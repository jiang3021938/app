"""
Supabase Storage service - replaces the Atoms Cloud OSS StorageService.
Uses Supabase Storage for file uploads/downloads.
"""
import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class SupabaseStorageService:
    """Service for file storage using Supabase Storage REST API."""

    def __init__(self):
        self.supabase_url = os.environ.get("SUPABASE_URL", "")
        self.supabase_key = os.environ.get("SUPABASE_KEY", "")
        self.supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

    def _headers(self, content_type: Optional[str] = None, use_service_role: bool = False) -> dict:
        key = self.supabase_service_role_key if (use_service_role and self.supabase_service_role_key) else self.supabase_key
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    async def upload_file(self, bucket_name: str, object_key: str, file_data: bytes, content_type: str = "application/octet-stream") -> str:
        """Upload a file to Supabase Storage. Returns the object key."""
        url = f"{self.supabase_url}/storage/v1/object/{bucket_name}/{object_key}"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                url,
                headers=self._headers(content_type, use_service_role=True),
                content=file_data,
            )

            if response.status_code in (409, 400):
                # File might already exist, try upsert via PUT
                response = await client.put(
                    url,
                    headers=self._headers(content_type, use_service_role=True),
                    content=file_data,
                )

            if response.status_code not in (200, 201):
                logger.error(f"Supabase storage upload failed: {response.status_code} {response.text}")
                raise ValueError(f"Failed to upload file: {response.text}")

        logger.info(f"File uploaded to Supabase: {bucket_name}/{object_key}")
        return object_key

    async def get_download_url(self, bucket_name: str, object_key: str, expires_in: int = 3600) -> str:
        """Get a signed download URL for a file in Supabase Storage."""
        url = f"{self.supabase_url}/storage/v1/object/sign/{bucket_name}/{object_key}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers={**self._headers("application/json", use_service_role=True)},
                json={"expiresIn": expires_in},
            )

            if response.status_code != 200:
                logger.error(f"Supabase signed URL failed: {response.status_code} {response.text}")
                raise ValueError(f"Failed to get download URL: {response.text}")

            data = response.json()
            signed_url = data.get("signedURL", "")
            if signed_url and not signed_url.startswith("http"):
                signed_url = f"{self.supabase_url}/storage/v1{signed_url}"
            return signed_url

    async def delete_file(self, bucket_name: str, object_key: str) -> bool:
        """Delete a file from Supabase Storage."""
        url = f"{self.supabase_url}/storage/v1/object/{bucket_name}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                url,
                headers={**self._headers("application/json", use_service_role=True)},
                json={"prefixes": [object_key]},
            )

            if response.status_code != 200:
                logger.error(f"Supabase delete failed: {response.status_code} {response.text}")
                return False

        logger.info(f"File deleted from Supabase: {bucket_name}/{object_key}")
        return True
