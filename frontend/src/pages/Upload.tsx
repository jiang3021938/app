import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload as UploadIcon, X, CheckCircle, AlertCircle, ArrowLeft, Loader2, CreditCard, FileUp, User } from "lucide-react";
import { toast } from "sonner";
import AnalysisProgress from "@/components/AnalysisProgress";
import { checkAuthStatus } from "@/lib/checkAuth";

const client = createClient();

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx";

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc");
}

function getFileIcon(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    return "📄";
  }
  return "📋";
}

interface Credits {
  total_credits: number;
  free_credits: number;
  paid_credits: number;
  is_admin: boolean;
  can_analyze: boolean;
  subscription_type: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: authUser } = await checkAuthStatus();
      if (!authUser) {
        navigate("/dashboard");
      } else {
        setUser(authUser);
        await loadCredits();
      }
    } catch {
      navigate("/dashboard");
    }
  };

  const loadCredits = async () => {
    try {
      const creditsResponse = await client.apiCall.invoke({
        url: "/api/v1/lease/credits",
        method: "GET",
      });
      setCredits(creditsResponse.data);
    } catch (err) {
      console.error("Failed to load credits:", err);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isAcceptedFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setError("Please upload a PDF or Word (.docx) file");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isAcceptedFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setError("Please upload a PDF or Word (.docx) file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Pre-check credits before uploading
    if (credits && !credits.can_analyze) {
      setError("no_credits");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const timestamp = Date.now();
      const fileKey = `leases/${user.id}/${timestamp}-${file.name}`;

      setProgress(20);
      await client.storage.upload({
        bucket_name: "lease-documents",
        object_key: fileKey,
        file: file,
      });

      setProgress(50);

      const docResponse = await client.entities.documents.create({
        data: {
          file_name: file.name,
          file_key: fileKey,
          file_size: file.size,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      setProgress(70);
      setUploading(false);
      setAnalyzing(true);

      const analysisResponse = await client.apiCall.invoke({
        url: "/api/v1/lease/analyze",
        method: "POST",
        data: { document_id: docResponse.data.id },
      });

      setProgress(100);

      if (analysisResponse.data.success) {
        toast.success("Analysis complete!");
        navigate(`/report/${docResponse.data.id}`);
      } else {
        setError(analysisResponse.data.error || "Analysis failed");
        setAnalyzing(false);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err?.status === 402 || err?.data?.detail?.toLowerCase().includes("credit")) {
        setError("no_credits");
      } else {
        setError(err?.data?.detail || err?.message || "Upload failed. Please try again.");
      }
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const noCredits = credits !== null && !credits.can_analyze;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <button 
                onClick={() => navigate("/")} 
                className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
              >
                LeaseLenses
              </button>
            </div>
          </div>
          {credits && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {user && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{user.email || user.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                {credits.is_admin ? (
                  <span className="text-green-600 font-medium">Admin (Unlimited)</span>
                ) : (
                  <span>{credits.total_credits} credit{credits.total_credits !== 1 ? "s" : ""} remaining</span>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* No Credits Warning Card */}
        {noCredits && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">No Credits Remaining</h3>
                  <p className="text-amber-700 mt-1">
                    You've used all your available credits. Purchase more credits or subscribe to continue analyzing documents.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/pricing")} className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    View Pricing
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inline credit error from failed upload attempt */}
        {error === "no_credits" && !noCredits && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <CreditCard className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You don't have enough credits to analyze this document.{" "}
              <button
                onClick={() => navigate("/pricing")}
                className="underline font-medium hover:text-amber-900"
              >
                Purchase credits
              </button>{" "}
              to continue.
            </AlertDescription>
          </Alert>
        )}

        <Card className={noCredits ? "opacity-60 pointer-events-none" : ""}>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Lease Document</CardTitle>
            <CardDescription>
              Upload a PDF or Word (.docx) file of your lease agreement for AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : file
                  ? "border-green-500 bg-green-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {getFileIcon(file.name)} {file.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileUp className="h-12 w-12 text-slate-400 mx-auto" />
                  <div>
                    <p className="font-medium text-slate-700">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-slate-500">Supports PDF and Word (.docx) files</p>
                  </div>
                  <input
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Error Alert (non-credit errors) */}
            {error && error !== "no_credits" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Uploading document...</span>
                  <span className="text-slate-500">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Analysis Steps Animation */}
            <AnalysisProgress active={analyzing} />

            {/* Upload Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleUpload}
              disabled={!file || uploading || analyzing || noCredits}
            >
              {uploading || analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? "Uploading..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload & Analyze
                </>
              )}
            </Button>

            {/* Info */}
            <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-600">
              <p className="font-medium mb-2">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Your document is securely uploaded to our servers</li>
                <li>AI extracts key terms, dates, and financial details</li>
                <li>Risk analysis identifies potential issues</li>
                <li>You receive a detailed audit report</li>
              </ol>
            </div>

            <p className="text-xs text-slate-500 text-center">
              By uploading, you agree to our terms of service. This tool provides 
              information only and does not constitute legal advice.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
