import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SuitabilityBadge({ client, portfolio }) {
  if (!client || !portfolio) return null;

  const calculateSuitability = () => {
    let score = 100;
    const issues = [];

    // Check risk profile match
    const portfolioRisk = portfolio.portfolio_risk || portfolio.strategy;
    if (portfolioRisk && client.risk_profile && portfolioRisk !== client.risk_profile) {
      score -= 30;
      issues.push(`Portfolio risk (${portfolioRisk}) doesn't match client profile (${client.risk_profile})`);
    }

    // Check age-based allocation
    const age = client.age || 0;
    const equityPct = (portfolio.stocks_pct || 0) + (portfolio.etfs_pct || 0);
    
    if (age > 0) {
      const recommendedEquity = Math.max(20, 110 - age);
      const equityDiff = Math.abs(equityPct - recommendedEquity);
      
      if (equityDiff > 20) {
        score -= 25;
        issues.push(`Equity allocation (${equityPct}%) significantly differs from age-based guideline (~${recommendedEquity}%)`);
      }
    }

    // Check horizon alignment
    if (client.investment_horizon) {
      const isShortTerm = client.investment_horizon.includes("1-3");
      const isLongTerm = client.investment_horizon.includes("10+");
      
      if (isShortTerm && equityPct > 50) {
        score -= 20;
        issues.push("High equity exposure for short-term horizon");
      }
      if (isLongTerm && equityPct < 40) {
        score -= 15;
        issues.push("Low equity exposure for long-term horizon");
      }
    }

    // Determine status
    if (score >= 80) return { status: "suitable", icon: CheckCircle2, color: "emerald", issues };
    if (score >= 60) return { status: "review", icon: AlertTriangle, color: "amber", issues };
    return { status: "unsuitable", icon: XCircle, color: "red", issues };
  };

  const { status, icon: Icon, color, issues } = calculateSuitability();

  const statusConfig = {
    suitable: { label: "Suitable", bgClass: `bg-${color}-50`, textClass: `text-${color}-700`, borderClass: `border-${color}-200` },
    review: { label: "Review Needed", bgClass: `bg-${color}-50`, textClass: `text-${color}-700`, borderClass: `border-${color}-200` },
    unsuitable: { label: "Not Suitable", bgClass: `bg-${color}-50`, textClass: `text-${color}-700`, borderClass: `border-${color}-200` },
  };

  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${config.bgClass} ${config.textClass} ${config.borderClass} text-xs flex items-center gap-1 cursor-help`}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-semibold text-xs mb-1">Suitability Assessment</p>
          {issues.length > 0 ? (
            <ul className="text-xs space-y-0.5">
              {issues.map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs">Portfolio aligns well with client profile</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}