import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.state_regulations import State_regulations

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class State_regulationsService:
    """Service layer for State_regulations operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[State_regulations]:
        """Create a new state_regulations"""
        try:
            obj = State_regulations(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created state_regulations with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating state_regulations: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[State_regulations]:
        """Get state_regulations by ID"""
        try:
            query = select(State_regulations).where(State_regulations.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching state_regulations {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of state_regulationss"""
        try:
            query = select(State_regulations)
            count_query = select(func.count(State_regulations.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(State_regulations, field):
                        query = query.where(getattr(State_regulations, field) == value)
                        count_query = count_query.where(getattr(State_regulations, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(State_regulations, field_name):
                        query = query.order_by(getattr(State_regulations, field_name).desc())
                else:
                    if hasattr(State_regulations, sort):
                        query = query.order_by(getattr(State_regulations, sort))
            else:
                query = query.order_by(State_regulations.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching state_regulations list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[State_regulations]:
        """Update state_regulations"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"State_regulations {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated state_regulations {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating state_regulations {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete state_regulations"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"State_regulations {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted state_regulations {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting state_regulations {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[State_regulations]:
        """Get state_regulations by any field"""
        try:
            if not hasattr(State_regulations, field_name):
                raise ValueError(f"Field {field_name} does not exist on State_regulations")
            result = await self.db.execute(
                select(State_regulations).where(getattr(State_regulations, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching state_regulations by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[State_regulations]:
        """Get list of state_regulationss filtered by field"""
        try:
            if not hasattr(State_regulations, field_name):
                raise ValueError(f"Field {field_name} does not exist on State_regulations")
            result = await self.db.execute(
                select(State_regulations)
                .where(getattr(State_regulations, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(State_regulations.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching state_regulationss by {field_name}: {str(e)}")
            raise