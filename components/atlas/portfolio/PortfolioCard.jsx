import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  FileText,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PortfolioCard({ portfolio, onEdit, onArchive, onActivate, onView, onGenerateReport, onDelete, isProcessing }) {
  const isActive = portfolio.status === "active";
  const isDraft = portfolio.status === "draft";
  const isArchived = portfolio.status === "archived";
  
  const returnColor = portfolio.return_pct >= 0 ? "text-emerald-400" : "text-red-400";
  const returnIcon = portfolio.return_pct >= 0 ? TrendingUp : TrendingDown;
  const ReturnIcon = returnIcon;
  
  // Performance sparkline data
  const sparklineData = portfolio.performance_history?.map((val, idx) => ({
    value: val
  })) || [];
  
  return (
    <Card className={`border-[#334155] bg-[#1e293b] hover:border-orange-500/30 transition-all ${
      portfolio.needs_rebalancing ? 'border-amber-500/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm text-slate-100">{portfolio.name}</CardTitle>
              {isDraft && (
                <Badge variant="outline" className="text-xs bg-slate-700/30 text-slate-300 border-slate-600">
                  Draft
                </Badge>
              )}
              {isActive && (
                <Badge className="text-xs bg-emerald-600 text-white border-emerald-500">
                  Active
                </Badge>
              )}
              {isArchived && (
                <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                  Archived
                </Badge>
              )}
              {portfolio.needs_rebalancing && (
                <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Rebalance
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 capitalize">{portfolio.strategy?.replace("_", " ")}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Value & Performance */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Value</p>
            <p className="text-lg font-bold text-slate-100">
              ${portfolio.total_value?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Since Inception</p>
            <div className={`flex items-center gap-1 text-sm font-semibold ${returnColor}`}>
              <ReturnIcon className="w-3 h-3" />
              {portfolio.return_since_inception >= 0 ? '+' : ''}
              {portfolio.return_since_inception?.toFixed(2) || '0.00'}%
            </div>
          </div>
        </div>
        
        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${portfolio.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={portfolio.return_pct >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={portfolio.return_pct >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={portfolio.return_pct >= 0 ? "#10b981" : "#ef4444"} 
                  strokeWidth={1.5}
                  fill={`url(#gradient-${portfolio.id})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Period Returns */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div>
            <p className="text-slate-500">1M</p>
            <p className={portfolio.return_1m >= 0 ? "text-emerald-400" : "text-red-400"}>
              {portfolio.return_1m >= 0 ? '+' : ''}{portfolio.return_1m?.toFixed(1) || '0.0'}%
            </p>
          </div>
          <div>
            <p className="text-slate-500">3M</p>
            <p className={portfolio.return_3m >= 0 ? "text-emerald-400" : "text-red-400"}>
              {portfolio.return_3m >= 0 ? '+' : ''}{portfolio.return_3m?.toFixed(1) || '0.0'}%
            </p>
          </div>
          <div>
            <p className="text-slate-500">6M</p>
            <p className={portfolio.return_6m >= 0 ? "text-emerald-400" : "text-red-400"}>
              {portfolio.return_6m >= 0 ? '+' : ''}{portfolio.return_6m?.toFixed(1) || '0.0'}%
            </p>
          </div>
          <div>
            <p className="text-slate-500">YTD</p>
            <p className={portfolio.return_ytd >= 0 ? "text-emerald-400" : "text-red-400"}>
              {portfolio.return_ytd >= 0 ? '+' : ''}{portfolio.return_ytd?.toFixed(1) || '0.0'}%
            </p>
          </div>
          <div>
            <p className="text-slate-500">1Y</p>
            <p className={portfolio.return_1y >= 0 ? "text-emerald-400" : "text-red-400"}>
              {portfolio.return_1y >= 0 ? '+' : ''}{portfolio.return_1y?.toFixed(1) || '0.0'}%
            </p>
          </div>
        </div>
        
        {/* Allocation Summary */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {portfolio.stocks_pct > 0 && (
            <div 
              className="bg-[#FF6F00]" 
              style={{ width: `${portfolio.stocks_pct}%` }}
              title={`Stocks ${portfolio.stocks_pct}%`}
            />
          )}
          {portfolio.bonds_pct > 0 && (
            <div 
              className="bg-[#22c55e]" 
              style={{ width: `${portfolio.bonds_pct}%` }}
              title={`Bonds ${portfolio.bonds_pct}%`}
            />
          )}
          {portfolio.etfs_pct > 0 && (
            <div 
              className="bg-[#3b82f6]" 
              style={{ width: `${portfolio.etfs_pct}%` }}
              title={`ETFs ${portfolio.etfs_pct}%`}
            />
          )}
          {portfolio.cash_pct > 0 && (
            <div 
              className="bg-[#dc2626]" 
              style={{ width: `${portfolio.cash_pct}%` }}
              title={`Cash ${portfolio.cash_pct}%`}
            />
          )}
          {portfolio.alternatives_pct > 0 && (
            <div 
              className="bg-[#a855f7]" 
              style={{ width: `${portfolio.alternatives_pct}%` }}
              title={`Alternatives ${portfolio.alternatives_pct}%`}
            />
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onGenerateReport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  className="flex-1 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {isProcessing ? "..." : "Reports"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1e293b] border-[#334155]" align="end">
                <DropdownMenuItem 
                  onClick={() => onGenerateReport(portfolio, 'portfolio_factsheet')}
                  className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Portfolio Factsheet
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onGenerateReport(portfolio, 'performance_report')}
                  className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Performance Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {isDraft && onActivate && (
            <Button
              size="sm"
              onClick={() => onActivate(portfolio)}
              disabled={isProcessing}
              className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {isProcessing ? "..." : "Activate"}
            </Button>
          )}
          
          {isActive && onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(portfolio)}
              disabled={isProcessing}
              className="flex-1 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
            >
              <Archive className="w-3 h-3 mr-1" />
              {isProcessing ? "..." : "Archive"}
            </Button>
          )}
          
          {isDraft && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(portfolio)}
              disabled={isProcessing}
              className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}