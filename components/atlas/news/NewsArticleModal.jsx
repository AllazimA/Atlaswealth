import React, { useState } from "react";
import { X, ExternalLink, Clock, Tag, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewsArticleModal({ article, onClose, onSave }) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("");

  const handleSave = () => {
    onSave({
      ...article,
      commentary,
      client_id: selectedClient || undefined,
      ticker: selectedTicker || article.ticker,
    });
    onClose();
  };

  const impactColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-slate-600/30 text-slate-400 border-slate-500",
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#1e293b] border-l border-[#334155] shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1e293b] border-b border-[#334155] p-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-100 leading-tight">{article.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
                {article.source || "Market News"}
              </Badge>
              {article.category && (
                <Badge className="text-[10px] bg-slate-600/30 text-slate-400 border-slate-500">
                  {article.category.replace(/_/g, " ")}
                </Badge>
              )}
              {article.impact && (
                <Badge className={`text-[10px] border ${impactColors[article.impact]}`}>
                  {article.impact} Impact
                </Badge>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.timestamp || "2 hours ago"}</span>
            </div>
            {article.asset_class && (
              <Badge className="text-[9px] bg-slate-700/30 text-slate-400 border-slate-600">
                {article.asset_class}
              </Badge>
            )}
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Summary</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {article.content || "Federal Reserve maintains current interest rates, signaling a cautious stance amid persistent inflation concerns. Officials indicate data-dependent approach for future policy decisions. Treasury yields rise modestly in response."}
            </p>
          </div>

          {/* Affected Assets */}
          {(article.ticker || article.affected_tickers?.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Affected Tickers</h3>
              <div className="flex flex-wrap gap-2">
                {(article.affected_tickers || [article.ticker]).filter(Boolean).map((ticker) => (
                  <Badge key={ticker} className="text-xs bg-slate-700/30 text-slate-300 border-slate-600">
                    {ticker}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Why This Matters */}
          <div className="p-4 bg-orange-500/5 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-100">Why This Matters</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="font-semibold text-slate-200">Market Implication:</span>
                <p className="mt-1">Rate stability supports equity valuations in near term. Fixed income yields remain attractive for income-focused portfolios.</p>
              </div>
              <div>
                <span className="font-semibold text-slate-200">Sector Implication:</span>
                <p className="mt-1">Financials benefit from maintained rate environment. Technology and growth sectors see reduced pressure from rate uncertainty.</p>
              </div>
              <div>
                <span className="font-semibold text-slate-200">Portfolio Relevance:</span>
                <p className="mt-1">Balanced allocations remain appropriate. Consider income opportunities in short-duration bonds.</p>
              </div>
            </div>
          </div>

          {/* Client Relevance */}
          {article.client_relevance && (
            <div className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100">Client Relevance</h3>
              </div>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>• Affects 12 client portfolios with financial sector exposure</li>
                <li>• Linked to 3 watchlist tickers</li>
                <li>• Relevant for moderate-growth strategy discussions</li>
              </ul>
            </div>
          )}

          {/* Save to Research */}
          {!showSaveForm ? (
            <Button 
              onClick={() => setShowSaveForm(true)} 
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Tag className="w-4 h-4 mr-2" />
              Save to Research Notes
            </Button>
          ) : (
            <div className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-slate-100">Save Article</h4>
              
              <div>
                <label className="text-xs text-slate-400">Link to Client (Optional)</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    <SelectItem value="client1">John Smith</SelectItem>
                    <SelectItem value="client2">Sarah Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Tag Ticker (Optional)</label>
                <input 
                  type="text"
                  value={selectedTicker}
                  onChange={(e) => setSelectedTicker(e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL, MSFT"
                  className="mt-1 w-full px-3 py-2 bg-[#0f172a] border border-[#334155] text-slate-100 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Add Commentary</label>
                <Textarea
                  value={commentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  placeholder="Add your notes or insights..."
                  rows={3}
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Save
                </Button>
                <Button onClick={() => setShowSaveForm(false)} variant="outline" className="border-slate-600 text-slate-300">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* External Link */}
          <a 
            href={article.external_url || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-orange-400 transition-colors"
          >
            <span>View original source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </>
  );
}