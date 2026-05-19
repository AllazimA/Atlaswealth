import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RebalancingSuggestions({ portfolio, holdings, driftData }) {
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const calculateRebalancingTrades = () => {
    const totalValue = driftData.totalValue;
    const trades = [];

    driftData.drifts.forEach(d => {
      if (Math.abs(d.drift) > 0.5) {
        const targetValue = (d.target / 100) * totalValue;
        const actualValue = (d.actual / 100) * totalValue;
        const difference = targetValue - actualValue;

        if (Math.abs(difference) > totalValue * 0.01) {
          trades.push({
            asset: d.asset,
            action: difference > 0 ? "buy" : "sell",
            amount: Math.abs(difference),
            target_pct: d.target,
            current_pct: d.actual,
            drift_pct: d.drift
          });
        }
      }
    });

    return trades;
  };

  const trades = calculateRebalancingTrades();

  const executeRebalanceMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Create rebalance action record
      const action = await base44.entities.RebalanceAction.create({
        portfolio_id: portfolio.id,
        action_type: "manual",
        trigger_reason: `Drift exceeded threshold of ${driftData.threshold}%`,
        drift_detected: driftData.maxDrift,
        trades_executed: trades,
        status: "executed",
        approved_by: user.email,
        execution_date: new Date().toISOString().split("T")[0],
        notes: notes
      });

      // Update portfolio to reset rebalancing flag and set last rebalance date
      await base44.entities.Portfolio.update(portfolio.id, {
        needs_rebalancing: false,
        last_rebalance_date: new Date().toISOString().split("T")[0]
      });

      return action;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientPortfolios"] });
      queryClient.invalidateQueries({ queryKey: ["allPortfolios"] });
      toast.success("Rebalancing executed successfully");
      setShowConfirm(false);
      setNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to execute rebalancing");
    }
  });

  const suggestRebalanceMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      return await base44.entities.RebalanceAction.create({
        portfolio_id: portfolio.id,
        action_type: "suggested",
        trigger_reason: `Drift exceeded threshold of ${driftData.threshold}%`,
        drift_detected: driftData.maxDrift,
        trades_executed: trades,
        status: "pending",
        approved_by: user.email,
        notes: notes
      });
    },
    onSuccess: () => {
      toast.success("Rebalancing suggestion saved");
      setNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save suggestion");
    }
  });

  if (!trades || trades.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-400">No rebalancing trades needed at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/50 bg-slate-800">
      <CardHeader>
        <CardTitle className="text-base text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          Rebalancing Suggestions
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Suggested trades to bring portfolio back to target allocation
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trade List */}
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
            {trades.map((trade, idx) => (
              <div key={idx} className="flex items-center justify-between pb-3 border-b border-slate-700 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {trade.action === "buy" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-100 capitalize">
                      {trade.action} {trade.asset}
                    </p>
                    <p className="text-xs text-slate-400">
                      Current: {trade.current_pct.toFixed(1)}% → Target: {trade.target_pct}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${trade.action === "buy" ? "text-green-400" : "text-red-400"}`}>
                    ${trade.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-slate-500">Drift: {trade.drift_pct.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-slate-900/30 rounded-lg p-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>
                Total rebalancing volume: ${trades.reduce((sum, t) => sum + t.amount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Rebalancing Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this rebalancing action..."
              className="bg-slate-900 border-slate-700 text-slate-100 text-sm"
              rows={2}
            />
          </div>

          {/* Actions */}
          {!showConfirm ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => suggestRebalanceMutation.mutate()}
                disabled={suggestRebalanceMutation.isPending}
              >
                {suggestRebalanceMutation.isPending ? "Saving..." : "Save Suggestion"}
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setShowConfirm(true)}
              >
                Execute Rebalance
              </Button>
            </div>
          ) : (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-300 mb-3">
                ⚠️ Confirm execution of {trades.length} rebalancing trade(s)?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => executeRebalanceMutation.mutate()}
                  disabled={executeRebalanceMutation.isPending}
                >
                  {executeRebalanceMutation.isPending ? "Executing..." : "Confirm & Execute"}
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 mt-2">
            Last rebalanced: {portfolio.last_rebalance_date 
              ? new Date(portfolio.last_rebalance_date).toLocaleDateString()
              : "Never"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}