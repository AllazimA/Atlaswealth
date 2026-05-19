import React from "react";
import { ExternalLink } from "lucide-react";

export default function MarketsOverview() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Markets Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time market context powered by TradingView</p>
        </div>
        <a
          href="https://www.tradingview.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
        >
          View Full Market <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Ticker Tape */}
      <div className="w-full overflow-hidden rounded-xl border border-[#334155] bg-[#1e293b]">
        <div dangerouslySetInnerHTML={{
          __html: `
            <div class="tradingview-widget-container" style="height: 70px; width: 100%;">
              <iframe scrolling="no" allowtransparency="true" frameborder="0" 
                src="https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#%7B%22symbols%22%3A%5B%7B%22proName%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22title%22%3A%22S%26P%20500%22%7D%2C%7B%22proName%22%3A%22FOREXCOM%3ANSXUSD%22%2C%22title%22%3A%22Nasdaq%20100%22%7D%2C%7B%22proName%22%3A%22FOREXCOM%3ADJI%22%2C%22title%22%3A%22Dow%2030%22%7D%2C%7B%22proName%22%3A%22INDEX%3ADXY%22%2C%22title%22%3A%22Dollar%20Index%22%7D%2C%7B%22proName%22%3A%22TVC%3AGOLD%22%2C%22title%22%3A%22Gold%22%7D%2C%7B%22proName%22%3A%22TVC%3AUSOIL%22%2C%22title%22%3A%22Oil%22%7D%2C%7B%22proName%22%3A%22COINBASE%3ABTCUSD%22%2C%22title%22%3A%22Bitcoin%22%7D%2C%7B%22proName%22%3A%22COINBASE%3AETHUSD%22%2C%22title%22%3A%22Ethereum%22%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22displayMode%22%3A%22adaptive%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A70%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22ticker-tape%22%2C%22page-uri%22%3A%22localhost%22%7D" 
                style="box-sizing: border-box; display: block; height: 70px; width: 100%;">
              </iframe>
            </div>
          `
        }} />
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-500 text-center">
        Market widgets powered by TradingView. Data is delayed depending on the exchange.
      </p>
    </div>
  );
}