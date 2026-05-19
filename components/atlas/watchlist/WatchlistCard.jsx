import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Bell, Calendar, Newspaper, Target, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const watchReasonLabels = {
  earnings_catalyst: "Earnings Catalyst",
  valuation_opportunity: "Valuation Play",
  dividend_watch: "Dividend Watch",
  technical_setup: "Technical Setup",
  client_interest: "Client Interest",
  momentum_play: "Momentum Play",
  turnaround_story: "Turnaround Story",
};

const volatilityColors = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function WatchlistCard({ item, onClick, onDelete }) {
  const isUp = (item.daily_change || 0) >= 0;
  const isMonthlyUp = (item.monthly_change_pct || 0) >= 0;

  return (
    <Card 
      className="border-[#334155] bg-[#1e293b] hover:border-orange-500/30 transition-all group cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
              isUp ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}>
              {item.ticker?.[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">{item.ticker}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{item.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-100">${(item.current_price || 0).toFixed(2)}</p>
            <div className={`flex items-center gap-0.5 text-[10px] font-medium justify-end ${
              isUp ? "text-emerald-400" : "text-red-400"
            }`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? "+" : ""}{(item.daily_change_pct || 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.sector && (
            <Badge className="text-[9px] px-1.5 py-0.5 bg-slate-700/30 text-slate-400 border-slate-600">
              {item.sector}
            </Badge>
          )}
          {item.volatility_level && (
            <Badge className={`text-[9px] px-1.5 py-0.5 border ${volatilityColors[item.volatility_level]}`}>
              Vol: {item.volatility_level}
            </Badge>
          )}
          {item.watch_reason && (
            <Badge className="text-[9px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 border-orange-500/30">
              {watchReasonLabels[item.watch_reason]}
            </Badge>
          )}
        </div>

        {/* Sparkline */}
        {item.price_trend && item.price_trend.length > 0 && (
          <div className="h-8 mb-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={item.price_trend.map((v) => ({ v }))}>
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke={isMonthlyUp ? "#10b981" : "#ef4444"} 
                  strokeWidth={1.5} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
          <div>
            <p className="text-slate-500">1M Perf</p>
            <p className={`font-semibold ${isMonthlyUp ? "text-emerald-400" : "text-red-400"}`}>
              {isMonthlyUp ? "+" : ""}{(item.monthly_change_pct || 0).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-slate-500">vs 50-MA</p>
            <div className="flex items-center gap-1">
              {item.ma_50_status === "above" && (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">Above</span>
                </>
              )}
              {item.ma_50_status === "below" && (
                <>
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="font-semibold text-red-400">Below</span>
                </>
              )}
              {item.ma_50_status === "at" && (
                <>
                  <Minus className="w-3 h-3 text-amber-400" />
                  <span className="font-semibold text-amber-400">At</span>
                </>
              )}
              {!item.ma_50_status && <span className="text-slate-500">N/A</span>}
            </div>
          </div>
        </div>

        {/* Alert Indicators */}
        <div className="flex items-center gap-2">
          {item.earnings_date && (
            <div className="flex items-center gap-1 text-[9px] text-amber-400">
              <Calendar className="w-3 h-3" />
              <span>Earnings soon</span>
            </div>
          )}
          {item.has_price_alert && (
            <div className="flex items-center gap-1 text-[9px] text-orange-400">
              <Bell className="w-3 h-3" />
              <span>Alert</span>
            </div>
          )}
          {item.has_recent_news && (
            <div className="flex items-center gap-1 text-[9px] text-blue-400">
              <Newspaper className="w-3 h-3" />
              <span>News</span>
            </div>
          )}
          {item.target_price && (
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <Target className="w-3 h-3" />
              <span>Target: ${item.target_price}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}