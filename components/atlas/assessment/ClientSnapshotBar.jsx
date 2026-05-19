import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Target, TrendingUp, Clock, DollarSign, Calendar } from "lucide-react";

export default function ClientSnapshotBar({ client }) {
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

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">
            {client.first_name} {client.last_name}
          </span>
        </div>

        {age && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Age {age}
          </Badge>
        )}

        {client.risk_profile && (
          <Badge
            className={`text-xs ${
              client.risk_profile === "conservative"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : client.risk_profile === "moderate"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {client.risk_profile}
          </Badge>
        )}

        {client.investment_horizon && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {client.investment_horizon}
          </Badge>
        )}

        {client.financial_goal && (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
            <Target className="w-3 h-3" />
            {client.financial_goal.replace("_", " ")}
          </Badge>
        )}

        {client.currency && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {client.currency}
          </Badge>
        )}
      </div>
    </div>
  );
}