/**
 * API client that replaces @metagptx/web-sdk.
 * All calls go directly to backend REST API endpoints.
 */

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Generic API invocation (replaces client.apiCall.invoke) */
export async function apiCall<T = any>(options: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
}): Promise<{ data: T }> {
  const { url, method, data } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: authHeaders(),
  };

  if (data && method !== "GET") {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    const err: any = new Error(errorBody.detail || `API error ${response.status}`);
    err.status = response.status;
    err.data = errorBody;
    throw err;
  }

  const result = await response.json();
  return { data: result };
}

/** Documents entity helpers (replaces client.entities.documents.*) */
export const documents = {
  async query(params: { sort?: string; limit?: number; query?: any }) {
    const qs = new URLSearchParams();
    if (params.sort) qs.set("sort", params.sort);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.query) qs.set("query", JSON.stringify(params.query));

    const response = await fetch(`/api/v1/entities/documents?${qs}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to query documents");
    }
    const data = await response.json();
    return { data };
  },

  async get(params: { id: string | number }) {
    const response = await fetch(`/api/v1/entities/documents/${params.id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to get document");
    }
    const data = await response.json();
    return { data };
  },

  async create(params: { data: any }) {
    const response = await fetch("/api/v1/entities/documents", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(params.data),
    });
    if (!response.ok) {
      throw new Error("Failed to create document");
    }
    const data = await response.json();
    return { data };
  },
};

/** Extractions entity helpers (replaces client.entities.extractions.*) */
export const extractions = {
  async query(params: { query?: any; limit?: number }) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.query) qs.set("query", JSON.stringify(params.query));

    const response = await fetch(`/api/v1/entities/extractions?${qs}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to query extractions");
    }
    const data = await response.json();
    return { data };
  },
};

/** File upload via backend endpoint (replaces client.storage.upload) */
export async function uploadFile(params: {
  bucket_name: string;
  object_key: string;
  file: File;
}): Promise<void> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("bucket_name", params.bucket_name);
  formData.append("object_key", params.object_key);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/v1/storage/upload", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(errorBody.detail || "Upload failed");
  }
}
