import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const profileColors = {
  conservative: "bg-slate-600/30 text-slate-300 border-slate-600",
  moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  aggressive: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const avatarColors = [
  "bg-orange-500/20 text-orange-400",
  "bg-slate-600/30 text-slate-300",
  "bg-amber-500/20 text-amber-400",
  "bg-slate-700/30 text-slate-400",
  "bg-orange-600/20 text-orange-300",
];

export default function ActiveClients({ clients = [] }) {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Active Clients</h3>
        <Link to={createPageUrl("Clients")} className="text-xs text-orange-400 hover:text-orange-300 font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {clients.slice(0, 5).map((client, i) => (
          <Link
            key={client.id}
            to={createPageUrl("ClientDetail") + `?id=${client.id}`}
            className="flex items-center gap-3 py-1.5 hover:bg-slate-700/30 -mx-2 px-2 rounded-lg transition-colors"
          >
            <Avatar className="w-9 h-9">
              <AvatarFallback className={`${avatarColors[i % avatarColors.length]} text-xs font-semibold`}>
                {client.first_name?.[0]}{client.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-100">
                {client.first_name} {client.last_name}
              </p>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${profileColors[client.risk_profile] || "bg-slate-700/30 text-slate-400"}`}>
                {client.risk_profile || "Unassessed"}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-slate-100">
                ${(client.total_aum || 0).toLocaleString()}
              </p>
              {client.status === "active" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
              )}
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No clients yet</p>
        )}
      </div>
    </div>
  );
}