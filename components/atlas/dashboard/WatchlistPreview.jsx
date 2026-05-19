import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function WatchlistPreview({ items = [] }) {
  const displayItems = items.length > 0 ? items.slice(0, 5) : [
    { ticker: "AAPL", name: "Apple Inc.", current_price: 168.25, daily_change: 2.15, daily_change_pct: 1.29 },
    { ticker: "MSFT", name: "Microsoft Corp.", current_price: 256.75, daily_change: -1.42, daily_change_pct: -0.55 },
    { ticker: "NVDA", name: "NVIDIA Corp.", current_price: 845.50, daily_change: 12.30, daily_change_pct: 1.48 },
    { ticker: "META", name: "Meta Platforms", current_price: 245.50, daily_change: 3.80, daily_change_pct: 1.57 },
  ];

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100">My Watchlist</h3>
        <Link to={createPageUrl("Watchlist")} className="text-xs text-orange-400 hover:text-orange-300 font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {displayItems.map((item) => {
          const isUp = (item.daily_change || 0) >= 0;
          return (
            <div key={item.ticker} className="flex items-center gap-3 py-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                isUp ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {item.ticker?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-100">{item.ticker}</p>
                <p className="text-[11px] text-slate-400 truncate">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-slate-100">${item.current_price?.toFixed(2)}</p>
                <p className={`text-[11px] font-medium flex items-center gap-0.5 justify-end ${
                  isUp ? "text-emerald-400" : "text-red-400"
                }`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? "+" : ""}{item.daily_change_pct?.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}