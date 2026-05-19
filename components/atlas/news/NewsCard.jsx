import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

export default function NewsCard({ article, onClick }) {
  const impactColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-slate-600/30 text-slate-400 border-slate-500",
  };

  return (
    <Card 
      className="border-[#334155] bg-[#1e293b] hover:border-orange-500/30 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-slate-100 leading-tight group-hover:text-orange-400 transition-colors">
            {article.title}
          </h3>
          {article.impact && (
            <Badge className={`text-[9px] border flex-shrink-0 ${impactColors[article.impact]}`}>
              {article.impact}
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{article.summary || article.content}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="text-[9px] bg-orange-500/20 text-orange-400 border-orange-500/30">
            {article.source || "Market News"}
          </Badge>
          
          {article.asset_class && (
            <Badge className="text-[9px] bg-slate-700/30 text-slate-400 border-slate-600">
              {article.asset_class}
            </Badge>
          )}

          {article.ticker && (
            <Badge className="text-[9px] bg-slate-700/30 text-slate-300 border-slate-600">
              {article.ticker}
            </Badge>
          )}

          <div className="flex items-center gap-1 text-[10px] text-slate-500 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{article.timestamp || "2h ago"}</span>
          </div>
        </div>

        {article.client_relevance && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-1 text-[10px] text-blue-400">
              <TrendingUp className="w-3 h-3" />
              <span>Affects client portfolios</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}