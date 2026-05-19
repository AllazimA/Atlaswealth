import React, { useState, useEffect } from "react";
import {
  X, TrendingUp, TrendingDown, Sparkles, ExternalLink,
  Loader2, RefreshCw, Target, BarChart3, Info, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFullStock } from "@/api/alphaVantage";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";

const FMT_USD = (n) => (n != null && !isNaN(parseFloat(n)) ? `$${parseFloat(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "N/A");
const FMT_PCT = (n) => (n != null && !isNaN(parseFloat(n)) ? `${(parseFloat(n) * 100).toFixed(2)}%` : "N/A");
const FMT_NUM = (n, d = 2) => (n != null && !isNaN(parseFloat(n)) ? parseFloat(n).toFixed(d) : "N/A");
const FMT_MCap = (n) => {
  const v = parseInt(n);
  if (!v || isNaN(v)) return "N/A";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toLocaleString()}`;
};

export default function EventSidePanel({ stock, onClose, portfolios }) {
  const [liveData, setLiveData]         = useState(null);
  const [loadingLive, setLoadingLive]   = useState(false);
  const navigate = useNavigate();

  // Auto-fetch live fundamentals when panel opens
  useEffect(() => {
    fetchLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock.ticker]);

  const fetchLive = async () => {
    setLoadingLive(true);
    try {
      const { quote, overview } = await getFullStock(stock.ticker);
      setLiveData({ quote, overview });
    } catch (_) {
      setLiveData(null);
    } finally {
      setLoadingLive(false);
    }
  };

  const price       = liveData?.quote?.price     ?? stock.current_price ?? 0;
  const changePct   = liveData?.quote?.changePct ?? stock.daily_change_pct ?? 0;
  const change      = liveData?.quote?.change    ?? stock.daily_change    ?? 0;
  const week52Low   = parseFloat(liveData?.overview?.["52WeekLow"])  || stock.week_52_low  || 0;
  const week52High  = parseFloat(liveData?.overview?.["52WeekHigh"]) || stock.week_52_high || 0;
  const isPositive  = changePct >= 0;

  const rangeWidth  = week52High > week52Low
    ? Math.min(100, Math.max(0, ((price - week52Low) / (week52High - week52Low)) * 100))
    : 50;

  const holdingPortfolios = portfolios.filter((p) => stock.inPortfolios?.includes(p.name));

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-[#1e293b] border-l border-[#334155] shadow-2xl z-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 bg-[#1e293b] border-b border-[#334155] p-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">{stock.ticker}</h2>
            {stock.volatility_level && (
              <Badge className={`text-[10px] border ${
                stock.volatility_level === "high"   ? "bg-red-500/20 text-red-400 border-red-500/30" :
                stock.volatility_level === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                                                      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              }`}>
                Vol: {stock.volatility_level}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{liveData?.overview?.Name || stock.name}</p>
          {liveData?.overview?.Sector && (
            <p className="text-[10px] text-slate-500">{liveData.overview.Sector} · {liveData.overview.Industry}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchLive}
            disabled={loadingLive}
            className="h-7 w-7 p-0 text-slate-400 hover:text-orange-400"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLive ? "animate-spin" : ""}`} />
          </Button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Price overview */}
        <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          {loadingLive ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading live quote…</span>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-slate-500 mb-0.5">Live Price</p>
              <p className="text-3xl font-bold text-slate-100">${price.toFixed(2)}</p>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <p className="text-[10px] text-slate-500">Today</p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)
                  </div>
                </div>
                {liveData?.quote?.volume && (
                  <div>
                    <p className="text-[10px] text-slate-500">Volume</p>
                    <p className="text-sm font-medium text-slate-300">{liveData.quote.volume.toLocaleString()}</p>
                  </div>
                )}
                {liveData?.quote?.prevClose && (
                  <div>
                    <p className="text-[10px] text-slate-500">Prev Close</p>
                    <p className="text-sm font-medium text-slate-300">${liveData.quote.prevClose.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 52-Week Range */}
        {(week52Low > 0 || week52High > 0) && (
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400 font-medium mb-3">52-Week Range</p>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[10px] text-slate-500">Low</p>
                <p className="text-xs font-semibold text-red-400">${week52Low.toFixed(2)}</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" style={{ width: "100%" }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-slate-700 shadow-md"
                    style={{ left: `calc(${rangeWidth}% - 6px)` }}
                  />
                </div>
                <p className="text-center text-[10px] text-slate-500 mt-1">
                  {rangeWidth.toFixed(0)}% from low · ${price.toFixed(2)} current
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500">High</p>
                <p className="text-xs font-semibold text-emerald-400">${week52High.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Trigger alert */}
        {stock.trigger_price && (
          <div className={`p-3 rounded-lg border flex items-center gap-3 ${
            price <= stock.trigger_price
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-orange-500/10 border-orange-500/30"
          }`}>
            <Target className={`w-4 h-4 shrink-0 ${price <= stock.trigger_price ? "text-emerald-400" : "text-orange-400"}`} />
            <div className="flex-1">
              <p className={`text-xs font-semibold ${price <= stock.trigger_price ? "text-emerald-400" : "text-orange-400"}`}>
                {price <= stock.trigger_price ? "✓ Trigger Price Reached!" : "Watching for Trigger"}
              </p>
              <p className="text-[10px] text-slate-400">
                Target: ${stock.trigger_price.toFixed(2)} ·
                {price <= stock.trigger_price
                  ? ` ${((stock.trigger_price - price) / stock.trigger_price * 100).toFixed(1)}% below`
                  : ` ${((price - stock.trigger_price) / stock.trigger_price * 100).toFixed(1)}% above`
                }
              </p>
            </div>
          </div>
        )}

        {/* Fundamentals */}
        {liveData?.overview?.MarketCapitalization && (
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-semibold text-slate-200">Key Fundamentals</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              {[
                { label: "Market Cap",    val: FMT_MCap(liveData.overview.MarketCapitalization) },
                { label: "P/E (TTM)",     val: FMT_NUM(liveData.overview.TrailingPE) },
                { label: "P/E (Fwd)",     val: FMT_NUM(liveData.overview.ForwardPE) },
                { label: "EPS (TTM)",     val: FMT_USD(liveData.overview.EPS) },
                { label: "Beta",          val: FMT_NUM(liveData.overview.Beta) },
                { label: "Div Yield",     val: FMT_PCT(liveData.overview.DividendYield) },
                { label: "Profit Margin", val: FMT_PCT(liveData.overview.ProfitMargin) },
                { label: "ROE",           val: FMT_PCT(liveData.overview.ReturnOnEquityTTM) },
                { label: "Analyst Target",val: FMT_USD(liveData.overview.AnalystTargetPrice) },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-slate-500">{label}</p>
                  <p className="text-slate-200 font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio holdings */}
        {holdingPortfolios.length > 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-semibold text-blue-400">In Portfolios</p>
            </div>
            <div className="space-y-2">
              {holdingPortfolios.map((portfolio) => (
                <div key={portfolio.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{portfolio.name}</span>
                  <div className="flex items-center gap-2">
                    {stock.totalWeight > 0 && (
                      <Badge className="bg-blue-600/30 text-blue-300 border-blue-500 text-[10px]">
                        {stock.totalWeight.toFixed(1)}%
                      </Badge>
                    )}
                    {stock.totalPL != null && (
                      <span className={`font-medium ${stock.totalPL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stock.totalPL >= 0 ? "+" : ""}${stock.totalPL.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insight */}
        {stock.ai_insight && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-semibold text-purple-400">AI Insight</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{stock.ai_insight}</p>
          </div>
        )}

        {/* Notes */}
        {stock.notes && (
          <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-medium text-slate-300">Notes</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{stock.notes}</p>
          </div>
        )}

        {/* TradingView Chart */}
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Price Chart</p>
          <div className="h-[360px] rounded-lg overflow-hidden border border-[#334155]">
            <iframe
              scrolling="no"
              allowTransparency="true"
              frameBorder="0"
              src={`https://s.tradingview.com/embed-widget/advanced-chart/?locale=en#%7B%22symbol%22%3A%22${stock.ticker}%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A360%2C%22interval%22%3A%22D%22%2C%22timezone%22%3A%22Etc%2FUTC%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22locale%22%3A%22en%22%2C%22toolbar_bg%22%3A%22%231e293b%22%2C%22enable_publishing%22%3Afalse%2C%22hide_side_toolbar%22%3Atrue%2C%22allow_symbol_change%22%3Afalse%7D`}
              style={{ display: "block", height: "360px", width: "100%" }}
            />
          </div>
        </div>

        {/* External links */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`https://finance.yahoo.com/quote/${stock.ticker}`, "_blank")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" /> Yahoo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`https://www.bloomberg.com/quote/${stock.ticker}:US`, "_blank")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" /> Bloomberg
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(createPageUrl("StockAnalysis") + `?ticker=${stock.ticker}`)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
          >
            <BarChart3 className="w-3 h-3 mr-1" /> Analyze
          </Button>
        </div>

        {/* Add to portfolio */}
        <Button
          onClick={() => navigate(createPageUrl("PortfolioBuilder") + `?ticker=${stock.ticker}`)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add to Portfolio
        </Button>
      </div>
    </div>
  );
}
