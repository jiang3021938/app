import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Crosshair,
  X,
} from "lucide-react";
import { apiCall } from "@/lib/api";

interface BBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface SourceLocation {
  page: number;
  bbox: BBox;
  matched_text: string;
  match_type: string;
  confidence?: number;
}

interface PageMeta {
  page: number;
  width: number;
  height: number;
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [sourceMap, setSourceMap] = useState<
    Record<string, SourceLocation[]>
  >({});
  const [pagesMeta, setPagesMeta] = useState<PageMeta[]>([]);
  const [highlights, setHighlights] = useState<SourceLocation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load source map and page count
  useEffect(() => {
    loadSourceMap();
    loadPageCount();
  }, [extractionId, documentId]);

  // Load page image when page changes
  useEffect(() => {
    if (totalPages > 0) {
      loadPageImage(currentPage);
    }
  }, [currentPage, documentId, totalPages]);

  // Update highlights when activeField changes
  useEffect(() => {
    if (activeField && sourceMap[activeField]) {
      const locations = sourceMap[activeField];
      setHighlights(locations);
      // Jump to the first matching page
      if (locations.length > 0) {
        setCurrentPage(locations[0].page);
      }
    } else {
      setHighlights([]);
    }
  }, [activeField, sourceMap]);

  const loadSourceMap = async () => {
    try {
      const response = await apiCall({
        url: `/api/v1/lease/source-map/${extractionId}`,
        method: "GET",
      });
      const data = response.data;
      setSourceMap(data.source_map || {});
      setPagesMeta(data.pages_meta || []);
      // If source map has pages_meta, use it for total pages
      if (data.pages_meta?.length) {
        setTotalPages(data.pages_meta.length);
      }
    } catch (error) {
      console.error("Failed to load source map:", error);
    }
  };

  const loadPageCount = async () => {
    try {
      const response = await apiCall({
        url: `/api/v1/lease/doc-page-count/${documentId}`,
        method: "GET",
      });
      if (response.data?.page_count) {
        setTotalPages((prev) => prev || response.data.page_count);
      }
    } catch (error) {
      console.error("Failed to load page count:", error);
    }
  };

  const loadPageImage = async (pageNum: number) => {
    setLoading(true);
    setImageError(false);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(
        `/api/v1/lease/pdf-page/${documentId}/${pageNum}`,
        { headers }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPageImage(url);
      } else {
        setPageImage(null);
        setImageError(true);
      }
    } catch (error) {
      console.error("Failed to load page image:", error);
      setPageImage(null);
      setImageError(true);
    } finally {
      setLoading(false);
    }
  };

  // Build a direct URL for the page image as fallback
  const getDirectPageUrl = (pageNum: number) => {
    // Try using the backend URL directly
    return `/api/v1/lease/pdf-page/${documentId}/${pageNum}`;
  };

  const getHighlightStyle = (
    location: SourceLocation
  ): React.CSSProperties | null => {
    const pageMeta = pagesMeta.find((p) => p.page === location.page);
    if (!pageMeta || location.page !== currentPage) return null;
    if (!imageRef.current) return null;

    const imgWidth = imageRef.current.clientWidth;
    const imgHeight = imageRef.current.clientHeight;

    const scaleX = imgWidth / pageMeta.width;
    const scaleY = imgHeight / pageMeta.height;

    const padding = 4;

    return {
      position: "absolute" as const,
      left: `${location.bbox.x0 * scaleX - padding}px`,
      top: `${location.bbox.y0 * scaleY - padding}px`,
      width: `${(location.bbox.x1 - location.bbox.x0) * scaleX + padding * 2}px`,
      height: `${(location.bbox.y1 - location.bbox.y0) * scaleY + padding * 2}px`,
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      border: "2px solid rgba(59, 130, 246, 0.7)",
      borderRadius: "4px",
      pointerEvents: "none" as const,
      transition: "all 0.3s ease",
      animation: "pulse-highlight 1.5s ease-in-out infinite",
    };
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  if (totalPages === 0 && !loading) {
    return (
      <Card className="p-6 text-center text-slate-500">
        <Crosshair className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">Document preview not available.</p>
        <p className="text-xs text-slate-400 mt-1">
          Re-analyze the document to enable source tracing.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 min-w-[80px] text-center">
            Page {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {activeField && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 text-xs gap-1"
            >
              <Crosshair className="h-3 w-3" />
              {activeField.replace(/_/g, " ")}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Document Page Display */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-200 p-4"
        style={{ minHeight: "400px" }}
      >
        <style>{`
          @keyframes pulse-highlight {
            0%, 100% { background-color: rgba(59, 130, 246, 0.15); }
            50% { background-color: rgba(59, 130, 246, 0.35); }
          }
        `}</style>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-full max-w-[600px] h-[800px]" />
          </div>
        ) : (
          <div
            className="relative mx-auto shadow-lg bg-white"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              width: "fit-content",
            }}
          >
            {/* Try blob URL first, then fallback to direct URL */}
            <img
              ref={imageRef}
              src={pageImage && !imageError ? pageImage : getDirectPageUrl(currentPage)}
              alt={`Page ${currentPage + 1}`}
              className="block max-w-full"
              onLoad={() => {
                // Force re-render highlights after image loads
                setHighlights((prev) => [...prev]);
              }}
              onError={() => {
                if (pageImage && !imageError) {
                  // Blob URL failed, try direct URL
                  setImageError(true);
                }
              }}
            />

            {/* Highlight overlays */}
            {highlights
              .filter((h) => h.page === currentPage)
              .map((location, idx) => {
                const style = getHighlightStyle(location);
                if (!style) return null;
                return (
                  <div
                    key={idx}
                    style={style}
                    title={`Source: ${location.matched_text?.substring(0, 100)}...`}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
