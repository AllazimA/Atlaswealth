import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tv } from "lucide-react";

const CHANNELS = [
  {
    id: "bloomberg",
    name: "Bloomberg TV",
    flag: "🇺🇸",
    language: "English",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCIALMKvObZNtJ6AmdCLP7Lg&autoplay=1",
    liveUrl: "https://www.bloomberg.com/live/us",
  },
  {
    id: "cnbc-us",
    name: "CNBC",
    flag: "🇺🇸",
    language: "English",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCvJJ_dzjViJCoLf5uKUTwoA&autoplay=1",
    liveUrl: "https://www.cnbc.com/live-tv/",
  },
  {
    id: "asharq-bloomberg",
    name: "Asharq Bloomberg",
    flag: "🌍",
    language: "Arabic",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCxjpGbfoLy6oodYdiyzQE4g&autoplay=1",
    liveUrl: "https://asharqbusiness.com/live/",
  },
  {
    id: "cnbc-arabia",
    name: "CNBC Arabia",
    flag: "🌍",
    language: "Arabic",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCsHdPPJXT-yKVTLGkn3DSvQ&autoplay=1",
    liveUrl: "https://www.youtube.com/@cnbcarabiaTV/live",
  },
  {
    id: "alarabiya",
    name: "Al Arabiya Business",
    flag: "🌍",
    language: "Arabic",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC0mthbFRIm_uYkkzMX09sJw&autoplay=1",
    liveUrl: "https://www.alarabiya.net/aswaq/live",
  },
  {
    id: "skynews-arabia",
    name: "Sky News Arabia",
    flag: "🌍",
    language: "Arabic",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCIJXOvggjKtCagMfxvcCzAA&autoplay=1",
    liveUrl: "https://www.skynewsarabia.com/live-tv",
  },
];

export default function LiveBusinessTV() {
  const [active, setActive] = useState(CHANNELS[0]);
  const [embedErrors, setEmbedErrors] = useState({});

  const handleEmbedError = (id) => {
    setEmbedErrors(prev => ({ ...prev, [id]: true }));
  };

  const hasError = embedErrors[active.id];

  return (
    <div className="w-full rounded-2xl border border-[#334155] overflow-hidden bg-[#1e293b]">
      {/* Channel Tabs */}
      <div className="flex items-center gap-0.5 px-3 pt-3 pb-0 overflow-x-auto scrollbar-hide">
        {CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActive(ch)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
              active.id === ch.id
                ? "bg-[#0f172a] text-white border-orange-500"
                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-700/30"
            }`}
          >
            <span>{ch.flag}</span>
            {ch.name}
            <Badge className="text-[9px] bg-red-600 text-white border-0 px-1 py-0">LIVE</Badge>
            <span className="text-[9px] text-slate-500">({ch.language})</span>
          </button>
        ))}
      </div>

      {/* Player Area */}
      <div className="relative bg-[#0f172a]" style={{ height: "460px" }}>
        {!hasError ? (
          <iframe
            key={active.id}
            src={active.embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => handleEmbedError(active.id)}
            title={`${active.name} Live`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-[#334155] flex items-center justify-center mx-auto mb-4">
                <Tv className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-100 font-semibold text-lg">{active.name}</p>
              <div className="flex items-center gap-2 justify-center mt-2">
                <span className="text-slate-400 text-sm">{active.flag} {active.language}</span>
                <Badge className="text-[10px] bg-red-600 text-white border-0">● LIVE</Badge>
              </div>
            </div>
            <a
              href={active.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Watch Live on {active.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
