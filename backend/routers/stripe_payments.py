import logging
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.payments import PaymentsService
from services.user_credits import User_creditsService
from core.config import settings

# Check if Stripe is configured
STRIPE_SECRET_KEY = getattr(settings, 'stripe_secret_key', None) or os.getenv('STRIPE_SECRET_KEY')
STRIPE_ENABLED = bool(STRIPE_SECRET_KEY)

if STRIPE_ENABLED:
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])

logger = logging.getLogger(__name__)

# Pricing configuration
PRICING = {
    "single": {
        "price": 900,  # $9.00 in cents
        "credits": 1,
        "name": "Single Analysis",
        "description": "One lease document analysis"
    },
    "pack5": {
        "price": 2900,  # $29.00 in cents
        "credits": 5,
        "name": "5-Pack Analysis",
        "description": "Five lease document analyses"
    },
    "monthly": {
        "price": 2900,  # $29.00 in cents
        "credits": 5,
        "name": "Monthly Subscription",
        "description": "5 analyses per month, renews monthly"
    }
}


class CheckoutRequest(BaseModel):
    plan_type: str  # single, pack5, monthly
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PaymentStatusResponse(BaseModel):
    status: str
    credits_added: int = 0
    message: str


def check_stripe_enabled():
    """Check if Stripe is enabled and raise error if not."""
    if not STRIPE_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="Payment service is not configured. Please contact support."
        )


@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Stripe checkout session for purchasing credits."""
    check_stripe_enabled()
    
    if request.plan_type not in PRICING:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    plan = PRICING[request.plan_type]
    
    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': plan['name'],
                        'description': plan['description'],
                    },
                    'unit_amount': plan['price'],
                },
                'quantity': 1,
            }],
            mode='payment' if request.plan_type != 'monthly' else 'subscription',
            success_url=request.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=request.cancel_url,
            client_reference_id=current_user.id,
            metadata={
                'user_id': current_user.id,
                'plan_type': request.plan_type,
                'credits': plan['credits']
            }
        )
        
        # Record the pending payment
        payments_service = PaymentsService(db)
        await payments_service.create({
            'user_id': current_user.id,
            'stripe_session_id': checkout_session.id,
            'amount': plan['price'],
            'credits': plan['credits'],
            'plan_type': request.plan_type,
            'status': 'pending'
        })
        
        return CheckoutResponse(
            checkout_url=checkout_session.url,
            session_id=checkout_session.id
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment service error")


@router.get("/verify/{session_id}", response_model=PaymentStatusResponse)
async def verify_payment(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify a payment and add credits if successful."""
    check_stripe_enabled()
    
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return PaymentStatusResponse(
                status='pending',
                message='Payment is still processing'
            )
        
        # Check if we already processed this payment
        payments_service = PaymentsService(db)
        payment = await payments_service.get_by_stripe_session_id(session_id)
        
        if payment and payment.status == 'completed':
            return PaymentStatusResponse(
                status='completed',
                credits_added=payment.credits,
                message='Payment already processed'
            )
        
        # Add credits to user
        credits_to_add = int(session.metadata.get('credits', 1))
        credits_service = User_creditsService(db)
        await credits_service.add_credits(current_user.id, credits_to_add)
        
        # Update payment status
        if payment:
            await payments_service.update(payment.id, {'status': 'completed'})
        
        return PaymentStatusResponse(
            status='completed',
            credits_added=credits_to_add,
            message=f'Successfully added {credits_to_add} credits'
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment verification error")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Stripe webhooks."""
    if not STRIPE_ENABLED:
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = getattr(settings, 'stripe_webhook_secret', None) or os.getenv('STRIPE_WEBHOOK_SECRET')
    
    if not webhook_secret:
        logger.warning("Stripe webhook secret not configured")
        raise HTTPException(status_code=500, detail="Webhook not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Process the successful payment
        user_id = session.get('client_reference_id')
        credits = int(session.get('metadata', {}).get('credits', 1))
        
        if user_id:
            credits_service = User_creditsService(db)
            await credits_service.add_credits(user_id, credits)
            
            payments_service = PaymentsService(db)
            await payments_service.update_by_stripe_session_id(
                session['id'],
                {'status': 'completed'}
            )
            
            logger.info(f"Added {credits} credits to user {user_id}")
    
    return {"status": "success"}


@router.get("/pricing")
async def get_pricing():
    """Get available pricing plans."""
    return {
        "plans": PRICING,
        "currency": "USD",
        "stripe_enabled": STRIPE_ENABLED
    }
