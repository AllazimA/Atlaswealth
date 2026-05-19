import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TrendingUp, TrendingDown, Search, X } from "lucide-react";
import { toast } from "sonner";

export default function TickerSnapshot() {
  const [tickerInput, setTickerInput] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleFetchData = async () => {
    if (!tickerInput.trim()) {
      toast.error("Please enter at least one ticker");
      return;
    }

    const tickers = tickerInput
      .split(/[\n,]/)
      .map(t => t.trim())
      .filter(t => t);

    setLoading(true);
    try {
      const response = await base44.functions.invoke("fetchTickerSnapshot", { tickers });
      
      if (response.data.results) {
        setData(response.data.results);
        const errorCount = response.data.results.filter(r => r.error).length;
        if (errorCount > 0) {
          toast.warning(`${errorCount} ticker(s) failed to fetch`);
        } else {
          toast.success(`Fetched data for ${response.data.results.length} ticker(s)`);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch ticker data");
      console.error(error);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setTickerInput("");
    setData([]);
    setSearchFilter("");
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Symbol", "Name", "Price", "Previous Close", "Open", "Day High", "Day Low",
      "Daily Change ($)", "Daily Change (%)", "Day's Range", "Volume", "Avg Daily Volume",
      "52W Low", "52W High", "Change from 52W High", "Change from 52W Low", "Market Cap", "Currency"
    ];

    const rows = filteredData.map(row => {
      const price = parseFloat(row.regularMarketPrice);
      const prevClose = parseFloat(row.regularMarketPreviousClose);
      const dayLow = parseFloat(row.regularMarketDayLow);
      const dayHigh = parseFloat(row.regularMarketDayHigh);
      const week52Low = parseFloat(row.fiftyTwoWeekLow);
      const week52High = parseFloat(row.fiftyTwoWeekHigh);

      const dailyChange = !isNaN(price) && !isNaN(prevClose) ? (price - prevClose).toFixed(2) : "N/A";
      const dailyChangePct = !isNaN(price) && !isNaN(prevClose) ? (((price - prevClose) / prevClose) * 100).toFixed(2) : "N/A";
      const daysRange = !isNaN(dayLow) && !isNaN(dayHigh) ? `${dayLow.toFixed(2)} - ${dayHigh.toFixed(2)}` : "N/A";
      const change52High = !isNaN(price) && !isNaN(week52High) ? (price - week52High).toFixed(2) : "N/A";
      const change52Low = !isNaN(price) && !isNaN(week52Low) ? (price - week52Low).toFixed(2) : "N/A";

      return [
        row.symbol,
        row.shortName || "N/A",
        row.regularMarketPrice || "N/A",
        row.regularMarketPreviousClose || "N/A",
        row.regularMarketOpen || "N/A",
        row.regularMarketDayHigh || "N/A",
        row.regularMarketDayLow || "N/A",
        dailyChange,
        dailyChangePct,
        daysRange,
        row.regularMarketVolume || "N/A",
        row.averageDailyVolume3Month || "N/A",
        row.fiftyTwoWeekLow || "N/A",
        row.fiftyTwoWeekHigh || "N/A",
        change52High,
        change52Low,
        row.marketCap || "N/A",
        row.currency || "USD"
      ];
    });

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticker_snapshot_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const filteredData = useMemo(() => {
    let filtered = data.filter(row => 
      !searchFilter || 
      row.symbol?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.shortName?.toLowerCase().includes(searchFilter.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }
        
        const aStr = String(aVal || "");
        const bStr = String(bVal || "");
        return sortConfig.direction === "asc" 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  }, [data, searchFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-slate-100">Ticker Snapshot (CSV Export)</CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Enter tickers to fetch real-time quotes and fundamentals data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            placeholder="Enter tickers (comma or line-separated)&#10;Example: AAPL, MSFT, GOOGL&#10;or&#10;AAPL&#10;MSFT&#10;GOOGL"
            className="bg-[#0f172a] border-[#334155] text-slate-100 font-mono text-xs min-h-[100px]"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleFetchData}
              disabled={loading || !tickerInput.trim()}
              className="bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900"
            >
              {loading ? "Fetching..." : "Fetch Data"}
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={data.length === 0}
              variant="outline"
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {data.length > 0 && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by symbol or name..."
                className="pl-9 bg-[#0f172a] border-[#334155] text-slate-100 text-xs"
              />
            </div>

            <div className="overflow-x-auto border border-[#334155] rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-[#0f172a] sticky top-0 z-10">
                  <tr className="border-b border-[#334155]">
                    {[
                      { key: "symbol", label: "Symbol" },
                      { key: "shortName", label: "Name" },
                      { key: "regularMarketPrice", label: "Price" },
                      { key: null, label: "Change" },
                      { key: "regularMarketOpen", label: "Open" },
                      { key: null, label: "Day's Range" },
                      { key: "regularMarketVolume", label: "Volume" },
                      { key: "marketCap", label: "Market Cap" },
                      { key: "fiftyTwoWeekLow", label: "52W Low" },
                      { key: "fiftyTwoWeekHigh", label: "52W High" },
                    ].map(({ key, label }) => (
                      <th
                        key={label}
                        onClick={() => key && handleSort(key)}
                        className={`px-3 py-2 text-left font-medium text-slate-400 uppercase tracking-wider ${
                          key ? "cursor-pointer hover:text-slate-200" : ""
                        }`}
                      >
                        {label}
                        {sortConfig.key === key && (
                          <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#1e293b]">
                  {filteredData.map((row, idx) => {
                    if (row.error) {
                      return (
                        <tr key={idx} className="border-b border-[#334155]">
                          <td className="px-3 py-2 font-mono font-bold text-slate-100">{row.symbol}</td>
                          <td colSpan="9" className="px-3 py-2 text-red-400">{row.error}</td>
                        </tr>
                      );
                    }

                    const price = parseFloat(row.regularMarketPrice);
                    const prevClose = parseFloat(row.regularMarketPreviousClose);
                    const dailyChange = !isNaN(price) && !isNaN(prevClose) ? price - prevClose : null;
                    const dailyChangePct = dailyChange !== null ? (dailyChange / prevClose) * 100 : null;
                    const isPositive = dailyChange > 0;
                    const isNegative = dailyChange < 0;

                    return (
                      <tr key={idx} className="border-b border-[#334155] hover:bg-slate-700/30">
                        <td className="px-3 py-2 font-mono font-bold text-slate-100">{row.symbol}</td>
                        <td className="px-3 py-2 text-slate-300 max-w-[150px] truncate">{row.shortName || "N/A"}</td>
                        <td className="px-3 py-2 font-mono text-slate-100">
                          {row.regularMarketPrice !== "N/A" ? parseFloat(row.regularMarketPrice).toFixed(2) : "N/A"}
                        </td>
                        <td className="px-3 py-2">
                          {dailyChange !== null ? (
                            <div className="flex items-center gap-1">
                              {isPositive && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                              {isNegative && <TrendingDown className="w-3 h-3 text-red-400" />}
                              <span className={`font-mono ${isPositive ? "text-emerald-400" : isNegative ? "text-red-400" : "text-slate-400"}`}>
                                {dailyChange.toFixed(2)} ({dailyChangePct.toFixed(2)}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">
                          {row.regularMarketOpen !== "N/A" ? parseFloat(row.regularMarketOpen).toFixed(2) : "N/A"}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">
                          {row.regularMarketDayLow !== "N/A" && row.regularMarketDayHigh !== "N/A"
                            ? `${parseFloat(row.regularMarketDayLow).toFixed(2)} - ${parseFloat(row.regularMarketDayHigh).toFixed(2)}`
                            : "N/A"}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">
                          {row.regularMarketVolume !== "N/A" 
                            ? parseFloat(row.regularMarketVolume).toLocaleString() 
                            : "N/A"}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">
                          {row.marketCap !== "N/A" 
                            ? `${(parseFloat(row.marketCap) / 1e9).toFixed(2)}B`
                            : "N/A"}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">
                          {row.fiftyTwoWeekLow !== "N/A" ? parseFloat(row.fiftyTwoWeekLow).toFixed(2) : "N/A"}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">
                          {row.fiftyTwoWeekHigh !== "N/A" ? parseFloat(row.fiftyTwoWeekHigh).toFixed(2) : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{filteredData.length} ticker(s) displayed</span>
              <span>Data cached for 60 seconds</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}