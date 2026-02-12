import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Upload as UploadIcon, X, CheckCircle, AlertCircle, 
  ArrowLeft, Loader2, Files, Trash2, CreditCard, Lock, FileUp, User
} from "lucide-react";
import { toast } from "sonner";
import { checkAuthStatus } from "@/lib/checkAuth";

const client = createClient();

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc");
}

interface FileItem {
  file: File;
  id: string;
  status: "pending" | "uploading" | "analyzing" | "completed" | "failed";
  progress: number;
  documentId?: number;
  extractionId?: number;
  error?: string;
}

interface Credits {
  total_credits: number;
  free_credits: number;
  paid_credits: number;
  is_admin: boolean;
  can_analyze: boolean;
  can_batch: boolean;
  subscription_type: string;
}

export default function BatchUploadPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
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

  const addFiles = (newFiles: FileList) => {
    const accepted = Array.from(newFiles).filter(isAcceptedFile);
    
    if (accepted.length !== newFiles.length) {
      toast.warning("Only PDF and Word (.docx) files are accepted");
    }
    
    const fileItems: FileItem[] = accepted.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      progress: 0,
    }));
    
    setFiles((prev) => [...prev, ...fileItems]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const updateFileStatus = (id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setOverallProgress(0);

    const documentIds: number[] = [];
    const fileIdMap: Record<number, string> = {};

    // Step 1: Upload all files
    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      
      try {
        updateFileStatus(fileItem.id, { status: "uploading", progress: 20 });

        const timestamp = Date.now();
        const fileKey = `leases/${user.id}/${timestamp}-${fileItem.file.name}`;

        await client.storage.upload({
          bucket_name: "lease-documents",
          object_key: fileKey,
          file: fileItem.file,
        });

        updateFileStatus(fileItem.id, { progress: 50 });

        const docResponse = await client.entities.documents.create({
          data: {
            file_name: fileItem.file.name,
            file_key: fileKey,
            file_size: fileItem.file.size,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });

        const docId = docResponse.data.id;
        documentIds.push(docId);
        fileIdMap[docId] = fileItem.id;
        
        updateFileStatus(fileItem.id, { 
          documentId: docId, 
          progress: 60,
          status: "analyzing" 
        });

        setOverallProgress(Math.round(((i + 1) / files.length) * 50));
      } catch (err: any) {
        updateFileStatus(fileItem.id, {
          status: "failed",
          error: err?.message || "Upload failed",
        });
      }
    }

    // Step 2: Batch analyze
    if (documentIds.length > 0) {
      try {
        const analysisResponse = await client.apiCall.invoke({
          url: "/api/v1/lease/analyze-batch",
          method: "POST",
          data: { document_ids: documentIds },
        });

        const results = analysisResponse.data.results || [];
        
        for (const result of results) {
          const fileId = fileIdMap[result.document_id];
          if (fileId) {
            if (result.success) {
              updateFileStatus(fileId, {
                status: "completed",
                progress: 100,
                extractionId: result.extraction_id,
              });
            } else {
              updateFileStatus(fileId, {
                status: "failed",
                error: result.error || "Analysis failed",
              });
            }
          }
        }

        setOverallProgress(100);
        
        const completed = results.filter((r: any) => r.success).length;
        if (completed > 0) {
          toast.success(`Successfully analyzed ${completed} document(s)`);
        }
      } catch (err: any) {
        // Handle credit errors gracefully
        if (err?.status === 402 || err?.data?.detail?.toLowerCase().includes("credit")) {
          toast.error("Insufficient credits. Please purchase more credits.");
          // Mark remaining as failed
          for (const docId of documentIds) {
            const fileId = fileIdMap[docId];
            if (fileId) {
              updateFileStatus(fileId, {
                status: "failed",
                error: "Insufficient credits",
              });
            }
          }
        } else {
          toast.error(err?.data?.detail || "Batch analysis failed");
        }
      }
    }

    setProcessing(false);
  };

  const completedFiles = files.filter((f) => f.status === "completed");
  const failedFiles = files.filter((f) => f.status === "failed");
  const pendingFiles = files.filter((f) => f.status === "pending");

  // Determine if batch upload should be locked
  const isBatchLocked = credits !== null && !credits.can_batch;

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
              <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Paywall for free/no-credit users */}
        {isBatchLocked ? (
          <Card className="border-blue-200">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <Lock className="h-10 w-10 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Batch Upload Requires a Paid Plan
                  </h2>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Batch uploading allows you to analyze multiple lease documents at once. 
                    Purchase credits or subscribe to unlock this feature.
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-6 max-w-sm w-full">
                  <h3 className="font-medium text-slate-700 mb-3">What you get:</h3>
                  <ul className="text-sm text-slate-600 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Upload multiple documents at once
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      AI analyzes all documents in parallel
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Detailed compliance reports for each
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      PDF & Word file support
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button size="lg" onClick={() => navigate("/pricing")} className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    View Pricing Plans
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/upload")}>
                    Upload Single Document
                  </Button>
                </div>
                
                {credits && credits.total_credits === 1 && (
                  <p className="text-sm text-slate-500">
                    You have 1 free credit — use it to{" "}
                    <button onClick={() => navigate("/upload")} className="text-blue-600 underline hover:text-blue-700">
                      analyze a single document
                    </button>{" "}
                    first.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Normal batch upload UI */
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Files className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">Batch Upload</CardTitle>
              </div>
              <CardDescription>
                Upload multiple lease documents (PDF or Word) for AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Credit warning if running low */}
              {credits && !credits.is_admin && credits.total_credits > 0 && credits.total_credits <= 3 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    You have {credits.total_credits} credit{credits.total_credits !== 1 ? "s" : ""} remaining. 
                    Each document uses 1 credit.{" "}
                    <button onClick={() => navigate("/pricing")} className="underline font-medium">
                      Get more credits
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <FileUp className="h-12 w-12 text-slate-400 mx-auto" />
                  <div>
                    <p className="font-medium text-slate-700">
                      Drag and drop your files here
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports PDF and Word (.docx) files — multiple files supported
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-700">
                      Selected Files ({files.length})
                      {credits && !credits.is_admin && (
                        <span className="text-sm font-normal text-slate-500 ml-2">
                          — will use {pendingFiles.length} credit{pendingFiles.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      disabled={processing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {files.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {fileItem.status === "pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {fileItem.status === "uploading" && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Uploading
                            </Badge>
                          )}
                          {fileItem.status === "analyzing" && (
                            <Badge className="bg-amber-100 text-amber-700">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Analyzing
                            </Badge>
                          )}
                          {fileItem.status === "completed" && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}
                          {fileItem.status === "failed" && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {fileItem.error === "Insufficient credits" ? "No Credits" : "Failed"}
                            </Badge>
                          )}
                          
                          {!processing && fileItem.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(fileItem.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {fileItem.status === "completed" && fileItem.documentId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/report/${fileItem.documentId}`)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Progress */}
              {processing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Processing batch...</span>
                    <span className="text-slate-500">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
              )}

              {/* Summary */}
              {files.length > 0 && !processing && (completedFiles.length > 0 || failedFiles.length > 0) && (
                <Alert className={failedFiles.length > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}>
                  <AlertDescription>
                    <div className="flex items-center gap-4">
                      {completedFiles.length > 0 && (
                        <span className="text-green-700">
                          ✓ {completedFiles.length} completed
                        </span>
                      )}
                      {failedFiles.length > 0 && (
                        <span className="text-red-700">
                          ✗ {failedFiles.length} failed
                        </span>
                      )}
                      {pendingFiles.length > 0 && (
                        <span className="text-slate-600">
                          {pendingFiles.length} pending
                        </span>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={processFiles}
                  disabled={pendingFiles.length === 0 || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Upload & Analyze All ({pendingFiles.length})
                    </>
                  )}
                </Button>
                
                {completedFiles.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                  >
                    View Dashboard
                  </Button>
                )}
              </div>

              {/* Info */}
              <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-600">
                <p className="font-medium mb-2">Batch Processing Benefits:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload multiple leases at once (PDF & Word)</li>
                  <li>AI analyzes all documents in parallel</li>
                  <li>Each document gets a detailed compliance report</li>
                  <li>View all results in your dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
