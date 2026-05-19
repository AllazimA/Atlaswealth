import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StockDetailPanel({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#1e293b] border-l border-[#334155] shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#1e293b] border-b border-[#334155] p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">{item.ticker}</h2>
          <p className="text-xs text-slate-400">{item.name}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Price */}
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Price</p>
          <p className="text-3xl font-bold text-slate-100">${(item.current_price || 0).toFixed(2)}</p>
          <p className={`text-sm font-medium ${(item.daily_change || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {(item.daily_change || 0) >= 0 ? "+" : ""}{(item.daily_change_pct || 0).toFixed(2)}% today
          </p>
        </div>

        {/* Embedded Chart */}
        <div className="h-[300px] rounded-lg overflow-hidden border border-[#334155]">
          <div dangerouslySetInnerHTML={{
            __html: `
              <div class="tradingview-widget-container" style="height: 300px; width: 100%;">
                <iframe scrolling="no" allowtransparency="true" frameborder="0" 
                  src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22${item.ticker}%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A300%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%7D" 
                  style="box-sizing: border-box; display: block; height: 300px; width: 100%;">
                </iframe>
              </div>
            `
          }} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Sector" value={item.sector || "N/A"} />
          <StatBox label="Volatility" value={item.volatility_level || "N/A"} />
          <StatBox label="vs 50-MA" value={item.ma_50_status || "N/A"} />
          <StatBox label="1M Change" value={`${(item.monthly_change_pct || 0).toFixed(1)}%`} />
        </div>

        {/* Watch Details */}
        <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">Watch Reason</p>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
            {item.watch_reason ? watchReasonLabels[item.watch_reason] : "General Watch"}
          </Badge>
        </div>

        {/* Alerts */}
        {(item.earnings_date || item.has_price_alert || item.has_recent_news || item.target_price) && (
          <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400 mb-2">Alerts & Events</p>
            <div className="space-y-2 text-xs">
              {item.earnings_date && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Earnings Date</span>
                  <span className="text-amber-400 font-medium">{item.earnings_date}</span>
                </div>
              )}
              {item.target_price && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Price</span>
                  <span className="text-slate-100 font-medium">${item.target_price}</span>
                </div>
              )}
              {item.has_price_alert && (
                <div className="flex items-center gap-2 text-orange-400">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[9px]">Price Alert Active</Badge>
                </div>
              )}
              {item.has_recent_news && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px]">Recent News</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Notes</p>
            <p className="text-xs text-slate-300">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="p-2 bg-slate-700/30 rounded border border-slate-600">
      <p className="text-[9px] text-slate-500 uppercase">{label}</p>
      <p className="text-xs font-semibold text-slate-200 capitalize">{value}</p>
    </div>
  );
}

const watchReasonLabels = {
  earnings_catalyst: "Earnings Catalyst",
  valuation_opportunity: "Valuation Play",
  dividend_watch: "Dividend Watch",
  technical_setup: "Technical Setup",
  client_interest: "Client Interest",
  momentum_play: "Momentum Play",
  turnaround_story: "Turnaround Story",
};