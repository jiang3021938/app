import { useState, useEffect, useRef } from "react";
import { apiCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crosshair,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

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
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sourceMap, setSourceMap] = useState<Record<string, SourceLocation[]>>({});
  const [pagesMeta, setPagesMeta] = useState<{ page: number; width: number; height: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load page count and source map
  useEffect(() => {
    loadPageCount();
    loadSourceMap();
  }, [documentId, extractionId]);

  // Navigate to page when activeField changes
  useEffect(() => {
    if (activeField && sourceMap[activeField]) {
      const locations = sourceMap[activeField];
      if (locations.length > 0) {
        setCurrentPage(locations[0].page);
      }
    }
  }, [activeField, sourceMap]);

  const loadPageCount = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await apiCall({
        url: `/api/v1/lease/doc-page-count/${documentId}`,
        method: "GET",
      });
      setPageCount(response.data.page_count || 1);
    } catch (err) {
      console.error("Failed to load page count:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceMap = async () => {
    try {
      const response = await apiCall({
        url: `/api/v1/lease/source-map/${extractionId}`,
        method: "GET",
      });
      const data = response.data;
      setSourceMap(data.source_map || {});
      setPagesMeta(data.pages_meta || []);
    } catch (err) {
      console.error("Failed to load source map:", err);
    }
  };

  const getPageImageUrl = (pageNum: number) => {
    const token = localStorage.getItem("token");
    return `/api/v1/lease/pdf-page/${documentId}/${pageNum}?t=${token}`;
  };

  // Get highlight overlay position for active field
  const getHighlightStyle = (): React.CSSProperties | null => {
    if (!activeField || !sourceMap[activeField]) return null;
    const locations = sourceMap[activeField];
    const loc = locations.find((l) => l.page === currentPage);
    if (!loc || !imageRef.current) return null;

    const pageMeta = pagesMeta[currentPage] || { width: 612, height: 792 };
    const imgRect = imageRef.current.getBoundingClientRect();
    const scaleX = imgRect.width / pageMeta.width;
    const scaleY = imgRect.height / pageMeta.height;

    return {
      position: "absolute",
      left: `${loc.bbox.x0 * scaleX}px`,
      top: `${loc.bbox.y0 * scaleY}px`,
      width: `${(loc.bbox.x1 - loc.bbox.x0) * scaleX}px`,
      height: `${(loc.bbox.y1 - loc.bbox.y0) * scaleY}px`,
      backgroundColor: "rgba(59, 130, 246, 0.25)",
      border: "2px solid rgba(59, 130, 246, 0.6)",
      borderRadius: "4px",
      pointerEvents: "none",
      animation: "pulse 2s ease-in-out infinite",
    };
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

  if (error || pageCount === 0) {
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
            <p className="text-sm font-medium">Document preview not available</p>
            <p className="text-xs text-slate-400 mt-1">
              The document could not be loaded for preview.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={loadPageCount}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const highlightStyle = getHighlightStyle();

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Source Tracing</span>
          {activeField && sourceMap[activeField] && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs gap-1">
              <Crosshair className="h-3 w-3" />
              {activeField.replace(/_/g, " ")}
              <span className="ml-1">(p.{(sourceMap[activeField][0]?.page ?? 0) + 1})</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation & Zoom */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-white">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-600 min-w-[60px] text-center">
            {currentPage + 1} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
            disabled={currentPage >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-500 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Image with Highlight Overlay */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-200 p-4"
        style={{ minHeight: "400px" }}
      >
        <div className="relative inline-block mx-auto" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
          <img
            ref={imageRef}
            src={getPageImageUrl(currentPage)}
            alt={`Page ${currentPage + 1}`}
            className="max-w-full shadow-lg bg-white"
            style={{ display: "block" }}
            onError={() => setError(true)}
          />
          {/* Blue highlight overlay */}
          {highlightStyle && <div style={highlightStyle} />}
        </div>
      </div>

      {/* Inline animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
