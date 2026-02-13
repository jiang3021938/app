import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.user_credits import User_credits

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class User_creditsService:
    """Service layer for User_credits operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[User_credits]:
        """Create a new user_credits"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = User_credits(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created user_credits with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating user_credits: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for user_credits {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[User_credits]:
        """Get user_credits by ID (user can only see their own records)"""
        try:
            query = select(User_credits).where(User_credits.id == obj_id)
            if user_id:
                query = query.where(User_credits.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching user_credits {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of user_creditss (user can only see their own records)"""
        try:
            query = select(User_credits)
            count_query = select(func.count(User_credits.id))
            
            if user_id:
                query = query.where(User_credits.user_id == user_id)
                count_query = count_query.where(User_credits.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(User_credits, field):
                        query = query.where(getattr(User_credits, field) == value)
                        count_query = count_query.where(getattr(User_credits, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(User_credits, field_name):
                        query = query.order_by(getattr(User_credits, field_name).desc())
                else:
                    if hasattr(User_credits, sort):
                        query = query.order_by(getattr(User_credits, sort))
            else:
                query = query.order_by(User_credits.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching user_credits list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[User_credits]:
        """Update user_credits (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"User_credits {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated user_credits {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating user_credits {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete user_credits (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"User_credits {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted user_credits {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting user_credits {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[User_credits]:
        """Get user_credits by any field"""
        try:
            if not hasattr(User_credits, field_name):
                raise ValueError(f"Field {field_name} does not exist on User_credits")
            result = await self.db.execute(
                select(User_credits).where(getattr(User_credits, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching user_credits by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[User_credits]:
        """Get list of user_creditss filtered by field"""
        try:
            if not hasattr(User_credits, field_name):
                raise ValueError(f"Field {field_name} does not exist on User_credits")
            result = await self.db.execute(
                select(User_credits)
                .where(getattr(User_credits, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(User_credits.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching user_creditss by {field_name}: {str(e)}")
            raise

    async def add_credits(self, user_id: str, credits_to_add: int) -> Optional[User_credits]:
        """Add paid credits to a user's account."""
        from datetime import datetime
        try:
            user_credits = await self.get_by_field("user_id", user_id)
            if not user_credits:
                user_credits = await self.create({
                    "user_id": user_id,
                    "free_credits": 0,
                    "paid_credits": credits_to_add,
                    "subscription_type": "none",
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                })
            else:
                current_paid = user_credits.paid_credits or 0
                user_credits = await self.update(user_credits.id, {
                    "paid_credits": current_paid + credits_to_add,
                    "updated_at": datetime.now(),
                })
            logger.info(f"Added {credits_to_add} credits to user {user_id}")
            return user_credits
        except Exception as e:
            logger.error(f"Error adding credits for user {user_id}: {str(e)}")
            raise

    async def activate_subscription(self, user_id: str, sub_type: str, days: int = 30) -> Optional[User_credits]:
        """Activate a subscription for a user."""
        from datetime import datetime, timedelta
        try:
            user_credits = await self.get_by_field("user_id", user_id)
            expires_at = datetime.now() + timedelta(days=days)
            if not user_credits:
                user_credits = await self.create({
                    "user_id": user_id,
                    "free_credits": 0,
                    "paid_credits": 0,
                    "subscription_type": sub_type,
                    "subscription_expires_at": expires_at,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                })
            else:
                await self.update(user_credits.id, {
                    "subscription_type": sub_type,
                    "subscription_expires_at": expires_at,
                    "updated_at": datetime.now(),
                })
            logger.info(f"Activated {sub_type} subscription for user {user_id} until {expires_at}")
            return user_credits
        except Exception as e:
            logger.error(f"Error activating subscription for user {user_id}: {str(e)}")
            raise