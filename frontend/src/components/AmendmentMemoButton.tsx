import { useState } from "react";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileEdit, Loader2, AlertTriangle, CheckCircle, Download, 
  MessageSquare, ArrowRight, Shield
} from "lucide-react";
import { toast } from "sonner";

const client = createClient();

interface Amendment {
  priority: string;
  category: string;
  current_issue: string;
  suggested_language: string;
  justification: string;
  negotiation_tip: string;
}

interface MemoData {
  memo_title: string;
  property_address: string;
  prepared_date: string;
  executive_summary: string;
  risk_level: string;
  amendments: Amendment[];
  general_recommendations: string[];
  disclaimer: string;
}

interface AmendmentMemoButtonProps {
  extractionId: number;
  disabled?: boolean;
}

export default function AmendmentMemoButton({ extractionId, disabled }: AmendmentMemoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState<MemoData | null>(null);
  const [open, setOpen] = useState(false);

  const generateMemo = async () => {
    if (memo) return; // Already generated
    
    setLoading(true);
    try {
      const response = await client.apiCall.invoke({
        url: `/api/v1/lease/amendment-memo/${extractionId}`,
        method: "POST",
      });

      if (response.data?.success) {
        setMemo(response.data.memo);
      } else {
        toast.error(response.data?.error || "Failed to generate memo");
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to generate amendment memo");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !memo) {
      generateMemo();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-amber-100 text-amber-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const exportAsText = () => {
    if (!memo) return;
    
    let text = `${memo.memo_title}\n${"=".repeat(50)}\n\n`;
    text += `Property: ${memo.property_address}\nDate: ${memo.prepared_date}\n\n`;
    text += `EXECUTIVE SUMMARY\n${memo.executive_summary}\n\n`;
    text += `AMENDMENT SUGGESTIONS\n${"-".repeat(30)}\n\n`;

    memo.amendments.forEach((a, i) => {
      text += `${i + 1}. [${a.priority.toUpperCase()}] ${a.category}\n`;
      text += `   Issue: ${a.current_issue}\n`;
      text += `   Suggested Language: ${a.suggested_language}\n`;
      text += `   Justification: ${a.justification}\n`;
      text += `   Negotiation Tip: ${a.negotiation_tip}\n\n`;
    });

    if (memo.general_recommendations?.length) {
      text += `GENERAL RECOMMENDATIONS\n${"-".repeat(30)}\n`;
      memo.general_recommendations.forEach((r) => {
        text += `• ${r}\n`;
      });
    }

    text += `\n\n${memo.disclaimer}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amendment-memo-${extractionId}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Memo downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={disabled}>
          <FileEdit className="h-4 w-4" />
          Amendment Memo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-blue-600" />
            Amendment Suggestions Memo
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-slate-600">Generating amendment suggestions...</p>
            <p className="text-xs text-slate-400">This may take 10-20 seconds</p>
          </div>
        ) : memo ? (
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{memo.property_address}</p>
                  <p className="text-xs text-slate-400">Prepared: {memo.prepared_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(memo.risk_level)}>
                    {memo.risk_level === "high" ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                    {memo.risk_level} risk
                  </Badge>
                  <Button variant="outline" size="sm" onClick={exportAsText}>
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Executive Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                  <h3 className="font-medium text-blue-900 mb-1">Executive Summary</h3>
                  <p className="text-sm text-blue-800">{memo.executive_summary}</p>
                </CardContent>
              </Card>

              {/* Amendments */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Amendment Suggestions ({memo.amendments?.length || 0})
                </h3>
                <div className="space-y-4">
                  {memo.amendments?.map((amendment, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <div className={`px-4 py-2 flex items-center gap-2 ${
                        amendment.priority === "high" ? "bg-red-50" : amendment.priority === "medium" ? "bg-amber-50" : "bg-blue-50"
                      }`}>
                        <Badge className={getPriorityColor(amendment.priority)} variant="outline">
                          {amendment.priority}
                        </Badge>
                        <span className="font-medium text-slate-700">{amendment.category}</span>
                      </div>
                      <CardContent className="py-4 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Current Issue</p>
                          <p className="text-sm text-slate-700">{amendment.current_issue}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700 mb-1">Suggested Language</p>
                          <p className="text-sm text-green-900 italic">"{amendment.suggested_language}"</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Justification</p>
                          <p className="text-sm text-slate-600">{amendment.justification}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Negotiation Tip
                          </p>
                          <p className="text-sm text-blue-800">{amendment.negotiation_tip}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* General Recommendations */}
              {memo.general_recommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">General Recommendations</h3>
                  <Card>
                    <CardContent className="py-4">
                      <ul className="space-y-2">
                        {memo.general_recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-slate-400 italic">{memo.disclaimer}</p>
            </div>
          </ScrollArea>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <p>Failed to generate memo. Please try again.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
