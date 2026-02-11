import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, ArrowLeft, Building2, DollarSign, Calendar, AlertTriangle,
  TrendingUp, Clock, CheckCircle, BarChart3, Plus
} from "lucide-react";

const client = createClient();

interface PortfolioSummary {
  total_properties: number;
  active_leases: number;
  expiring_soon: number;
  total_monthly_rent: number;
  total_annual_rent: number;
  total_deposits_held: number;
}

interface LeaseItem {
  extraction_id: number;
  document_id: number;
  property_address: string | null;
  tenant_name: string | null;
  monthly_rent: number | null;
  security_deposit: number | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  status: string;
}

interface UpcomingDate {
  date: string;
  type: string;
  label: string;
  extraction_id: number;
}

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [leases, setLeases] = useState<LeaseItem[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const authRes = await client.auth.me();
      if (!authRes.data) {
        navigate("/dashboard");
        return;
      }

      const response = await client.apiCall.invoke({
        url: "/api/v1/lease/portfolio",
        method: "GET",
      });

      setSummary(response.data.summary);
      setLeases(response.data.leases || []);
      setUpcoming(response.data.upcoming_dates || []);
    } catch (err) {
      console.error("Portfolio load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "expiring_soon": return <Badge className="bg-amber-100 text-amber-700"><AlertTriangle className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
      case "expired": return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const daysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    if (diff === 0) return "Today";
    return `${diff} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">Portfolio Dashboard</span>
            </div>
          </div>
          <Button onClick={() => navigate("/upload")} className="gap-2">
            <Plus className="h-4 w-4" />Add Lease
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{summary.total_properties}</p>
                    <p className="text-xs text-slate-500">Total Properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      ${summary.total_monthly_rent.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Monthly Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      ${summary.total_annual_rent.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Annual Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={summary.expiring_soon > 0 ? "border-amber-300" : ""}>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    summary.expiring_soon > 0 ? "bg-amber-100" : "bg-slate-100"
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${summary.expiring_soon > 0 ? "text-amber-600" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{summary.expiring_soon}</p>
                    <p className="text-xs text-slate-500">Expiring (90 days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Lease List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">All Leases</h2>
            {leases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No leases yet. Upload your first document.</p>
                  <Button onClick={() => navigate("/upload")}>Upload Lease</Button>
                </CardContent>
              </Card>
            ) : (
              leases.map((lease) => (
                <Card
                  key={lease.extraction_id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/report/${lease.document_id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-800 truncate">
                            {lease.property_address || "Unknown Address"}
                          </p>
                          {getStatusBadge(lease.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {lease.tenant_name && <span>Tenant: {lease.tenant_name}</span>}
                          {lease.monthly_rent && <span>${lease.monthly_rent.toLocaleString()}/mo</span>}
                          {lease.lease_end_date && (
                            <span>Ends: {new Date(lease.lease_end_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Timeline Sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Dates</h2>
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No upcoming dates</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {upcoming.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 rounded-lg p-2 -m-2"
                        onClick={() => navigate(`/report/${item.extraction_id}`)}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${
                            new Date(item.date) < new Date(Date.now() + 30 * 86400000) ? "bg-red-400" :
                            new Date(item.date) < new Date(Date.now() + 90 * 86400000) ? "bg-amber-400" :
                            "bg-blue-400"
                          }`} />
                          {idx < upcoming.length - 1 && <div className="w-px h-8 bg-slate-200 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{item.label}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {daysUntil(item.date)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deposits Summary */}
            {summary && summary.total_deposits_held > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-600">Deposits Held</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-800">
                    ${summary.total_deposits_held.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Across {summary.total_properties} properties
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
