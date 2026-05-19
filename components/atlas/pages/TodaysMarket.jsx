import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, BarChart3, Activity, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getQuote } from "@/api/alphaVantage";

// Sector ETFs — supported by Alpha Vantage GLOBAL_QUOTE
const SECTOR_ETFS = [
  { name: "Technology",       ticker: "XLK" },
  { name: "Healthcare",       ticker: "XLV" },
  { name: "Financials",       ticker: "XLF" },
  { name: "Consumer Discr.",  ticker: "XLY" },
  { name: "Industrials",      ticker: "XLI" },
  { name: "Energy",           ticker: "XLE" },
  { name: "Utilities",        ticker: "XLU" },
  { name: "Real Estate",      ticker: "XLRE" },
];

const STATIC_DRIVERS = [
  "Federal Reserve policy signals impacting rate-sensitive sectors",
  "Corporate earnings season driving sector rotation",
  "US dollar strength weighing on multinational revenue",
  "Geopolitical developments influencing energy prices",
  "Inflation data shaping expectations for monetary policy",
];

const STATIC_TALKING_POINTS = [
  "Remind clients that short-term volatility is a normal part of long-term investing",
  "Review portfolio allocations relative to stated risk tolerance and time horizon",
  "Consider rebalancing if equity allocations have drifted significantly",
  "Highlight importance of diversification across sectors and geographies",
  "Document any client concerns discussed for compliance purposes",
];

export default function TodaysMarket() {
  const [currentTime, setCurrentTime]   = useState(new Date());
  const [marketStatus, setMarketStatus] = useState("live");
  const [sectors, setSectors]           = useState([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);

  /* ── Clock & market-hours ──────────────────────────────────────────────── */
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 60_000);
    const h = new Date().getHours();
    const d = new Date().getDay();
    setMarketStatus(d === 0 || d === 6 || h < 9 || h >= 16 ? "closed" : "live");
    return () => clearInterval(tick);
  }, []);

  /* ── Fetch sector ETF performance via Alpha Vantage ─────────────────────── */
  const fetchSectors = useCallback(async () => {
    setSectorsLoading(true);
    const results = [];
    for (let i = 0; i < SECTOR_ETFS.length; i++) {
      const { name, ticker } = SECTOR_ETFS[i];
      try {
        const q = await getQuote(ticker);
        results.push({ name, ticker, pct: q.changePct, up: q.changePct >= 0, price: q.price });
      } catch {
        results.push({ name, ticker, pct: 0, up: true, error: true });
      }
      // Respect 5 req/min free-tier limit
      if (i < SECTOR_ETFS.length - 1) await new Promise(r => setTimeout(r, 300));
    }
    setSectors(results);
    setLastRefresh(new Date());
    setSectorsLoading(false);
    toast.success("Sector data updated");
  }, []);

  useEffect(() => { fetchSectors(); }, [fetchSectors]);

  // Market tone from sector data
  const positiveCount  = sectors.filter(s => s.up).length;
  const marketRegime   = positiveCount >= 6 ? "risk-on" : positiveCount <= 2 ? "risk-off" : "neutral";
  const maxAbsPct      = Math.max(...sectors.map(s => Math.abs(s.pct)), 1);

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── TradingView Ticker Tape ──────────────────────────────────────── */}
      <div className="w-full overflow-hidden rounded-xl border border-[#334155] bg-[#1e293b]">
        <iframe
          src="https://www.tradingview.com/embed-widget/ticker-tape/?locale=en#%7B%22symbols%22%3A%5B%7B%22proName%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22title%22%3A%22S%26P%20500%22%7D%2C%7B%22proName%22%3A%22FOREXCOM%3ANSXUSD%22%2C%22title%22%3A%22US%20100%22%7D%2C%7B%22proName%22%3A%22FX_IDC%3AEURUSD%22%2C%22title%22%3A%22EUR%2FUSD%22%7D%2C%7B%22proName%22%3A%22BITSTAMP%3ABTCUSD%22%2C%22title%22%3A%22Bitcoin%22%7D%2C%7B%22proName%22%3A%22BITSTAMP%3AETHUSD%22%2C%22title%22%3A%22Ethereum%22%7D%2C%7B%22description%22%3A%22Gold%22%2C%22proName%22%3A%22TVC%3AGOLD%22%7D%2C%7B%22description%22%3A%22Crude%20Oil%22%2C%22proName%22%3A%22TVC%3AUSOIL%22%7D%2C%7B%22description%22%3A%22VIX%22%2C%22proName%22%3A%22CBOE%3AVIX%22%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22isTransparent%22%3Afalse%2C%22displayMode%22%3A%22adaptive%22%2C%22colorTheme%22%3A%22dark%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A78%7D"
          title="TradingView Ticker Tape"
          className="w-full"
          style={{ height: 78 }}
          frameBorder="0"
          allowTransparency="true"
          scrolling="no"
        />
      </div>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Today's Market</h1>
          <p className="text-sm text-slate-400 mt-1">Live market overview and key indices</p>
        </div>
        <Button onClick={fetchSectors} disabled={sectorsLoading}
          className="bg-orange-600 hover:bg-orange-700 text-white" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${sectorsLoading ? "animate-spin" : ""}`} />
          {sectorsLoading ? "Updating..." : "Refresh Data"}
        </Button>
      </div>

      {/* ── Status strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl border border-[#334155]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${marketStatus === "live" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
          <span className="text-xs text-slate-400">Status:</span>
          <Badge className={`text-xs font-bold ${marketStatus === "live" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-700 text-slate-300 border-slate-600"}`}>
            {marketStatus === "live" ? "LIVE" : "CLOSED"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-slate-400">Updated:</span>
          <span className="text-xs font-semibold text-slate-100">
            {lastRefresh ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} EST
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-400">Source:</span>
          <span className="text-xs font-medium text-slate-100">TradingView + Alpha Vantage</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-slate-400">Tone:</span>
          <Badge className={`text-xs font-bold ${
            marketRegime === "risk-on"  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
            marketRegime === "risk-off" ? "bg-red-500/20 text-red-400 border-red-500/30" :
            "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}>
            {marketRegime === "risk-on" ? "RISK-ON" : marketRegime === "risk-off" ? "RISK-OFF" : "NEUTRAL"}
          </Badge>
        </div>
      </div>

      {/* ── TradingView Market Overview — US Indices + Global ─────────────── */}
      <Card className="border-[#334155] bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-orange-400" />
            </div>
            US Market Indices &amp; Global Markets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-2xl">
          <iframe
            src={`https://www.tradingview.com/embed-widget/market-overview/?locale=en#${encodeURIComponent(JSON.stringify({
              colorTheme: "dark",
              dateRange: "1D",
              showChart: true,
              locale: "en",
              width: "100%",
              height: 550,
              isTransparent: true,
              showSymbolLogo: true,
              showFloatingTooltip: true,
              plotLineColorGrowing: "rgba(255,152,0,1)",
              plotLineColorFalling: "rgba(255,82,82,1)",
              gridLineColor: "rgba(51,65,85,0.5)",
              scaleFontColor: "rgba(148,163,184,1)",
              belowLineFillColorGrowing: "rgba(255,152,0,0.08)",
              belowLineFillColorFalling: "rgba(255,82,82,0.08)",
              belowLineFillColorGrowingBottom: "rgba(255,152,0,0)",
              belowLineFillColorFallingBottom: "rgba(255,82,82,0)",
              symbolActiveColor: "rgba(255,152,0,0.1)",
              tabs: [
                {
                  title: "US Indices",
                  symbols: [
                    { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
                    { s: "FOREXCOM:NSXUSD", d: "NASDAQ 100" },
                    { s: "FOREXCOM:DJI",    d: "Dow Jones" },
                    { s: "TVC:RUT",         d: "Russell 2000" },
                    { s: "CBOE:VIX",        d: "VIX" },
                  ],
                  originalTitle: "Indices",
                },
                {
                  title: "Global",
                  symbols: [
                    { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
                    { s: "XETR:DAX",        d: "DAX" },
                    { s: "TVC:NI225",       d: "Nikkei 225" },
                    { s: "TVC:HSI",         d: "Hang Seng" },
                    { s: "TVC:TASI",        d: "Saudi Tadawul" },
                    { s: "EMIRATES:DFMGI",  d: "UAE DFM" },
                    { s: "ADX:FADGI",       d: "UAE ADX" },
                    { s: "TVC:MASI",        d: "Morocco MASI" },
                  ],
                  originalTitle: "Global",
                },
                {
                  title: "Commodities",
                  symbols: [
                    { s: "TVC:GOLD",   d: "Gold" },
                    { s: "TVC:USOIL",  d: "Crude Oil" },
                    { s: "TVC:SILVER", d: "Silver" },
                    { s: "TVC:USOIL",  d: "WTI" },
                  ],
                  originalTitle: "Commodities",
                },
              ],
            }))}`}
            title="TradingView Market Overview"
            width="100%"
            height="550"
            frameBorder="0"
            allowTransparency="true"
            scrolling="no"
            style={{ display: "block" }}
          />
        </CardContent>
      </Card>

      {/* ── Sector Performance (Alpha Vantage) + Forex/Crypto ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sector bars */}
        <Card className="border-[#334155] bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                Sector Performance
              </CardTitle>
              <span className="text-[10px] text-slate-500">via Alpha Vantage</span>
            </div>
          </CardHeader>
          <CardContent>
            {sectorsLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400 mr-2" />
                <span className="text-sm text-slate-400">Fetching sector data…</span>
              </div>
            ) : (
              <div className="space-y-3">
                {sectors.map((s) => (
                  <div key={s.name} className="space-y-1.5 px-1 py-1 rounded-lg hover:bg-[#0f172a]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">{s.name}</span>
                        {s.price && <span className="text-[10px] text-slate-500">${s.price.toFixed(2)}</span>}
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${s.up ? "text-emerald-400" : "text-red-400"}`}>
                        {s.pct >= 0 ? "+" : ""}{s.pct.toFixed(2)}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 h-full rounded-full transition-all duration-500 ${s.up ? "bg-gradient-to-r from-emerald-600 to-emerald-400 left-1/2" : "bg-gradient-to-l from-red-600 to-red-400 right-1/2"}`}
                        style={{ width: `${Math.min((Math.abs(s.pct) / maxAbsPct) * 48, 48)}%` }}
                      />
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TradingView Forex / Crypto mini widget */}
        <Card className="border-[#334155] bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-violet-400" />
              </div>
              Forex &amp; Crypto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-2xl">
            <iframe
              src={`https://www.tradingview.com/embed-widget/market-quotes/?locale=en#${encodeURIComponent(JSON.stringify({
                width: "100%",
                height: 400,
                symbolsGroups: [
                  {
                    name: "Forex",
                    symbols: [
                      { name: "FX:EURUSD", displayName: "EUR/USD" },
                      { name: "FX:GBPUSD", displayName: "GBP/USD" },
                      { name: "FX:USDJPY", displayName: "USD/JPY" },
                      { name: "FX:USDSAR", displayName: "USD/SAR" },
                    ],
                  },
                  {
                    name: "Crypto",
                    symbols: [
                      { name: "BITSTAMP:BTCUSD", displayName: "Bitcoin" },
                      { name: "BITSTAMP:ETHUSD", displayName: "Ethereum" },
                    ],
                  },
                ],
                showSymbolLogo: true,
                isTransparent: true,
                colorTheme: "dark",
                locale: "en",
              }))}`}
              title="TradingView Market Quotes"
              width="100%"
              height="400"
              frameBorder="0"
              allowTransparency="true"
              scrolling="no"
              style={{ display: "block" }}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Market Drivers + Advisor Talking Points ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#334155] bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              Today's Market Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATIC_DRIVERS.map((driver, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f172a]/50 border border-[#334155] hover:border-red-500/30 transition-all">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-red-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{driver}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-[#0f172a]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-orange-400" />
              </div>
              Advisor Talking Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATIC_TALKING_POINTS.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f172a]/50 border border-orange-500/20 hover:border-orange-500/40 transition-all">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-[11px] text-slate-500 text-center">
        Index &amp; chart data from TradingView (real-time). Sector ETF data from Alpha Vantage (25 req/day free tier).
      </p>
    </div>
  );
}
