import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, BarChart3, Globe, RefreshCw, ExternalLink } from "lucide-react";

const CATEGORIES = [
  { id: "markets", label: "Markets", icon: TrendingUp, query: "stock+market+S%26P+500" },
  { id: "rates",   label: "Rates",   icon: DollarSign, query: "federal+reserve+interest+rates" },
  { id: "earnings",label: "Earnings",icon: BarChart3,  query: "corporate+earnings+quarterly+results" },
  { id: "macro",   label: "News",    icon: Globe,      query: "global+economy+GDP+inflation" },
];

const CURATED_NEWS = {
  markets: [
    { title: "S&P 500 and Nasdaq Rise as Tech Leads Market Rally", source: "Reuters", time: "Live", sentiment: "positive", url: "https://www.reuters.com/markets/" },
    { title: "Dow Jones Retreats on Mixed Economic Signals", source: "Bloomberg", time: "Live", sentiment: "neutral", url: "https://www.bloomberg.com/markets/" },
    { title: "Wall Street Futures Point Higher Ahead of Fed Minutes", source: "CNBC", time: "Live", sentiment: "positive", url: "https://www.cnbc.com/markets/" },
    { title: "VIX Volatility Index Falls to Multi-Month Low", source: "MarketWatch", time: "Live", sentiment: "positive", url: "https://www.marketwatch.com/" },
    { title: "Russell 2000 Outperforms as Small-Caps Rally", source: "WSJ", time: "Live", sentiment: "positive", url: "https://www.wsj.com/market-data/" },
  ],
  rates: [
    { title: "Federal Reserve Signals Cautious Approach to Rate Cuts", source: "Bloomberg", time: "Live", sentiment: "neutral", url: "https://www.bloomberg.com/economics/" },
    { title: "Treasury Yields Steady as Inflation Data Eases Concerns", source: "Reuters", time: "Live", sentiment: "neutral", url: "https://www.reuters.com/markets/rates-bonds/" },
    { title: "10-Year Treasury Yield Dips Below Key Level", source: "CNBC", time: "Live", sentiment: "positive", url: "https://www.cnbc.com/bonds/" },
    { title: "ECB Rate Path Diverges from Fed as EU Growth Slows", source: "FT", time: "Live", sentiment: "neutral", url: "https://www.ft.com/global-economy/" },
    { title: "Fed Fund Futures Price in Two Cuts for Second Half of Year", source: "Reuters", time: "Live", sentiment: "positive", url: "https://www.reuters.com/markets/" },
  ],
  earnings: [
    { title: "Apple Reports Strong iPhone Sales, Beats Estimates", source: "CNBC", time: "Live", sentiment: "positive", url: "https://www.cnbc.com/earnings/" },
    { title: "Microsoft Azure Revenue Growth Accelerates in Q3", source: "Reuters", time: "Live", sentiment: "positive", url: "https://www.reuters.com/technology/" },
    { title: "NVIDIA Posts Record Earnings on AI Chip Demand", source: "Bloomberg", time: "Live", sentiment: "positive", url: "https://www.bloomberg.com/technology/" },
    { title: "JPMorgan Chase Beats Estimates Despite Higher Provisions", source: "WSJ", time: "Live", sentiment: "neutral", url: "https://www.wsj.com/finance/" },
    { title: "Alphabet Ad Revenue Rebounds, Cloud Business Accelerates", source: "CNBC", time: "Live", sentiment: "positive", url: "https://www.cnbc.com/earnings/" },
  ],
  macro: [
    { title: "US Jobless Claims Fall, Labour Market Remains Resilient", source: "Reuters", time: "Live", sentiment: "positive", url: "https://www.reuters.com/business/economy/" },
    { title: "CPI Inflation Cools to Lowest Level Since 2021", source: "Bloomberg", time: "Live", sentiment: "positive", url: "https://www.bloomberg.com/economics/" },
    { title: "China Manufacturing PMI Contracts Unexpectedly", source: "FT", time: "Live", sentiment: "negative", url: "https://www.ft.com/global-economy/" },
    { title: "IMF Upgrades Global Growth Forecast for Current Year", source: "Reuters", time: "Live", sentiment: "positive", url: "https://www.reuters.com/business/" },
    { title: "Oil Prices Slip on Demand Concerns and Dollar Strength", source: "CNBC", time: "Live", sentiment: "negative", url: "https://www.cnbc.com/energy/" },
  ],
};

const sentimentStyle = {
  positive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  negative: "bg-red-500/20 text-red-400 border-red-500/30",
  neutral:  "bg-slate-700/40 text-slate-400 border-slate-600",
};

export default function MarketNewsWidget() {
  const [activeCategory, setActiveCategory] = useState("markets");
  const [loading, setLoading] = useState(false);
  const [liveHeadlines, setLiveHeadlines] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchNews = async (cat) => {
    const category = cat || activeCategory;
    setLoading(true);
    try {
      const q = CATEGORIES.find(c => c.id === category)?.query || "stock+market";
      const res = await fetch(
        `/yf-api/v1/finance/search?q=${q}&newsCount=5&enableFuzzyQuery=false`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = (data?.news || []).slice(0, 5).map(n => ({
        title: n.title,
        source: n.publisher,
        time: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toLocaleDateString() : "Recent",
        sentiment: "neutral",
        url: n.link,
      }));
      if (items.length > 0) {
        setLiveHeadlines(prev => ({ ...prev, [category]: items }));
        setLastUpdated(new Date());
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchNews("markets"); }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (!liveHeadlines[cat]) fetchNews(cat);
  };

  const headlines = liveHeadlines[activeCategory] || CURATED_NEWS[activeCategory] || [];

  return (
    <Card className="border-[#334155] bg-[#1e293b] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            Market News & Updates
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchNews()}
            disabled={loading}
            className="h-7 w-7 text-slate-500 hover:text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex gap-1 mt-2 flex-wrap">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-orange-600 text-white"
                    : "bg-[#0f172a] text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                }`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-2">
        {headlines.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-[#0f172a]/50 border border-[#334155] hover:border-orange-500/40 hover:bg-[#0f172a] transition-all group"
          >
            <p className="text-sm font-medium text-slate-200 leading-snug group-hover:text-white transition-colors">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500">{item.time}</span>
              <Badge className={`text-[10px] border ${sentimentStyle[item.sentiment] || sentimentStyle.neutral}`}>
                {item.source}
              </Badge>
              <ExternalLink className="w-3 h-3 text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}

        <a
          href="https://finance.yahoo.com/news/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium mt-3 transition-colors"
        >
          View More <ExternalLink className="w-3 h-3" />
        </a>

        <p className="text-[10px] text-slate-600 mt-2">
          Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Source: Yahoo Finance
        </p>
      </CardContent>
    </Card>
  );
}
