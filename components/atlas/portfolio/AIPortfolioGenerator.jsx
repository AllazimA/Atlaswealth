import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, TrendingUp, Shield, Target, Info } from "lucide-react";
import { toast } from "sonner";

const PROFILE_PORTFOLIOS = {
  conservative: {
    portfolio_name: "Capital Preservation Portfolio",
    strategy: "conservative",
    expected_return: "4–6% p.a.",
    portfolio_rationale: "Prioritizes capital protection with steady income through high-quality fixed income and defensive equities.",
    risk_analysis: "Low volatility. Drawdown limited by heavy bond allocation. Suitable for clients with short horizons or low risk tolerance.",
    rebalancing_frequency: "Annually",
    allocation: { stocks: 20, bonds: 50, etfs: 15, cash: 10, alternatives: 5 },
    holdings: [
      { ticker: "AGG",  name: "iShares Core US Aggregate Bond ETF", asset_type: "etf",   target_weight: 30, current_price: 96,  sector: "Fixed Income", rationale: "Core bond anchor" },
      { ticker: "BND",  name: "Vanguard Total Bond Market ETF",      asset_type: "etf",   target_weight: 20, current_price: 73,  sector: "Fixed Income", rationale: "Broad bond exposure" },
      { ticker: "SPY",  name: "SPDR S&P 500 ETF Trust",              asset_type: "etf",   target_weight: 15, current_price: 580, sector: "US Equity",    rationale: "Core equity hedge" },
      { ticker: "JNJ",  name: "Johnson & Johnson",                    asset_type: "stock", target_weight: 10, current_price: 148, sector: "Healthcare",   rationale: "Defensive dividend" },
      { ticker: "PG",   name: "Procter & Gamble",                     asset_type: "stock", target_weight: 10, current_price: 165, sector: "Consumer",     rationale: "Stable dividend" },
      { ticker: "T",    name: "AT&T Inc.",                            asset_type: "stock", target_weight: 5,  current_price: 18,  sector: "Telecom",      rationale: "High yield" },
      { ticker: "CASH", name: "Cash & Equivalents",                   asset_type: "cash",  target_weight: 10, current_price: 1,   sector: "Cash",         rationale: "Liquidity buffer" },
    ],
  },
  moderate: {
    portfolio_name: "Balanced Growth Portfolio",
    strategy: "moderate",
    expected_return: "6–9% p.a.",
    portfolio_rationale: "Balanced mix of growth and income assets, designed for medium-term wealth accumulation with manageable volatility.",
    risk_analysis: "Moderate volatility. 50/50 equity/fixed split provides growth potential while cushioning downturns.",
    rebalancing_frequency: "Semi-annually",
    allocation: { stocks: 30, bonds: 20, etfs: 30, cash: 10, alternatives: 10 },
    holdings: [
      { ticker: "SPY",  name: "SPDR S&P 500 ETF Trust",              asset_type: "etf",   target_weight: 25, current_price: 580, sector: "US Equity",    rationale: "Core equity" },
      { ticker: "AGG",  name: "iShares Core US Aggregate Bond ETF",  asset_type: "etf",   target_weight: 20, current_price: 96,  sector: "Fixed Income", rationale: "Bond ballast" },
      { ticker: "QQQ",  name: "Invesco QQQ Trust",                   asset_type: "etf",   target_weight: 10, current_price: 490, sector: "Technology",   rationale: "Growth tilt" },
      { ticker: "MSFT", name: "Microsoft Corporation",               asset_type: "stock", target_weight: 10, current_price: 410, sector: "Technology",   rationale: "Quality large-cap" },
      { ticker: "AAPL", name: "Apple Inc.",                          asset_type: "stock", target_weight: 10, current_price: 225, sector: "Technology",   rationale: "Consumer tech moat" },
      { ticker: "VEA",  name: "Vanguard FTSE Developed Markets ETF", asset_type: "etf",   target_weight: 10, current_price: 50,  sector: "International",rationale: "International diversification" },
      { ticker: "CASH", name: "Cash & Equivalents",                  asset_type: "cash",  target_weight: 10, current_price: 1,   sector: "Cash",         rationale: "Liquidity" },
      { ticker: "GLD",  name: "SPDR Gold Shares",                    asset_type: "etf",   target_weight: 5,  current_price: 220, sector: "Commodities",  rationale: "Inflation hedge" },
    ],
  },
  aggressive: {
    portfolio_name: "High Growth Portfolio",
    strategy: "aggressive",
    expected_return: "10–15% p.a.",
    portfolio_rationale: "Maximizes long-term growth through concentrated equity exposure in leading tech and innovation companies.",
    risk_analysis: "High volatility. Suitable for long-horizon investors who can withstand 30–40% drawdowns during market stress.",
    rebalancing_frequency: "Quarterly",
    allocation: { stocks: 60, bonds: 5, etfs: 25, cash: 5, alternatives: 5 },
    holdings: [
      { ticker: "QQQ",  name: "Invesco QQQ Trust",     asset_type: "etf",   target_weight: 20, current_price: 490, sector: "Technology",   rationale: "Tech sector core" },
      { ticker: "NVDA", name: "NVIDIA Corporation",    asset_type: "stock", target_weight: 15, current_price: 120, sector: "Technology",   rationale: "AI & GPU leader" },
      { ticker: "MSFT", name: "Microsoft Corporation", asset_type: "stock", target_weight: 15, current_price: 410, sector: "Technology",   rationale: "Cloud & AI platform" },
      { ticker: "AAPL", name: "Apple Inc.",            asset_type: "stock", target_weight: 10, current_price: 225, sector: "Technology",   rationale: "Consumer ecosystem" },
      { ticker: "GOOGL",name: "Alphabet Inc.",         asset_type: "stock", target_weight: 10, current_price: 185, sector: "Technology",   rationale: "Search & cloud" },
      { ticker: "AMZN", name: "Amazon.com Inc.",       asset_type: "stock", target_weight: 10, current_price: 220, sector: "Consumer",     rationale: "E-commerce & AWS" },
      { ticker: "IWM",  name: "iShares Russell 2000 ETF", asset_type: "etf", target_weight: 10, current_price: 215, sector: "US Equity", rationale: "Small-cap upside" },
      { ticker: "CASH", name: "Cash & Equivalents",   asset_type: "cash",  target_weight: 5,  current_price: 1,   sector: "Cash",         rationale: "Tactical dry powder" },
      { ticker: "AGG",  name: "iShares Core US Aggregate Bond ETF", asset_type: "etf", target_weight: 5, current_price: 96, sector: "Fixed Income", rationale: "Minimal bond buffer" },
    ],
  },
};

PROFILE_PORTFOLIOS.moderate_conservative = { ...PROFILE_PORTFOLIOS.conservative, portfolio_name: "Conservative Balanced Portfolio", strategy: "conservative", expected_return: "5–7% p.a.", allocation: { stocks: 25, bonds: 40, etfs: 20, cash: 10, alternatives: 5 } };
PROFILE_PORTFOLIOS.moderate_aggressive = { ...PROFILE_PORTFOLIOS.aggressive, portfolio_name: "Growth-Oriented Portfolio", strategy: "aggressive", expected_return: "9–12% p.a.", allocation: { stocks: 50, bonds: 10, etfs: 30, cash: 5, alternatives: 5 } };

export default function AIPortfolioGenerator({ client, onApplyPortfolio }) {
  const [portfolio, setPortfolio] = useState(null);

  const generatePortfolio = () => {
    if (!client) {
      toast.error("Please select a client first");
      return;
    }
    const profile = client.risk_profile || "moderate";
    const template = PROFILE_PORTFOLIOS[profile] || PROFILE_PORTFOLIOS.moderate;
    const targetAUM = client.investment_amount || client.total_aum || 100000;

    const holdings = template.holdings.map(h => {
      const targetValue = (h.target_weight / 100) * targetAUM;
      const shares = h.current_price > 1 ? Math.round(targetValue / h.current_price) : 0;
      return { ...h, shares, avg_cost: h.current_price, total_value: shares * h.current_price };
    });

    setPortfolio({ ...template, holdings, generated_at: new Date().toISOString() });
    toast.success("Portfolio template generated");
  };

  const handleApply = () => {
    if (!portfolio) return;
    onApplyPortfolio({
      name: portfolio.portfolio_name,
      strategy: portfolio.strategy,
      allocation: portfolio.allocation,
      holdings: portfolio.holdings,
    });
    toast.success("Portfolio applied — review and save when ready");
  };

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <CardTitle className="text-sm text-slate-100">Portfolio Template Generator</CardTitle>
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-[10px]">Based on Risk Profile</Badge>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Generate an institutional-grade portfolio template based on the client's risk profile and investment goals
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!client ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Select a client to generate a portfolio template</p>
          </div>
        ) : portfolio ? (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{portfolio.portfolio_name}</h3>
                  <Badge className="mt-1 bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs capitalize">{portfolio.strategy}</Badge>
                </div>
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{portfolio.portfolio_rationale}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: TrendingUp, label: "Expected Return", value: portfolio.expected_return, color: "text-emerald-400" },
                { icon: Shield, label: "Risk Level", value: client.risk_profile || "Moderate", color: "text-blue-400" },
                { icon: Target, label: "Holdings", value: `${portfolio.holdings.length} securities`, color: "text-amber-400" },
              ].map(m => (
                <div key={m.label} className="bg-[#0f172a] border border-[#334155] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                    <span className="text-[10px] text-slate-400 uppercase">{m.label}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-100">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-100 mb-3">Asset Allocation</h4>
              <div className="space-y-2">
                {Object.entries(portfolio.allocation).filter(([, v]) => v > 0).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-slate-400">{key}</span>
                      <span className="font-semibold text-slate-100">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#D4AF37] to-orange-500 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-100 mb-3">Recommended Holdings</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {portfolio.holdings.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{h.ticker}</span>
                        <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-[9px]">{h.asset_type}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{h.name}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 truncate">{h.rationale}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-xs font-bold text-slate-100">{h.target_weight}%</p>
                      <p className="text-[10px] text-slate-400">{h.shares} units</p>
                      <p className="text-[9px] text-slate-500">${h.current_price?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">{portfolio.risk_analysis}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleApply} className="flex-1 bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900 font-medium">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Apply to Builder
              </Button>
              <Button onClick={generatePortfolio} variant="outline" className="border-[#334155] text-slate-300 hover:bg-slate-700/30">
                Regenerate
              </Button>
            </div>
            <p className="text-[9px] text-slate-600 italic text-center pt-1 border-t border-slate-700/50">
              Template portfolios require advisor review and approval before implementation
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <Sparkles className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <p className="text-sm text-slate-300 mb-1">
              Generate a portfolio template for {client.first_name} {client.last_name}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Based on {client.risk_profile ? `${client.risk_profile} risk profile` : "their risk assessment"}
            </p>
            <Button onClick={generatePortfolio} className="bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900 font-medium">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Portfolio Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
