import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, MoreVertical, Trash2, Sparkles,
  PlusCircle, FileText, ExternalLink
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";

const watchReasonMap = {
  earnings_catalyst:   { label: "Earnings",   color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  valuation_opportunity:{ label: "Valuation", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  dividend_watch:      { label: "Dividend",   color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  technical_setup:     { label: "Technical",  color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  momentum_play:       { label: "Momentum",   color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  client_interest:     { label: "Client",     color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  turnaround_story:    { label: "Turnaround", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
};

const statusMap = {
  watching:    { label: "Watching",     color: "bg-slate-600/50 text-slate-300 border-slate-500" },
  accumulating:{ label: "Accumulating", color: "bg-blue-600/50 text-blue-300 border-blue-500" },
  ready_to_add:{ label: "Ready",        color: "bg-green-600/50 text-green-300 border-green-500" },
  avoid:       { label: "Avoid",        color: "bg-red-600/50 text-red-300 border-red-500" },
};

const STATUS_CYCLE = ["watching", "accumulating", "ready_to_add", "avoid"];

export default function StockRow({ item, onSelect, onDelete, onUpdate }) {
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [aiInsight, setAiInsight]           = useState(item.ai_insight || null);
  const navigate = useNavigate();

  const isPositive        = (item.daily_change_pct || 0) >= 0;
  const price             = item.current_price || 0;
  const low52             = item.week_52_low   || 0;
  const high52            = item.week_52_high  || 0;
  const rangeWidth        = high52 > low52
    ? Math.min(100, Math.max(0, ((price - low52) / (high52 - low52)) * 100))
    : 0;

  const atTrigger = item.trigger_price && price <= item.trigger_price;

  const cycleStatus = () => {
    const cur = item.advisor_status || "watching";
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
    onUpdate({ advisor_status: next });
  };

  const generateInsight = () => {
    setLoadingInsight(true);
    const daily   = item.daily_change_pct || 0;
    const monthly = item.monthly_change_pct || 0;
    const reason  = item.watch_reason || "valuation_opportunity";
    const trigP   = item.trigger_price;

    let insight = "";
    if (reason === "earnings_catalyst")    insight = "Pre-earnings setup — monitor guidance and revenue surprises";
    else if (reason === "dividend_watch")  insight = "Dividend yield in focus — confirm payout ratio sustainability";
    else if (reason === "technical_setup") insight = daily > 0 ? "Bullish momentum — watch for volume confirmation" : "Bearish pressure — await reversal signal before entry";
    else if (reason === "momentum_play")   insight = monthly > 5 ? "Strong monthly momentum — trail stop-loss recommended" : "Momentum fading — reassess catalyst validity";
    else if (daily > 2)                    insight = "Strong intraday rally — assess sustainability vs. sector peers";
    else if (daily < -2)                   insight = "Sharp decline — review for fundamental change or noise";
    else if (trigP && price < trigP)       insight = `Below trigger $${trigP} — potential entry zone reached`;
    else                                   insight = "Monitor price action relative to sector performance and index trends";

    setAiInsight(insight);
    onUpdate({ ai_insight: insight });
    setLoadingInsight(false);
  };

  return (
    <tr
      className="border-b border-[#334155] hover:bg-slate-700/20 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      {/* Symbol */}
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onSelect}
        >
          <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
            isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}>
            {item.ticker?.[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">{item.ticker}</p>
            {atTrigger && (
              <span className="text-[9px] text-orange-400 font-medium">● At Trigger</span>
            )}
          </div>
        </div>
      </td>

      {/* Company */}
      <td className="px-3 py-3">
        <p className="text-xs text-slate-300 max-w-[160px] truncate">{item.name || "—"}</p>
      </td>

      {/* Sector */}
      <td className="px-3 py-3">
        <Badge className="text-[10px] bg-slate-700/50 text-slate-400 border-slate-600 whitespace-nowrap">
          {item.sector || "N/A"}
        </Badge>
      </td>

      {/* Last Price */}
      <td className="px-3 py-3">
        <span className="text-sm font-semibold text-slate-100">
          ${price.toFixed(2)}
        </span>
      </td>

      {/* Daily % */}
      <td className="px-3 py-3">
        <div className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? "+" : ""}{(item.daily_change_pct || 0).toFixed(2)}%
        </div>
      </td>

      {/* 52W Range mini bar */}
      <td className="px-3 py-3">
        {high52 > 0 ? (
          <div className="w-24">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 rounded-full"
                style={{ width: `${rangeWidth}%` }}
              />
            </div>
            <div className="flex justify-between mt-0.5 text-[9px] text-slate-600">
              <span>${low52.toFixed(0)}</span>
              <span>${high52.toFixed(0)}</span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        )}
      </td>

      {/* Watch Reason */}
      <td className="px-3 py-3">
        {item.watch_reason && watchReasonMap[item.watch_reason] ? (
          <Badge className={`text-[10px] border whitespace-nowrap ${watchReasonMap[item.watch_reason].color}`}>
            {watchReasonMap[item.watch_reason].label}
          </Badge>
        ) : <span className="text-xs text-slate-600">—</span>}
      </td>

      {/* Status — click to cycle */}
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        {item.advisor_status && statusMap[item.advisor_status] ? (
          <Badge
            className={`text-[10px] border cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${statusMap[item.advisor_status].color}`}
            onClick={cycleStatus}
            title="Click to cycle status"
          >
            {statusMap[item.advisor_status].label}
          </Badge>
        ) : (
          <Badge
            className="text-[10px] border cursor-pointer bg-slate-600/50 text-slate-300 border-slate-500 whitespace-nowrap"
            onClick={(e) => { e.stopPropagation(); cycleStatus(); }}
          >
            Set status
          </Badge>
        )}
      </td>

      {/* Trigger Price */}
      <td className="px-3 py-3">
        {item.trigger_price ? (
          <span className={`text-xs font-medium ${atTrigger ? "text-emerald-400" : "text-orange-400"}`}>
            ${item.trigger_price.toFixed(2)}
          </span>
        ) : <span className="text-xs text-slate-600">—</span>}
      </td>

      {/* Portfolio */}
      <td className="px-3 py-3">
        {item.inPortfolios?.length > 0 ? (
          <div className="space-y-0.5">
            {item.inPortfolios.slice(0, 2).map((name, idx) => (
              <Badge key={idx} className="text-[9px] bg-blue-600/30 text-blue-300 border-blue-500 block truncate max-w-[100px]">
                {name}
              </Badge>
            ))}
            {item.inPortfolios.length > 2 && (
              <span className="text-[9px] text-slate-500">+{item.inPortfolios.length - 2} more</span>
            )}
          </div>
        ) : <span className="text-xs text-slate-600">—</span>}
      </td>

      {/* AI Insight */}
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        {loadingInsight ? (
          <span className="text-xs text-slate-500 italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-pulse" /> Generating…
          </span>
        ) : aiInsight ? (
          <p className="text-xs text-slate-300 max-w-[200px] line-clamp-2">{aiInsight}</p>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={generateInsight}
            className="h-6 text-xs text-slate-500 hover:text-orange-400 px-2"
          >
            <Sparkles className="w-3 h-3 mr-1" /> Generate
          </Button>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1e293b] border-[#334155]" align="end">
            <DropdownMenuItem
              onClick={() => navigate(createPageUrl("StockAnalysis") + `?ticker=${item.ticker}`)}
              className="text-slate-200 hover:bg-slate-700 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2" /> Analyze Stock
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(createPageUrl("PortfolioBuilder") + `?ticker=${item.ticker}`)}
              className="text-slate-200 hover:bg-slate-700 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-2" /> Add to Portfolio
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={generateInsight}
              className="text-slate-200 hover:bg-slate-700 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Refresh AI Insight
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Report feature coming soon")}
              className="text-slate-200 hover:bg-slate-700 text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-2" /> Add to Report
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-400 hover:bg-red-900/20 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
