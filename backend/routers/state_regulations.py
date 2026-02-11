import json
import logging
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.state_regulations import State_regulationsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/state_regulations", tags=["state_regulations"])


# ---------- Pydantic Schemas ----------
class State_regulationsData(BaseModel):
    """Entity data schema (for create/update)"""
    state_code: str
    state_name: str
    regulation_category: str
    regulation_title: str
    regulation_content: str
    max_amount: float = None
    max_multiplier: float = None
    required_days: int = None
    source_url: str = None
    last_updated: str = None


class State_regulationsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    state_code: Optional[str] = None
    state_name: Optional[str] = None
    regulation_category: Optional[str] = None
    regulation_title: Optional[str] = None
    regulation_content: Optional[str] = None
    max_amount: Optional[float] = None
    max_multiplier: Optional[float] = None
    required_days: Optional[int] = None
    source_url: Optional[str] = None
    last_updated: Optional[str] = None


class State_regulationsResponse(BaseModel):
    """Entity response schema"""
    id: int
    state_code: str
    state_name: str
    regulation_category: str
    regulation_title: str
    regulation_content: str
    max_amount: Optional[float] = None
    max_multiplier: Optional[float] = None
    required_days: Optional[int] = None
    source_url: Optional[str] = None
    last_updated: Optional[str] = None

    class Config:
        from_attributes = True


class State_regulationsListResponse(BaseModel):
    """List response schema"""
    items: List[State_regulationsResponse]
    total: int
    skip: int
    limit: int


class State_regulationsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[State_regulationsData]


class State_regulationsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: State_regulationsUpdateData


class State_regulationsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[State_regulationsBatchUpdateItem]


class State_regulationsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=State_regulationsListResponse)
async def query_state_regulationss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query state_regulationss with filtering, sorting, and pagination"""
    logger.debug(f"Querying state_regulationss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = State_regulationsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} state_regulationss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying state_regulationss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=State_regulationsListResponse)
async def query_state_regulationss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query state_regulationss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying state_regulationss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = State_regulationsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} state_regulationss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying state_regulationss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=State_regulationsResponse)
async def get_state_regulations(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single state_regulations by ID"""
    logger.debug(f"Fetching state_regulations with id: {id}, fields={fields}")
    
    service = State_regulationsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"State_regulations with id {id} not found")
            raise HTTPException(status_code=404, detail="State_regulations not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching state_regulations {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=State_regulationsResponse, status_code=201)
async def create_state_regulations(
    data: State_regulationsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new state_regulations"""
    logger.debug(f"Creating new state_regulations with data: {data}")
    
    service = State_regulationsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create state_regulations")
        
        logger.info(f"State_regulations created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating state_regulations: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating state_regulations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[State_regulationsResponse], status_code=201)
async def create_state_regulationss_batch(
    request: State_regulationsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple state_regulationss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} state_regulationss")
    
    service = State_regulationsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} state_regulationss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[State_regulationsResponse])
async def update_state_regulationss_batch(
    request: State_regulationsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple state_regulationss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} state_regulationss")
    
    service = State_regulationsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} state_regulationss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=State_regulationsResponse)
async def update_state_regulations(
    id: int,
    data: State_regulationsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing state_regulations"""
    logger.debug(f"Updating state_regulations {id} with data: {data}")

    service = State_regulationsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"State_regulations with id {id} not found for update")
            raise HTTPException(status_code=404, detail="State_regulations not found")
        
        logger.info(f"State_regulations {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating state_regulations {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating state_regulations {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_state_regulationss_batch(
    request: State_regulationsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple state_regulationss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} state_regulationss")
    
    service = State_regulationsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} state_regulationss successfully")
        return {"message": f"Successfully deleted {deleted_count} state_regulationss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_state_regulations(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single state_regulations by ID"""
    logger.debug(f"Deleting state_regulations with id: {id}")
    
    service = State_regulationsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"State_regulations with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="State_regulations not found")
        
        logger.info(f"State_regulations {id} deleted successfully")
        return {"message": "State_regulations deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting state_regulations {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")