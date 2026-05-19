import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

export default function RebalanceDetector({ portfolio, holdings, onRebalance }) {
  // Calculate current allocation from holdings
  const totalValue = holdings?.reduce((sum, h) => sum + (h.total_value || 0), 0) || 0;
  
  const currentAllocation = {
    stocks: 0,
    bonds: 0,
    etfs: 0,
    cash: 0,
    alternatives: 0
  };
  
  holdings?.forEach(h => {
    const weight = totalValue > 0 ? ((h.total_value || 0) / totalValue) * 100 : 0;
    const type = h.asset_type?.toLowerCase();
    if (currentAllocation[type] !== undefined) {
      currentAllocation[type] += weight;
    }
  });
  
  // Calculate drift
  const drifts = {
    stocks: currentAllocation.stocks - (portfolio.stocks_pct || 0),
    bonds: currentAllocation.bonds - (portfolio.bonds_pct || 0),
    etfs: currentAllocation.etfs - (portfolio.etfs_pct || 0),
    cash: currentAllocation.cash - (portfolio.cash_pct || 0),
    alternatives: currentAllocation.alternatives - (portfolio.alternatives_pct || 0)
  };
  
  const maxDrift = Math.max(...Object.values(drifts).map(Math.abs));
  const needsRebalancing = maxDrift > (portfolio.rebalance_threshold || 5);
  
  if (!needsRebalancing) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Portfolio Balanced
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400">
            All allocations are within {portfolio.rebalance_threshold || 5}% of target. No rebalancing needed.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-amber-500/50 bg-amber-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Rebalancing Required
          </CardTitle>
          <Badge className="bg-amber-600 text-white border-amber-500">
            Max drift: {maxDrift.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-300">
          Portfolio allocation has drifted beyond the {portfolio.rebalance_threshold || 5}% threshold.
        </p>
        
        <div className="space-y-2">
          {Object.entries(drifts).map(([asset, drift]) => {
            if (Math.abs(drift) < 1) return null;
            
            const isOverweight = drift > 0;
            const icon = isOverweight ? TrendingUp : TrendingDown;
            const Icon = icon;
            const color = isOverweight ? "text-red-400" : "text-emerald-400";
            
            return (
              <div key={asset} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3 h-3 ${color}`} />
                  <span className="text-slate-300 capitalize">{asset}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    Target: {portfolio[`${asset}_pct`] || 0}%
                  </span>
                  <span className="text-slate-300">
                    Current: {currentAllocation[asset].toFixed(1)}%
                  </span>
                  <span className={`font-semibold ${color}`}>
                    {isOverweight ? '+' : ''}{drift.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button
          onClick={onRebalance}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          size="sm"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Generate Rebalancing Plan
        </Button>
      </CardContent>
    </Card>
  );
}