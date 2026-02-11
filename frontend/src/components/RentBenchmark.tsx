import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, MapPin, BarChart3, ArrowUpRight } from "lucide-react";

const client = createClient();

interface BenchmarkData {
  market_area: string;
  data_source: string;
  median_rents: { "1br": number; "2br": number; "3br": number };
  yoy_change_percent: number;
  data_note: string;
  comparison?: {
    your_rent: number;
    estimated_type: string;
    market_median: number;
    difference: number;
    difference_percent: number;
    assessment: string;
    assessment_text: string;
  };
  projection?: {
    next_year_estimate: number;
    annual_increase: number;
    note: string;
  };
}

interface RentBenchmarkProps {
  extractionId: number;
}

export default function RentBenchmark({ extractionId }: RentBenchmarkProps) {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmark();
  }, [extractionId]);

  const loadBenchmark = async () => {
    try {
      const response = await client.apiCall.invoke({
        url: `/api/v1/lease/benchmark/${extractionId}`,
        method: "GET",
      });
      if (response.data?.success) {
        setData(response.data.benchmark);
      }
    } catch (err) {
      console.error("Benchmark load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getAssessmentStyle = (assessment?: string) => {
    switch (assessment) {
      case "below_market": return { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: TrendingDown, label: "Below Market" };
      case "above_market": return { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: TrendingUp, label: "Above Market" };
      default: return { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Minus, label: "At Market" };
    }
  };

  const style = getAssessmentStyle(data.comparison?.assessment);
  const Icon = style.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Rent Benchmarking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market area */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span>{data.market_area}</span>
          {data.data_source === "national" && (
            <Badge variant="secondary" className="text-xs">National Avg</Badge>
          )}
        </div>

        {/* Comparison card */}
        {data.comparison && (
          <div className={`rounded-lg p-4 ${style.bg} ${style.border} border`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${style.color}`} />
                <span className={`font-semibold ${style.color}`}>{style.label}</span>
              </div>
              <Badge className={`${style.bg} ${style.color} border ${style.border}`}>
                {data.comparison.difference_percent > 0 ? "+" : ""}{data.comparison.difference_percent}%
              </Badge>
            </div>
            <p className="text-sm text-slate-700">{data.comparison.assessment_text}</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="text-center">
                <p className="text-xs text-slate-500">Your Rent</p>
                <p className="text-lg font-bold text-slate-800">
                  ${data.comparison.your_rent.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Market Median ({data.comparison.estimated_type})
                </p>
                <p className="text-lg font-bold text-slate-800">
                  ${data.comparison.market_median.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Median rents table */}
        <div className="grid grid-cols-3 gap-2">
          {(["1br", "2br", "3br"] as const).map((type) => (
            <div key={type} className="text-center bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-500 uppercase">{type}</p>
              <p className="text-sm font-semibold text-slate-700">
                ${data.median_rents[type].toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* YoY trend */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Year-over-year trend</span>
          <span className={data.yoy_change_percent > 0 ? "text-red-600" : "text-green-600"}>
            {data.yoy_change_percent > 0 ? <ArrowUpRight className="h-3 w-3 inline" /> : null}
            {data.yoy_change_percent > 0 ? "+" : ""}{data.yoy_change_percent}%
          </span>
        </div>

        {/* Projection */}
        {data.projection && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Projected at Renewal</p>
            <p className="text-sm font-semibold text-slate-700">
              ${data.projection.next_year_estimate.toLocaleString()}/mo
              <span className="text-xs text-slate-400 font-normal ml-1">
                (+${data.projection.annual_increase.toLocaleString()})
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{data.projection.note}</p>
          </div>
        )}

        <p className="text-xs text-slate-400">{data.data_note}</p>
      </CardContent>
    </Card>
  );
}
