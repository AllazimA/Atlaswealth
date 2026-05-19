import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User, Target, TrendingUp, Clock, AlertCircle } from "lucide-react";

export default function ClientContextBar({ client }) {
  if (!client) return null;

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = client.age || calculateAge(client.date_of_birth);
  const isIncomplete = !client.risk_profile || !client.financial_goal || !client.investment_horizon;

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <div className="p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold text-slate-100">
            {client.first_name} {client.last_name}
          </span>
        </div>

        {age && (
          <Badge variant="default" className="text-xs font-bold">
            Age {age}
          </Badge>
        )}

        {client.financial_goal && (
          <Badge variant="success" className="text-xs font-bold flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            {client.financial_goal.replace("_", " ")}
          </Badge>
        )}

        {client.risk_profile && (
          <Badge
            variant={
              client.risk_profile === "conservative"
                ? "default"
                : client.risk_profile === "moderate"
                ? "warning"
                : "info"
            }
            className="text-xs font-bold"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            {client.risk_profile}
          </Badge>
        )}

        {client.investment_horizon && (
          <Badge variant="default" className="text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {client.investment_horizon}
          </Badge>
        )}

        {client.investment_preferences?.length > 0 && (
          <Badge variant="default" className="text-xs font-bold">
            {client.investment_preferences.slice(0, 2).join(", ")}
            {client.investment_preferences.length > 2 && ` +${client.investment_preferences.length - 2}`}
          </Badge>
        )}

        {isIncomplete && (
          <Badge variant="warning" className="text-xs font-bold flex items-center gap-1 ml-auto">
            <AlertCircle className="w-3.5 h-3.5" />
            Incomplete Profile
          </Badge>
        )}
      </div>
    </Card>
  );
}