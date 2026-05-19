import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, CheckCircle2, AlertCircle, Search, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getQuote, getOverview } from "@/api/alphaVantage";
import { toast } from "sonner";

export default function AddStockForm({ onClose, onSuccess }) {
  const [ticker, setTicker]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [previewing, setPreviewing]       = useState(false);
  const [preview, setPreview]             = useState(null);
  const [fetchError, setFetchError]       = useState(null);
  const [watchReason, setWatchReason]     = useState("valuation_opportunity");
  const [advisorStatus, setAdvisorStatus] = useState("watching");
  const [triggerPrice, setTriggerPrice]   = useState("");
  const [notes, setNotes]                 = useState("");

  // ── Step 1: Look up ticker ───────────────────────────────────────────────────
  // Fetch quote first (1 API call), then try overview (1 more call).
  // If overview is rate-limited we still show basic price data.
  const handlePreview = async () => {
    if (!ticker.trim()) return;
    setPreviewing(true);
    setPreview(null);
    setFetchError(null);
    try {
      const sym = ticker.trim().toUpperCase();

      // Quote is mandatory — if this fails we surface the error
      const quote = await getQuote(sym);

      // Overview is optional — gracefully skip if rate-limited
      let overview = {};
      try {
        overview = await getOverview(sym);
      } catch (_) {
        // Rate limit or network — continue with quote-only data
      }

      const price      = quote.price;
      const beta       = parseFloat(overview.Beta) || 1;
      const volatility = beta > 1.5 ? "high" : beta < 0.7 ? "low" : "medium";
      const ma50       = parseFloat(overview["50DayMovingAverage"]) || 0;
      const maStatus   = ma50
        ? price > ma50 * 1.005 ? "above" : price < ma50 * 0.995 ? "below" : "at"
        : null;

      setPreview({
        ticker:             sym,
        name:               overview.Name     || sym,
        current_price:      price,
        sector:             overview.Sector   || "N/A",
        industry:           overview.Industry || "N/A",
        daily_change_pct:   parseFloat(quote.changePct.toFixed(2)),
        daily_change:       parseFloat(quote.change.toFixed(2)),
        monthly_change_pct: 0,
        week_52_low:        parseFloat(overview["52WeekLow"])  || quote.low  || 0,
        week_52_high:       parseFloat(overview["52WeekHigh"]) || quote.high || 0,
        volatility_level:   volatility,
        ma_50_status:       maStatus,
        market_cap:         overview.MarketCapitalization,
        pe_ratio:           overview.TrailingPE,
        dividend_yield:     overview.DividendYield,
        analyst_target:     overview.AnalystTargetPrice,
        beta,
        overviewPartial:    !overview.Name, // flag if overview was unavailable
      });
    } catch (err) {
      // Surface error inline so user knows what happened
      const msg = err.message || "Could not fetch ticker";
      setFetchError(msg);
    } finally {
      setPreviewing(false);
    }
  };

  // ── Step 2: Save to watchboard ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await base44.entities.WatchlistItem.create({
        ticker:             preview.ticker,
        name:               preview.name,
        current_price:      preview.current_price,
        sector:             preview.sector,
        daily_change_pct:   preview.daily_change_pct,
        daily_change:       preview.daily_change,
        monthly_change_pct: 0,
        week_52_low:        preview.week_52_low,
        week_52_high:       preview.week_52_high,
        volatility_level:   preview.volatility_level,
        ma_50_status:       preview.ma_50_status,
        watch_reason:       watchReason,
        advisor_status:     advisorStatus,
        trigger_price:      triggerPrice ? parseFloat(triggerPrice) : null,
        notes:              notes || null,
        group:              "core_watchlist",
      });
      toast.success(`${preview.ticker} added to watchboard`);
      onSuccess();
    } catch (err) {
      toast.error("Failed to save — please try again");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n, digits = 2) =>
    n != null && !isNaN(parseFloat(n)) ? parseFloat(n).toFixed(digits) : "N/A";

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100">Add Stock to Watchboard</CardTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Ticker lookup ── */}
        <div>
          <Label className="text-xs text-slate-400">Ticker Symbol *</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={ticker}
              onChange={(e) => { setTicker(e.target.value.toUpperCase()); setPreview(null); }}
              onKeyDown={(e) => e.key === "Enter" && handlePreview()}
              placeholder="e.g., AAPL"
              className="bg-[#0f172a] border-[#334155] text-slate-100"
              autoFocus
            />
            <Button
              onClick={handlePreview}
              disabled={!ticker.trim() || previewing}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 shrink-0"
            >
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* ── Inline error ── */}
        {fetchError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-400">Could not fetch {ticker}</p>
              <p className="text-[11px] text-red-300/80 mt-0.5 leading-relaxed">{fetchError}</p>
              {fetchError.toLowerCase().includes("rate") && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Alpha Vantage allows 5 requests/min on the free plan. Wait ~60 seconds and retry.
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePreview}
              disabled={previewing}
              className="h-7 px-2 text-slate-300 hover:text-white shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${previewing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        )}

        {/* ── Preview card ── */}
        {preview && (
          <div className={`p-3 rounded-lg bg-[#0f172a]/80 border space-y-2 ${preview.overviewPartial ? "border-amber-500/30" : "border-emerald-500/30"}`}>
            {preview.overviewPartial && (
              <div className="flex items-center gap-2 text-[11px] text-amber-400 pb-1 border-b border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Live price loaded. Fundamentals (P/E, sector, 52W) may be incomplete — rate limit hit, you can still add the stock.
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-100">{preview.ticker}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400 truncate max-w-[180px]">{preview.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span>{preview.sector}</span>
                  {preview.industry !== "N/A" && <><span>·</span><span>{preview.industry}</span></>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-slate-100">${fmt(preview.current_price)}</p>
                <p className={`text-xs font-medium ${preview.daily_change_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {preview.daily_change_pct >= 0 ? "+" : ""}{fmt(preview.daily_change_pct)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700 text-[10px]">
              <div>
                <p className="text-slate-500">52W Low</p>
                <p className="text-slate-300 font-medium">${fmt(preview.week_52_low)}</p>
              </div>
              <div>
                <p className="text-slate-500">52W High</p>
                <p className="text-slate-300 font-medium">${fmt(preview.week_52_high)}</p>
              </div>
              <div>
                <p className="text-slate-500">Beta</p>
                <p className="text-slate-300 font-medium">{fmt(preview.beta)}</p>
              </div>
              <div>
                <p className="text-slate-500">P/E</p>
                <p className="text-slate-300 font-medium">{fmt(preview.pe_ratio)}</p>
              </div>
              <div>
                <p className="text-slate-500">vs 50-MA</p>
                <p className={`font-medium ${
                  preview.ma_50_status === "above" ? "text-emerald-400" :
                  preview.ma_50_status === "below" ? "text-red-400" : "text-amber-400"
                }`}>{preview.ma_50_status || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">Volatility</p>
                <p className={`font-medium ${
                  preview.volatility_level === "high" ? "text-red-400" :
                  preview.volatility_level === "low"  ? "text-emerald-400" : "text-amber-400"
                }`}>{preview.volatility_level}</p>
              </div>
              {preview.dividend_yield && parseFloat(preview.dividend_yield) > 0 && (
                <div>
                  <p className="text-slate-500">Div Yield</p>
                  <p className="text-blue-400 font-medium">{(parseFloat(preview.dividend_yield) * 100).toFixed(2)}%</p>
                </div>
              )}
              {preview.analyst_target && (
                <div>
                  <p className="text-slate-500">Target</p>
                  <p className="text-orange-400 font-medium">${fmt(preview.analyst_target)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Configuration ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Watch Reason</Label>
            <Select value={watchReason} onValueChange={setWatchReason}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                <SelectItem value="valuation_opportunity">Valuation Opportunity</SelectItem>
                <SelectItem value="earnings_catalyst">Earnings Catalyst</SelectItem>
                <SelectItem value="dividend_watch">Dividend Watch</SelectItem>
                <SelectItem value="technical_setup">Technical Setup</SelectItem>
                <SelectItem value="momentum_play">Momentum Play</SelectItem>
                <SelectItem value="client_interest">Client Interest</SelectItem>
                <SelectItem value="turnaround_story">Turnaround Story</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Advisor Status</Label>
            <Select value={advisorStatus} onValueChange={setAdvisorStatus}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                <SelectItem value="watching">Watching</SelectItem>
                <SelectItem value="accumulating">Accumulating</SelectItem>
                <SelectItem value="ready_to_add">Ready to Add</SelectItem>
                <SelectItem value="avoid">Avoid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Trigger Price (Optional)</Label>
            <Input
              type="number"
              step="0.01"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              placeholder="e.g., 150.00"
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Wait for Q2 results"
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>
        </div>

        <Button
          onClick={preview ? handleSubmit : handlePreview}
          disabled={!ticker.trim() || loading || previewing}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading || previewing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {previewing ? "Fetching data…" : "Saving…"}
            </>
          ) : preview ? (
            "Add to Watchboard"
          ) : (
            "Look Up Ticker"
          )}
        </Button>
        {!preview && (
          <p className="text-center text-[10px] text-slate-600">Enter a ticker and click Look Up, then confirm to add</p>
        )}
      </CardContent>
    </Card>
  );
}
