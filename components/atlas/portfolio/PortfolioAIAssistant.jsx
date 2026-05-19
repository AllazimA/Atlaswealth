import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";

export default function PortfolioAIAssistant({ portfolio, client, holdings }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const riskProfile = client?.risk_profile || "moderate";
    const stocksPct = portfolio?.stocks_pct || 0;
    const bondsPct = portfolio?.bonds_pct || 0;
    const etfsPct = portfolio?.etfs_pct || 0;
    const cashPct = portfolio?.cash_pct || 0;
    const totalPositions = holdings?.length || 0;
    const returnPct = portfolio?.return_pct || 0;
    const targets = {
      conservative: { stocks: 30, bonds: 50 },
      moderate: { stocks: 50, bonds: 30 },
      aggressive: { stocks: 70, bonds: 10 },
      growth: { stocks: 65, bonds: 10 },
      income: { stocks: 25, bonds: 55 },
    };
    const target = targets[riskProfile] || targets.moderate;
    const stockDelta = stocksPct - target.stocks;
    const bondDelta = bondsPct - target.bonds;

    if (q.includes("rebalanc")) {
      const needs = Math.abs(stockDelta) > 5 || Math.abs(bondDelta) > 5;
      if (needs) {
        const actions = [];
        if (stockDelta > 5) actions.push(`• Reduce equities by ~${stockDelta.toFixed(0)}% (currently ${stocksPct}%, target ${target.stocks}%)`);
        else if (stockDelta < -5) actions.push(`• Increase equities by ~${Math.abs(stockDelta).toFixed(0)}% (currently ${stocksPct}%, target ${target.stocks}%)`);
        if (bondDelta > 5) actions.push(`• Reduce fixed income by ~${bondDelta.toFixed(0)}% (currently ${bondsPct}%, target ${target.bonds}%)`);
        else if (bondDelta < -5) actions.push(`• Increase fixed income by ~${Math.abs(bondDelta).toFixed(0)}% (currently ${bondsPct}%, target ${target.bonds}%)`);
        return `Rebalancing Recommendation for ${portfolio?.name}\n\nBased on the ${riskProfile} risk profile, the current allocation is out of balance:\n\n${actions.join("\n")}\n\nRecommended: Execute trades gradually over 2–3 sessions to minimize market impact. Review tax implications before trimming profitable positions.\n\n⚠️ Rule-based analysis. Consult a licensed advisor before executing trades.`;
      }
      return `Rebalancing Status: On Target ✓\n\n${portfolio?.name} is well-balanced for a ${riskProfile} profile:\n• Stocks: ${stocksPct}% (target ${target.stocks}%)\n• Bonds: ${bondsPct}% (target ${target.bonds}%)\n• ETFs: ${etfsPct}% | Cash: ${cashPct}%\n\nNo immediate rebalancing action required. Review quarterly.`;
    }

    if (q.includes("risk")) {
      const riskLevel = stocksPct > 65 ? "High" : stocksPct > 45 ? "Moderate" : "Low-Moderate";
      return `Risk Analysis: ${riskLevel}\n\n• Equity exposure: ${stocksPct}% (${stocksPct > target.stocks + 5 ? "above" : stocksPct < target.stocks - 5 ? "below" : "within"} ${riskProfile} range)\n• Fixed income buffer: ${bondsPct}%\n• Cash cushion: ${cashPct}%\n• Positions: ${totalPositions} (${totalPositions < 5 ? "concentrated" : totalPositions > 15 ? "well-diversified" : "moderately diversified"})\n\nProfile aligns with ${riskProfile} mandate.${cashPct < 3 ? " Consider maintaining higher cash reserves for liquidity." : ""}`;
    }

    if (q.includes("sector") || q.includes("concentrat") || q.includes("diversif")) {
      const totalVal = portfolio?.total_value || 1;
      const topHoldings = (holdings || []).slice(0, 5).map(h => `${h.ticker} (${((h.total_value / totalVal) * 100).toFixed(1)}%)`).join(", ");
      return `Sector Concentration Analysis\n\nTop holdings: ${topHoldings || "No holdings data"}\nTotal positions: ${totalPositions}\n\n${totalPositions < 5 ? "⚠️ High concentration risk — fewer than 5 positions. Consider broadening across sectors." : totalPositions < 10 ? "Moderate diversification. Consider adding exposure to Healthcare, Utilities, or International." : "Good diversification. Monitor sector weights quarterly."}\n\nGrowth/Defensive split: ${stocksPct + etfsPct}% / ${bondsPct}%`;
    }

    if (q.includes("optim") || q.includes("suggest") || q.includes("improv")) {
      const suggestions = [];
      if (cashPct > 10) suggestions.push(`• Deploy excess cash (${cashPct}%) — drag on returns`);
      if (totalPositions < 8) suggestions.push("• Increase diversification — add 3–5 positions across uncorrelated sectors");
      if (stockDelta > 10) suggestions.push("• Trim equity overweight; reallocate to bonds or defensive ETFs");
      if (bondDelta > 10) suggestions.push("• Shift some fixed income to dividend-paying equities for better risk-adjusted returns");
      if (returnPct < 0) suggestions.push("• Review underperforming positions — consider tax-loss harvesting on losers >-15%");
      if (!suggestions.length) suggestions.push("• Portfolio appears well-positioned for the current risk profile", "• Maintain allocation — review at next quarterly rebalancing");
      return `Optimization Suggestions for ${portfolio?.name}\n\n${suggestions.join("\n")}\n\nPerformance: ${returnPct >= 0 ? "+" : ""}${returnPct}% | Strategy: ${portfolio?.strategy || riskProfile}`;
    }

    return `Portfolio Summary: ${portfolio?.name || "Portfolio"}\n\nClient: ${client?.first_name || ""} ${client?.last_name || ""} | Risk: ${riskProfile}\nStrategy: ${portfolio?.strategy || "N/A"} | Return: ${returnPct >= 0 ? "+" : ""}${returnPct}%\n\nAllocation vs. ${riskProfile} target:\n• Stocks: ${stocksPct}% (target ~${target.stocks}%) ${Math.abs(stockDelta) > 5 ? "⚠️" : "✓"}\n• Bonds: ${bondsPct}% (target ~${target.bonds}%) ${Math.abs(bondDelta) > 5 ? "⚠️" : "✓"}\n• ETFs: ${etfsPct}% | Cash: ${cashPct}%\n\nPositions: ${totalPositions} | Value: $${(portfolio?.total_value || 0).toLocaleString()}\n\nTry: "Should I rebalance?", "Analyze risk", "Suggest improvements"`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const userInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const response = generateResponse(userInput);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 400);
  };

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#D4AF37]" />
            <CardTitle className="text-sm text-slate-100">AI Portfolio Assistant</CardTitle>
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Ask questions about rebalancing, market analysis, portfolio optimization, or data lookups
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length > 0 && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-xs ${
                  msg.role === "user"
                    ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-slate-100"
                    : "bg-[#0f172a] border border-[#334155] text-slate-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === "assistant" && <Bot className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI: 'Should I rebalance?', 'Analyze this portfolio', 'What's the risk exposure?', 'Suggest improvements'..."
            className="bg-[#0f172a] border-[#334155] text-slate-100 text-xs min-h-[80px]"
            disabled={loading}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex-1 bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
            {messages.length > 0 && (
              <Button
                onClick={() => setMessages([])}
                variant="outline"
                className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            "Should I rebalance this portfolio?",
            "Analyze sector concentration",
            "What's the current risk level?",
            "Suggest optimization"
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setInput(suggestion)}
              className="text-left text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 px-2 py-1.5 rounded border border-slate-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}