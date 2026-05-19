import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";

// ── Module-level ticker→CIK cache (loaded once per session) ──────────────────
let _tickerMap = null;

async function loadTickerMap() {
  if (_tickerMap) return _tickerMap;
  // Proxy route → https://www.sec.gov/files/company_tickers.json
  const res = await fetch("/sec-www/files/company_tickers.json");
  if (!res.ok) throw new Error(`SEC ticker map: HTTP ${res.status}`);
  const raw = await res.json();
  _tickerMap = {};
  Object.values(raw).forEach(({ ticker, cik_str, title }) => {
    _tickerMap[ticker.toUpperCase()] = {
      cik: String(cik_str).padStart(10, "0"),
      name: title,
    };
  });
  return _tickerMap;
}

// ── Main fetch logic ──────────────────────────────────────────────────────────
async function fetchSECFilings(ticker) {
  const sym = ticker.toUpperCase();

  // 1. Resolve ticker → CIK
  const map   = await loadTickerMap();
  const entry = map[sym];
  if (!entry) throw new Error(`${sym} not found in SEC EDGAR`);
  const { cik, name } = entry;

  // 2. Fetch recent submissions via proxy → https://data.sec.gov/submissions/CIK…json
  const subRes = await fetch(`/sec-data/submissions/CIK${cik}.json`);
  if (!subRes.ok) throw new Error(`Submissions fetch failed: HTTP ${subRes.status}`);
  const sub = await subRes.json();

  const recent = sub.filings?.recent;
  if (!recent?.form?.length) throw new Error("No recent filings");

  // 3. Extract target forms
  const TARGET  = ["10-K", "10-Q", "8-K", "DEF 14A"];
  const MAX     = { "10-K": 1, "10-Q": 2, "8-K": 3, "DEF 14A": 1 };
  const seen    = {};
  const list    = [];

  for (let i = 0; i < recent.form.length; i++) {
    const form = recent.form[i];
    if (!TARGET.includes(form)) continue;
    seen[form] = seen[form] || 0;
    if (seen[form] >= MAX[form]) continue;
    seen[form]++;

    const accNo = recent.accessionNumber[i].replace(/-/g, "");
    const doc   = recent.primaryDocument[i] || "";
    const url   = doc
      ? `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accNo}/${doc}`
      : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${form}&dateb=&owner=include&count=10`;

    list.push({
      form_type:   form,
      filing_date: recent.filingDate[i],
      description: recent.primaryDocDescription[i] || `${form} Filing`,
      url,
      accNo,
    });
  }

  return { company_name: name, cik, filings: list };
}

// ── Badge colours ──────────────────────────────────────────────────────────────
const FORM_COLORS = {
  "10-K":   "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "10-Q":   "bg-blue-500/20   text-blue-300   border-blue-500/30",
  "8-K":    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "DEF 14A":"bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const FORM_LABELS = {
  "10-K":    "Annual Report",
  "10-Q":    "Quarterly Report",
  "8-K":     "Current Report",
  "DEF 14A": "Proxy Statement",
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function SECFilings({ ticker }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey:  ["secFilings", ticker],
    queryFn:   () => fetchSECFilings(ticker),
    enabled:   !!ticker,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry:     1,
  });

  if (isLoading) {
    return (
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Loading SEC EDGAR filings…</p>
          <p className="text-xs text-slate-500 mt-1">Fetching from SEC.gov</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardContent className="p-6 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
          <div>
            <p className="text-sm text-slate-300 font-medium">SEC Filings unavailable</p>
            <p className="text-xs text-slate-500 mt-1">{error.message}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline"
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30 text-xs"
              onClick={() => refetch()}>
              Retry
            </Button>
            <Button size="sm" variant="outline"
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30 text-xs"
              onClick={() => window.open(
                `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&ticker=${ticker}&type=&dateb=&owner=exclude&count=40`,
                "_blank"
              )}>
              <ExternalLink className="w-3 h-3 mr-1" /> SEC EDGAR
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.filings?.length) {
    return (
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardContent className="p-6 text-center">
          <FileText className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No filings found for {ticker}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            SEC Filings
          </CardTitle>
          <Badge className="bg-slate-700 text-slate-400 border-slate-600 text-[10px]">
            CIK {data.cik}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{data.company_name}</p>
      </CardHeader>

      <CardContent className="space-y-2">
        {data.filings.map((f, i) => (
          <div key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155] hover:border-orange-500/30 transition-all group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className={`text-[10px] px-1.5 ${FORM_COLORS[f.form_type] || "bg-slate-700 text-slate-300"}`}>
                  {f.form_type}
                </Badge>
                <span className="text-xs font-medium text-slate-200 truncate">
                  {FORM_LABELS[f.form_type] || f.description}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Filed {new Date(f.filing_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0 ml-2">
              <Button size="sm" variant="ghost"
                className="h-7 w-7 p-0 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                title="Open filing"
                onClick={() => window.open(f.url, "_blank")}>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost"
                className="h-7 w-7 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                title="Download"
                onClick={() => window.open(f.url, "_blank")}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <p className="text-[10px] text-slate-600 pt-1 text-center">
          Source: SEC EDGAR · Data via data.sec.gov
        </p>
      </CardContent>
    </Card>
  );
}
