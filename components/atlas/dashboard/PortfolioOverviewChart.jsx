import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { getChartColors } from "../portfolio/AssetColors";

const COLORS = getChartColors();

const allocationData = [
  { name: "Stocks", value: 45 },
  { name: "ETFs", value: 30 },
  { name: "Bonds", value: 15 },
  { name: "Cash", value: 10 },
];

const performanceData = [
  { month: "Sep", value: 980000 },
  { month: "Oct", value: 1020000 },
  { month: "Nov", value: 1080000 },
  { month: "Dec", value: 1050000 },
  { month: "Jan", value: 1150000 },
  { month: "Feb", value: 1200000 },
  { month: "Mar", value: 1255000 },
];

export default function PortfolioOverviewChart() {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
      <h3 className="text-sm font-semibold text-slate-100 mb-1">Portfolio Overview</h3>
      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-2xl font-bold text-slate-100">$1,255,000</span>
        <span className="text-sm font-semibold text-emerald-400">+9.75%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allocation Pie */}
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Asset Allocation</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {allocationData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[11px] text-slate-400">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Performance</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(v) => `$${v.toLocaleString()}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
                />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}