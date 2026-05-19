import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

export default function AddWatchlistForm({ onSave, onCancel, isSaving }) {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTicker = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const sym = ticker.trim().toUpperCase();
      const res = await fetch(
        `/yf-api/v10/finance/quoteSummary/${sym}?modules=price,summaryProfile,defaultKeyStatistics`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("Ticker not found");
      const json = await res.json();
      const r = json?.quoteSummary?.result?.[0];
      if (!r) throw new Error("No data");
      const p = r.price || {};
      const sp = r.summaryProfile || {};
      const ks = r.defaultKeyStatistics || {};
      const price = p.regularMarketPrice?.raw || 0;
      const prev = p.regularMarketPreviousClose?.raw || price;
      const dailyChangePct = prev ? ((price - prev) / prev) * 100 : 0;
      const beta = ks.beta?.raw || 1;
      const volatility = beta > 1.5 ? "high" : beta < 0.7 ? "low" : "medium";
      const ma50 = ks.fiftyDayAverage?.raw;
      const maStatus = ma50 ? (price > ma50 ? "above" : "below") : "at";

      onSave({
        ticker: sym,
        name: p.longName || p.shortName || sym,
        current_price: price,
        sector: sp.sector || "N/A",
        volatility_level: volatility,
        ma_50_status: maStatus,
        monthly_change_pct: 0,
        daily_change_pct: parseFloat(dailyChangePct.toFixed(2)),
        daily_change: parseFloat((price - prev).toFixed(2)),
        watch_reason: "valuation_opportunity",
        price_trend: [],
        group: "core_watchlist",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">Add to Watchlist</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-slate-400">Stock Ticker or Company Name</Label>
            <Input 
              value={ticker} 
              onChange={(e) => setTicker(e.target.value.toUpperCase())} 
              placeholder="e.g., AAPL, MSFT, TSLA"
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTicker();
              }}
              autoFocus
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Enter ticker symbol - all details will be fetched automatically
            </p>
          </div>

          <Button 
            onClick={handleAddTicker} 
            disabled={!ticker || loading || isSaving} 
            className="bg-orange-600 hover:bg-orange-700 w-full"
          >
            {loading || isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching stock data...
              </>
            ) : (
              "Add to Watchlist"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}