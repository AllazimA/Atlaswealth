import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap, FileText, RefreshCw, Shield, TrendingUp,
  ChevronRight, AlertTriangle, CheckCircle2
} from "lucide-react";

export default function AdvisorQuickActions() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 100),
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ["allPortfolios"],
    queryFn: () => base44.entities.Portfolio.list("-created_date", 50),
  });

  const today = new Date();

  // Client Briefing: clients with reviews due in next 7 days
  const urgentReviews = clients.filter(c => {
    if (!c.next_review_date) return false;
    const d = new Date(c.next_review_date);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  // Rebalance Check: portfolios flagged for rebalancing
  const needsRebalance = portfolios.filter(p => p.needs_rebalancing);

  // Risk Snapshot: clients without risk profile
  const unassessedClients = clients.filter(c => !c.risk_profile || c.status === "pending");

  // Overdue: clients with past review date
  const overdueReviews = clients.filter(c => {
    if (!c.next_review_date) return false;
    return new Date(c.next_review_date) < today;
  });

  const actions = [
    {
      id: "briefing",
      icon: FileText,
      label: "Client Briefing",
      description: "Review clients due for a meeting",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      badge: urgentReviews.length,
      badgeColor: urgentReviews.length > 0 ? "bg-orange-600 text-white" : "bg-slate-700 text-slate-400",
      items: urgentReviews.map(c => ({
        name: `${c.first_name} ${c.last_name}`,
        detail: `Review due ${new Date(c.next_review_date).toLocaleDateString()}`,
        link: createPageUrl("Clients"),
      })),
      emptyMsg: "No client reviews due in the next 7 days",
      action: () => navigate(createPageUrl("Clients")),
    },
    {
      id: "rebalance",
      icon: RefreshCw,
      label: "Rebalance Check",
      description: "Portfolios flagged for rebalancing",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      badge: needsRebalance.length,
      badgeColor: needsRebalance.length > 0 ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400",
      items: needsRebalance.map(p => ({
        name: p.name,
        detail: `${p.portfolio_risk || "—"} strategy`,
        link: createPageUrl("PortfolioBuilder"),
      })),
      emptyMsg: "All portfolios are within target allocation",
      action: () => navigate(createPageUrl("PortfolioBuilder")),
    },
    {
      id: "risk",
      icon: Shield,
      label: "Risk Snapshot",
      description: "Clients with incomplete risk profiles",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      badge: unassessedClients.length,
      badgeColor: unassessedClients.length > 0 ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400",
      items: unassessedClients.slice(0, 4).map(c => ({
        name: `${c.first_name} ${c.last_name}`,
        detail: c.status === "pending" ? "Pending onboarding" : "No risk profile",
        link: createPageUrl("ClientAssessment") + `?clientId=${c.id}`,
      })),
      emptyMsg: "All clients have completed risk profiles",
      action: () => navigate(createPageUrl("ClientAssessment")),
    },
    {
      id: "stress",
      icon: TrendingUp,
      label: "Overdue Reviews",
      description: "Clients with past-due review dates",
      color: "text-red-400",
      bg: "bg-red-500/10",
      badge: overdueReviews.length,
      badgeColor: overdueReviews.length > 0 ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400",
      items: overdueReviews.slice(0, 4).map(c => ({
        name: `${c.first_name} ${c.last_name}`,
        detail: `Overdue since ${new Date(c.next_review_date).toLocaleDateString()}`,
        link: createPageUrl("Clients"),
      })),
      emptyMsg: "No overdue client reviews",
      action: () => navigate(createPageUrl("Clients")),
    },
  ];

  const totalAlerts = urgentReviews.length + needsRebalance.length + unassessedClients.length + overdueReviews.length;

  return (
    <Card className="border-[#334155] bg-[#1e293b] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            Advisor Quick Actions
          </CardTitle>
          {totalAlerts > 0 && (
            <Badge className="bg-red-600/80 text-white text-xs">
              {totalAlerts} alert{totalAlerts !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {clients.length} clients · {portfolios.length} portfolios
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-2">
        {actions.map(action => {
          const Icon = action.icon;
          const isOpen = expanded === action.id;
          return (
            <div key={action.id} className="rounded-xl border border-[#334155] overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : action.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-700/30 transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100">{action.label}</p>
                  <p className="text-xs text-slate-500 truncate">{action.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-xs ${action.badgeColor}`}>{action.badge}</Badge>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#334155] bg-[#0f172a]/50 p-3 space-y-2">
                  {action.items.length === 0 ? (
                    <div className="flex items-center gap-2 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-xs text-slate-400">{action.emptyMsg}</p>
                    </div>
                  ) : (
                    action.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(item.link)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/40 text-left transition-colors"
                      >
                        <AlertTriangle className={`w-3 h-3 ${action.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500">{item.detail}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                      </button>
                    ))
                  )}
                  <Button
                    size="sm"
                    onClick={action.action}
                    className="w-full h-7 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-200 mt-1"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        <p className="text-[10px] text-slate-600 pt-2">
          Live TV content provided via official third-party sources. Availability may vary by region.
        </p>
      </CardContent>
    </Card>
  );
}
