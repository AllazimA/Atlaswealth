import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, ArrowUpDown, TrendingUp, TrendingDown,
  AlertCircle, Calendar, DollarSign, Eye, Sparkles,
  RefreshCw, Target, Loader2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import StockRow from "../components/watchlist/StockRow";
import AddStockForm from "../components/watchlist/AddStockForm";
import EventSidePanel from "../components/watchlist/EventSidePanel";
import { getQuote } from "@/api/alphaVantage";

export default function AdvisorWatchboard() {
  const [activeView, setActiveView]     = useState("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState("ticker");
  const [sortDir, setSortDir]           = useState("asc");
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading: loadingWatchlist } = useQuery({
    queryKey:  ["watchlist"],
    queryFn:   () => base44.entities.WatchlistItem.list("-created_date", 200),
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ["portfolios"],
    queryFn:  () => base44.entities.Portfolio.filter({ status: "active" }),
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ["holdings"],
    queryFn:  () => base44.entities.Holding.list("-created_date", 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WatchlistItem.delete(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchboard");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WatchlistItem.update(id, data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  // ── Refresh live prices for all items ─────────────────────────────────────
  const handleRefreshPrices = async () => {
    if (refreshing || watchlist.length === 0) return;
    setRefreshing(true);
    let updated = 0;
    try {
      for (let i = 0; i < watchlist.length; i++) {
        const item = watchlist[i];
        try {
          const q = await getQuote(item.ticker);
          await base44.entities.WatchlistItem.update(item.id, {
            current_price:   q.price,
            daily_change_pct: q.changePct,
            daily_change:    q.change,
          });
          updated++;
        } catch (_) {}
        if (i < watchlist.length - 1) await new Promise((r) => setTimeout(r, 350));
      }
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setLastRefreshed(new Date());
      toast.success(`Prices refreshed for ${updated}/${watchlist.length} stocks`);
    } catch (_) {
      toast.error("Refresh failed — please retry");
    } finally {
      setRefreshing(false);
    }
  };

  // ── Enrich with portfolio data ─────────────────────────────────────────────
  const enrichedWatchlist = watchlist.map((item) => {
    const itemHoldings   = holdings.filter((h) => h.ticker === item.ticker);
    const portfolioNames = itemHoldings
      .map((h) => portfolios.find((p) => p.id === h.portfolio_id)?.name)
      .filter(Boolean);
    return {
      ...item,
      inPortfolios: portfolioNames,
      totalWeight:  itemHoldings.reduce((s, h) => s + (h.weight_pct || 0), 0),
      totalPL:      itemHoldings.reduce((s, h) => s + (h.gain_loss  || 0), 0),
    };
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCount   = enrichedWatchlist.length;
  const gainers      = enrichedWatchlist.filter((i) => (i.daily_change_pct || 0) > 0).length;
  const losers       = enrichedWatchlist.filter((i) => (i.daily_change_pct || 0) < 0).length;
  const atTrigger    = enrichedWatchlist.filter(
    (i) => i.trigger_price && i.current_price <= i.trigger_price
  ).length;

  // ── View filtering ─────────────────────────────────────────────────────────
  const viewFiltered = enrichedWatchlist.filter((item) => {
    if (activeView === "all")          return true;
    if (activeView === "opportunities") return ["valuation_opportunity", "technical_setup"].includes(item.watch_reason);
    if (activeView === "risk")         return item.volatility_level === "high" || item.has_price_alert;
    if (activeView === "dividend")     return item.watch_reason === "dividend_watch";
    if (activeView === "earnings")     return item.earnings_date || item.watch_reason === "earnings_catalyst";
    if (activeView === "themes")       return ["momentum_play", "turnaround_story"].includes(item.watch_reason);
    return true;
  });

  // ── Search filtering ───────────────────────────────────────────────────────
  const searchFiltered = viewFiltered.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.ticker?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.sector?.toLowerCase().includes(q)
    );
  });

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = [...searchFiltered].sort((a, b) => {
    let av = a[sortBy];
    let bv = b[sortBy];
    if (["ticker", "name", "sector"].includes(sortBy)) {
      av = (av || "").toLowerCase();
      bv = (bv || "").toLowerCase();
    } else {
      av = parseFloat(av) || 0;
      bv = parseFloat(bv) || 0;
    }
    return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Advisor Watchboard</h1>
          <p className="text-sm text-slate-400 mt-1">Professional stock monitoring and portfolio action tool</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPrices}
            disabled={refreshing || watchlist.length === 0}
            className="border-[#334155] text-slate-300 hover:bg-slate-700/30 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh Prices"}
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-orange-600 hover:bg-orange-700 h-9">
            <Plus className="w-4 h-4 mr-1.5" /> Add Stock
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Watching",    val: totalCount,  color: "text-slate-300", bg: "bg-slate-700/30",      icon: <Eye className="w-3.5 h-3.5" /> },
            { label: "Today ↑",     val: gainers,     color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { label: "Today ↓",     val: losers,      color: "text-red-400",     bg: "bg-red-500/10",     icon: <TrendingDown className="w-3.5 h-3.5" /> },
            { label: "At Trigger",  val: atTrigger,   color: "text-orange-400",  bg: "bg-orange-500/10",  icon: <Target className="w-3.5 h-3.5" /> },
          ].map(({ label, val, color, bg, icon }) => (
            <div key={label} className={`${bg} rounded-lg border border-[#334155] px-3 py-2.5 flex items-center justify-between`}>
              <div>
                <p className="text-[10px] text-slate-500">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{val}</p>
              </div>
              <div className={color}>{icon}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Views + Search ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <Tabs value={activeView} onValueChange={setActiveView} className="flex-1">
          <TabsList className="bg-[#1e293b] border border-[#334155]">
            {[
              { value: "all",           label: "All",           icon: <Eye className="w-3 h-3" /> },
              { value: "opportunities", label: "Opportunities", icon: <Target className="w-3 h-3" /> },
              { value: "risk",          label: "Risk Alerts",   icon: <AlertCircle className="w-3 h-3" /> },
              { value: "dividend",      label: "Dividend",      icon: <DollarSign className="w-3 h-3" /> },
              { value: "earnings",      label: "Earnings",      icon: <Calendar className="w-3 h-3" /> },
              { value: "themes",        label: "Themes",        icon: <Sparkles className="w-3 h-3" /> },
            ].map(({ value, label, icon }) => (
              <TabsTrigger key={value} value={value} className="text-xs data-[state=active]:bg-orange-600">
                <span className="mr-1">{icon}</span>{label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search ticker, company, sector…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-72 h-9 bg-[#1e293b] border-[#334155] text-slate-100"
          />
        </div>
      </div>

      {/* ── Last refreshed notice ──────────────────────────────────── */}
      {lastRefreshed && (
        <p className="text-[10px] text-slate-600">
          Prices last refreshed: {lastRefreshed.toLocaleTimeString()}
        </p>
      )}

      {/* ── Add Form ───────────────────────────────────────────────── */}
      {showAddForm && (
        <AddStockForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
          }}
        />
      )}

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="border border-[#334155] rounded-lg overflow-hidden bg-[#1e293b]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a] border-b border-[#334155]">
              <tr>
                <Th label="Symbol"      sortable onClick={() => handleSort("ticker")}           active={sortBy === "ticker"}           dir={sortDir} />
                <Th label="Company"     sortable onClick={() => handleSort("name")}             active={sortBy === "name"}             dir={sortDir} />
                <Th label="Sector"      sortable onClick={() => handleSort("sector")}           active={sortBy === "sector"}           dir={sortDir} />
                <Th label="Last Price"  sortable onClick={() => handleSort("current_price")}    active={sortBy === "current_price"}    dir={sortDir} />
                <Th label="Daily %"     sortable onClick={() => handleSort("daily_change_pct")} active={sortBy === "daily_change_pct"} dir={sortDir} />
                <Th label="52W Range" />
                <Th label="Watch Reason" />
                <Th label="Status" />
                <Th label="Trigger" />
                <Th label="Portfolio" />
                <Th label="AI Insight" />
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingWatchlist ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading watchboard…</p>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {searchQuery ? "No stocks match your search" : "No stocks on this watchboard"}
                    </p>
                    {!searchQuery && (
                      <p className="text-xs text-slate-600 mt-1">Click "+ Add Stock" to start monitoring</p>
                    )}
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <StockRow
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedStock(item)}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    onUpdate={(data) => updateMutation.mutate({ id: item.id, data })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <div className="px-4 py-2 border-t border-[#334155] bg-[#0f172a]/40 flex items-center justify-between">
            <p className="text-[10px] text-slate-600">{sorted.length} stock{sorted.length !== 1 ? "s" : ""} shown</p>
            {lastRefreshed && (
              <p className="text-[10px] text-slate-600">Updated {lastRefreshed.toLocaleTimeString()}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Side Panel ─────────────────────────────────────────────── */}
      {selectedStock && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedStock(null)} />
          <EventSidePanel
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
            portfolios={portfolios}
          />
        </>
      )}
    </div>
  );
}

function Th({ label, sortable, onClick, active, dir }) {
  return (
    <th
      className={`px-3 py-2.5 text-left text-xs font-semibold text-slate-400 whitespace-nowrap ${sortable ? "cursor-pointer hover:text-slate-200" : ""}`}
      onClick={sortable ? onClick : undefined}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortable && active && (
          <ArrowUpDown className={`w-3 h-3 ${dir === "desc" ? "rotate-180" : ""}`} />
        )}
      </div>
    </th>
  );
}
