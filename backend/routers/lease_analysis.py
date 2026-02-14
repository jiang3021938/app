import logging
import base64
import json
import ast
import re
import httpx as httpx_client
from datetime import datetime
from urllib.parse import urlencode, quote
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.config import settings
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.lease_extraction import LeaseExtractionService, generate_ics_content
from services.pdf_extractor import PDFExtractor
from services.document_extractor import DocumentExtractor
from services.gemini_extractor import GeminiExtractor
from services.amendment_memo import AmendmentMemoService
from services.lease_comparison import LeaseComparisonService
from services.rent_benchmark import RentBenchmarkService
from services.executive_summary import ExecutiveSummaryService
from services.pdf_report import PDFReportGenerator
from services.documents import DocumentsService
from services.extractions import ExtractionsService
from services.user_credits import User_creditsService
from services.compliance_checker import ComplianceChecker
from services.storage import StorageService
from services.supabase_storage import SupabaseStorageService
from schemas.storage import FileUpDownRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/lease", tags=["lease"])


def safe_parse_json_or_literal(data: Any) -> Any:
    """Safely parse a string that could be JSON or Python literal.
    
    This replaces unsafe eval() calls with safe parsing methods.
    """
    if data is None:
        return None
    if not isinstance(data, str):
        return data
    
    # Try JSON first (most common case)
    try:
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        pass
    
    # Try ast.literal_eval for Python literals (safe alternative to eval)
    try:
        return ast.literal_eval(data)
    except (ValueError, SyntaxError):
        pass
    
    # Return as-is if parsing fails
    return data


def _get_content_type(filename: str) -> str:
    """Determine content type from file name."""
    filename_lower = (filename or "").lower()
    if filename_lower.endswith(".docx"):
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename_lower.endswith(".doc"):
        return "application/msword"
    return "application/pdf"


class AnalyzeRequest(BaseModel):
    document_id: int


class BatchAnalyzeRequest(BaseModel):
    document_ids: List[int]


class CalendarRequest(BaseModel):
    extraction_id: int


class AnalysisResponse(BaseModel):
    success: bool
    extraction_id: Optional[int] = None
    document_id: Optional[int] = None
    data: Optional[dict] = None
    compliance: Optional[dict] = None
    error: Optional[str] = None


class BatchAnalysisResponse(BaseModel):
    success: bool
    results: List[dict] = []
    total: int = 0
    completed: int = 0
    failed: int = 0


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_document(
    request: AnalyzeRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze a previously uploaded lease document"""
    try:
        # Get document
        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(request.document_id, current_user.id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check user credits (admins bypass credit checks)
        is_admin = getattr(current_user, 'role', 'user') == 'admin'
        credits_service = User_creditsService(db)
        user_credits = await credits_service.get_by_field("user_id", current_user.id)
        
        if not user_credits:
            # Create initial credits for new user
            user_credits = await credits_service.create({
                "user_id": current_user.id,
                "free_credits": 1,
                "paid_credits": 0,
                "subscription_type": "none",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }, current_user.id)
        
        # Check if user has credits
        total_credits = (user_credits.free_credits or 0) + (user_credits.paid_credits or 0)
        
        # Check subscription
        has_subscription = False
        if user_credits.subscription_type == "monthly" and user_credits.subscription_expires_at:
            if user_credits.subscription_expires_at > datetime.now():
                has_subscription = True
        
        if not is_admin and total_credits <= 0 and not has_subscription:
            raise HTTPException(
                status_code=402, 
                detail="No credits remaining. Please purchase more credits or subscribe."
            )
        
        # Update document status
        await doc_service.update(request.document_id, {"status": "processing"}, current_user.id)
        
        # Download file from storage (with database fallback)
        file_bytes = None
        try:
            supabase_storage = SupabaseStorageService()
            download_url = await supabase_storage.get_download_url(
                bucket_name="lease-documents",
                object_key=document.file_key
            )
            async with httpx_client.AsyncClient(timeout=120.0) as http_client:
                file_response = await http_client.get(download_url)
                file_bytes = file_response.content
        except Exception as e:
            logger.warning(f"Supabase download failed, trying database fallback: {e}")

        if not file_bytes and document.file_data:
            file_bytes = base64.b64decode(document.file_data)

        if not file_bytes:
            raise HTTPException(status_code=404, detail="Document file not available for re-analysis")

        # Analyze PDF using Gemini API
        try:
            gemini_extractor = GeminiExtractor()
            analysis_result = await gemini_extractor.analyze_pdf(file_bytes, document.file_name)
            extracted_data = analysis_result["extracted_data"]
            full_text = analysis_result["full_text"]
            source_blocks = analysis_result["source_blocks"]  # Empty for Gemini
            pages_meta = analysis_result["pages_meta"]  # Empty for Gemini
            logger.info(f"Successfully analyzed PDF using Gemini API")
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            await doc_service.update(request.document_id, {"status": "failed"}, current_user.id)
            return AnalysisResponse(
                success=False,
                error=f"PDF analysis failed: {str(e)}"
            )
        
        # Use source map from Gemini text matching
        source_map = analysis_result.get("source_map", {})
        
        # Perform compliance check
        compliance_checker = ComplianceChecker(db)
        compliance_result = await compliance_checker.check_compliance(extracted_data)
        
        # Save extraction results
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.create({
            "user_id": current_user.id,
            "document_id": request.document_id,
            "tenant_name": extracted_data.get("tenant_name"),
            "landlord_name": extracted_data.get("landlord_name"),
            "property_address": extracted_data.get("property_address"),
            "monthly_rent": extracted_data.get("monthly_rent"),
            "security_deposit": extracted_data.get("security_deposit"),
            "lease_start_date": extracted_data.get("lease_start_date"),
            "lease_end_date": extracted_data.get("lease_end_date"),
            "renewal_notice_days": extracted_data.get("renewal_notice_days"),
            "pet_policy": extracted_data.get("pet_policy"),
            "late_fee_terms": extracted_data.get("late_fee_terms"),
            "risk_flags": json.dumps(extracted_data.get("risk_flags", [])),
            "audit_checklist": json.dumps(extracted_data.get("audit_checklist", [])),
            "compliance_data": json.dumps(compliance_result),
            "raw_extraction": json.dumps(extracted_data),
            "source_map": json.dumps(source_map if source_map is not None else {}),
            "pages_meta": json.dumps(pages_meta if pages_meta is not None else []),
            "created_at": datetime.now()
        }, current_user.id)
        
        # Deduct credits (admins don't consume credits)
        if not is_admin:
            if user_credits.free_credits and user_credits.free_credits > 0:
                await credits_service.update(user_credits.id, {
                    "free_credits": user_credits.free_credits - 1,
                    "updated_at": datetime.now()
                }, current_user.id)
            elif user_credits.paid_credits and user_credits.paid_credits > 0:
                await credits_service.update(user_credits.id, {
                    "paid_credits": user_credits.paid_credits - 1,
                    "updated_at": datetime.now()
                }, current_user.id)
        
        # Update document status
        await doc_service.update(request.document_id, {"status": "completed"}, current_user.id)
        
        return AnalysisResponse(
            success=True,
            extraction_id=extraction.id,
            document_id=document.id,
            data=extracted_data,
            compliance=compliance_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-and-analyze", response_model=AnalysisResponse)
async def upload_and_analyze(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a lease document and analyze it in one step"""
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        allowed_extensions = (".pdf", ".docx", ".doc")
        if not file.filename.lower().endswith(allowed_extensions):
            raise HTTPException(status_code=400, detail="Please upload a PDF or Word (.docx) file")

        # Read file bytes
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")

        # Check user credits
        is_admin = getattr(current_user, 'role', 'user') == 'admin'
        credits_service = User_creditsService(db)
        user_credits = await credits_service.get_by_field("user_id", current_user.id)

        if not user_credits:
            user_credits = await credits_service.create({
                "user_id": current_user.id,
                "free_credits": 1,
                "paid_credits": 0,
                "subscription_type": "none",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }, current_user.id)

        total_credits = (user_credits.free_credits or 0) + (user_credits.paid_credits or 0)
        has_subscription = False
        if user_credits.subscription_type == "monthly" and user_credits.subscription_expires_at:
            if user_credits.subscription_expires_at > datetime.now():
                has_subscription = True

        if not is_admin and total_credits <= 0 and not has_subscription:
            raise HTTPException(
                status_code=402,
                detail="No credits remaining. Please purchase more credits or subscribe."
            )

        # Create document record (use timestamp as file_key placeholder)
        import time
        timestamp = int(time.time() * 1000)
        safe_name = file.filename.replace(" ", "-")
        file_key = f"uploads/{current_user.id}/{timestamp}-{safe_name}"

        doc_service = DocumentsService(db)
        document = await doc_service.create({
            "file_name": file.filename,
            "file_key": file_key,
            "file_size": len(file_bytes),
            "status": "processing",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }, current_user.id)

        # Analyze PDF directly from uploaded bytes (no storage download needed)
        try:
            gemini_extractor = GeminiExtractor()
            analysis_result = await gemini_extractor.analyze_pdf(file_bytes, file.filename)
            extracted_data = analysis_result["extracted_data"]
            full_text = analysis_result["full_text"]
            source_blocks = analysis_result["source_blocks"]
            pages_meta = analysis_result["pages_meta"]
            source_map = analysis_result.get("source_map", {})
            logger.info(f"Successfully analyzed PDF using Gemini API")
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            await doc_service.update(document.id, {"status": "failed"}, current_user.id)
            return AnalysisResponse(
                success=False,
                error=f"PDF analysis failed: {str(e)}"
            )

        # Perform compliance check
        compliance_checker = ComplianceChecker(db)
        compliance_result = await compliance_checker.check_compliance(extracted_data)

        # Save extraction results
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.create({
            "user_id": current_user.id,
            "document_id": document.id,
            "tenant_name": extracted_data.get("tenant_name"),
            "landlord_name": extracted_data.get("landlord_name"),
            "property_address": extracted_data.get("property_address"),
            "monthly_rent": extracted_data.get("monthly_rent"),
            "security_deposit": extracted_data.get("security_deposit"),
            "lease_start_date": extracted_data.get("lease_start_date"),
            "lease_end_date": extracted_data.get("lease_end_date"),
            "renewal_notice_days": extracted_data.get("renewal_notice_days"),
            "pet_policy": extracted_data.get("pet_policy"),
            "late_fee_terms": extracted_data.get("late_fee_terms"),
            "risk_flags": json.dumps(extracted_data.get("risk_flags", [])),
            "audit_checklist": json.dumps(extracted_data.get("audit_checklist", [])),
            "compliance_data": json.dumps(compliance_result),
            "raw_extraction": json.dumps(extracted_data),
            "source_map": json.dumps(source_map if source_map is not None else {}),
            "pages_meta": json.dumps(pages_meta if pages_meta is not None else []),
            "created_at": datetime.now()
        }, current_user.id)

        # Deduct credits
        if not is_admin:
            if user_credits.free_credits and user_credits.free_credits > 0:
                await credits_service.update(user_credits.id, {
                    "free_credits": user_credits.free_credits - 1,
                    "updated_at": datetime.now()
                }, current_user.id)
            elif user_credits.paid_credits and user_credits.paid_credits > 0:
                await credits_service.update(user_credits.id, {
                    "paid_credits": user_credits.paid_credits - 1,
                    "updated_at": datetime.now()
                }, current_user.id)

        # Update document status and store file data for PDF preview fallback
        # Only store file_data for files under 20MB to avoid database bloat
        update_data = {"status": "completed"}
        if len(file_bytes) <= 20 * 1024 * 1024:
            update_data["file_data"] = base64.b64encode(file_bytes).decode()
        await doc_service.update(document.id, update_data, current_user.id)

        # Upload to Supabase Storage for temporary PDF preview
        try:
            content_type = _get_content_type(file.filename)
            
            supabase_storage = SupabaseStorageService()
            await supabase_storage.upload_file(
                bucket_name="lease-documents",
                object_key=file_key,
                file_data=file_bytes,
                content_type=content_type
            )
            logger.info(f"Document cached to Supabase Storage: {file_key}")
        except Exception as e:
            # Non-blocking: PDF preview will fall back to database-stored file_data
            logger.warning(f"Failed to cache document to Supabase Storage: {e}")

        await db.flush()
        await db.refresh(document)
        await db.refresh(extraction)

        return AnalysisResponse(
            success=True,
            extraction_id=extraction.id,
            document_id=document.id,
            data=extracted_data,
            compliance=compliance_result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload and analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/analyze-batch", response_model=BatchAnalysisResponse)
async def analyze_documents_batch(
    request: BatchAnalyzeRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze multiple lease documents in batch"""
    try:
        results = []
        completed = 0
        failed = 0
        
        # Check user credits first (admins bypass)
        is_admin = getattr(current_user, 'role', 'user') == 'admin'
        credits_service = User_creditsService(db)
        user_credits = await credits_service.get_by_field("user_id", current_user.id)
        
        if not user_credits:
            user_credits = await credits_service.create({
                "user_id": current_user.id,
                "free_credits": 1,
                "paid_credits": 0,
                "subscription_type": "none",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }, current_user.id)
        
        total_credits = (user_credits.free_credits or 0) + (user_credits.paid_credits or 0)
        has_subscription = False
        if user_credits.subscription_type == "monthly" and user_credits.subscription_expires_at:
            if user_credits.subscription_expires_at > datetime.now():
                has_subscription = True
        
        documents_to_process = len(request.document_ids)
        
        if not is_admin and total_credits < documents_to_process and not has_subscription:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient credits. You have {total_credits} credits but need {documents_to_process}."
            )
        
        doc_service = DocumentsService(db)
        extractions_service = ExtractionsService(db)
        extraction_service = LeaseExtractionService()
        compliance_checker = ComplianceChecker(db)
        
        for doc_id in request.document_ids:
            try:
                document = await doc_service.get_by_id(doc_id, current_user.id)
                
                if not document:
                    results.append({
                        "document_id": doc_id,
                        "success": False,
                        "error": "Document not found"
                    })
                    failed += 1
                    continue
                
                # Update document status
                await doc_service.update(doc_id, {"status": "processing"}, current_user.id)
                
                # Extract text (placeholder for MVP)
                document_text = f"""
                Sample lease agreement for {document.file_name}.
                """
                
                # Perform AI extraction
                result = await extraction_service.extract_lease_data(document_text)
                
                if not result["success"]:
                    await doc_service.update(doc_id, {"status": "failed"}, current_user.id)
                    results.append({
                        "document_id": doc_id,
                        "success": False,
                        "error": result.get("error", "Extraction failed")
                    })
                    failed += 1
                    continue
                
                extracted_data = result["data"]
                
                # Compliance check
                compliance_result = await compliance_checker.check_compliance(extracted_data)
                
                # Save extraction
                extraction = await extractions_service.create({
                    "user_id": current_user.id,
                    "document_id": doc_id,
                    "tenant_name": extracted_data.get("tenant_name"),
                    "landlord_name": extracted_data.get("landlord_name"),
                    "property_address": extracted_data.get("property_address"),
                    "monthly_rent": extracted_data.get("monthly_rent"),
                    "security_deposit": extracted_data.get("security_deposit"),
                    "lease_start_date": extracted_data.get("lease_start_date"),
                    "lease_end_date": extracted_data.get("lease_end_date"),
                    "renewal_notice_days": extracted_data.get("renewal_notice_days"),
                    "pet_policy": extracted_data.get("pet_policy"),
                    "late_fee_terms": extracted_data.get("late_fee_terms"),
                    "risk_flags": json.dumps(extracted_data.get("risk_flags", [])),
                    "audit_checklist": json.dumps(extracted_data.get("audit_checklist", [])),
                    "compliance_data": json.dumps(compliance_result),
                    "raw_extraction": json.dumps(extracted_data),
                    "created_at": datetime.now()
                }, current_user.id)
                
                # Deduct credit (admins don't consume credits)
                if not is_admin:
                    current_credits = await credits_service.get_by_field("user_id", current_user.id)
                    if current_credits.free_credits and current_credits.free_credits > 0:
                        await credits_service.update(current_credits.id, {
                            "free_credits": current_credits.free_credits - 1,
                            "updated_at": datetime.now()
                        }, current_user.id)
                    elif current_credits.paid_credits and current_credits.paid_credits > 0:
                        await credits_service.update(current_credits.id, {
                            "paid_credits": current_credits.paid_credits - 1,
                            "updated_at": datetime.now()
                        }, current_user.id)
                
                await doc_service.update(doc_id, {"status": "completed"}, current_user.id)
                
                results.append({
                    "document_id": doc_id,
                    "success": True,
                    "extraction_id": extraction.id,
                    "file_name": document.file_name
                })
                completed += 1
                
            except Exception as e:
                logger.error(f"Batch analysis error for doc {doc_id}: {e}")
                results.append({
                    "document_id": doc_id,
                    "success": False,
                    "error": str(e)
                })
                failed += 1
        
        return BatchAnalysisResponse(
            success=completed > 0,
            results=results,
            total=len(request.document_ids),
            completed=completed,
            failed=failed
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compliance/{extraction_id}")
async def get_compliance_report(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get compliance report for an extraction"""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)
        
        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")
        
        # Re-run compliance check with current data
        compliance_checker = ComplianceChecker(db)
        extraction_data = {
            "property_address": extraction.property_address,
            "monthly_rent": extraction.monthly_rent,
            "security_deposit": extraction.security_deposit,
            "renewal_notice_days": extraction.renewal_notice_days,
            "late_fee_terms": extraction.late_fee_terms
        }
        
        compliance_result = await compliance_checker.check_compliance(extraction_data)
        
        return compliance_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Compliance check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regulations/{state_code}")
async def get_state_regulations(
    state_code: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all regulations for a specific state"""
    try:
        compliance_checker = ComplianceChecker(db)
        regulations = await compliance_checker.get_state_regulations(state_code.upper())
        
        if not regulations:
            raise HTTPException(
                status_code=404, 
                detail=f"No regulations found for state: {state_code}"
            )
        
        return {
            "state_code": state_code.upper(),
            "regulations": regulations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get regulations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regulations")
async def get_all_states(
    db: AsyncSession = Depends(get_db),
):
    """Get list of all states with regulations"""
    try:
        from sqlalchemy import select, distinct
        from models.state_regulations import State_regulations
        
        result = await db.execute(
            select(
                State_regulations.state_code,
                State_regulations.state_name
            ).distinct()
        )
        states = result.all()
        
        return {
            "states": [
                {"code": s[0], "name": s[1]}
                for s in states
            ]
        }
        
    except Exception as e:
        logger.error(f"Get states error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calendar/{extraction_id}")
async def get_calendar(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate ICS calendar file for lease dates"""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)
        
        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")
        
        # Get document name
        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(extraction.document_id, current_user.id)
        doc_name = document.file_name if document else "Lease"
        
        # Generate ICS content
        extraction_data = {
            "lease_end_date": extraction.lease_end_date,
            "renewal_notice_days": extraction.renewal_notice_days,
            "property_address": extraction.property_address
        }
        
        ics_content = generate_ics_content(extraction_data, doc_name)
        
        return Response(
            content=ics_content,
            media_type="text/calendar",
            headers={
                "Content-Disposition": f"attachment; filename=lease-reminders-{extraction_id}.ics"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Calendar generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/credits")
async def get_user_credits(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's credit balance and permissions"""
    try:
        is_admin = getattr(current_user, 'role', 'user') == 'admin'
        credits_service = User_creditsService(db)
        user_credits = await credits_service.get_by_field("user_id", current_user.id)
        
        if not user_credits:
            # Create initial credits for new user
            user_credits = await credits_service.create({
                "user_id": current_user.id,
                "free_credits": 1,
                "paid_credits": 0,
                "subscription_type": "none",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }, current_user.id)
        
        total_credits = (user_credits.free_credits or 0) + (user_credits.paid_credits or 0)
        has_subscription = False
        if user_credits.subscription_type == "monthly" and user_credits.subscription_expires_at:
            if user_credits.subscription_expires_at > datetime.now():
                has_subscription = True
        
        return {
            "free_credits": user_credits.free_credits or 0,
            "paid_credits": user_credits.paid_credits or 0,
            "total_credits": total_credits,
            "subscription_type": user_credits.subscription_type,
            "subscription_expires_at": user_credits.subscription_expires_at,
            "is_admin": is_admin,
            "can_analyze": is_admin or total_credits > 0 or has_subscription,
            "can_batch": is_admin or total_credits > 1 or has_subscription,
        }
        
    except Exception as e:
        logger.error(f"Get credits error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class SetCreditsRequest(BaseModel):
    free_credits: Optional[int] = None
    paid_credits: Optional[int] = None
    subscription_type: Optional[str] = None


@router.post("/credits/set")
async def admin_set_credits(
    request: SetCreditsRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint: manually set credit balance for testing"""
    is_admin = getattr(current_user, 'role', 'user') == 'admin'
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        credits_service = User_creditsService(db)
        user_credits = await credits_service.get_by_field("user_id", current_user.id)
        
        if not user_credits:
            user_credits = await credits_service.create({
                "user_id": current_user.id,
                "free_credits": request.free_credits or 0,
                "paid_credits": request.paid_credits or 0,
                "subscription_type": request.subscription_type or "none",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }, current_user.id)
        else:
            updates = {"updated_at": datetime.now()}
            if request.free_credits is not None:
                updates["free_credits"] = request.free_credits
            if request.paid_credits is not None:
                updates["paid_credits"] = request.paid_credits
            if request.subscription_type is not None:
                updates["subscription_type"] = request.subscription_type
            await credits_service.update(user_credits.id, updates, current_user.id)
        
        return {"success": True, "message": "Credits updated"}
    except Exception as e:
        logger.error(f"Set credits error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Feature: PDF Source Tracing (click-to-source)
# ──────────────────────────────────────────────────────────────────────────────


async def _rebuild_source_map(extraction, db: AsyncSession, user_id: str):
    """Rebuild source_map from the original document for an extraction.
    Returns (source_map, pages_meta) or (None, None) on failure."""
    try:
        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(extraction.document_id, user_id)
        if not document:
            return None, None

        # Get file bytes (Supabase then DB fallback)
        file_bytes = None
        try:
            if document.file_key:
                supabase_storage = SupabaseStorageService()
                download_url = await supabase_storage.get_download_url(
                    bucket_name="lease-documents",
                    object_key=document.file_key
                )
                async with httpx_client.AsyncClient(timeout=120.0) as http_client:
                    file_response = await http_client.get(download_url)
                    file_response.raise_for_status()
                    file_bytes = file_response.content
        except Exception as e:
            logger.warning(f"[rebuild-source-map] Supabase download failed: {e}")

        if not file_bytes and document.file_data:
            file_bytes = base64.b64decode(document.file_data)

        if not file_bytes:
            return None, None

        # Reconstruct extracted_data from extraction fields
        extracted_data = {
            "tenant_name": extraction.tenant_name,
            "landlord_name": extraction.landlord_name,
            "property_address": extraction.property_address,
            "monthly_rent": extraction.monthly_rent,
            "security_deposit": extraction.security_deposit,
            "lease_start_date": extraction.lease_start_date,
            "lease_end_date": extraction.lease_end_date,
            "pet_policy": extraction.pet_policy,
            "late_fee_terms": extraction.late_fee_terms,
        }
        # Include risk_flags for risk tracing
        if extraction.risk_flags:
            try:
                extracted_data["risk_flags"] = json.loads(extraction.risk_flags)
            except (json.JSONDecodeError, TypeError):
                pass

        extractor = GeminiExtractor.__new__(GeminiExtractor)
        source_map, page_count = extractor._build_source_map_from_file(
            file_bytes, document.file_name, extracted_data
        )
        pages_meta = [
            {"page": i, "width": 612, "height": 792}
            for i in range(page_count)
        ]
        return source_map, pages_meta
    except Exception as e:
        logger.error(f"[rebuild-source-map] Error: {e}")
        return None, None


@router.get("/source-map/{extraction_id}")
async def get_source_map(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get source location mapping for an extraction (field → PDF location).
    If the stored source_map has fewer fields than expected, rebuilds it
    from the document using the improved matching logic."""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)

        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        source_map = {}
        if extraction.source_map:
            try:
                source_map = json.loads(extraction.source_map)
            except (json.JSONDecodeError, TypeError):
                pass

        pages_meta = []
        if extraction.pages_meta:
            try:
                pages_meta = json.loads(extraction.pages_meta)
            except (json.JSONDecodeError, TypeError):
                pass

        # Count how many non-null extraction fields exist
        traceable_fields = ["tenant_name", "landlord_name", "property_address",
                            "monthly_rent", "security_deposit", "lease_start_date",
                            "lease_end_date", "pet_policy", "late_fee_terms"]
        expected_count = sum(1 for f in traceable_fields
                            if getattr(extraction, f, None) is not None
                            and str(getattr(extraction, f, "")).strip().lower()
                            not in ("", "not specified", "not specified in lease", "none", "null"))
        # Also count risk flags
        risk_count = 0
        if extraction.risk_flags:
            try:
                risks = json.loads(extraction.risk_flags)
                if isinstance(risks, list):
                    risk_count = len(risks)
            except (json.JSONDecodeError, TypeError):
                pass

        total_expected = expected_count + risk_count
        # Rebuild if source_map has significantly fewer fields than expected
        needs_rebuild = len(source_map) < max(3, total_expected // 2)

        if needs_rebuild:
            try:
                rebuilt_map, rebuilt_pages_meta = await _rebuild_source_map(
                    extraction, db, current_user.id
                )
                if rebuilt_map and len(rebuilt_map) > len(source_map):
                    source_map = rebuilt_map
                    if rebuilt_pages_meta:
                        pages_meta = rebuilt_pages_meta
                    # Persist the improved source_map back to DB
                    await extractions_service.update(extraction.id, {
                        "source_map": json.dumps(source_map),
                        "pages_meta": json.dumps(pages_meta),
                    }, current_user.id)
                    logger.info(f"Rebuilt source_map for extraction {extraction_id}: {len(source_map)} fields (expected ~{total_expected})")
            except Exception as e:
                logger.warning(f"Failed to rebuild source_map for extraction {extraction_id}: {e}")

        return {
            "extraction_id": extraction_id,
            "source_map": source_map,
            "pages_meta": pages_meta,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Source map error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pdf-page/{document_id}/{page_num}")
async def get_pdf_page_image(
    document_id: int,
    page_num: int,
    request: Request,
    t: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Render a specific document page as a PNG image for the viewer.
    Supports both PDF and Word (.docx) files.
    Auth via Authorization header or ?t= query parameter token."""
    try:
        logger.info(f"[pdf-page] Request for document_id={document_id}, page_num={page_num}")
        from core.auth import decode_access_token, AccessTokenError

        # Try Authorization header first, then query parameter token
        user_id = None
        auth_header = request.headers.get("authorization", "")
        token = None
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:]
            logger.debug(f"[pdf-page] Using Authorization header token")
        elif t:
            token = t
            logger.debug(f"[pdf-page] Using query parameter token")

        if token:
            try:
                payload = decode_access_token(token)
                user_id = payload.get("sub")
                logger.info(f"[pdf-page] Authenticated user_id={user_id}")
            except AccessTokenError as e:
                # Token invalid/expired — fall through to 401 below
                logger.warning(f"[pdf-page] Token validation failed: {e}")

        if not user_id:
            logger.warning(f"[pdf-page] Authentication required - no valid token")
            raise HTTPException(status_code=401, detail="Authentication required")

        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(document_id, user_id)

        if not document:
            logger.warning(f"[pdf-page] Document {document_id} not found for user {user_id}")
            raise HTTPException(status_code=404, detail="Document not found")

        logger.info(f"[pdf-page] Document found: {document.file_name}, file_key={document.file_key}")

        # Download file from storage (with database fallback)
        file_bytes = None
        try:
            if not document.file_key:
                raise ValueError("Document has no file_key")
            supabase_storage = SupabaseStorageService()
            download_url = await supabase_storage.get_download_url(
                bucket_name="lease-documents",
                object_key=document.file_key
            )
            logger.info(f"[pdf-page] Got Supabase download URL, downloading...")
            async with httpx_client.AsyncClient(timeout=120.0) as http_client:
                file_response = await http_client.get(download_url)
                file_response.raise_for_status()
                file_bytes = file_response.content
            logger.info(f"[pdf-page] Downloaded {len(file_bytes)} bytes from Supabase")
        except Exception as e:
            logger.warning(f"[pdf-page] Supabase download failed, trying database fallback: {e}")

        if not file_bytes and document.file_data:
            file_bytes = base64.b64decode(document.file_data)
            logger.info(f"[pdf-page] Using database fallback, decoded {len(file_bytes)} bytes")

        if not file_bytes:
            logger.error(f"[pdf-page] No file bytes available for document {document_id}")
            raise HTTPException(status_code=404, detail="Document file not available")

        file_name = document.file_name.lower()

        if file_name.endswith(('.docx', '.doc')):
            # Render Word page as SVG
            logger.info(f"[pdf-page] Rendering Word document page {page_num}")
            content_bytes, media_type = _render_docx_page(file_bytes, page_num)
        else:
            # Render PDF page as SVG (without PyMuPDF/Pillow)
            logger.info(f"[pdf-page] Rendering PDF document page {page_num}")
            content_bytes, media_type = _render_pdf_page(file_bytes, page_num)

        logger.info(f"[pdf-page] Successfully rendered page {page_num}, size={len(content_bytes)} bytes, type={media_type}")
        return Response(
            content=content_bytes,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=3600"},
        )

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"[pdf-page] ValueError for document {document_id}, page {page_num}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"[pdf-page] Document page render error for document {document_id}, page {page_num}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def _escape_xml(text: str) -> str:
    """Escape special XML characters for SVG content and strip invalid XML chars."""
    # Remove control characters that are invalid in XML 1.0
    # Valid: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")


def _render_text_as_svg(lines: list, page_title: str = "") -> bytes:
    """Render text lines as an SVG image (no Pillow/PyMuPDF needed).
    Returns SVG bytes that can be displayed in <img> tags."""
    # Letter size in points (8.5 x 11 inches at 72 DPI)
    width = 612
    height = 792
    margin = 54  # 0.75 inch margin
    font_size = 11
    line_height = 16

    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        f'<rect width="{width}" height="{height}" fill="white"/>',
    ]

    y = margin + font_size
    for line in lines:
        if y + line_height > height - margin:
            break
        escaped = _escape_xml(line)
        svg_lines.append(
            f'<text x="{margin}" y="{y}" font-family="monospace, Courier, sans-serif" font-size="{font_size}" fill="#1a1a1a">{escaped}</text>'
        )
        y += line_height

    svg_lines.append('</svg>')
    return "\n".join(svg_lines).encode("utf-8")


def _render_pdf_page(file_bytes: bytes, page_num: int) -> tuple:
    """Render a PDF page as SVG using pypdf text extraction (no Pillow/PyMuPDF needed).
    Returns (content_bytes, media_type)."""
    import io
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(file_bytes))
    if page_num >= len(reader.pages):
        raise ValueError(f"Page {page_num} does not exist (total pages: {len(reader.pages)})")

    page = reader.pages[page_num]
    text = page.extract_text() or ""

    # Split text into lines
    lines = []
    for paragraph in text.split("\n"):
        if not paragraph.strip():
            lines.append("")
            continue
        words = paragraph.split()
        line = ""
        for word in words:
            test = f"{line} {word}".strip()
            if len(test) > 90:
                lines.append(line)
                line = word
            else:
                line = test
        if line:
            lines.append(line)

    return _render_text_as_svg(lines), "image/svg+xml"


def _render_docx_page(file_bytes: bytes, page_num: int) -> tuple:
    """Render a Word document page as SVG (no Pillow/PyMuPDF needed).
    Returns (content_bytes, media_type)."""
    from services.document_extractor import _extract_docx_text

    paragraphs = _extract_docx_text(file_bytes)

    # Paginate: ~45 lines per page (standard letter)
    lines_per_page = 45
    pages = []
    current_page_lines = []
    for para in paragraphs:
        words = para.split()
        line = ""
        for word in words:
            test = f"{line} {word}".strip()
            if len(test) > 85:
                current_page_lines.append(line)
                line = word
                if len(current_page_lines) >= lines_per_page:
                    pages.append(current_page_lines)
                    current_page_lines = []
            else:
                line = test
        if line:
            current_page_lines.append(line)
            if len(current_page_lines) >= lines_per_page:
                pages.append(current_page_lines)
                current_page_lines = []
        current_page_lines.append("")  # blank line between paragraphs

    if current_page_lines:
        pages.append(current_page_lines)

    if not pages:
        pages = [["(Empty document)"]]

    if page_num >= len(pages):
        raise ValueError(f"Page {page_num} does not exist (total pages: {len(pages)})")

    return _render_text_as_svg(pages[page_num]), "image/svg+xml"


@router.get("/doc-page-count/{document_id}")
async def get_document_page_count(
    document_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get total page count for a document (PDF or Word)."""
    try:
        logger.info(f"[doc-page-count] Request for document_id={document_id}, user_id={current_user.id}")
        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(document_id, current_user.id)

        if not document:
            logger.warning(f"[doc-page-count] Document {document_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Document not found")

        logger.info(f"[doc-page-count] Document found: {document.file_name}, file_key={document.file_key}")

        # Download file from storage (with database fallback)
        file_bytes = None
        try:
            if not document.file_key:
                raise ValueError("Document has no file_key")
            supabase_storage = SupabaseStorageService()
            download_url = await supabase_storage.get_download_url(
                bucket_name="lease-documents",
                object_key=document.file_key
            )
            logger.info(f"[doc-page-count] Got Supabase download URL, downloading...")
            async with httpx_client.AsyncClient(timeout=120.0) as http_client:
                file_response = await http_client.get(download_url)
                file_response.raise_for_status()
                file_bytes = file_response.content
            logger.info(f"[doc-page-count] Downloaded {len(file_bytes)} bytes from Supabase")
        except Exception as e:
            logger.warning(f"[doc-page-count] Supabase download failed, trying database fallback: {e}")

        if not file_bytes and document.file_data:
            file_bytes = base64.b64decode(document.file_data)
            logger.info(f"[doc-page-count] Using database fallback, decoded {len(file_bytes)} bytes")

        if not file_bytes:
            logger.error(f"[doc-page-count] No file bytes available for document {document_id}")
            raise HTTPException(status_code=404, detail="Document file not available")

        file_name = document.file_name.lower()

        if file_name.endswith(('.docx', '.doc')):
            from services.document_extractor import _extract_docx_text
            paragraphs = _extract_docx_text(file_bytes)
            # Estimate pages
            total_lines = 0
            for para in paragraphs:
                total_lines += max(1, len(para) // 85 + 1) + 1
            page_count = max(1, (total_lines + 44) // 45)
        else:
            import io
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)

        logger.info(f"[doc-page-count] Calculated page_count={page_count} for document {document_id}")
        return {"page_count": page_count, "file_type": "docx" if file_name.endswith(('.docx', '.doc')) else "pdf"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[doc-page-count] Page count error for document {document_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pdf-url/{document_id}")
async def get_pdf_download_url(
    document_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a temporary download URL for the original PDF (for pdfjs viewer)."""
    try:
        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(document_id, current_user.id)

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Try Supabase Storage first
        try:
            supabase_storage = SupabaseStorageService()
            url = await supabase_storage.get_download_url(
                bucket_name="lease-documents",
                object_key=document.file_key
            )
            return {"url": url}
        except Exception as e:
            logger.warning(f"Supabase storage unavailable, trying database fallback: {e}")

        # Fallback: serve from database-stored file_data
        if document.file_data:
            from core.auth import create_access_token
            pdf_token = create_access_token(
                claims={"sub": current_user.id, "purpose": "pdf_view", "doc_id": document_id},
                expires_minutes=60,
            )
            return {"url": f"/api/v1/lease/pdf-serve/{document_id}?token={pdf_token}"}

        raise HTTPException(
            status_code=404,
            detail="PDF preview is not available. The original file was not stored."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF URL error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pdf-serve/{document_id}")
async def serve_pdf_from_database(
    document_id: int,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Serve a PDF directly from database-stored file_data (fallback for Supabase Storage)."""
    from core.auth import decode_access_token, AccessTokenError

    try:
        payload = decode_access_token(token)
    except AccessTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Validate that the token was issued for this specific document
    token_doc_id = payload.get("doc_id")
    if token_doc_id is not None and token_doc_id != document_id:
        raise HTTPException(status_code=403, detail="Token not valid for this document")

    doc_service = DocumentsService(db)
    document = await doc_service.get_by_id(document_id, user_id)

    if not document or not document.file_data:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        file_bytes = base64.b64decode(document.file_data)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decode stored file data")

    content_type = _get_content_type(document.file_name)

    return Response(
        content=file_bytes,
        media_type=content_type,
        headers={"Content-Disposition": f"inline; filename=\"{document.file_name}\""},
    )


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Google Calendar Integration
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/google-calendar/{extraction_id}")
async def get_google_calendar_links(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate Google Calendar event links for key lease dates."""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)

        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        doc_service = DocumentsService(db)
        document = await doc_service.get_by_id(extraction.document_id, current_user.id)
        doc_name = document.file_name if document else "Lease"

        events: List[Dict[str, Any]] = []

        property_addr = extraction.property_address or "N/A"

        # Lease end date event
        if extraction.lease_end_date:
            date_str = extraction.lease_end_date.replace("-", "")
            events.append({
                "title": f"Lease Expires – {doc_name}",
                "date": extraction.lease_end_date,
                "google_url": _build_gcal_url(
                    title=f"Lease Expires – {doc_name}",
                    date=date_str,
                    details=f"Your lease agreement expires. Property: {property_addr}",
                    location=property_addr,
                ),
                "type": "lease_end",
            })

            # Renewal notice deadline
            notice_days = extraction.renewal_notice_days or 60
            try:
                from datetime import timedelta
                end_date = datetime.strptime(extraction.lease_end_date, "%Y-%m-%d")
                notice_date = end_date - timedelta(days=notice_days)
                notice_str = notice_date.strftime("%Y%m%d")
                events.append({
                    "title": f"Renewal Notice Deadline – {doc_name}",
                    "date": notice_date.strftime("%Y-%m-%d"),
                    "google_url": _build_gcal_url(
                        title=f"Renewal Notice Deadline – {doc_name}",
                        date=notice_str,
                        details=f"Deadline to provide renewal notice ({notice_days} days before lease end). Property: {property_addr}",
                        location=property_addr,
                    ),
                    "type": "renewal_notice",
                })
            except ValueError:
                pass

        # Lease start date event (for reference)
        if extraction.lease_start_date:
            date_str = extraction.lease_start_date.replace("-", "")
            events.append({
                "title": f"Lease Starts – {doc_name}",
                "date": extraction.lease_start_date,
                "google_url": _build_gcal_url(
                    title=f"Lease Starts – {doc_name}",
                    date=date_str,
                    details=f"Lease agreement start date. Property: {property_addr}",
                    location=property_addr,
                ),
                "type": "lease_start",
            })

        return {"events": events}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google Calendar link error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _build_gcal_url(title: str, date: str, details: str, location: str = "") -> str:
    """Build a Google Calendar event creation URL."""
    params = {
        "action": "TEMPLATE",
        "text": title,
        "dates": f"{date}/{date}",
        "details": details,
        "location": location,
    }
    return f"https://calendar.google.com/calendar/render?{urlencode(params)}"


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Amendment Memo Generation
# ──────────────────────────────────────────────────────────────────────────────


@router.post("/amendment-memo/{extraction_id}")
async def generate_amendment_memo(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a professional amendment suggestions memo for a lease."""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)

        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        # Build extraction data
        extraction_data = {
            "tenant_name": extraction.tenant_name,
            "landlord_name": extraction.landlord_name,
            "property_address": extraction.property_address,
            "monthly_rent": extraction.monthly_rent,
            "security_deposit": extraction.security_deposit,
            "lease_start_date": extraction.lease_start_date,
            "lease_end_date": extraction.lease_end_date,
            "pet_policy": extraction.pet_policy,
            "late_fee_terms": extraction.late_fee_terms,
            "renewal_notice_days": extraction.renewal_notice_days,
        }

        # Parse risk flags safely (no eval)
        risk_flags = []
        if extraction.risk_flags:
            risk_flags = safe_parse_json_or_literal(extraction.risk_flags)
            if not isinstance(risk_flags, list):
                risk_flags = []

        # Parse compliance data safely (no eval)
        compliance_data = None
        if extraction.compliance_data:
            compliance_data = safe_parse_json_or_literal(extraction.compliance_data)

        memo_service = AmendmentMemoService()
        result = await memo_service.generate_memo(extraction_data, compliance_data, risk_flags)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Amendment memo error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Lease Comparison
# ──────────────────────────────────────────────────────────────────────────────


class CompareRequest(BaseModel):
    extraction_ids: List[int]


@router.post("/compare")
async def compare_leases(
    request: CompareRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Compare 2-3 lease extractions side by side."""
    try:
        if len(request.extraction_ids) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 extractions to compare")
        if len(request.extraction_ids) > 3:
            raise HTTPException(status_code=400, detail="Can compare up to 3 leases at a time")

        extractions_service = ExtractionsService(db)
        extractions_data = []
        labels = []

        for ext_id in request.extraction_ids:
            extraction = await extractions_service.get_by_id(ext_id, current_user.id)
            if not extraction:
                raise HTTPException(status_code=404, detail=f"Extraction {ext_id} not found")

            ext_data = {
                "tenant_name": extraction.tenant_name,
                "landlord_name": extraction.landlord_name,
                "property_address": extraction.property_address,
                "monthly_rent": extraction.monthly_rent,
                "security_deposit": extraction.security_deposit,
                "lease_start_date": extraction.lease_start_date,
                "lease_end_date": extraction.lease_end_date,
                "renewal_notice_days": extraction.renewal_notice_days,
                "pet_policy": extraction.pet_policy,
                "late_fee_terms": extraction.late_fee_terms,
                "risk_flags": extraction.risk_flags,
            }
            extractions_data.append(ext_data)
            labels.append(extraction.property_address or f"Lease #{ext_id}")

        comparison_service = LeaseComparisonService()
        result = await comparison_service.compare_leases(extractions_data, labels)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lease comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Rent Benchmarking
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/benchmark/{extraction_id}")
async def get_rent_benchmark(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get market rent benchmark data for a lease."""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)

        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        benchmark_service = RentBenchmarkService()
        result = benchmark_service.get_benchmark(
            property_address=extraction.property_address or "",
            monthly_rent=extraction.monthly_rent,
        )

        return {"success": True, "benchmark": result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Benchmark error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Email Lead Capture (Template Downloads)
# ──────────────────────────────────────────────────────────────────────────────


class LeadCaptureRequest(BaseModel):
    email: str
    name: Optional[str] = None
    template_type: str = "general"


@router.post("/lead/capture")
async def capture_lead(request: LeadCaptureRequest):
    """Capture email for template downloads (no auth required)."""
    try:
        # In production, save to DB or send to email marketing service
        logger.info(f"Lead captured: {request.email} for template: {request.template_type}")
        return {
            "success": True,
            "message": "Thank you! Check your email for the download link.",
            "download_url": f"/api/v1/lease/template/{request.template_type}",
        }
    except Exception as e:
        logger.error(f"Lead capture error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/template/{template_type}")
async def get_template(template_type: str):
    """Return template content (placeholder - in production serve actual files)."""
    templates = {
        "checklist": {
            "title": "Landlord Lease Review Checklist",
            "type": "checklist",
            "items": [
                "Verify tenant full legal name matches ID",
                "Confirm property address is complete and correct",
                "Check security deposit amount complies with state law",
                "Ensure lease start and end dates are clearly specified",
                "Review late fee terms for reasonableness and legality",
                "Confirm pet policy is explicitly stated",
                "Check for lead-based paint disclosure (pre-1978 buildings)",
                "Verify maintenance responsibilities are clearly defined",
                "Review subletting/assignment clauses",
                "Confirm notice periods for entry, termination, and renewal",
                "Check for dispute resolution procedures",
                "Verify insurance requirements",
                "Review early termination clauses and penalties",
                "Confirm utility responsibility assignments",
                "Check parking and storage arrangements",
            ],
        },
        "california": {
            "title": "California Residential Lease Key Requirements",
            "type": "guide",
            "sections": [
                {"title": "Security Deposit", "content": "Maximum 2x monthly rent (unfurnished) or 3x (furnished). AB 12 reduces this to 1x starting 2025."},
                {"title": "Late Fees", "content": "Must be reasonable. Courts generally accept 5-6% of monthly rent."},
                {"title": "Rent Increase Notice", "content": "30 days for increases <10%, 90 days for increases ≥10%."},
                {"title": "Entry Notice", "content": "24 hours written notice required except emergencies."},
                {"title": "Rent Control", "content": "AB 1482 caps annual increases at 5% + CPI (max 10%) for properties 15+ years old."},
            ],
        },
        "general": {
            "title": "Standard Residential Lease Template Guide",
            "type": "guide",
            "sections": [
                {"title": "Essential Parties", "content": "Full legal names of all tenants and landlord/property management company."},
                {"title": "Property Description", "content": "Complete address including unit number, parking spaces, storage areas."},
                {"title": "Term", "content": "Clear start and end dates, renewal terms, month-to-month conversion."},
                {"title": "Rent", "content": "Amount, due date, acceptable payment methods, grace period."},
                {"title": "Security Deposit", "content": "Amount, conditions for return, timeline, itemization requirements."},
                {"title": "Maintenance", "content": "Landlord vs tenant responsibilities, repair request procedures, emergency contacts."},
            ],
        },
    }
    return templates.get(template_type, templates["general"])


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Portfolio Summary
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/portfolio")
async def get_portfolio_summary(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get portfolio-level summary of all user's leases."""
    try:
        extractions_service = ExtractionsService(db)
        doc_service = DocumentsService(db)

        # Get all user documents
        from sqlalchemy import select
        from models.documents import Documents
        from models.extractions import Extractions

        docs_result = await db.execute(
            select(Documents).where(Documents.created_by == current_user.id).order_by(Documents.created_at.desc())
        )
        documents = docs_result.scalars().all()

        ext_result = await db.execute(
            select(Extractions).where(Extractions.user_id == current_user.id).order_by(Extractions.created_at.desc())
        )
        extractions = ext_result.scalars().all()

        # Build portfolio data
        total_monthly_rent = 0
        total_deposits = 0
        active_leases = 0
        expiring_soon = []  # within 90 days
        upcoming_dates = []

        from datetime import datetime, timedelta
        now = datetime.now()
        ninety_days = now + timedelta(days=90)

        lease_items = []
        for ext in extractions:
            item = {
                "extraction_id": ext.id,
                "document_id": ext.document_id,
                "property_address": ext.property_address,
                "tenant_name": ext.tenant_name,
                "monthly_rent": ext.monthly_rent,
                "security_deposit": ext.security_deposit,
                "lease_start_date": ext.lease_start_date,
                "lease_end_date": ext.lease_end_date,
                "status": "active",
            }

            if ext.monthly_rent:
                total_monthly_rent += ext.monthly_rent
            if ext.security_deposit:
                total_deposits += ext.security_deposit

            # Check lease status
            if ext.lease_end_date:
                try:
                    end_date = datetime.strptime(ext.lease_end_date, "%Y-%m-%d")
                    if end_date < now:
                        item["status"] = "expired"
                    elif end_date <= ninety_days:
                        item["status"] = "expiring_soon"
                        expiring_soon.append(item)
                    else:
                        item["status"] = "active"
                        active_leases += 1

                    upcoming_dates.append({
                        "date": ext.lease_end_date,
                        "type": "lease_end",
                        "label": f"Lease ends – {ext.property_address or 'Unknown'}",
                        "extraction_id": ext.id,
                    })
                except ValueError:
                    item["status"] = "unknown"
            else:
                active_leases += 1

            lease_items.append(item)

        # Sort upcoming dates
        upcoming_dates.sort(key=lambda x: x["date"])

        return {
            "summary": {
                "total_properties": len(lease_items),
                "active_leases": active_leases,
                "expiring_soon": len(expiring_soon),
                "total_monthly_rent": round(total_monthly_rent, 2),
                "total_annual_rent": round(total_monthly_rent * 12, 2),
                "total_deposits_held": round(total_deposits, 2),
            },
            "leases": lease_items,
            "upcoming_dates": upcoming_dates[:10],
            "expiring_soon": expiring_soon,
        }

    except Exception as e:
        logger.error(f"Portfolio summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Executive Summary (AI)
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/summary/{extraction_id}")
async def get_executive_summary(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI executive summary for a lease report."""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)
        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        extraction_data = {
            "tenant_name": extraction.tenant_name,
            "landlord_name": extraction.landlord_name,
            "property_address": extraction.property_address,
            "monthly_rent": extraction.monthly_rent,
            "security_deposit": extraction.security_deposit,
            "lease_start_date": extraction.lease_start_date,
            "lease_end_date": extraction.lease_end_date,
            "pet_policy": extraction.pet_policy,
            "late_fee_terms": extraction.late_fee_terms,
            "renewal_notice_days": extraction.renewal_notice_days,
        }

        # Parse risk flags safely (no eval)
        risk_flags = []
        if extraction.risk_flags:
            risk_flags = safe_parse_json_or_literal(extraction.risk_flags)
            if not isinstance(risk_flags, list):
                risk_flags = []

        # Parse compliance data safely (no eval)
        compliance_data = None
        if extraction.compliance_data:
            compliance_data = safe_parse_json_or_literal(extraction.compliance_data)

        summary_service = ExecutiveSummaryService()
        result = await summary_service.generate_summary(extraction_data, compliance_data, risk_flags)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Executive summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Feature: PDF Report Export
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/export-pdf/{extraction_id}")
async def export_pdf_report(
    extraction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and return a professional PDF report."""
    try:
        extractions_service = ExtractionsService(db)
        extraction = await extractions_service.get_by_id(extraction_id, current_user.id)
        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        extraction_data = {
            "tenant_name": extraction.tenant_name,
            "landlord_name": extraction.landlord_name,
            "property_address": extraction.property_address,
            "monthly_rent": extraction.monthly_rent,
            "security_deposit": extraction.security_deposit,
            "lease_start_date": extraction.lease_start_date,
            "lease_end_date": extraction.lease_end_date,
            "pet_policy": extraction.pet_policy,
            "late_fee_terms": extraction.late_fee_terms,
            "renewal_notice_days": extraction.renewal_notice_days,
        }

        # Parse risk flags safely (no eval)
        risk_flags = []
        if extraction.risk_flags:
            risk_flags = safe_parse_json_or_literal(extraction.risk_flags)
            if not isinstance(risk_flags, list):
                risk_flags = []

        # Parse compliance data safely (no eval)
        compliance_data = None
        if extraction.compliance_data:
            compliance_data = safe_parse_json_or_literal(extraction.compliance_data)

        # Get benchmark data
        from services.rent_benchmark import RentBenchmarkService
        benchmark_service = RentBenchmarkService()
        benchmark_data = benchmark_service.get_benchmark(
            property_address=extraction.property_address or "",
            monthly_rent=extraction.monthly_rent,
        )

        # Get executive summary
        try:
            summary_service = ExecutiveSummaryService()
            executive_summary = await summary_service.generate_summary(extraction_data, compliance_data, risk_flags)
        except Exception:
            executive_summary = None

        # Generate PDF
        generator = PDFReportGenerator()
        pdf_bytes = generator.generate(
            extraction=extraction_data,
            risk_flags=risk_flags,
            compliance_data=compliance_data,
            benchmark_data=benchmark_data,
            executive_summary=executive_summary,
        )

        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="PDF generation failed. reportlab may not be installed.")

        filename = f"LeaseLens-Report-{extraction_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class RecordShareRequest(BaseModel):
    platform: str  # "twitter", "facebook", "linkedin" - validated in endpoint handler


@router.post("/record-share")
async def record_share_credit(
    req: RecordShareRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a social media share and award 1 free credit (max 4 per account)."""
    try:
        allowed_platforms = {"twitter", "facebook", "linkedin"}
        if req.platform not in allowed_platforms:
            raise HTTPException(status_code=400, detail=f"Invalid platform: {req.platform}")

        credits_service = User_creditsService(db)
        result = await credits_service.add_share_credit(current_user.id, req.platform)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Record share error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
