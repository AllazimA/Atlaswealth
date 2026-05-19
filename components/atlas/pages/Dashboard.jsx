import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getColorForAsset } from "../components/portfolio/AssetColors";
import { format, isPast, isWithinInterval, addDays, differenceInDays } from "date-fns";
import {
  DollarSign, TrendingUp, AlertTriangle, Users, ArrowUp, ArrowDown,
  Calendar, FileText, UserPlus, RefreshCw, ChevronRight,
  PieChart as PieChartIcon, Clock, CheckCircle2,
  Activity, BarChart3, Lightbulb, Star
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmtUSD = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

const RISK_COLORS = {
  conservative: "#64748b",
  moderate:     "#f59e0b",
  aggressive:   "#3b82f6",
};

// ── main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: clients = [] }    = useQuery({ queryKey: ["clients"],    queryFn: () => base44.entities.Client.list("-created_date", 200) });
  const { data: portfolios = [] } = useQuery({ queryKey: ["portfolios"], queryFn: () => base44.entities.Portfolio.list("-created_date", 200) });
  const { data: holdings = [] }   = useQuery({ queryKey: ["holdings"],   queryFn: () => base44.entities.Holding.list("-created_date", 1000) });

  // Live market data (Yahoo Finance, falls back to static)
  const { data: marketData = STATIC_MARKET } = useQuery({
    queryKey: ["market-indices"],
    queryFn: fetchMarketData,
    refetchInterval: 60_000,
    initialData: STATIC_MARKET,
  });

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const activeClients     = clients.filter(c => c.status === "active");
    const activePortfolios  = portfolios.filter(p => p.status === "active");
    const totalAUM          = portfolios.reduce((s, p) => s + (p.total_value || 0), 0);
    const atRisk            = activePortfolios.filter(p => p.needs_rebalancing || (p.return_pct || 0) < -10).length;
    const today             = new Date();
    const overdueReviews    = clients.filter(c => c.next_review_date && isPast(new Date(c.next_review_date))).length;
    const pendingClients    = clients.filter(c => c.status === "pending").length;
    const avgReturn         = activePortfolios.length
      ? activePortfolios.reduce((s, p) => s + (p.return_pct || 0), 0) / activePortfolios.length
      : 0;

    return { totalAUM, activeClients: activeClients.length, activePortfolios: activePortfolios.length, atRisk, overdueReviews, pendingClients, avgReturn };
  }, [clients, portfolios]);

  // ── Asset allocation from real holdings ────────────────────────────────────
  const allocationData = useMemo(() => {
    if (!holdings.length) return [];
    const totals = {};
    holdings.forEach(h => {
      const type = h.asset_type || "other";
      totals[type] = (totals[type] || 0) + (h.total_value || 0);
    });
    const grand = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(totals)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round((value / grand) * 100), raw: value }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  // ── Risk distribution ───────────────────────────────────────────────────────
  const riskData = useMemo(() => {
    const counts = { conservative: 0, moderate: 0, aggressive: 0 };
    clients.forEach(c => { if (counts[c.risk_profile] !== undefined) counts[c.risk_profile]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [clients]);

  // ── Attention items from REAL data ──────────────────────────────────────────
  const attentionItems = useMemo(() => {
    const items = [];

    // Overdue reviews
    clients.filter(c => c.next_review_date && isPast(new Date(c.next_review_date)))
      .slice(0, 2)
      .forEach(c => items.push({
        icon: Calendar, iconBg: "bg-red-500/10", iconColor: "text-red-400",
        title: `${c.first_name} ${c.last_name}`,
        message: `Review overdue since ${format(new Date(c.next_review_date), "MMM d")}`,
        action: "Review", href: createPageUrl("ClientDetail") + `?id=${c.id}`,
      }));

    // Portfolios needing rebalancing
    portfolios.filter(p => p.needs_rebalancing)
      .slice(0, 2)
      .forEach(p => {
        const client = clients.find(c => c.id === p.client_id);
        if (client) items.push({
          icon: AlertTriangle, iconBg: "bg-amber-500/10", iconColor: "text-amber-400",
          title: `${client.first_name} ${client.last_name}`,
          message: "Portfolio needs rebalancing",
          action: "Rebalance", href: createPageUrl("PortfolioBuilder"),
        });
      });

    // Pending clients
    clients.filter(c => c.status === "pending")
      .slice(0, 2)
      .forEach(c => items.push({
        icon: Clock, iconBg: "bg-blue-500/10", iconColor: "text-blue-400",
        title: `${c.first_name} ${c.last_name}`,
        message: "Pending onboarding — risk assessment missing",
        action: "Assess", href: createPageUrl("ClientAssessment"),
      }));

    // Portfolios with negative returns
    portfolios.filter(p => (p.return_pct || 0) < -10 && p.status === "active")
      .slice(0, 1)
      .forEach(p => {
        const client = clients.find(c => c.id === p.client_id);
        if (client) items.push({
          icon: TrendingUp, iconBg: "bg-red-500/10", iconColor: "text-red-400",
          title: `${client.first_name} ${client.last_name}`,
          message: `Portfolio down ${Math.abs(p.return_pct || 0).toFixed(1)}% — review allocation`,
          action: "View", href: createPageUrl("ClientDetail") + `?id=${client.id}`,
        });
      });

    // Fallback
    if (items.length === 0) items.push({
      icon: CheckCircle2, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400",
      title: "All clear",
      message: "No urgent actions required. Great work!",
      action: null, href: null,
    });

    return items.slice(0, 4);
  }, [clients, portfolios]);

  // ── Upcoming reviews (next 30 days) ────────────────────────────────────────
  const upcomingReviews = useMemo(() => {
    const today = new Date();
    const in30  = addDays(today, 30);
    return clients
      .filter(c => c.next_review_date && isWithinInterval(new Date(c.next_review_date), { start: today, end: in30 }))
      .sort((a, b) => new Date(a.next_review_date) - new Date(b.next_review_date))
      .slice(0, 5);
  }, [clients]);

  // ── Smart insights (rule-based) ─────────────────────────────────────────────
  const insights = useMemo(() => {
    const list = [];
    const activeP = portfolios.filter(p => p.status === "active");

    if (kpis.overdueReviews > 0)
      list.push({ priority: "high", icon: Calendar, title: `${kpis.overdueReviews} overdue review${kpis.overdueReviews > 1 ? "s" : ""}`, desc: "Schedule immediately to stay compliant", href: createPageUrl("Clients") });

    if (kpis.atRisk > 0)
      list.push({ priority: "high", icon: AlertTriangle, title: `${kpis.atRisk} portfolio${kpis.atRisk > 1 ? "s" : ""} need rebalancing`, desc: "Allocation drift detected — action recommended", href: createPageUrl("PortfolioBuilder") });

    if (kpis.pendingClients > 0)
      list.push({ priority: "medium", icon: Users, title: `${kpis.pendingClients} client${kpis.pendingClients > 1 ? "s" : ""} not onboarded`, desc: "Complete risk assessment and build portfolio", href: createPageUrl("ClientAssessment") });

    const noPortfolio = clients.filter(c => c.status === "active" && !portfolios.find(p => p.client_id === c.id && p.status === "active")).length;
    if (noPortfolio > 0)
      list.push({ priority: "medium", icon: PieChartIcon, title: `${noPortfolio} active client${noPortfolio > 1 ? "s" : ""} without portfolios`, desc: "Build a portfolio to start managing their assets", href: createPageUrl("PortfolioBuilder") });

    if (kpis.avgReturn > 5)
      list.push({ priority: "low", icon: TrendingUp, title: `Avg portfolio return: +${kpis.avgReturn.toFixed(1)}%`, desc: "Portfolios performing well — consider documenting wins", href: createPageUrl("Reports") });

    if (upcomingReviews.length > 0)
      list.push({ priority: "low", icon: Star, title: `${upcomingReviews.length} review${upcomingReviews.length > 1 ? "s" : ""} in the next 30 days`, desc: "Prepare performance summaries in advance", href: createPageUrl("Reports") });

    return list.slice(0, 4);
  }, [clients, portfolios, kpis, upcomingReviews]);

  // ── market sentiment ────────────────────────────────────────────────────────
  const avgChange = marketData.slice(0, 3).reduce((s, m) => s + parseFloat(m.changePercent || 0), 0) / 3;
  const isRiskOn  = avgChange >= -0.3;

  // ── recent clients ──────────────────────────────────────────────────────────
  const recentClients = useMemo(() =>
    [...clients].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5),
  [clients]);

  return (
    <div className="space-y-6 pb-24">

      {/* ── KPI Strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard icon={DollarSign} iconBg="bg-[#D4AF37]/10" iconColor="text-[#D4AF37]"
          value={fmtUSD(kpis.totalAUM)} label="Total AUM"
          onClick={() => navigate(createPageUrl("Clients"))} />
        <KPICard icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-400"
          value={kpis.activeClients} label="Active Clients"
          sub={kpis.pendingClients > 0 ? `${kpis.pendingClients} pending` : null} subColor="text-amber-400"
          onClick={() => navigate(createPageUrl("Clients"))} />
        <KPICard icon={PieChartIcon} iconBg="bg-emerald-500/10" iconColor="text-emerald-400"
          value={kpis.activePortfolios} label="Active Portfolios"
          onClick={() => navigate(createPageUrl("PortfolioBuilder"))} />
        <KPICard icon={AlertTriangle} iconBg="bg-amber-500/10" iconColor="text-amber-400"
          value={kpis.atRisk} label="Portfolios at Risk"
          onClick={() => navigate(createPageUrl("PortfolioBuilder"))} />
        <KPICard
          icon={kpis.avgReturn >= 0 ? TrendingUp : TrendingUp}
          iconBg={kpis.avgReturn >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
          iconColor={kpis.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}
          value={`${kpis.avgReturn >= 0 ? "+" : ""}${kpis.avgReturn.toFixed(1)}%`}
          label="Avg Portfolio Return"
          onClick={() => navigate(createPageUrl("PortfolioBuilder"))} />
      </div>

      {/* ── Row 2: Overview + Market Pulse ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Portfolio Overview */}
        <div className="lg:col-span-3 bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Portfolio Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Aggregate across all active portfolios</p>
            </div>
            <Button size="sm" variant="outline"
              className="border-[#334155] text-slate-400 hover:text-slate-100 text-xs h-8"
              onClick={() => navigate(createPageUrl("PortfolioBuilder"))}>
              View All
            </Button>
          </div>

          {holdings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allocation pie */}
              <div>
                <p className="text-xs text-slate-400 font-medium mb-3">Asset Allocation</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocationData} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                        paddingAngle={3} dataKey="value">
                        {allocationData.map((entry, i) => (
                          <Cell key={i} fill={getColorForAsset(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n, p) => [`${v}% — ${fmtUSD(p.payload.raw)}`, p.payload.name]}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: getColorForAsset(item.name) }} />
                      <span className="text-[11px] text-slate-400">{item.name} {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk distribution pie */}
              <div>
                <p className="text-xs text-slate-400 font-medium mb-3">Client Risk Distribution</p>
                {riskData.length > 0 ? (
                  <>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={riskData} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                            paddingAngle={3} dataKey="value">
                            {riskData.map((entry) => (
                              <Cell key={entry.name} fill={RISK_COLORS[entry.name.toLowerCase()] || "#64748b"} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, n, p) => [`${v} client${v > 1 ? "s" : ""}`, p.payload.name]}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {riskData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLORS[item.name.toLowerCase()] || "#64748b" }} />
                          <span className="text-[11px] text-slate-400">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState text="Add clients to see risk distribution" />
                )}
              </div>
            </div>
          ) : (
            <EmptyState icon={BarChart3} text="No holdings data yet. Build a portfolio to see allocation charts." />
          )}
        </div>

        {/* Market Pulse */}
        <div className="space-y-4">
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100">Market Pulse</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRiskOn ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {isRiskOn ? "RISK-ON" : "RISK-OFF"}
              </span>
            </div>
            <div className="space-y-2.5">
              {marketData.map((item) => (
                <div key={item.name}
                  className="flex items-center justify-between py-1.5 border-b border-slate-700/40 last:border-0 cursor-pointer hover:bg-slate-800/30 rounded px-1 -mx-1 transition-colors"
                  onClick={() => navigate(createPageUrl("TodaysMarket"))}>
                  <span className="text-xs font-medium text-slate-300">{item.name}</span>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-100">{item.value}</div>
                    <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${item.positive ? "text-emerald-400" : "text-red-400"}`}>
                      {item.positive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                      {item.changePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(createPageUrl("TodaysMarket"))}
              className="w-full mt-3 text-xs text-orange-400 hover:text-orange-300 flex items-center justify-center gap-1 transition-colors">
              Full Market View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3: Insights + Attention + Upcoming Reviews ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Smart Insights */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-semibold text-slate-100">Smart Insights</h3>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#334155] hover:border-[#D4AF37]/30 cursor-pointer transition-colors"
                  onClick={() => ins.href && navigate(ins.href)}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ins.priority === "high" ? "bg-red-500/10" : ins.priority === "medium" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
                    <ins.icon className={`w-3.5 h-3.5 ${ins.priority === "high" ? "text-red-400" : ins.priority === "medium" ? "text-amber-400" : "text-blue-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-100">{ins.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ins.desc}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${ins.priority === "high" ? "bg-red-500/20 text-red-400" : ins.priority === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {ins.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} text="No insights yet — add clients and portfolios to get started." />
          )}
        </div>

        {/* What Needs Attention */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-slate-100">Needs Attention</h3>
          </div>
          <div className="space-y-3">
            {attentionItems.map((item, i) => (
              <div key={i}
                className={`flex items-center gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#334155] transition-colors ${item.href ? "hover:border-orange-500/30 cursor-pointer" : ""}`}
                onClick={() => item.href && navigate(item.href)}>
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.message}</p>
                </div>
                {item.action && (
                  <span className="text-[10px] text-orange-400 font-semibold flex-shrink-0 hover:text-orange-300">
                    {item.action} →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reviews */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-100">Upcoming Reviews</h3>
            </div>
            <span className="text-[10px] text-slate-500">Next 30 days</span>
          </div>
          {upcomingReviews.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingReviews.map((client) => {
                const daysLeft = differenceInDays(new Date(client.next_review_date), new Date());
                const urgency  = daysLeft <= 3 ? "text-red-400" : daysLeft <= 7 ? "text-amber-400" : "text-emerald-400";
                return (
                  <div key={client.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f172a] border border-[#334155] hover:border-blue-500/30 cursor-pointer transition-colors"
                    onClick={() => navigate(createPageUrl("ClientDetail") + `?id=${client.id}`)}>
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-100">{client.first_name} {client.last_name}</p>
                      <p className="text-[11px] text-slate-400">{format(new Date(client.next_review_date), "MMM d, yyyy")}</p>
                    </div>
                    <span className={`text-[10px] font-bold flex-shrink-0 ${urgency}`}>
                      {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Calendar} text="No upcoming reviews. Set review dates on client profiles." />
          )}
        </div>
      </div>

      {/* ── Row 4: Recent Clients + Portfolio Drift ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Clients */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100">Recent Clients</h3>
            <button onClick={() => navigate(createPageUrl("Clients"))}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentClients.length > 0 ? (
            <div className="space-y-2">
              {recentClients.map((client, i) => {
                const clientPortfolios = portfolios.filter(p => p.client_id === client.id && p.status === "active");
                const statusColors = { active: "text-emerald-400", pending: "text-amber-400", inactive: "text-slate-500", archived: "text-slate-600" };
                return (
                  <div key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#334155] hover:border-[#D4AF37]/20 cursor-pointer transition-colors"
                    onClick={() => navigate(createPageUrl("ClientDetail") + `?id=${client.id}`)}>
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-xs font-bold text-[#D4AF37] flex-shrink-0">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{client.first_name} {client.last_name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{client.risk_profile || "Unassessed"} · {clientPortfolios.length} portfolio{clientPortfolios.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-100">{fmtUSD(portfolios.filter(p => p.client_id === client.id).reduce((s, p) => s + (p.total_value || 0), 0))}</p>
                      <p className={`text-[11px] font-medium capitalize ${statusColors[client.status] || "text-slate-400"}`}>{client.status || "pending"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Users} text="No clients yet. Add your first client to get started." action={{ label: "Add Client", href: createPageUrl("Clients") + "?new=true" }} navigate={navigate} />
          )}
        </div>

        {/* Portfolio Drift */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100">Portfolio Drift</h3>
            <button onClick={() => navigate(createPageUrl("PortfolioBuilder"))}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <PortfolioDriftList portfolios={portfolios} holdings={holdings} clients={clients} navigate={navigate} />
        </div>
      </div>

      {/* ── Bottom Action Bar ────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-sm border-t border-[#334155] p-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <Button className="bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900 h-10 px-5 font-semibold"
            onClick={() => navigate(createPageUrl("Clients") + "?new=true")}>
            <UserPlus className="w-4 h-4 mr-2" /> New Client
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white h-10 px-5"
            onClick={() => navigate(createPageUrl("Reports"))}>
            <FileText className="w-4 h-4 mr-2" /> Generate Report
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white h-10 px-5"
            onClick={() => navigate(createPageUrl("PortfolioBuilder"))}>
            <RefreshCw className="w-4 h-4 mr-2" /> Portfolio Builder
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white h-10 px-5"
            onClick={() => navigate(createPageUrl("StockAnalysis"))}>
            <BarChart3 className="w-4 h-4 mr-2" /> Stock Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, iconBg, iconColor, value, label, sub, subColor, onClick }) {
  return (
    <div className={`bg-[#1e293b] rounded-2xl border border-[#334155] p-5 hover:border-[#D4AF37]/30 transition-all duration-200 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-100">{value}</div>
          {sub && <div className={`text-xs font-semibold mt-0.5 ${subColor}`}>{sub}</div>}
        </div>
      </div>
      <p className="text-[13px] text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon = Activity, text, action, navigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <div className="w-10 h-10 rounded-full bg-slate-700/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <p className="text-xs text-slate-500 max-w-[180px] leading-relaxed">{text}</p>
      {action && navigate && (
        <button onClick={() => navigate(action.href)}
          className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors">
          {action.label} →
        </button>
      )}
    </div>
  );
}

function PortfolioDriftList({ portfolios, holdings, clients, navigate }) {
  const driftItems = useMemo(() => {
    return portfolios
      .filter(p => p.status === "active")
      .map(p => {
        const ph = holdings.filter(h => h.portfolio_id === p.id);
        const total = ph.reduce((s, h) => s + (h.total_value || 0), 0);
        if (total === 0) return null;

        const actual = {};
        ph.forEach(h => {
          const t = h.asset_type || "other";
          actual[t] = (actual[t] || 0) + (h.total_value || 0) / total * 100;
        });

        const targets = { stocks: p.stocks_pct || 0, bonds: p.bonds_pct || 0, etfs: p.etfs_pct || 0, cash: p.cash_pct || 0, alternatives: p.alternatives_pct || 0 };
        const drift = Math.max(...Object.keys(targets).map(k => Math.abs((actual[k] || 0) - targets[k])));

        const client = clients.find(c => c.id === p.client_id);
        return { p, drift, client, total };
      })
      .filter(Boolean)
      .sort((a, b) => b.drift - a.drift)
      .slice(0, 5);
  }, [portfolios, holdings, clients]);

  if (driftItems.length === 0) {
    return <EmptyState icon={CheckCircle2} text="All portfolios are within target allocation" />;
  }

  return (
    <div className="space-y-3">
      {driftItems.map(({ p, drift, client }, i) => {
        const driftColor = drift > 10 ? "bg-red-500" : drift > 5 ? "bg-amber-500" : "bg-emerald-500";
        const textColor  = drift > 10 ? "text-red-400" : drift > 5 ? "text-amber-400" : "text-emerald-400";
        return (
          <div key={p.id}
            className="cursor-pointer hover:bg-slate-800/30 rounded-lg p-2 -mx-2 transition-colors"
            onClick={() => client && navigate(createPageUrl("ClientDetail") + `?id=${client.id}`)}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-slate-100">
                {client ? `${client.first_name} ${client.last_name}` : "Unknown Client"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{fmtUSD(p.total_value || 0)}</span>
                <span className={`text-sm font-bold ${textColor}`}>{drift.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${driftColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(drift * 5, 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Market data fetch ─────────────────────────────────────────────────────────

const STATIC_MARKET = [
  { name: "S&P 500",   value: "6,047.15", change: "12.45",  changePercent: "0.21",  positive: true  },
  { name: "NASDAQ",    value: "19,632.32",change: "85.50",  changePercent: "0.44",  positive: true  },
  { name: "DOW",       value: "44,850.73",change: "-22.15", changePercent: "-0.05", positive: false },
  { name: "GOLD",      value: "2,875.30", change: "15.80",  changePercent: "0.55",  positive: true  },
  { name: "OIL",       value: "73.42",    change: "-1.23",  changePercent: "-0.17", positive: false },
  { name: "USD INDEX", value: "108.15",   change: "0.25",   changePercent: "0.23",  positive: true  },
];

async function fetchMarketData() {
  const indices = [
    { symbol: "^GSPC",    name: "S&P 500"   },
    { symbol: "^IXIC",    name: "NASDAQ"    },
    { symbol: "^DJI",     name: "DOW"       },
    { symbol: "GC=F",     name: "GOLD"      },
    { symbol: "CL=F",     name: "OIL"       },
    { symbol: "DX-Y.NYB", name: "USD INDEX" },
  ];
  return Promise.all(
    indices.map(async (idx, i) => {
      try {
        const res = await fetch(`/yf-api/v8/finance/chart/${idx.symbol}?interval=1d&range=1d`);
        const json = await res.json();
        const meta = json.chart.result[0].meta;
        const chg  = meta.regularMarketPrice - meta.previousClose;
        return { name: idx.name, value: meta.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: chg.toFixed(2), changePercent: ((chg / meta.previousClose) * 100).toFixed(2), positive: chg > 0 };
      } catch {
        return STATIC_MARKET[i];
      }
    })
  );
}
