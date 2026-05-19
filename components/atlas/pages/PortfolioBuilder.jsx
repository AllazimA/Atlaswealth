import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, CheckCircle2, Sparkles, Info, LayoutGrid, Bot, ChevronDown, ChevronUp, AlertTriangle, Target, Clock, Lightbulb } from "lucide-react";
import SuitabilityBadge from "../components/portfolio/SuitabilityBadge";
import { getChartColors } from "../components/portfolio/AssetColors";
import ThemeGallery from "../components/portfolio/ThemeGallery";
import HoldingsPreview from "../components/portfolio/HoldingsPreview";
import PerformanceAnalysis from "../components/portfolio/PerformanceAnalysis";
import AIPortfolioGenerator from "../components/portfolio/AIPortfolioGenerator";
import ManualModeSteps from "../components/portfolio/ManualModeSteps";
import { toast } from "sonner";

const COLORS = getChartColors();

const templates = {
  conservative: { stocks: 20, bonds: 50, etfs: 10, cash: 15, alternatives: 5, name: "Conservative Growth" },
  moderate: { stocks: 40, bonds: 25, etfs: 20, cash: 10, alternatives: 5, name: "Balanced Moderate" },
  aggressive: { stocks: 60, bonds: 10, etfs: 20, cash: 5, alternatives: 5, name: "Aggressive Growth" },
  income: { stocks: 15, bonds: 45, etfs: 20, cash: 15, alternatives: 5, name: "Income Focus" },
  growth: { stocks: 55, bonds: 15, etfs: 20, cash: 5, alternatives: 5, name: "Growth Focus" },
};

export default function PortfolioBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedClientId = urlParams.get("clientId");
  const queryClient = useQueryClient();

  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || "");
  const [portfolioName, setPortfolioName] = useState("");
  const [strategy, setStrategy] = useState("");
  const [mode, setMode] = useState("guided");
  const [appliedTheme, setAppliedTheme] = useState(null);
  const [themeCustomized, setThemeCustomized] = useState(false);
  const [alloc, setAlloc] = useState({ stocks: 40, bonds: 25, etfs: 20, cash: 10, alternatives: 5 });
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [totalAUM, setTotalAUM] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [saved, setSaved] = useState(false);
  const [suitabilityOverride, setSuitabilityOverride] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 100),
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ["allPortfolios"],
    queryFn: () => base44.entities.Portfolio.list("-created_date", 50),
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const calculateInvisibleHorizon = () => {
    if (!selectedClient) return null;
    const age = selectedClient.age || 0;
    const horizon = selectedClient.investment_horizon || "";
    const goal = selectedClient.financial_goal || "";
    
    let years = 10;
    if (horizon.includes("1-3")) years = 2;
    else if (horizon.includes("3-5")) years = 4;
    else if (horizon.includes("5-7")) years = 6;
    else if (horizon.includes("7-10")) years = 8;
    else if (horizon.includes("10+")) years = 15;
    
    if (goal === "retirement" && age > 0) {
      years = Math.max(years, 65 - age);
    }
    
    return years;
  };

  const PRESET_HOLDINGS = {
    conservative: [
      { ticker: "AGG",  name: "iShares Core US Aggregate Bond ETF", asset_type: "etf",   weight_pct: 35, avg_cost: 96,  rationale: "Core fixed income anchor" },
      { ticker: "BND",  name: "Vanguard Total Bond Market ETF",      asset_type: "etf",   weight_pct: 20, avg_cost: 73,  rationale: "Broad bond diversification" },
      { ticker: "SPY",  name: "SPDR S&P 500 ETF Trust",              asset_type: "etf",   weight_pct: 15, avg_cost: 580, rationale: "Core equity exposure" },
      { ticker: "JNJ",  name: "Johnson & Johnson",                    asset_type: "stock", weight_pct: 10, avg_cost: 148, rationale: "Defensive dividend payer" },
      { ticker: "PG",   name: "Procter & Gamble",                     asset_type: "stock", weight_pct: 10, avg_cost: 165, rationale: "Stable consumer staple" },
      { ticker: "T",    name: "AT&T Inc.",                            asset_type: "stock", weight_pct: 5,  avg_cost: 18,  rationale: "High dividend yield" },
      { ticker: "CASH", name: "Cash & Equivalents",                   asset_type: "cash",  weight_pct: 5,  avg_cost: 1,   rationale: "Liquidity buffer" },
    ],
    moderate: [
      { ticker: "SPY",  name: "SPDR S&P 500 ETF Trust",              asset_type: "etf",   weight_pct: 30, avg_cost: 580, rationale: "Core US equity" },
      { ticker: "AGG",  name: "iShares Core US Aggregate Bond ETF",  asset_type: "etf",   weight_pct: 20, avg_cost: 96,  rationale: "Fixed income balance" },
      { ticker: "QQQ",  name: "Invesco QQQ Trust",                   asset_type: "etf",   weight_pct: 10, avg_cost: 490, rationale: "Tech growth exposure" },
      { ticker: "MSFT", name: "Microsoft Corporation",               asset_type: "stock", weight_pct: 10, avg_cost: 410, rationale: "Quality mega-cap" },
      { ticker: "AAPL", name: "Apple Inc.",                          asset_type: "stock", weight_pct: 10, avg_cost: 225, rationale: "Quality mega-cap" },
      { ticker: "VEA",  name: "Vanguard FTSE Developed Markets ETF", asset_type: "etf",   weight_pct: 10, avg_cost: 50,  rationale: "International diversification" },
      { ticker: "CASH", name: "Cash & Equivalents",                  asset_type: "cash",  weight_pct: 10, avg_cost: 1,   rationale: "Liquidity buffer" },
    ],
    aggressive: [
      { ticker: "QQQ",  name: "Invesco QQQ Trust",     asset_type: "etf",   weight_pct: 25, avg_cost: 490, rationale: "Tech-heavy growth" },
      { ticker: "NVDA", name: "NVIDIA Corporation",    asset_type: "stock", weight_pct: 15, avg_cost: 120, rationale: "AI/semiconductor leader" },
      { ticker: "MSFT", name: "Microsoft Corporation", asset_type: "stock", weight_pct: 15, avg_cost: 410, rationale: "Cloud & AI exposure" },
      { ticker: "AAPL", name: "Apple Inc.",            asset_type: "stock", weight_pct: 10, avg_cost: 225, rationale: "Consumer tech moat" },
      { ticker: "GOOGL",name: "Alphabet Inc.",         asset_type: "stock", weight_pct: 10, avg_cost: 185, rationale: "Search & cloud dominance" },
      { ticker: "AMZN", name: "Amazon.com Inc.",       asset_type: "stock", weight_pct: 10, avg_cost: 220, rationale: "E-commerce & AWS" },
      { ticker: "IWM",  name: "iShares Russell 2000 ETF", asset_type: "etf", weight_pct: 10, avg_cost: 215, rationale: "Small-cap upside" },
      { ticker: "CASH", name: "Cash & Equivalents",   asset_type: "cash",  weight_pct: 5,  avg_cost: 1,   rationale: "Liquidity" },
    ],
    income: [
      { ticker: "DVY",  name: "iShares Select Dividend ETF",                  asset_type: "etf", weight_pct: 25, avg_cost: 115, rationale: "High dividend yield" },
      { ticker: "VYM",  name: "Vanguard High Dividend Yield ETF",              asset_type: "etf", weight_pct: 20, avg_cost: 130, rationale: "Dividend growth" },
      { ticker: "TLT",  name: "iShares 20+ Year Treasury Bond ETF",           asset_type: "etf", weight_pct: 20, avg_cost: 90,  rationale: "Long duration income" },
      { ticker: "LQD",  name: "iShares iBoxx Investment Grade Corporate Bond", asset_type: "etf", weight_pct: 15, avg_cost: 110, rationale: "Corporate bond income" },
      { ticker: "JNJ",  name: "Johnson & Johnson",                            asset_type: "stock", weight_pct: 10, avg_cost: 148, rationale: "Dividend aristocrat" },
      { ticker: "KO",   name: "The Coca-Cola Company",                        asset_type: "stock", weight_pct: 5,  avg_cost: 67,  rationale: "Stable dividend payer" },
      { ticker: "CASH", name: "Cash & Equivalents",                           asset_type: "cash",  weight_pct: 5,  avg_cost: 1,   rationale: "Liquidity" },
    ],
    growth: [
      { ticker: "VUG",  name: "Vanguard Growth ETF",          asset_type: "etf",   weight_pct: 25, avg_cost: 350, rationale: "Core growth exposure" },
      { ticker: "QQQ",  name: "Invesco QQQ Trust",            asset_type: "etf",   weight_pct: 20, avg_cost: 490, rationale: "Tech sector tilt" },
      { ticker: "MSFT", name: "Microsoft Corporation",        asset_type: "stock", weight_pct: 15, avg_cost: 410, rationale: "Quality growth compounder" },
      { ticker: "NVDA", name: "NVIDIA Corporation",           asset_type: "stock", weight_pct: 10, avg_cost: 120, rationale: "AI infrastructure" },
      { ticker: "AMZN", name: "Amazon.com Inc.",              asset_type: "stock", weight_pct: 10, avg_cost: 220, rationale: "E-commerce & cloud" },
      { ticker: "BND",  name: "Vanguard Total Bond Market ETF", asset_type: "etf", weight_pct: 10, avg_cost: 73,  rationale: "Stability anchor" },
      { ticker: "EEM",  name: "iShares MSCI Emerging Markets ETF", asset_type: "etf", weight_pct: 5, avg_cost: 43, rationale: "EM growth exposure" },
      { ticker: "CASH", name: "Cash & Equivalents",           asset_type: "cash",  weight_pct: 5,  avg_cost: 1,   rationale: "Liquidity" },
    ],
  };

  const generateSmartSuggestions = (key) => {
    const preset = PRESET_HOLDINGS[key];
    if (!preset) return;
    const newHoldings = preset.map(h => ({
      ...h,
      shares: 0,
      isAutoPopulated: true,
      isSuggestion: true,
      priceSource: "Reference Price",
      priceTimestamp: new Date().toLocaleTimeString(),
      error: null,
    }));
    setHoldings(newHoldings);
  };

  const applyTemplate = (key) => {
    const t = templates[key];
    
    // Apply template allocation directly - no overrides
    const allocToApply = {
      stocks: t.stocks,
      bonds: t.bonds,
      etfs: t.etfs,
      cash: t.cash,
      alternatives: t.alternatives
    };
    
    setAlloc(allocToApply);
    setPortfolioName(t.name);
    setStrategy(key);
    
    // Auto-generate smart suggestions
    generateSmartSuggestions(key);
  };

  const addHolding = () => {
    setHoldings([...holdings, { ticker: "", name: "", asset_type: "stock", shares: 0, avg_cost: 0, weight_pct: 0, isAutoPopulated: false, priceSource: "", priceTimestamp: "" }]);
  };

  const fetchTickerData = async (ticker, index) => {
    if (!ticker || ticker.length < 1) return;
    try {
      const res = await fetch(
        `/yf-api/v8/finance/chart/${ticker.toUpperCase()}?interval=1d&range=1d`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && meta.regularMarketPrice) {
        const typeMap = { EQUITY: "stock", ETF: "etf", BOND: "bond", MUTUALFUND: "mutual_fund", CRYPTOCURRENCY: "crypto" };
        const updated = [...holdings];
        updated[index] = {
          ...updated[index],
          ticker: ticker.toUpperCase(),
          name: meta.longName || meta.shortName || ticker.toUpperCase(),
          asset_type: typeMap[meta.quoteType] || "stock",
          avg_cost: meta.regularMarketPrice,
          current_price: meta.regularMarketPrice,
          currency: meta.currency || "USD",
          exchange: meta.exchangeName || "",
          isAutoPopulated: true,
          priceSource: "Yahoo Finance",
          priceTimestamp: new Date().toLocaleTimeString(),
          error: null,
        };
        setHoldings(updated);
        return;
      }
    } catch (_) {}
    // fallback — mark for manual entry
    const updated = [...holdings];
    updated[index] = {
      ...updated[index],
      ticker: ticker.toUpperCase(),
      error: "Could not fetch price — enter manually",
      isAutoPopulated: false,
    };
    setHoldings(updated);
  };

  const updateHolding = (index, field, value) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], [field]: value };
    setHoldings(updated);
    if (appliedTheme && field !== 'shares') {
      setThemeCustomized(true);
    }
  };

  const handleApplyTheme = (theme) => {
    setAppliedTheme(theme);
    setThemeCustomized(false);
    setMode("themes");
    setAlloc({
      stocks: theme.allocations.stocks_pct,
      bonds: theme.allocations.bonds_pct,
      etfs: theme.allocations.etfs_pct,
      cash: theme.allocations.cash_pct,
      alternatives: theme.allocations.alternatives_pct
    });
    setHoldings(theme.holdings.map(h => ({
      ticker: h.ticker,
      name: h.name,
      asset_type: h.asset_type,
      weight_pct: h.weight,
      shares: 0,
      avg_cost: 0,
      current_price: 0,
      total_value: 0,
      gain_loss: 0,
      gain_loss_pct: 0
    })));
    setPortfolioName(theme.name);
    setStrategy(theme.category);
    toast.success(`Theme "${theme.name}" applied`);
  };

  const handleAllocationChange = (key, value) => {
    setAlloc(prev => ({ ...prev, [key]: value }));
    if (appliedTheme) {
      setThemeCustomized(true);
    }
  };

  const removeHolding = (index) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const pieData = [
    { name: "Stocks", value: alloc.stocks },
    { name: "Bonds", value: alloc.bonds },
    { name: "ETFs", value: alloc.etfs },
    { name: "Cash", value: alloc.cash },
    { name: "Alternatives", value: alloc.alternatives },
  ].filter((d) => d.value > 0);

  const calculatePortfolioRisk = () => {
    const equityPct = alloc.stocks + alloc.etfs;
    if (equityPct < 35) return "conservative";
    if (equityPct < 60) return "moderate";
    if (equityPct < 75) return "balanced";
    return "aggressive";
  };

  const generateAIInsights = () => {
    if (!selectedClient) return;
    setAiLoading(true);

    const equityPct = alloc.stocks + alloc.etfs;
    const profile = selectedClient.risk_profile || "moderate";
    const horizon = selectedClient.investment_horizon || "";
    const assetCount = Object.values(alloc).filter(v => v > 0).length;

    const riskAligned =
      (profile === "conservative" && equityPct <= 40) ||
      (profile === "moderate" && equityPct >= 35 && equityPct <= 65) ||
      (profile === "aggressive" && equityPct >= 55);

    const horizonLong = horizon.includes("7") || horizon.includes("10+");
    const horizonShort = horizon.includes("1-3");

    const result = {
      risk_alignment: {
        status: riskAligned ? "aligned" : equityPct > 0 ? "caution" : "misaligned",
        message: `Portfolio has ${equityPct}% equity for a ${profile} risk client.`,
        suggestion: riskAligned
          ? "Equity exposure is well-aligned with client's risk profile."
          : profile === "conservative"
          ? `Reduce equity to below 40% — current ${equityPct}% is elevated for conservative investors.`
          : `Consider increasing equity exposure above 55% to match ${profile} risk tolerance.`,
      },
      diversification: {
        status: assetCount >= 4 && alloc.alternatives >= 0 ? "good" : assetCount >= 3 ? "moderate" : "poor",
        message: `${assetCount} asset classes represented in the current allocation.`,
        suggestion:
          assetCount < 3
            ? "Add more asset classes (bonds, ETFs) to improve diversification."
            : alloc.alternatives === 0
            ? "Consider a small alternatives allocation (5–10%) for uncorrelated returns."
            : "Portfolio is well-diversified across asset classes.",
      },
      time_horizon: {
        status: horizonLong && equityPct < 40 ? "review" : "appropriate",
        message: `Investment horizon: ${horizon || "Not specified"}.`,
        suggestion: horizonLong && equityPct < 40
          ? "Long horizon investors can typically tolerate higher equity exposure for growth."
          : horizonShort && equityPct > 60
          ? "Short-horizon clients may benefit from reducing equity volatility."
          : "Allocation appears consistent with the stated investment horizon.",
      },
      themes: [
        { name: "Quality Dividend Growth", rationale: "Stable income via dividend-paying blue-chip equities" },
        { name: "ESG / Sustainable", rationale: "Align with socially responsible investment mandates" },
        { name: "Global Diversification", rationale: "Reduce home-country bias with international ETFs" },
      ],
    };

    setAiInsights(result);
    setAiLoading(false);
  };

  const applySuggestion = (suggestion) => {
    toast.info("Manual application required - review suggestion and adjust sliders accordingly");
  };

  const handleApplyAIPortfolio = (aiPortfolio) => {
    setPortfolioName(aiPortfolio.name);
    setStrategy(aiPortfolio.strategy);
    setAlloc(aiPortfolio.allocation);
    setHoldings(aiPortfolio.holdings.map(h => ({
      ticker: h.ticker,
      name: h.name,
      asset_type: h.asset_type,
      shares: h.shares,
      avg_cost: h.avg_cost,
      weight_pct: h.target_weight,
      current_price: h.current_price,
      sector: h.sector,
      rationale: h.rationale,
      isAutoPopulated: true,
      isSuggestion: true,
      priceSource: "AI Market Data",
      priceTimestamp: new Date().toLocaleTimeString()
    })));
    setMode("guided");
    toast.success("AI portfolio applied - review and save when ready");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const totalAlloc = Object.values(alloc).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalAlloc - 100) > 0.1) {
        throw new Error("Total allocation must equal 100%");
      }

      const portfolio = await base44.entities.Portfolio.create({
        client_id: selectedClientId,
        name: portfolioName,
        strategy,
        mode: mode,
        portfolio_risk: calculatePortfolioRisk(),
        status: "draft",
        stocks_pct: alloc.stocks,
        bonds_pct: alloc.bonds,
        etfs_pct: alloc.etfs,
        cash_pct: alloc.cash,
        alternatives_pct: alloc.alternatives,
        suitability_override: suitabilityOverride,
        suitability_justification: suitabilityOverride ? overrideJustification : "",
        total_value: holdings.reduce((sum, h) => sum + (h.shares * h.avg_cost || 0), 0),
        ...(appliedTheme && {
          theme_id: appliedTheme.id,
          theme_name: appliedTheme.name,
          theme_category: appliedTheme.category,
          benchmark: appliedTheme.benchmark
        })
      });

      if (holdings.length > 0) {
        await base44.entities.Holding.bulkCreate(
          holdings.filter((h) => h.ticker).map((h) => ({
            portfolio_id: portfolio.id,
            client_id: selectedClientId,
            ticker: h.ticker,
            name: h.name,
            asset_type: h.asset_type,
            shares: h.shares,
            avg_cost: h.avg_cost,
            total_value: h.shares * h.avg_cost,
            weight_pct: h.weight_pct,
          }))
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPortfolios"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Portfolio saved as draft!");
      setAppliedTheme(null);
      setThemeCustomized(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save portfolio");
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Portfolio Builder</h1>
        <p className="text-sm text-slate-400 mt-1">Design and build investment portfolios</p>
      </div>

      {/* Client Info & Suitability */}
      {selectedClient && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {selectedClient.first_name} {selectedClient.last_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">{selectedClient.risk_profile || "N/A"}</Badge>
                <Badge variant="outline" className="text-xs bg-slate-700/30 text-slate-300 border-slate-600">{selectedClient.investment_horizon || "N/A"}</Badge>
                {calculateInvisibleHorizon() && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs flex items-center gap-1 cursor-help bg-slate-700/30 text-slate-300 border-slate-600">
                          <Info className="w-3 h-3" />
                          Invisible Horizon: ~{calculateInvisibleHorizon()}y
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-[#1e293b] border-[#334155] text-slate-100">
                        <p className="text-xs">
                          The "true" horizon considering age, stated horizon, and goals. Use this as the primary guide for equity exposure.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            {portfolioName && <SuitabilityBadge client={selectedClient} portfolio={{ ...alloc, portfolio_risk: calculatePortfolioRisk(), strategy }} />}
          </div>
        </div>
      )}

      {/* AI Portfolio Generator */}
      {selectedClientId && (
        <AIPortfolioGenerator 
          client={selectedClient} 
          onApplyPortfolio={handleApplyAIPortfolio}
        />
      )}

      {/* Client Selector */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-slate-400">Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Portfolio Name</Label>
            <Input value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100" placeholder="e.g. Growth Portfolio" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select strategy" /></SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                {["conservative", "moderate", "aggressive", "balanced", "income", "growth"].map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(val) => { setMode(val); if (val !== "themes") { setAppliedTheme(null); setThemeCustomized(false); } }}>
        <TabsList className="bg-[#1e293b] border border-[#334155] rounded-xl p-1 grid grid-cols-4">
          <TabsTrigger value="guided" className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Guided
          </TabsTrigger>
          <TabsTrigger value="manual" className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">Manual</TabsTrigger>
          <TabsTrigger value="themes" className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Themes
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">Performance</TabsTrigger>
        </TabsList>

        {/* Guided Mode */}
        <TabsContent value="guided" className="mt-4 space-y-4">
          <Card className="border-[#334155] bg-[#1e293b]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Smart Portfolio Templates
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Select a strategy to auto-generate institutional-grade portfolio with suggested tickers and live market prices
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(templates).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs ${
                      strategy === key ? "border-orange-500 bg-orange-500/20" : "border-[#334155] hover:border-orange-500/50 hover:bg-slate-700/30"
                    }`}
                  >
                    <p className="font-semibold text-slate-100 capitalize">{key}</p>
                    <p className="text-slate-400 mt-0.5">{t.stocks}% stocks</p>
                    <p className="text-[10px] text-slate-500 mt-1">Pre-built holdings</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {holdings.length > 0 && (
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-100">Suggested Holdings</CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Review and adjust suggested securities. Enter quantities to complete portfolio.
                </p>
              </CardHeader>
              <CardContent>
                {holdings.map((h, i) => (
                  <div key={i} className="space-y-2 mb-4 p-3 rounded-lg border border-[#334155] bg-[#0f172a]/30">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      <div>
                        <Label className="text-[10px] text-slate-400">Ticker</Label>
                        <Input 
                          value={h.ticker} 
                          onChange={(e) => updateHolding(i, "ticker", e.target.value.toUpperCase())}
                          onBlur={(e) => fetchTickerData(e.target.value, i)}
                          className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100 font-semibold" 
                          placeholder="e.g. AAPL"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400">Name {h.isAutoPopulated && <span className="text-emerald-400">✓</span>}</Label>
                        <Input 
                          value={h.name} 
                          onChange={(e) => updateHolding(i, "name", e.target.value)} 
                          className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100" 
                          disabled={h.isAutoPopulated}
                          placeholder="Auto-filled"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400">Type {h.isAutoPopulated && <span className="text-emerald-400">✓</span>}</Label>
                        <Select value={h.asset_type} onValueChange={(v) => updateHolding(i, "asset_type", v)} disabled={h.isAutoPopulated}>
                          <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#1e293b] border-[#334155]">
                            {["stock", "etf", "bond", "mutual_fund", "cash", "crypto"].map((t) => (
                              <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400">Shares/Units</Label>
                        <Input type="number" value={h.shares} onChange={(e) => updateHolding(i, "shares", parseFloat(e.target.value) || 0)} className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400">Price {h.isAutoPopulated && <span className="text-emerald-400">✓</span>}</Label>
                        <Input 
                          type="number" 
                          value={h.avg_cost} 
                          onChange={(e) => updateHolding(i, "avg_cost", parseFloat(e.target.value) || 0)} 
                          className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                          disabled={h.isAutoPopulated}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeHolding(i)} className="text-red-400 hover:text-red-500 mt-auto">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {h.error && (
                      <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                        <span>⚠</span> {h.error}
                      </div>
                    )}
                    
                    {h.isAutoPopulated && h.priceSource && (
                      <div className="text-[10px] text-emerald-400 flex items-center gap-2">
                        <span>✓ {h.priceSource}</span>
                        {h.priceTimestamp && <span className="text-slate-500">• {h.priceTimestamp}</span>}
                        {h.currency && <span className="text-slate-500">• {h.currency}</span>}
                        {h.exchange && <span className="text-slate-500">• {h.exchange}</span>}
                      </div>
                    )}
                    
                    {h.isSuggestion && h.rationale && (
                      <div className="text-[10px] text-blue-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {h.rationale}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Themes Mode */}
        <TabsContent value="themes" className="mt-4 space-y-4">
          <ThemeGallery onApplyTheme={handleApplyTheme} />
          
          {appliedTheme && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      Theme Applied: {appliedTheme.name}
                    </span>
                    {themeCustomized && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                        Customized
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{appliedTheme.description}</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          {selectedClientId && portfolios.length > 0 ? (
            <div className="space-y-6">
              {portfolios.filter(p => p.client_id === selectedClientId).map(portfolio => (
                <div key={portfolio.id}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-100">{portfolio.name}</h3>
                    <p className="text-sm text-slate-400">Performance vs {portfolio.benchmark || "S&P 500"}</p>
                  </div>
                  <PerformanceAnalysis portfolio={portfolio} benchmark={portfolio.benchmark || "S&P 500"} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardContent className="p-12 text-center">
                <p className="text-sm text-slate-400 mb-4">
                  {!selectedClientId 
                    ? "Select a client to view performance analysis" 
                    : "No portfolios available. Build a portfolio first to see performance metrics."}
                </p>
                {selectedClientId && (
                  <Button 
                    variant="outline"
                    className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
                    onClick={() => setMode("guided")}
                  >
                    Build Your First Portfolio
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manual Mode */}
        <TabsContent value="manual" className="mt-4">
          <ManualModeSteps 
            client={selectedClient}
            portfolioName={portfolioName}
            setPortfolioName={setPortfolioName}
            baseCurrency={baseCurrency}
            setBaseCurrency={setBaseCurrency}
            totalAUM={totalAUM}
            setTotalAUM={setTotalAUM}
            holdings={holdings}
            setHoldings={setHoldings}
            alloc={alloc}
            setAlloc={setAlloc}
            onSave={() => saveMutation.mutate()}
            isSaving={saveMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Allocation Preview + AI Panel */}
      {(mode !== "themes" || appliedTheme) && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#334155] bg-[#1e293b] lg:col-span-1">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-slate-100">Allocation</CardTitle></CardHeader>
              <CardContent>
                {["stocks", "bonds", "etfs", "cash", "alternatives"].map((key) => (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-slate-400">{key}</span>
                      <span className="font-semibold text-slate-100">{alloc[key]}%</span>
                    </div>
                    <Slider
                      value={[alloc[key]]}
                      onValueChange={([v]) => handleAllocationChange(key, v)}
                      min={0} max={100} step={5}
                    />
                  </div>
                ))}
                <div className="text-xs text-right">
                  Total: <span className={`font-bold ${Object.values(alloc).reduce((a, b) => a + b, 0) === 100 ? "text-emerald-400" : "text-red-400"}`}>
                    {Object.values(alloc).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#334155] bg-[#1e293b] lg:col-span-1">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-slate-100">Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-[11px] text-slate-400">{d.name} {d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio AI Guidance Panel */}
            <Card className="border-[#334155] bg-[#1e293b] lg:col-span-1">
              <CardHeader className="pb-3">
                <button
                  onClick={() => {
                    setAiPanelOpen(!aiPanelOpen);
                    if (!aiPanelOpen && !aiInsights && selectedClient) {
                      generateAIInsights();
                    }
                  }}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#D4AF37]" />
                    <CardTitle className="text-sm text-slate-100">Portfolio AI Guidance</CardTitle>
                    <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-[10px]">Advisory</Badge>
                  </div>
                  {aiPanelOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
                  )}
                </button>
              </CardHeader>
              {aiPanelOpen && (
                <CardContent className="space-y-3">
                  {!selectedClient ? (
                    <p className="text-xs text-slate-400 text-center py-4">Select a client to receive AI guidance</p>
                  ) : aiLoading ? (
                    <div className="space-y-3">
                      <div className="h-20 bg-slate-700/30 rounded-lg animate-pulse" />
                      <div className="h-20 bg-slate-700/30 rounded-lg animate-pulse" />
                      <div className="h-20 bg-slate-700/30 rounded-lg animate-pulse" />
                    </div>
                  ) : aiInsights ? (
                    <>
                      {/* Risk Alignment */}
                      <AIInsightSection
                        title="Risk Alignment"
                        icon={AlertTriangle}
                        status={aiInsights.risk_alignment?.status}
                        message={aiInsights.risk_alignment?.message}
                        suggestion={aiInsights.risk_alignment?.suggestion}
                        expanded={expandedSection === "risk"}
                        onToggle={() => setExpandedSection(expandedSection === "risk" ? null : "risk")}
                        onApply={() => applySuggestion(aiInsights.risk_alignment?.suggestion)}
                      />

                      {/* Diversification */}
                      <AIInsightSection
                        title="Diversification"
                        icon={Target}
                        status={aiInsights.diversification?.status}
                        message={aiInsights.diversification?.message}
                        suggestion={aiInsights.diversification?.suggestion}
                        expanded={expandedSection === "diversification"}
                        onToggle={() => setExpandedSection(expandedSection === "diversification" ? null : "diversification")}
                        onApply={() => applySuggestion(aiInsights.diversification?.suggestion)}
                      />

                      {/* Time Horizon */}
                      <AIInsightSection
                        title="Time Horizon Fit"
                        icon={Clock}
                        status={aiInsights.time_horizon?.status}
                        message={aiInsights.time_horizon?.message}
                        suggestion={aiInsights.time_horizon?.suggestion}
                        expanded={expandedSection === "horizon"}
                        onToggle={() => setExpandedSection(expandedSection === "horizon" ? null : "horizon")}
                        onApply={() => applySuggestion(aiInsights.time_horizon?.suggestion)}
                      />

                      {/* Theme Suggestions */}
                      {aiInsights.themes && aiInsights.themes.length > 0 && (
                        <div className="pt-2 border-t border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wide">Theme Suggestions</span>
                          </div>
                          <div className="space-y-2">
                            {aiInsights.themes.map((theme, idx) => (
                              <div key={idx} className="bg-[#0f172a] rounded-lg p-2 border border-slate-700/50">
                                <p className="text-[11px] font-medium text-slate-200">{theme.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{theme.rationale}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateAIInsights}
                        className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700/30 mt-2"
                      >
                        Refresh Analysis
                      </Button>

                      <p className="text-[9px] text-slate-600 italic text-center pt-2 border-t border-slate-700/50">
                        AI guidance is advisory only. Final decisions remain with the advisor.
                      </p>
                    </>
                  ) : (
                    <Button
                      onClick={generateAIInsights}
                      className="w-full bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900 text-xs"
                    >
                      <Bot className="w-3.5 h-3.5 mr-1.5" />
                      Generate AI Insights
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Holdings Preview */}
          {holdings.length > 0 && (
            <HoldingsPreview holdings={holdings} />
          )}
        </>
      )}

      {/* Advisor Override (if suitability issues exist) */}
      {selectedClient && portfolioName && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={suitabilityOverride}
              onChange={(e) => setSuitabilityOverride(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label className="text-sm font-semibold text-amber-400">Advisor Override</Label>
              <p className="text-xs text-amber-300 mt-1">
                Check this if you're proceeding despite suitability concerns
              </p>
              {suitabilityOverride && (
                <Textarea
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  placeholder="Explain why this portfolio is suitable despite the concerns..."
                  className="mt-3 bg-[#0f172a] border-[#334155] text-slate-100"
                  rows={3}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!selectedClientId || !portfolioName || saveMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {saveMutation.isPending ? "Saving..." : "Save Portfolio"}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Portfolio saved
          </span>
        )}
      </div>
    </div>
  );
}

function AIInsightSection({ title, icon: Icon, status, message, suggestion, expanded, onToggle, onApply }) {
  const statusColors = {
    aligned: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    good: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    appropriate: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    caution: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    moderate: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    review: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    misaligned: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    poor: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    inappropriate: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  };

  const colors = statusColors[status] || { bg: "bg-slate-700/30", text: "text-slate-400", border: "border-slate-600" };

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className={`w-3.5 h-3.5 ${colors.text} flex-shrink-0`} />
          <span className="text-[11px] font-semibold text-slate-100 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${colors.bg} ${colors.text} ${colors.border} text-[9px] px-1.5 py-0.5`}>
            {status?.toUpperCase()}
          </Badge>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-[10px] text-slate-300 leading-relaxed">{message}</p>
          {suggestion && (
            <>
              <div className="pt-2 border-t border-slate-700/50">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">Suggestion:</span> {suggestion}
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onApply}
                  className="flex-1 text-[9px] bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900 font-medium py-1.5 rounded transition-colors"
                >
                  Review
                </button>
                <button className="flex-1 text-[9px] bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-1.5 rounded transition-colors">
                  Ignore
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}