import React, { useState } from "react";
import { getFullStock } from "@/api/alphaVantage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { Search, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Percent, Target, Shield, AlertTriangle, CheckCircle, Zap, Bot, Send, X } from "lucide-react";
import SECFilings from "../components/stock/SECFilings";

export default function StockAnalysis() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [advisorCommentary, setAdvisorCommentary] = useState("");
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleAiChat = (query = null) => {
    const userQuery = query || chatInput.trim();
    if (!userQuery) return;
    if (!query) {
      setChatMessages(prev => [...prev, { role: "user", content: userQuery }]);
      setChatInput("");
    }
    setChatLoading(true);
    setTimeout(() => {
      const stock = stockData?.company_name || "the selected stock";
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: {
          trend_overview: { summary: `For research on ${stock}, please refer to the fundamental data loaded in the analysis panel. Use the tabs above to review valuation, growth, and risk metrics.`, direction: "range-bound" },
          key_drivers: ["Review the valuation ratios in the Fundamentals tab", "Monitor analyst consensus for directional guidance", "Check balance sheet health in the Balance Sheet section"],
          risk_signals: { risks: ["All investments carry market risk. Past performance does not guarantee future results.", "Review client suitability before recommending any security."], severity: "medium" },
          valuation_context: "Valuation data is sourced from Yahoo Finance and reflects most recent available figures.",
          analyst_takeaway: "Conduct thorough due diligence and ensure suitability before incorporating any security into a client portfolio.",
          sources: "Yahoo Finance"
        }
      }]);
      setChatLoading(false);
    }, 400);
  };

  const fmt = (val, suffix = "") => val != null ? `${val.toFixed ? val.toFixed(2) : val}${suffix}` : "N/A";
  const fmtB = (val) => {
    if (val == null) return "N/A";
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const analyzeStock = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setStockData(null);
    try {
      const sym = ticker.trim().toUpperCase();
      const { quote: q, overview: ov } = await getFullStock(sym);

      const price  = q.price;
      const beta   = ov.Beta   ? parseFloat(ov.Beta)   : null;
      const divYld = ov.DividendYield ? parseFloat(ov.DividendYield) : 0;

      const pct = (raw) => raw && raw !== "None" && raw !== "-" ? `${(parseFloat(raw) * 100).toFixed(2)}%` : "N/A";
      const usd = (raw) => raw && raw !== "None" && raw !== "-" ? `$${parseFloat(raw).toFixed(2)}` : "N/A";
      const num = (raw) => raw && raw !== "None" && raw !== "-" ? parseFloat(raw).toFixed(2) : "N/A";
      const big = (raw) => {
        const n = parseFloat(raw);
        if (isNaN(n)) return "N/A";
        if (n >= 1e12) return `$${(n/1e12).toFixed(2)}T`;
        if (n >= 1e9)  return `$${(n/1e9).toFixed(2)}B`;
        if (n >= 1e6)  return `$${(n/1e6).toFixed(2)}M`;
        return `$${n.toLocaleString()}`;
      };

      const targetPrice = ov.AnalystTargetPrice ? parseFloat(ov.AnalystTargetPrice) : null;

      const result = {
        company_name: ov.Name || sym,
        ticker:       sym,
        sector:       ov.Sector   || "N/A",
        industry:     ov.Industry || "N/A",
        market_cap:   big(ov.MarketCapitalization),
        current_price: `$${price.toFixed(2)}`,
        prev_close:    `$${q.prevClose.toFixed(2)}`,
        change:        `${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)} (${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%)`,
        week_52_high:  usd(ov["52WeekHigh"]),
        week_52_low:   usd(ov["52WeekLow"]),
        ytd_return:    "N/A",
        two_year_return: "N/A",
        beta:          beta ? beta.toFixed(2) : "N/A",
        exchange:      ov.Exchange || "N/A",
        overview:      ov.Description
          ? ov.Description.slice(0, 500) + "..."
          : `${ov.Name || sym} — ${ov.Industry || ov.Sector || "listed security"}.`,

        valuation: {
          pe_ratio:       num(ov.TrailingPE),
          forward_pe:     num(ov.ForwardPE),
          ev_ebitda:      num(ov.EVToEBITDA),
          price_sales:    num(ov.PriceToSalesRatioTTM),
          peg_ratio:      num(ov.PEGRatio),
          price_book:     num(ov.PriceToBookRatio),
          sector_median_pe: "N/A",
        },

        profitability: {
          gross_margin:     pct(ov.GrossProfitTTM && ov.RevenueTTM
            ? (parseFloat(ov.GrossProfitTTM) / parseFloat(ov.RevenueTTM)).toString()
            : null),
          operating_margin: pct(ov.OperatingMarginTTM),
          net_margin:       pct(ov.ProfitMargin),
          roe:              pct(ov.ReturnOnEquityTTM),
          roic:             pct(ov.ReturnOnAssetsTTM),
        },

        growth: {
          revenue_growth_ttm:   pct(ov.QuarterlyRevenueGrowthYOY),
          revenue_growth_3y_cagr: "N/A",
          eps_growth_ttm:       pct(ov.QuarterlyEarningsGrowthYOY),
          eps_growth_forward:   "N/A",
          revenue_trend: [],
          eps_trend:     [],
        },

        balance_sheet: {
          debt_equity:    num(ov.DebtEquityRatioTTM || null),
          net_debt_ebitda: "N/A",
          current_ratio:  "N/A",
          book_value:     usd(ov.BookValue),
        },

        income: {
          dividend_yield:    divYld > 0 ? `${(divYld * 100).toFixed(2)}%` : "None",
          dividend_per_share: usd(ov.DividendPerShare),
          payout_ratio:      "N/A",
          dividend_growth_5y: "N/A",
          fcf_yield:         "N/A",
        },

        analyst_consensus: {
          buy_count:  "N/A",
          hold_count: "N/A",
          sell_count: "N/A",
          avg_target: targetPrice ? `$${targetPrice.toFixed(2)}` : "N/A",
          target_high: "N/A",
          target_low:  "N/A",
          upside_pct: targetPrice
            ? `${(((targetPrice - price) / price) * 100).toFixed(1)}%`
            : "N/A",
          source: "Alpha Vantage",
        },

        financials: {
          revenue_fy1:    big(ov.RevenueTTM),
          revenue_fy2:    "N/A",
          net_income_fy1: "N/A",
          net_income_fy2: "N/A",
          fcf_fy1:        "N/A",
          fcf_fy2:        "N/A",
          ocf_fy1:        "N/A",
          ocf_fy2:        "N/A",
        },

        technical: {
          trend: price && ov["50DayMovingAverage"]
            ? (price > parseFloat(ov["50DayMovingAverage"]) ? "uptrend" : "downtrend")
            : "N/A",
          ma_50:  usd(ov["50DayMovingAverage"]),
          ma_200: usd(ov["200DayMovingAverage"]),
          rsi:    "N/A",
        },

        suitability: {
          volatility: beta ? (beta > 1.3 ? "High" : beta < 0.7 ? "Low" : "Moderate") : "N/A",
          income_suitability: divYld > 0 ? "Income-generating" : "Growth-oriented",
          defensive_or_cyclical: ov.Sector
            ? (["Utilities","Consumer Staples","Healthcare"].includes(ov.Sector) ? "Defensive" : "Cyclical")
            : "N/A",
          portfolio_role: "To be determined by advisor",
        },

        key_risks: [
          "Market and sector risk — price may fluctuate significantly",
          "Macroeconomic conditions including interest rates and inflation",
          "Company-specific execution and regulatory risks",
        ],

        outlook: targetPrice
          ? `Analyst target: $${targetPrice.toFixed(2)} — ${(((targetPrice - price) / price) * 100).toFixed(1)}% upside from current price`
          : "No analyst target available",

        data_source:  "Alpha Vantage",
        last_updated: new Date().toLocaleString(),
      };

      setStockData(result);
    } catch (err) {
      console.error(err);
      setStockData(null);
      toast.error(err.message || "Could not load stock data");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Stock Analysis</h1>
        <p className="text-sm text-slate-400 mt-1">Research and analyze stocks with AI-powered insights</p>
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Enter ticker (e.g. AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && analyzeStock()}
              className="pl-9 bg-[#1e293b] border-[#334155] text-slate-100"
            />
          </div>
          <Button onClick={analyzeStock} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        <Button 
          onClick={() => setAiChatOpen(!aiChatOpen)} 
          className="bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900"
        >
          <Bot className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* AI Stock Intelligence Panel */}
      {aiChatOpen && (
        <Card className="border-[#334155] bg-[#1e293b]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#D4AF37]" />
              <CardTitle className="text-sm font-semibold text-slate-100">Atlas Stock Intelligence</CardTitle>
              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-[10px]">AI-generated</Badge>
            </div>
            <button onClick={() => setAiChatOpen(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-4">Ask about trend, valuation, or risk insights</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Compare to peers", "Explain valuation", "Key downside risks", "Impact on portfolio"].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleAiChat(chip)}
                        className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full text-xs text-slate-300 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.role === "user" && (
                      <div className="flex justify-end mb-3">
                        <div className="bg-[#D4AF37] text-slate-900 px-3 py-1.5 rounded-lg text-xs font-medium max-w-[70%]">
                          {msg.content}
                        </div>
                      </div>
                    )}
                    {msg.role === "assistant" && (
                      <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-xs font-semibold text-slate-100">Research Insight</span>
                          </div>
                          {stockData && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                              {stockData.ticker}
                            </Badge>
                          )}
                        </div>

                        {/* Trend Overview */}
                        {msg.content.trend_overview && (
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Trend Overview</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                msg.content.trend_overview.direction === "uptrend" ? "bg-emerald-500/20 text-emerald-400" :
                                msg.content.trend_overview.direction === "downtrend" ? "bg-red-500/20 text-red-400" :
                                "bg-amber-500/20 text-amber-400"
                              }`}>
                                {msg.content.trend_overview.direction === "uptrend" ? "↑" :
                                 msg.content.trend_overview.direction === "downtrend" ? "↓" : "→"}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">{msg.content.trend_overview.summary}</p>
                            </div>
                          </div>
                        )}

                        {/* Key Drivers */}
                        {msg.content.key_drivers && msg.content.key_drivers.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Key Drivers</span>
                            </div>
                            <ul className="space-y-1 ml-5">
                              {msg.content.key_drivers.slice(0, 3).map((driver, i) => (
                                <li key={i} className="text-xs text-slate-300 leading-relaxed list-disc">{driver}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Risk Signals */}
                        {msg.content.risk_signals && (
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Risk Signals</span>
                              <Badge className={`text-[10px] ${
                                msg.content.risk_signals.severity === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                msg.content.risk_signals.severity === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                                "bg-slate-600/30 text-slate-400 border-slate-600"
                              }`}>
                                {msg.content.risk_signals.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <ul className="space-y-1 ml-5">
                              {msg.content.risk_signals.risks.slice(0, 2).map((risk, i) => (
                                <li key={i} className="text-xs text-slate-300 leading-relaxed list-disc">{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Valuation Context */}
                        {msg.content.valuation_context && (
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Valuation Context</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed ml-5">{msg.content.valuation_context}</p>
                          </div>
                        )}

                        {/* Analyst Takeaway */}
                        {msg.content.analyst_takeaway && (
                          <div className="pt-2 border-t border-slate-700/50">
                            <div className="flex items-center gap-2 mb-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wide">Analyst Takeaway</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed ml-5 font-medium">{msg.content.analyst_takeaway}</p>
                          </div>
                        )}

                        {/* Sources & Compliance */}
                        <div className="pt-2 border-t border-slate-700/50 space-y-1">
                          {msg.content.sources && (
                            <p className="text-[10px] text-slate-500">
                              Sources: {msg.content.sources}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-600 italic">
                            This insight is informational and does not constitute investment advice.
                          </p>
                        </div>

                        {/* Quick Follow-Up Chips */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {["Compare to peers", "Explain valuation", "Key downside risks", "Impact on portfolio"].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => handleAiChat(chip)}
                              disabled={chatLoading}
                              className="px-2.5 py-1 bg-slate-700/30 hover:bg-slate-700 border border-slate-600/50 rounded-full text-[10px] text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                    Analyzing...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-700/50">
              <Input
                placeholder="Ask about trend, valuation, or risk..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiChat()}
                className="bg-[#0f172a] border-[#334155] text-slate-100 text-xs"
                disabled={chatLoading}
              />
              <Button 
                onClick={() => handleAiChat()} 
                disabled={chatLoading || !chatInput.trim()}
                className="bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl bg-slate-700" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-2xl bg-slate-700" />
            <Skeleton className="h-24 rounded-2xl bg-slate-700" />
            <Skeleton className="h-24 rounded-2xl bg-slate-700" />
          </div>
        </div>
      )}

      {stockData && !loading && (
        <div className="space-y-4">
          {/* Stock Header */}
          <Card className="border-[#334155] bg-[#1e293b]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{stockData.company_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      {stockData.ticker}
                    </Badge>
                    <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xs">
                      {stockData.sector}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Source: {stockData.data_source || "Yahoo Finance"} • Last Updated: {stockData.last_updated || new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-100">{stockData.current_price}</p>
                  <p className="text-xs text-slate-500">Current Price</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Chart & Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Market Snapshot Chart */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" /> Market Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div dangerouslySetInnerHTML={{
                    __html: `
                      <div class="tradingview-widget-container" style="height: 450px; width: 100%;">
                        <iframe scrolling="no" allowtransparency="true" frameborder="0" 
                          src="https://s.tradingview.com/embed-widget/symbol-overview/?locale=en#%7B%22symbols%22%3A%5B%5B%22${stockData.ticker}%22%5D%5D%2C%22chartOnly%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A450%2C%22colorTheme%22%3A%22dark%22%2C%22showVolume%22%3Atrue%2C%22showMA%22%3Atrue%2C%22hideDateRanges%22%3Afalse%2C%22hideMarketStatus%22%3Afalse%2C%22hideSymbolLogo%22%3Afalse%2C%22scalePosition%22%3A%22right%22%2C%22scaleMode%22%3A%22Normal%22%2C%22fontFamily%22%3A%22-apple-system%2C%20BlinkMacSystemFont%2C%20Trebuchet%20MS%2C%20Roboto%2C%20Ubuntu%2C%20sans-serif%22%2C%22fontSize%22%3A%2210%22%2C%22noTimeScale%22%3Afalse%2C%22valuesTracking%22%3A%221%22%2C%22changeMode%22%3A%22price-and-percent%22%2C%22chartType%22%3A%22area%22%2C%22backgroundColor%22%3A%22rgba(30%2C%2041%2C%2059%2C%201)%22%2C%22gridLineColor%22%3A%22rgba(51%2C%2065%2C%2085%2C%201)%22%2C%22lineWidth%22%3A2%2C%22lineType%22%3A0%2C%22dateRanges%22%3A%5B%221d%7C1%22%2C%221m%7C30%22%2C%226m%7C1D%22%2C%2212m%7C1D%22%2C%2260m%7C1W%22%2C%22all%7C1M%22%5D%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22symbol-overview%22%7D" 
                          style="box-sizing: border-box; display: block; height: 450px; width: 100%;">
                        </iframe>
                      </div>
                    `
                  }} />
                </CardContent>
              </Card>

              {/* Valuation */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-orange-400" /> Valuation
                    </CardTitle>
                    {getValuationStatus(stockData.valuation?.pe_ratio, stockData.valuation?.sector_median_pe) && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        {getValuationStatus(stockData.valuation?.pe_ratio, stockData.valuation?.sector_median_pe)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <StatItem label="P/E (TTM)" value={stockData.valuation?.pe_ratio} />
                    <StatItem label="Forward P/E" value={stockData.valuation?.forward_pe} />
                    <StatItem label="EV/EBITDA" value={stockData.valuation?.ev_ebitda} />
                    <StatItem label="Price/Sales" value={stockData.valuation?.price_sales} />
                    <StatItem label="PEG" value={stockData.valuation?.peg_ratio} />
                  </div>
                </CardContent>
              </Card>

              {/* Growth & Profitability */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-[#334155] bg-[#1e293b]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" /> Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <StatItem label="Revenue TTM" value={stockData.growth?.revenue_growth_ttm} positive />
                      <StatItem label="Revenue 3Y" value={stockData.growth?.revenue_growth_3y_cagr} positive />
                      <StatItem label="EPS TTM" value={stockData.growth?.eps_growth_ttm} positive />
                      <StatItem label="EPS Forward" value={stockData.growth?.eps_growth_forward} positive />
                    </div>
                    {stockData.growth?.revenue_trend && stockData.growth.revenue_trend.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Revenue Trend (4Q)</p>
                        <ResponsiveContainer width="100%" height={50}>
                          <LineChart data={stockData.growth.revenue_trend.map((v, i) => ({ v }))}>
                            <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-[#334155] bg-[#1e293b]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-blue-400" /> Profitability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ProfitBar label="Gross" value={stockData.profitability?.gross_margin} />
                    <ProfitBar label="Operating" value={stockData.profitability?.operating_margin} />
                    <ProfitBar label="Net" value={stockData.profitability?.net_margin} />
                    <ProfitBar label="ROE" value={stockData.profitability?.roe} />
                    <ProfitBar label="ROIC" value={stockData.profitability?.roic} />
                  </CardContent>
                </Card>
              </div>

              {/* Financial Highlights */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-100">Financial Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 text-xs text-slate-500 font-medium">Metric</th>
                          <th className="text-right py-2 text-xs text-slate-500 font-medium">FY 2022</th>
                          <th className="text-right py-2 text-xs text-slate-500 font-medium">FY 2023</th>
                          <th className="text-right py-2 text-xs text-slate-500 font-medium">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <FinRow label="Revenue" fy1={stockData.financials?.revenue_fy1} fy2={stockData.financials?.revenue_fy2} />
                        <FinRow label="Net Income" fy1={stockData.financials?.net_income_fy1} fy2={stockData.financials?.net_income_fy2} />
                        <FinRow label="Free Cash Flow" fy1={stockData.financials?.fcf_fy1} fy2={stockData.financials?.fcf_fy2} />
                        <FinRow label="Op Cash Flow" fy1={stockData.financials?.ocf_fy1} fy2={stockData.financials?.ocf_fy2} />
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              {/* Market Stats */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold text-slate-400 uppercase">Market Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatBox label="52W High" value={stockData.week_52_high} />
                  <StatBox label="52W Low" value={stockData.week_52_low} />
                  <StatBox label="YTD Return" value={stockData.ytd_return} highlight positive />
                  <StatBox label="2Y Return" value={stockData.two_year_return} highlight positive />
                  <StatBox label="Beta" value={stockData.beta} />
                </CardContent>
              </Card>

              {/* Balance Sheet Risk */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" /> Balance Sheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RiskGauge label="Debt/Equity" value={stockData.balance_sheet?.debt_equity} type="debt" />
                  <RiskGauge label="Current Ratio" value={stockData.balance_sheet?.current_ratio} type="liquidity" />
                  <RiskGauge label="Net Debt/EBITDA" value={stockData.balance_sheet?.net_debt_ebitda} type="coverage" />
                </CardContent>
              </Card>

              {/* Analyst Consensus */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" /> Analyst Consensus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <ConsensusBar label="Buy" count={stockData.analyst_consensus?.buy_count} color="emerald" />
                    <ConsensusBar label="Hold" count={stockData.analyst_consensus?.hold_count} color="amber" />
                    <ConsensusBar label="Sell" count={stockData.analyst_consensus?.sell_count} color="red" />
                  </div>
                  <div className="pt-3 border-t border-slate-700 space-y-2">
                    <PriceTarget label="Avg Target" value={stockData.analyst_consensus?.avg_target} />
                    <PriceTarget label="High" value={stockData.analyst_consensus?.target_high} />
                    <PriceTarget label="Low" value={stockData.analyst_consensus?.target_low} />
                    {stockData.analyst_consensus?.upside_pct && (
                      <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                        <p className="text-xs text-slate-400">Upside</p>
                        <p className="text-sm font-bold text-orange-400">{stockData.analyst_consensus.upside_pct}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 pt-2">
                    Source: {stockData.analyst_consensus?.source || "Yahoo Finance"}
                  </p>
                </CardContent>
              </Card>

              {/* SEC Filings */}
              <SECFilings ticker={stockData.ticker} />

              {/* Insights */}
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-100">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="facts">
                    <TabsList className="bg-slate-700/50 w-full">
                      <TabsTrigger value="facts" className="flex-1 text-xs">Facts</TabsTrigger>
                      <TabsTrigger value="advisor" className="flex-1 text-xs">Advisor Notes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="facts" className="mt-3 space-y-2">
                      <div className="text-xs text-slate-400">
                        <p className="font-medium text-slate-300 mb-2">Key Risks:</p>
                        <ul className="space-y-1">
                          {stockData.key_risks?.slice(0, 3).map((risk, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-xs text-slate-400 pt-2">
                        <p className="font-medium text-slate-300 mb-1">Outlook:</p>
                        <p>{stockData.outlook}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="advisor" className="mt-3">
                      <Textarea
                        value={advisorCommentary}
                        onChange={(e) => setAdvisorCommentary(e.target.value)}
                        placeholder="Add your notes..."
                        rows={5}
                        className="text-xs bg-slate-700/30 border-slate-700 text-slate-300"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getValuationStatus(pe, sectorPE) {
  if (!pe || !sectorPE) return null;
  const numPe = parseFloat(pe);
  const numSector = parseFloat(sectorPE);
  if (isNaN(numPe) || isNaN(numSector)) return null;
  return numPe > numSector * 1.2 ? "Expensive" : numPe < numSector * 0.8 ? "Cheap" : "Neutral";
}

function StatItem({ label, value, positive }) {
  const isPositive = positive && value && parseFloat(value) > 0;
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${isPositive ? "text-emerald-400" : "text-slate-300"}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

function StatBox({ label, value, highlight, positive }) {
  const bgClass = highlight ? "bg-orange-500/10 border-orange-500/20" : "bg-slate-700/30 border-slate-700";
  const valueColor = positive && value && parseFloat(value?.replace("%", "")) > 0 ? "text-emerald-400" : "text-slate-300";
  
  return (
    <div className={`p-3 border rounded-lg ${bgClass}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold mt-1 ${valueColor}`}>{value || "N/A"}</p>
    </div>
  );
}

function ProfitBar({ label, value }) {
  const numValue = parseFloat(value);
  const displayValue = !isNaN(numValue) ? Math.abs(numValue) : 0;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-slate-300">{value || "N/A"}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: `${Math.min(displayValue, 100)}%` }} />
      </div>
    </div>
  );
}

function RiskGauge({ label, value, type }) {
  const numValue = parseFloat(value);
  let risk = "neutral";
  
  if (!isNaN(numValue)) {
    if (type === "debt") risk = numValue < 0.5 ? "low" : numValue < 1.5 ? "medium" : "high";
    else if (type === "liquidity") risk = numValue > 1.5 ? "low" : numValue > 1.0 ? "medium" : "high";
    else if (type === "coverage") risk = numValue < 3 ? "low" : numValue < 5 ? "medium" : "high";
  }
  
  const colors = {
    low: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    medium: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    high: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    neutral: { bg: "bg-slate-700/30", text: "text-slate-400", border: "border-slate-700" }
  };
  
  return (
    <div className={`flex items-center justify-between p-2 rounded border ${colors[risk].bg} ${colors[risk].border}`}>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-bold ${colors[risk].text}`}>{value || "N/A"}</p>
      </div>
      <Badge className={`${colors[risk].bg} ${colors[risk].text} ${colors[risk].border} text-[10px]`}>
        {risk === "low" ? "Low Risk" : risk === "medium" ? "Medium" : risk === "high" ? "High Risk" : "—"}
      </Badge>
    </div>
  );
}

function ConsensusBar({ label, count, color }) {
  const numCount = parseInt(count) || 0;
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500"
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-12">{label}</span>
      <div className="flex-1 h-6 bg-slate-700 rounded overflow-hidden">
        <div className={`h-full ${colors[color]}`} style={{ width: `${Math.min(numCount * 10, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-300 w-8 text-right">{count || "0"}</span>
    </div>
  );
}

function PriceTarget({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-300">{value || "N/A"}</span>
    </div>
  );
}

function FinRow({ label, fy1, fy2 }) {
  const val1 = parseFloat(fy1?.replace(/[^0-9.-]/g, ""));
  const val2 = parseFloat(fy2?.replace(/[^0-9.-]/g, ""));
  const trend = !isNaN(val1) && !isNaN(val2) ? (val1 > val2 ? "up" : "down") : "flat";
  
  return (
    <tr className="border-b border-slate-700/50">
      <td className="py-3 text-slate-400 text-xs">{label}</td>
      <td className="py-3 text-right text-slate-300 font-medium text-xs">{fy1 || "N/A"}</td>
      <td className="py-3 text-right text-slate-300 font-medium text-xs">{fy2 || "N/A"}</td>
      <td className="py-3 text-right">
        {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-400 inline" />}
        {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400 inline" />}
      </td>
    </tr>
  );
}