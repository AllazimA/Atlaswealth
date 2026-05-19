import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, TrendingUp, TrendingDown } from "lucide-react";

export default function RebalanceHistory({ portfolioId }) {
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["rebalanceActions", portfolioId],
    queryFn: () => base44.entities.RebalanceAction.filter({ portfolio_id: portfolioId }),
    enabled: !!portfolioId
  });

  if (isLoading) {
    return (
      <Card className="border-slate-700 bg-slate-800">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-400">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-400">No rebalancing history yet</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    executed: "bg-green-500/20 text-green-300 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30"
  };

  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">Rebalancing History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={statusColors[action.status]}>
                      {action.status}
                    </Badge>
                    <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xs">
                      {action.action_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{action.trigger_reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Drift Detected</p>
                  <p className="text-sm font-semibold text-orange-400">{action.drift_detected?.toFixed(2)}%</p>
                </div>
              </div>

              {/* Trades */}
              {action.trades_executed && action.trades_executed.length > 0 && (
                <div className="space-y-2 mb-3">
                  {action.trades_executed.map((trade, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        {trade.action === "buy" ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className="text-slate-300 capitalize">{trade.action} {trade.asset}</span>
                      </div>
                      <span className="text-slate-400">${trade.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-3 border-t border-slate-700">
                {action.execution_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(action.execution_date).toLocaleDateString()}
                  </div>
                )}
                {action.approved_by && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {action.approved_by}
                  </div>
                )}
              </div>

              {action.notes && (
                <p className="text-xs text-slate-400 mt-2 italic">{action.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}