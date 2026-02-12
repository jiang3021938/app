import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, Plus, CreditCard, LogOut, Clock, CheckCircle, 
  AlertCircle, User, Files, Download, Building2, Scale
} from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { checkAuthStatus, performLogout } from "@/lib/checkAuth";

const client = createClient();

interface Document {
  id: number;
  file_name: string;
  status: string;
  created_at: string;
}

interface Credits {
  free_credits: number;
  paid_credits: number;
  total_credits: number;
  subscription_type: string;
  is_admin: boolean;
  can_analyze: boolean;
  can_batch: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [authType, setAuthType] = useState<"atoms" | "email" | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: authUser, authType: type } = await checkAuthStatus();
      if (authUser) {
        setUser(authUser);
        setAuthType(type);
        await loadData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load documents
      const docsResponse = await client.entities.documents.query({
        sort: "-created_at",
        limit: 50
      });
      setDocuments(docsResponse.data?.items || []);

      // Load credits
      const creditsResponse = await client.apiCall.invoke({
        url: "/api/v1/lease/credits",
        method: "GET"
      });
      setCredits(creditsResponse.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await performLogout(authType);
    setUser(null);
    setDocuments([]);
    setCredits(null);
    setAuthType(null);
    navigate("/");
  };

  const toggleDocSelection = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleUploadCheck = () => {
    if (credits && credits.total_credits === 0 && !credits.is_admin) {
      setShowNoCreditsModal(true);
    } else {
      navigate("/upload");
    }
  };

  const handleBatchUploadCheck = () => {
    if (credits && credits.total_credits === 0 && !credits.is_admin) {
      setShowNoCreditsModal(true);
    } else {
      navigate("/batch-upload");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to LeaseLenses</CardTitle>
            <CardDescription>Sign in to analyze your lease documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleLoginButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button onClick={handleLogin} variant="outline" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Sign in with Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <button 
              onClick={() => navigate("/")} 
              className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
            >
              LeaseLenses
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Home
            </Button>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4" />
              <span>{user.email || user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Documents</CardTitle>
              <Files className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{documents.length}</div>
              <p className="text-xs text-slate-500 mt-1">Analyzed leases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Available Credits</CardTitle>
              <CreditCard className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{credits?.total_credits || 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                {credits?.free_credits || 0} free + {credits?.paid_credits || 0} paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Subscription</CardTitle>
              <Scale className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 capitalize">
                {credits?.subscription_type || "Free"}
              </div>
              <p className="text-xs text-slate-500 mt-1">Current plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleUploadCheck} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Analyze New Lease
          </Button>
          <Button onClick={handleBatchUploadCheck} variant="outline">
            <Files className="h-4 w-4 mr-2" />
            Batch Upload
          </Button>
          <Button onClick={() => navigate("/pricing")} variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Get More Credits
          </Button>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Documents
            </CardTitle>
            <CardDescription>View and manage your analyzed lease documents</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents yet</h3>
                <p className="text-slate-500 mb-4">Upload your first lease document to get started</p>
                <Button onClick={handleUploadCheck} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/report/${doc.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleDocSelection(doc.id);
                        }}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.file_name}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc.status)}
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* No Credits Modal */}
        <Dialog open={showNoCreditsModal} onOpenChange={setShowNoCreditsModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
                No Credits Remaining
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                You have no credits remaining. Please purchase credits to continue analyzing documents.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setShowNoCreditsModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowNoCreditsModal(false);
                  navigate("/pricing");
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Credits
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
