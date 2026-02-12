import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crosshair,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";

const client = createClient();

interface SourceLocation {
  page: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  matched_text: string;
  match_type: string;
  confidence?: number;
}

interface PDFViewerProps {
  documentId: number;
  extractionId: number;
  activeField: string | null;
  onClose?: () => void;
}

export default function PDFViewer({
  documentId,
  extractionId,
  activeField,
  onClose,
}: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sourceMap, setSourceMap] = useState<
    Record<string, SourceLocation[]>
  >({});
  const [currentPage, setCurrentPage] = useState(1);

  // Load PDF URL and source map
  useEffect(() => {
    loadPdfUrl();
    loadSourceMap();
  }, [documentId, extractionId]);

  // Navigate to page when activeField changes
  useEffect(() => {
    if (activeField && sourceMap[activeField]) {
      const locations = sourceMap[activeField];
      if (locations.length > 0) {
        const page = locations[0].page + 1; // 0-indexed to 1-indexed
        setCurrentPage(page);
        // Update iframe URL to navigate to specific page
        if (pdfUrl) {
          const baseUrl = pdfUrl.split("#")[0];
          setPdfUrl(`${baseUrl}#page=${page}`);
        }
      }
    }
  }, [activeField, sourceMap]);

  const loadPdfUrl = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await client.apiCall.invoke({
        url: `/api/v1/lease/pdf-url/${documentId}`,
        method: "GET",
      });
      if (response.data?.url) {
        setPdfUrl(response.data.url);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load PDF URL:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceMap = async () => {
    try {
      const response = await client.apiCall.invoke({
        url: `/api/v1/lease/source-map/${extractionId}`,
        method: "GET",
      });
      const data = response.data;
      setSourceMap(data.source_map || {});
    } catch (err) {
      console.error("Failed to load source map:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Source Tracing
          </span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="w-full h-full min-h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Source Tracing
          </span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center text-center text-slate-500 p-6">
          <div>
            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">PDF preview not available</p>
            <p className="text-xs text-slate-400 mt-1">
              The document could not be loaded for preview.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={loadPdfUrl}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            Source Tracing
          </span>
          {activeField && sourceMap[activeField] && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 text-xs gap-1"
            >
              <Crosshair className="h-3 w-3" />
              {activeField.replace(/_/g, " ")}
              {sourceMap[activeField][0] && (
                <span className="ml-1">
                  (p.{sourceMap[activeField][0].page + 1})
                </span>
              )}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(pdfUrl, "_blank")}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 bg-slate-200" style={{ minHeight: "400px" }}>
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 130px)" }}
          title="Lease Document PDF"
        />
      </div>
    </div>
  );
}
