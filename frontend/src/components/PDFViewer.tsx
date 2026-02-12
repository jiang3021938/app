import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crosshair,
  X,
  FileText,
  Info,
} from "lucide-react";
import { apiCall } from "@/lib/api";

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
  const [sourceMap, setSourceMap] = useState<Record<string, SourceLocation[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSourceMap();
  }, [extractionId, documentId]);

  const loadSourceMap = async () => {
    setLoading(true);
    try {
      const response = await apiCall({
        url: `/api/v1/lease/source-map/${extractionId}`,
        method: "GET",
      });
      const data = response.data;
      setSourceMap(data.source_map || {});
    } catch (error) {
      console.error("Failed to load source map:", error);
    } finally {
      setLoading(false);
    }
  };

  const fieldNames = Object.keys(sourceMap);
  const activeLocations = activeField ? (sourceMap[activeField] || []) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Source Tracing</span>
        </div>
        <div className="flex items-center gap-2">
          {activeField && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs gap-1">
              <Crosshair className="h-3 w-3" />
              {activeField.replace(/_/g, " ")}
            </Badge>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4" style={{ minHeight: "400px" }}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activeField && activeLocations.length > 0 ? (
          /* Show source text for the active field */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Crosshair className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Source for: <span className="text-blue-600">{activeField.replace(/_/g, " ")}</span>
              </span>
            </div>
            {activeLocations.map((location, idx) => (
              <Card key={idx} className="p-3 border-blue-200 bg-blue-50/50">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                    Page {(location.page || 0) + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 break-words leading-relaxed">
                      "{location.matched_text}"
                    </p>
                    {location.confidence && (
                      <p className="text-xs text-slate-400 mt-1">
                        Confidence: {Math.round(location.confidence * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : fieldNames.length > 0 ? (
          /* Show all available source fields */
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3 text-slate-500">
              <Info className="h-4 w-4" />
              <span className="text-xs">Click a <Crosshair className="h-3 w-3 inline" /> field in the report to view its source text.</span>
            </div>
            {fieldNames.map((field) => (
              <div key={field} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-sm">
                <Crosshair className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="text-slate-600">{field.replace(/_/g, " ")}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {sourceMap[field].length} source{sourceMap[field].length > 1 ? "s" : ""}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          /* No source data available */
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium mb-1">PDF preview not available</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              This document was analyzed in memory without storing the original PDF.
              Source tracing data will appear here when available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
