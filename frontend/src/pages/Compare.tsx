import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, ArrowLeft, Scale, CheckCircle, Loader2, 
  Trophy, AlertTriangle, Lightbulb
} from "lucide-react";
import { toast } from "sonner";

const client = createClient();

interface DocOption {
  id: number;
  file_name: string;
  created_at: string;
  extraction_id?: number;
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocOption[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const authRes = await client.auth.me();
      if (!authRes.data) { navigate("/dashboard"); return; }

      const docsRes = await client.entities.documents.query({ sort: "-created_at", limit: 50 });
      const docs = (docsRes.data?.items || []).filter((d: any) => d.status === "completed");

      // Get extraction IDs
      const docsWithExtractions: DocOption[] = [];
      for (const doc of docs) {
        try {
          const extRes = await client.apiCall.invoke({
            url: `/api/v1/lease/source-map/${doc.id}`,
            method: "GET",
          });
          // If source-map works, extraction exists
          docsWithExtractions.push({ ...doc, extraction_id: doc.id });
        } catch {
          docsWithExtractions.push({ ...doc });
        }
      }
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (docId: number) => {
    setSelected((prev) => {
      if (prev.includes(docId)) return prev.filter((id) => id !== docId);
      if (prev.length >= 3) { toast.warning("Maximum 3 leases for comparison"); return prev; }
      return [...prev, docId];
    });
  };

  const runComparison = async () => {
    if (selected.length < 2) return;
    setComparing(true);
    setResult(null);

    try {
      // Use document IDs as extraction IDs (they map 1:1 in this system)
      const response = await client.apiCall.invoke({
        url: "/api/v1/lease/compare",
        method: "POST",
        data: { extraction_ids: selected },
      });

      if (response.data?.success) {
        setResult(response.data);
      } else {
        toast.error(response.data?.error || "Comparison failed");
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to compare leases");
    } finally {
      setComparing(false);
    }
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return "—";
    if (type === "currency") return `$${Number(value).toLocaleString()}`;
    return String(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">Lease Comparison</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!result ? (
          <>
            {/* Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Leases to Compare</CardTitle>
                <CardDescription>Choose 2-3 analyzed documents for side-by-side comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No analyzed documents yet. Upload and analyze leases first.</p>
                    <Button className="mt-4" onClick={() => navigate("/upload")}>Upload Lease</Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selected.includes(doc.id)
                            ? "bg-blue-50 border border-blue-300"
                            : "bg-slate-50 border border-transparent hover:bg-slate-100"
                        }`}
                        onClick={() => toggleSelect(doc.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                          className="h-4 w-4 rounded"
                        />
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{doc.file_name}</p>
                          <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                        {selected.includes(doc.id) && (
                          <Badge className="bg-blue-100 text-blue-700">
                            #{selected.indexOf(doc.id) + 1}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={runComparison}
                  disabled={selected.length < 2 || comparing}
                >
                  {comparing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Scale className="h-4 w-4 mr-2" />Compare {selected.length} Leases</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Results */}
            <Button variant="ghost" className="mb-4" onClick={() => setResult(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />New Comparison
            </Button>

            {/* AI Summary */}
            {result.ai_analysis && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">AI Analysis Summary</h3>
                      <p className="text-sm text-blue-800">{result.ai_analysis.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Table */}
            {result.comparison_table && (
              <Card className="mb-6 overflow-hidden">
                <CardHeader>
                  <CardTitle>Side-by-Side Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left text-sm font-medium text-slate-600 px-4 py-3 border-b">Field</th>
                          {result.labels?.map((label: string, i: number) => (
                            <th key={i} className="text-left text-sm font-medium text-slate-600 px-4 py-3 border-b">
                              {label.length > 30 ? label.substring(0, 30) + "..." : label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.comparison_table.table?.map((row: any, idx: number) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="text-sm font-medium text-slate-700 px-4 py-3 border-b">{row.field}</td>
                            {row.values?.map((val: any, i: number) => (
                              <td key={i} className="text-sm text-slate-600 px-4 py-3 border-b">
                                {formatValue(val, row.type)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Dimension Analysis */}
            {result.ai_analysis?.dimensions && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.ai_analysis.dimensions.map((dim: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-700">{dim.category}</h4>
                        {dim.winner && (
                          <Badge className="bg-green-100 text-green-700">
                            <Trophy className="h-3 w-3 mr-1" />{dim.winner}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{dim.analysis}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.ai_analysis?.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.ai_analysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
