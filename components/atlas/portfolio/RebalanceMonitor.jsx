import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

export default function RebalanceMonitor({ portfolio, holdings, onRebalanceNeeded }) {
  const [drift, setDrift] = useState(null);
  const [checking, setChecking] = useState(false);

  const calculateDrift = () => {
    if (!holdings || holdings.length === 0) return null;

    const totalValue = holdings.reduce((sum, h) => sum + (h.total_value || 0), 0);
    if (totalValue === 0) return null;

    // Calculate current actual allocations
    const actualAlloc = {
      stocks: 0,
      bonds: 0,
      etfs: 0,
      cash: 0,
      alternatives: 0
    };

    holdings.forEach(h => {
      const weight = (h.total_value / totalValue) * 100;
      const assetType = h.asset_type || "stock";
      
      if (assetType === "stock") actualAlloc.stocks += weight;
      else if (assetType === "bond") actualAlloc.bonds += weight;
      else if (assetType === "etf") actualAlloc.etfs += weight;
      else if (assetType === "cash") actualAlloc.cash += weight;
      else actualAlloc.alternatives += weight;
    });

    // Calculate drift from target
    const targetAlloc = {
      stocks: portfolio.stocks_pct || 0,
      bonds: portfolio.bonds_pct || 0,
      etfs: portfolio.etfs_pct || 0,
      cash: portfolio.cash_pct || 0,
      alternatives: portfolio.alternatives_pct || 0
    };

    const drifts = Object.keys(targetAlloc).map(key => ({
      asset: key,
      target: targetAlloc[key],
      actual: actualAlloc[key],
      drift: Math.abs(actualAlloc[key] - targetAlloc[key])
    }));

    const maxDrift = Math.max(...drifts.map(d => d.drift));
    const threshold = portfolio.rebalance_threshold || 5;

    return {
      drifts,
      maxDrift,
      threshold,
      needsRebalancing: maxDrift > threshold,
      totalValue
    };
  };

  const checkAndUpdateDrift = async () => {
    setChecking(true);
    const driftData = calculateDrift();
    setDrift(driftData);

    if (driftData && driftData.needsRebalancing !== portfolio.needs_rebalancing) {
      await base44.entities.Portfolio.update(portfolio.id, {
        needs_rebalancing: driftData.needsRebalancing
      });
      
      if (driftData.needsRebalancing) {
        onRebalanceNeeded?.(driftData);
      }
    }
    setChecking(false);
  };

  useEffect(() => {
    checkAndUpdateDrift();
  }, [holdings]);

  if (!drift) {
    return (
      <Card className="border-slate-700 bg-slate-800">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-400">Calculating drift...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${drift.needsRebalancing ? "border-orange-500/50 bg-orange-500/5" : "border-green-500/50 bg-green-500/5"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-slate-100 flex items-center gap-2">
            {drift.needsRebalancing ? (
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            )}
            Rebalancing Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkAndUpdateDrift}
            disabled={checking}
            className="text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Status:</span>
            <Badge className={drift.needsRebalancing 
              ? "bg-orange-500/20 text-orange-300 border-orange-500/30" 
              : "bg-green-500/20 text-green-300 border-green-500/30"
            }>
              {drift.needsRebalancing ? "Rebalancing Needed" : "On Target"}
            </Badge>
          </div>

          {/* Max Drift */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Maximum Drift:</span>
            <span className={`text-lg font-bold ${drift.maxDrift > drift.threshold ? "text-orange-400" : "text-green-400"}`}>
              {drift.maxDrift.toFixed(2)}%
            </span>
          </div>

          {/* Threshold */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Threshold:</span>
            <span className="text-sm text-slate-200">{drift.threshold}%</span>
          </div>

          {/* Drift Details */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-300 mb-2">Asset Class Drift:</p>
            {drift.drifts.map(d => (
              <div key={d.asset} className="flex items-center justify-between text-xs">
                <span className="capitalize text-slate-400">{d.asset}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{d.actual.toFixed(1)}% vs {d.target}%</span>
                  <span className={`font-semibold ${d.drift > drift.threshold ? "text-orange-400" : "text-slate-400"}`}>
                    {d.drift > 0.1 ? `±${d.drift.toFixed(1)}%` : "✓"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}