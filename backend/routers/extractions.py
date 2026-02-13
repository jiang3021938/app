import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.extractions import ExtractionsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/extractions", tags=["extractions"])


# ---------- Pydantic Schemas ----------
class ExtractionsData(BaseModel):
    """Entity data schema (for create/update)"""
    document_id: int
    tenant_name: str = None
    landlord_name: str = None
    property_address: str = None
    monthly_rent: float = None
    security_deposit: float = None
    lease_start_date: str = None
    lease_end_date: str = None
    renewal_notice_days: int = None
    pet_policy: str = None
    late_fee_terms: str = None
    risk_flags: str = None
    audit_checklist: str = None
    compliance_data: str = None
    raw_extraction: str = None
    source_map: str = None
    pages_meta: str = None
    created_at: Optional[datetime] = None


class ExtractionsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    document_id: Optional[int] = None
    tenant_name: Optional[str] = None
    landlord_name: Optional[str] = None
    property_address: Optional[str] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
    lease_start_date: Optional[str] = None
    lease_end_date: Optional[str] = None
    renewal_notice_days: Optional[int] = None
    pet_policy: Optional[str] = None
    late_fee_terms: Optional[str] = None
    risk_flags: Optional[str] = None
    audit_checklist: Optional[str] = None
    compliance_data: Optional[str] = None
    raw_extraction: Optional[str] = None
    source_map: Optional[str] = None
    pages_meta: Optional[str] = None
    created_at: Optional[datetime] = None


class ExtractionsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    document_id: int
    tenant_name: Optional[str] = None
    landlord_name: Optional[str] = None
    property_address: Optional[str] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
    lease_start_date: Optional[str] = None
    lease_end_date: Optional[str] = None
    renewal_notice_days: Optional[int] = None
    pet_policy: Optional[str] = None
    late_fee_terms: Optional[str] = None
    risk_flags: Optional[str] = None
    audit_checklist: Optional[str] = None
    compliance_data: Optional[str] = None
    raw_extraction: Optional[str] = None
    source_map: Optional[str] = None
    pages_meta: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExtractionsListResponse(BaseModel):
    """List response schema"""
    items: List[ExtractionsResponse]
    total: int
    skip: int
    limit: int


class ExtractionsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[ExtractionsData]


class ExtractionsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: ExtractionsUpdateData


class ExtractionsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[ExtractionsBatchUpdateItem]


class ExtractionsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=ExtractionsListResponse)
async def query_extractionss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query extractionss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying extractionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = ExtractionsService(db)
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
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} extractionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying extractionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=ExtractionsListResponse)
async def query_extractionss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query extractionss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying extractionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = ExtractionsService(db)
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
        logger.debug(f"Found {result['total']} extractionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying extractionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=ExtractionsResponse)
async def get_extractions(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single extractions by ID (user can only see their own records)"""
    logger.debug(f"Fetching extractions with id: {id}, fields={fields}")
    
    service = ExtractionsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Extractions with id {id} not found")
            raise HTTPException(status_code=404, detail="Extractions not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching extractions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=ExtractionsResponse, status_code=201)
async def create_extractions(
    data: ExtractionsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new extractions"""
    logger.debug(f"Creating new extractions with data: {data}")
    
    service = ExtractionsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create extractions")
        
        logger.info(f"Extractions created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating extractions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating extractions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[ExtractionsResponse], status_code=201)
async def create_extractionss_batch(
    request: ExtractionsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple extractionss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} extractionss")
    
    service = ExtractionsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} extractionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[ExtractionsResponse])
async def update_extractionss_batch(
    request: ExtractionsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple extractionss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} extractionss")
    
    service = ExtractionsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} extractionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=ExtractionsResponse)
async def update_extractions(
    id: int,
    data: ExtractionsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing extractions (requires ownership)"""
    logger.debug(f"Updating extractions {id} with data: {data}")

    service = ExtractionsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Extractions with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Extractions not found")
        
        logger.info(f"Extractions {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating extractions {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating extractions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_extractionss_batch(
    request: ExtractionsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple extractionss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} extractionss")
    
    service = ExtractionsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} extractionss successfully")
        return {"message": f"Successfully deleted {deleted_count} extractionss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_extractions(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single extractions by ID (requires ownership)"""
    logger.debug(f"Deleting extractions with id: {id}")
    
    service = ExtractionsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Extractions with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Extractions not found")
        
        logger.info(f"Extractions {id} deleted successfully")
        return {"message": "Extractions deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting extractions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")