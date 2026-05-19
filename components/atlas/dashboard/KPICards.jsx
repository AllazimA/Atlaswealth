import React from "react";
import { Users, PieChart, DollarSign, ClipboardCheck, Lightbulb } from "lucide-react";

const kpis = [
  { key: "clients", label: "Total Clients", icon: Users, color: "bg-[#D4AF37]/10", iconColor: "text-[#D4AF37]" },
  { key: "portfolios", label: "Active Portfolios", icon: PieChart, color: "bg-slate-600/10", iconColor: "text-slate-400" },
  { key: "aum", label: "Total AUM", icon: DollarSign, color: "bg-emerald-500/10", iconColor: "text-emerald-400", isCurrency: true },
  { key: "pending", label: "Pending Assessments", icon: ClipboardCheck, color: "bg-blue-500/10", iconColor: "text-blue-400" },
  { key: "insights", label: "AI Insights", icon: Lightbulb, color: "bg-amber-500/10", iconColor: "text-amber-400" },
];

export default function KPICards({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => {
        const value = data?.[kpi.key] ?? 0;
        const displayValue = kpi.isCurrency
          ? `$${(value / 1000000).toFixed(1)}M`
          : value;

        return (
          <div
            key={kpi.key}
            className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5 hover:border-[#D4AF37]/20 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
              <span className="text-2xl font-bold text-slate-100">{displayValue}</span>
            </div>
            <p className="text-[13px] text-slate-400 font-medium">{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
}