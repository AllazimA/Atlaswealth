import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PORTFOLIO_THEMES, THEME_CATEGORIES, getCategoryBadgeColor, getRiskBadgeColor } from "./ThemeLibrary";
import { Sparkles, TrendingUp, Shield, Leaf, DollarSign, Coins } from "lucide-react";

const categoryIcons = {
  risk: Shield,
  sector: TrendingUp,
  style: Sparkles,
  income: DollarSign,
  esg: Leaf,
  alternatives: Coins
};

export default function ThemeGallery({ onApplyTheme }) {
  const [selectedCategory, setSelectedCategory] = useState(THEME_CATEGORIES.ALL);

  const filteredThemes = selectedCategory === THEME_CATEGORIES.ALL
    ? PORTFOLIO_THEMES
    : PORTFOLIO_THEMES.filter(t => t.category === selectedCategory);

  const categories = [
    { value: THEME_CATEGORIES.ALL, label: "All Themes" },
    { value: THEME_CATEGORIES.RISK, label: "Risk-Based" },
    { value: THEME_CATEGORIES.SECTOR, label: "Sector" },
    { value: THEME_CATEGORIES.STYLE, label: "Style" },
    { value: THEME_CATEGORIES.INCOME, label: "Income" },
    { value: THEME_CATEGORIES.ESG, label: "ESG" },
    { value: THEME_CATEGORIES.ALTERNATIVES, label: "Alternatives" }
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? "bg-orange-500 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map(theme => {
          const CategoryIcon = categoryIcons[theme.category];
          return (
            <div
              key={theme.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-orange-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {CategoryIcon && (
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <CategoryIcon className="w-4 h-4 text-orange-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{theme.name}</h3>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={`text-xs border ${getCategoryBadgeColor(theme.category)}`}>
                  {theme.category.toUpperCase()}
                </Badge>
                <Badge className={`text-xs border ${getRiskBadgeColor(theme.riskLevel)}`}>
                  {theme.riskLevel}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{theme.description}</p>

              {/* Allocation Preview */}
              <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stocks:</span>
                    <span className="text-slate-200 font-medium">{theme.allocations.stocks_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bonds:</span>
                    <span className="text-slate-200 font-medium">{theme.allocations.bonds_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ETFs:</span>
                    <span className="text-slate-200 font-medium">{theme.allocations.etfs_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cash:</span>
                    <span className="text-slate-200 font-medium">{theme.allocations.cash_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-slate-500 mb-3">
                <div>Benchmark: {theme.benchmark}</div>
                {theme.targetHorizon && <div>Horizon: {theme.targetHorizon}</div>}
              </div>

              {/* Apply Button */}
              <Button
                onClick={() => onApplyTheme(theme)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
              >
                Apply Theme
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}