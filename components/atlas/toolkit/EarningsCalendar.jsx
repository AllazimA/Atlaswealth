import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus } from "lucide-react";
import { format, addDays } from "date-fns";

const MOCK_EARNINGS = [
  { company: "Apple Inc.", ticker: "AAPL", date: addDays(new Date(), 2), sector: "Technology", market: "NASDAQ" },
  { company: "Microsoft Corp.", ticker: "MSFT", date: addDays(new Date(), 3), sector: "Technology", market: "NASDAQ" },
  { company: "Tesla Inc.", ticker: "TSLA", date: addDays(new Date(), 5), sector: "Automotive", market: "NASDAQ" },
  { company: "JPMorgan Chase", ticker: "JPM", date: addDays(new Date(), 7), sector: "Financial", market: "NYSE" },
  { company: "Johnson & Johnson", ticker: "JNJ", date: addDays(new Date(), 8), sector: "Healthcare", market: "NYSE" },
  { company: "Amazon.com Inc.", ticker: "AMZN", date: addDays(new Date(), 10), sector: "Technology", market: "NASDAQ" },
  { company: "Exxon Mobil Corp.", ticker: "XOM", date: addDays(new Date(), 12), sector: "Energy", market: "NYSE" },
  { company: "Procter & Gamble", ticker: "PG", date: addDays(new Date(), 14), sector: "Consumer Goods", market: "NYSE" }
];

export default function EarningsCalendar() {
  const [sectorFilter, setSectorFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");

  const filteredEarnings = MOCK_EARNINGS.filter(e => {
    const sectorMatch = sectorFilter === "all" || e.sector === sectorFilter;
    const marketMatch = marketFilter === "all" || e.market === marketFilter;
    return sectorMatch && marketMatch;
  });

  const sectors = [...new Set(MOCK_EARNINGS.map(e => e.sector))];
  const markets = [...new Set(MOCK_EARNINGS.map(e => e.market))];

  return (
    <Card className="border-[#334155] bg-[#1e293b] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" />
            Earnings Calendar
          </CardTitle>
          <Badge variant="outline" className="text-xs">{filteredEarnings.length} upcoming</Badge>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="h-8 text-xs bg-[#0f172a] border-[#334155] text-slate-300">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={marketFilter} onValueChange={setMarketFilter}>
            <SelectTrigger className="h-8 text-xs bg-[#0f172a] border-[#334155] text-slate-300">
              <SelectValue placeholder="All Markets" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="all">All Markets</SelectItem>
              {markets.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-2">
          {filteredEarnings.map((earning, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-lg bg-[#0f172a]/50 border border-[#334155] hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{earning.company}</span>
                    <Badge className="bg-slate-700/50 text-slate-300 border-slate-600 text-[10px] px-1.5 py-0">
                      {earning.ticker}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{format(earning.date, "MMM d, yyyy")}</span>
                    <span>•</span>
                    <span>{earning.sector}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{earning.market}</Badge>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-7 text-xs text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Note
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}