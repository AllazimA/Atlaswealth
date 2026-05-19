import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const marketData = [
  { name: "S&P 500", value: "5,190.80", change: "+37.44", pct: "+0.72%", up: true },
  { name: "NASDAQ", value: "16,150.38", change: "+145.27", pct: "+0.91%", up: true },
  { name: "DOW", value: "38,750.45", change: "+195.81", pct: "+0.51%", up: true },
  { name: "RUSSELL", value: "2,085.12", change: "-12.30", pct: "-0.59%", up: false },
];

export default function MarketTicker() {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
      <h3 className="text-sm font-semibold text-slate-100 mb-4">Today's Market</h3>
      <div className="space-y-3">
        {marketData.map((item) => (
          <div key={item.name} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2.5">
              {item.up ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className="text-[13px] font-semibold text-slate-300">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-medium text-slate-100">{item.value}</span>
              <span className={`text-xs ml-2 font-medium ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}