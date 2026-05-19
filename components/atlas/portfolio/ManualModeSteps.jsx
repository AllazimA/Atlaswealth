import React, { useState } from "react";
import { getQuote } from "@/api/alphaVantage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Plus, Trash2, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { getChartColors } from "./AssetColors";
import { toast } from "sonner";

const COLORS = getChartColors();

export default function ManualModeSteps({ 
  client, 
  portfolioName, 
  setPortfolioName, 
  baseCurrency, 
  setBaseCurrency,
  totalAUM,
  setTotalAUM,
  holdings, 
  setHoldings,
  alloc,
  setAlloc,
  onSave,
  isSaving
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tickerInput, setTickerInput] = useState("");
  const [fetchingTickers, setFetchingTickers] = useState(false);
  const [tickerResults, setTickerResults] = useState([]);
  const [constraints, setConstraints] = useState({
    maxSingleHolding: 20,
    maxSectorWeight: 30,
    minCash: 5,
    rebalanceTolerance: 5
  });

  // Auto-calc totals
  const totalValue = holdings.reduce((sum, h) => sum + ((h.shares || 0) * (h.current_price || 0)), 0);
  const weightsSum = Object.values(alloc).reduce((sum, val) => sum + val, 0);

  const updateHolding = (index, field, value) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calc position value and weight
    if (field === 'shares' || field === 'current_price') {
      const positionValue = (updated[index].shares || 0) * (updated[index].current_price || 0);
      updated[index].position_value = positionValue;
      updated[index].weight_pct = totalValue > 0 ? (positionValue / totalValue) * 100 : 0;
    }
    
    setHoldings(updated);
  };

  const addHolding = () => {
    setHoldings([...holdings, { 
      ticker: "", 
      name: "", 
      asset_type: "stock", 
      shares: 0, 
      current_price: 0,
      position_value: 0,
      weight_pct: 0
    }]);
  };

  const removeHolding = (index) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const fetchTickerData = async () => {
    if (!tickerInput.trim()) return;
    setFetchingTickers(true);
    const tickers = tickerInput.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);

    // Fetch one at a time with a small delay to respect 5 req/min free-tier limit
    const results = [];
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      try {
        const q = await getQuote(ticker);
        results.push({
          ticker,
          name: ticker, // GLOBAL_QUOTE doesn't return name; user can edit in the table
          asset_type: "stock",
          current_price: q.price,
          change: q.change,
          changePct: q.changePct,
          isValid: true,
        });
      } catch (err) {
        results.push({ ticker, error: err.message || "Not found", isValid: false });
      }
      // 300 ms gap between calls so we stay under 5 req/min
      if (i < tickers.length - 1) await new Promise(r => setTimeout(r, 300));
    }

    setTickerResults(results);
    const valid = results.filter(r => r.isValid).length;
    if (valid > 0) toast.success(`Fetched ${valid} of ${tickers.length} ticker${tickers.length !== 1 ? "s" : ""}`);
    else toast.error("No tickers found — check symbols and try again");
    setFetchingTickers(false);
  };

  const addTickerToHoldings = (tickerData) => {
    const newHolding = {
      ticker: tickerData.ticker,
      name: tickerData.name,
      asset_type: tickerData.asset_type,
      shares: 0,
      current_price: tickerData.current_price || 0,
      sector: tickerData.sector,
      position_value: 0,
      weight_pct: 0,
      isAutoPopulated: true
    };
    setHoldings([...holdings, newHolding]);
    toast.success(`${tickerData.ticker} added to holdings`);
  };

  const clearTickerSearch = () => {
    setTickerInput("");
    setTickerResults([]);
  };

  const pieData = [
    { name: "Stocks", value: alloc.stocks },
    { name: "Bonds", value: alloc.bonds },
    { name: "ETFs", value: alloc.etfs },
    { name: "Cash", value: alloc.cash },
    { name: "Alternatives", value: alloc.alternatives },
  ].filter((d) => d.value > 0);

  const validationChecks = [
    { 
      label: "Weights sum to 100%", 
      passed: Math.abs(weightsSum - 100) < 0.1,
      detail: `Current: ${weightsSum.toFixed(1)}%`
    },
    { 
      label: "All prices available", 
      passed: holdings.every(h => h.current_price > 0),
      detail: `${holdings.filter(h => h.current_price > 0).length}/${holdings.length} complete`
    },
    { 
      label: "No concentration risk", 
      passed: holdings.every(h => h.weight_pct <= constraints.maxSingleHolding),
      detail: `Max single: ${constraints.maxSingleHolding}%`
    }
  ];

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-[10px] text-slate-400">Portfolio Name</Label>
            <Input 
              value={portfolioName} 
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="e.g. Growth Portfolio"
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>
          <div className="w-32">
            <Label className="text-[10px] text-slate-400">Base Currency</Label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                {["USD", "EUR", "GBP", "CAD", "AUD", "CHF"].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Label className="text-[10px] text-slate-400">Total Notional / AUM</Label>
            <Input 
              type="number"
              value={totalAUM} 
              onChange={(e) => setTotalAUM(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 500000"
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              onClick={onSave}
              disabled={isSaving || !portfolioName || holdings.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Portfolio"}
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Step Tabs */}
      <Tabs value={currentStep.toString()} onValueChange={(v) => setCurrentStep(parseInt(v))}>
        <TabsList className="bg-[#1e293b] border border-[#334155] rounded-xl p-1 grid grid-cols-3">
          <TabsTrigger value="1" className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            1. Add Holdings
          </TabsTrigger>
          <TabsTrigger 
            value="2" 
            disabled={holdings.length === 0}
            className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white"
          >
            2. Allocation & Constraints
          </TabsTrigger>
          <TabsTrigger 
            value="3"
            disabled={holdings.length === 0}
            className="rounded-lg text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white"
          >
            3. Review & Save
          </TabsTrigger>
        </TabsList>

        {/* STEP 1: ADD HOLDINGS */}
        <TabsContent value="1" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            {/* Left: Holdings Table */}
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-100">Holdings Table</CardTitle>
                  <Badge variant="outline" className="text-xs">{holdings.length} positions</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {holdings.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    <Plus className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>No holdings yet. Add tickers from the panel or create manually.</p>
                  </div>
                ) : (
                  holdings.map((h, i) => (
                    <div key={i} className="border border-[#334155] rounded-lg p-3 bg-[#0f172a]/30">
                      <div className="grid grid-cols-6 gap-3 items-end">
                        <div>
                          <Label className="text-[10px] text-slate-400">Ticker</Label>
                          <Input 
                            value={h.ticker}
                            onChange={(e) => updateHolding(i, "ticker", e.target.value.toUpperCase())}
                            className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100 font-mono"
                            placeholder="AAPL"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-400">Name</Label>
                          <Input 
                            value={h.name}
                            onChange={(e) => updateHolding(i, "name", e.target.value)}
                            className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                            placeholder="Company name"
                            disabled={h.isAutoPopulated}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-400">Type</Label>
                          <Select value={h.asset_type} onValueChange={(v) => updateHolding(i, "asset_type", v)}>
                            <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-[#334155]">
                              {["stock", "etf", "bond", "cash"].map(t => (
                                <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-400">Shares</Label>
                          <Input 
                            type="number"
                            value={h.shares}
                            onChange={(e) => updateHolding(i, "shares", parseFloat(e.target.value) || 0)}
                            className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-400">Last Price</Label>
                          <Input 
                            type="number"
                            value={h.current_price}
                            onChange={(e) => updateHolding(i, "current_price", parseFloat(e.target.value) || 0)}
                            className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                            placeholder={h.current_price === 0 ? "N/A" : ""}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-[10px] text-slate-400">Value</Label>
                            <div className="mt-1 px-3 py-2 bg-slate-700/30 rounded-md text-slate-100 text-sm font-mono">
                              {h.position_value > 0 ? `$${h.position_value.toLocaleString(undefined, {maximumFractionDigits: 0})}` : "—"}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeHolding(i)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {h.current_price === 0 && (
                        <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Missing price data
                        </div>
                      )}
                    </div>
                  ))
                )}
                <Button 
                  variant="outline" 
                  onClick={addHolding}
                  className="w-full text-xs border-[#334155] text-slate-300 hover:bg-slate-700/30"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Row Manually
                </Button>
                
                {totalValue > 0 && (
                  <div className="pt-3 mt-3 border-t border-slate-700/50 flex justify-between text-sm">
                    <span className="text-slate-400">Total Portfolio Value:</span>
                    <span className="font-semibold text-slate-100">{baseCurrency} {totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Ticker Search Panel (Compact) */}
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-100">Ticker Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-400">Type tickers (comma separated)</Label>
                  <Textarea 
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value)}
                    placeholder="e.g. AAPL, MSFT, TSLA"
                    className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100 font-mono"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchTickerData}
                    disabled={fetchingTickers || !tickerInput.trim()}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    {fetchingTickers ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Fetching...</> : "Fetch Data"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={clearTickerSearch}
                    className="text-xs border-[#334155] text-slate-300 hover:bg-slate-700/30"
                  >
                    Clear
                  </Button>
                </div>

                {tickerResults.length > 0 && (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    <Label className="text-xs text-slate-400">Results:</Label>
                    {tickerResults.map((result, i) => (
                      <div key={i} className={`p-2 rounded-lg border ${result.isValid ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-100 font-mono">{result.ticker}</p>
                            {result.isValid ? (
                              <>
                                <p className="text-[10px] text-slate-400">{result.asset_type} • <span className="text-slate-100 font-semibold">${result.current_price?.toFixed(2)}</span></p>
                                {result.changePct !== undefined && (
                                  <p className={`text-[10px] font-medium ${result.changePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {result.changePct >= 0 ? "▲" : "▼"} {Math.abs(result.changePct).toFixed(2)}%
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-[10px] text-red-400">{result.error}</p>
                            )}
                          </div>
                          {result.isValid && (
                            <Button
                              size="sm"
                              onClick={() => addTickerToHoldings(result)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-6 px-2 flex-shrink-0"
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={holdings.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Next: Allocation →
            </Button>
          </div>
        </TabsContent>

        {/* STEP 2: ALLOCATION & CONSTRAINTS */}
        <TabsContent value="2" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-100">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["stocks", "bonds", "etfs", "cash", "alternatives"].map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="capitalize text-slate-400">{key}</span>
                      <span className="font-semibold text-slate-100">{alloc[key]}%</span>
                    </div>
                    <Slider
                      value={[alloc[key]]}
                      onValueChange={([v]) => setAlloc(prev => ({ ...prev, [key]: v }))}
                      min={0} max={100} step={5}
                      className="cursor-pointer"
                    />
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-700/50 text-right text-sm">
                  Total: <span className={`font-bold ${Math.abs(weightsSum - 100) < 0.1 ? "text-emerald-400" : "text-red-400"}`}>
                    {weightsSum.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#334155] bg-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-100">Constraints (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400">Max Single Holding Weight (%)</Label>
                  <Input 
                    type="number"
                    value={constraints.maxSingleHolding}
                    onChange={(e) => setConstraints(prev => ({...prev, maxSingleHolding: parseFloat(e.target.value) || 0}))}
                    className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Max Sector Weight (%)</Label>
                  <Input 
                    type="number"
                    value={constraints.maxSectorWeight}
                    onChange={(e) => setConstraints(prev => ({...prev, maxSectorWeight: parseFloat(e.target.value) || 0}))}
                    className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Minimum Cash (%)</Label>
                  <Input 
                    type="number"
                    value={constraints.minCash}
                    onChange={(e) => setConstraints(prev => ({...prev, minCash: parseFloat(e.target.value) || 0}))}
                    className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Rebalance Tolerance (%)</Label>
                  <Input 
                    type="number"
                    value={constraints.rebalanceTolerance}
                    onChange={(e) => setConstraints(prev => ({...prev, rebalanceTolerance: parseFloat(e.target.value) || 0}))}
                    className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                  />
                </div>
                <div className="pt-2 text-xs text-slate-500">
                  <Info className="w-3 h-3 inline mr-1" />
                  Constraints show warnings but don't block saving
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-4">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
            >
              ← Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Next: Review →
            </Button>
          </div>
        </TabsContent>

        {/* STEP 3: REVIEW & SAVE */}
        <TabsContent value="3" className="mt-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400">Total Holdings</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{holdings.length}</p>
              </CardContent>
            </Card>
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{baseCurrency} {totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              </CardContent>
            </Card>
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400">Risk Label</p>
                <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {alloc.stocks + alloc.etfs > 70 ? "Aggressive" : alloc.stocks + alloc.etfs > 50 ? "Moderate" : "Conservative"}
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400">Allocation Total</p>
                <p className={`text-2xl font-bold mt-1 ${Math.abs(weightsSum - 100) < 0.1 ? "text-emerald-400" : "text-red-400"}`}>
                  {weightsSum.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart */}
          <Card className="border-[#334155] bg-[#1e293b]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-100">Allocation Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(v) => `${v}%`} 
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-slate-400">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Holdings Preview (Read-only) */}
          <Card className="border-[#334155] bg-[#1e293b]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-100">Holdings Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-700/50">
                    <tr className="text-slate-400">
                      <th className="text-left py-2 font-medium">Ticker</th>
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-right py-2 font-medium">Shares</th>
                      <th className="text-right py-2 font-medium">Price</th>
                      <th className="text-right py-2 font-medium">Value</th>
                      <th className="text-right py-2 font-medium">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr key={i} className="border-b border-slate-700/30">
                        <td className="py-2 text-slate-100 font-mono">{h.ticker}</td>
                        <td className="py-2 text-slate-300">{h.name || "—"}</td>
                        <td className="py-2 text-right text-slate-300">{h.shares}</td>
                        <td className="py-2 text-right text-slate-300">{h.current_price > 0 ? `$${h.current_price}` : "N/A"}</td>
                        <td className="py-2 text-right text-slate-100 font-medium">
                          ${h.position_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="py-2 text-right text-slate-100">{h.weight_pct.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Validation Checklist */}
          <Card className="border-[#334155] bg-[#1e293b]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-100">Validation Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {validationChecks.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0f172a]/30">
                  <div className="flex items-center gap-2">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className={`text-xs ${check.passed ? 'text-slate-300' : 'text-amber-400'}`}>{check.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">{check.detail}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
            >
              ← Back
            </Button>
            <Button 
              onClick={onSave}
              disabled={isSaving || !portfolioName || holdings.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Portfolio"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}