// Portfolio Theme Library
export const THEME_CATEGORIES = {
  ALL: "all",
  RISK: "risk",
  SECTOR: "sector",
  STYLE: "style",
  INCOME: "income",
  ESG: "esg",
  ALTERNATIVES: "alternatives"
};

export const PORTFOLIO_THEMES = [
  {
    id: "all-weather",
    name: "All-Weather Portfolio",
    category: "style",
    riskLevel: "moderate",
    description: "Diversified across asset classes to perform well in any economic environment",
    targetHorizon: "5-10 years",
    allocations: {
      stocks_pct: 35,
      bonds_pct: 40,
      etfs_pct: 15,
      cash_pct: 5,
      alternatives_pct: 5
    },
    holdings: [
      { ticker: "SPY", name: "SPDR S&P 500 ETF", weight: 20, asset_type: "etf" },
      { ticker: "TLT", name: "iShares 20+ Year Treasury Bond ETF", weight: 25, asset_type: "etf" },
      { ticker: "IEF", name: "iShares 7-10 Year Treasury Bond ETF", weight: 15, asset_type: "etf" },
      { ticker: "GLD", name: "SPDR Gold Shares", weight: 5, asset_type: "etf" },
      { ticker: "VNQ", name: "Vanguard Real Estate ETF", weight: 10, asset_type: "etf" },
      { ticker: "VWO", name: "Vanguard Emerging Markets ETF", weight: 10, asset_type: "etf" },
      { ticker: "TIP", name: "iShares TIPS Bond ETF", weight: 10, asset_type: "etf" },
      { ticker: "CASH", name: "Cash & Equivalents", weight: 5, asset_type: "cash" }
    ],
    benchmark: "60/40 Blended Portfolio",
    portfolio_risk: "moderate"
  },
  {
    id: "ai-tech",
    name: "AI & Tech Leaders",
    category: "sector",
    riskLevel: "aggressive",
    description: "Growth-focused portfolio targeting AI, cloud computing, and technology innovation",
    targetHorizon: "7-10 years",
    allocations: {
      stocks_pct: 70,
      bonds_pct: 10,
      etfs_pct: 15,
      cash_pct: 5,
      alternatives_pct: 0
    },
    holdings: [
      { ticker: "NVDA", name: "NVIDIA Corporation", weight: 12, asset_type: "stock" },
      { ticker: "MSFT", name: "Microsoft Corporation", weight: 12, asset_type: "stock" },
      { ticker: "GOOGL", name: "Alphabet Inc.", weight: 10, asset_type: "stock" },
      { ticker: "AAPL", name: "Apple Inc.", weight: 10, asset_type: "stock" },
      { ticker: "META", name: "Meta Platforms Inc.", weight: 8, asset_type: "stock" },
      { ticker: "AMZN", name: "Amazon.com Inc.", weight: 8, asset_type: "stock" },
      { ticker: "TSLA", name: "Tesla Inc.", weight: 5, asset_type: "stock" },
      { ticker: "AMD", name: "Advanced Micro Devices", weight: 5, asset_type: "stock" },
      { ticker: "QQQ", name: "Invesco QQQ Trust", weight: 15, asset_type: "etf" },
      { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", weight: 10, asset_type: "etf" },
      { ticker: "CASH", name: "Cash & Equivalents", weight: 5, asset_type: "cash" }
    ],
    benchmark: "NASDAQ 100",
    portfolio_risk: "aggressive"
  },
  {
    id: "dividend-income",
    name: "Dividend Income",
    category: "income",
    riskLevel: "moderate",
    description: "High-quality dividend-paying stocks and bonds for steady income generation",
    targetHorizon: "3-7 years",
    allocations: {
      stocks_pct: 40,
      bonds_pct: 35,
      etfs_pct: 20,
      cash_pct: 5,
      alternatives_pct: 0
    },
    holdings: [
      { ticker: "VYM", name: "Vanguard High Dividend Yield ETF", weight: 20, asset_type: "etf" },
      { ticker: "SCHD", name: "Schwab U.S. Dividend Equity ETF", weight: 15, asset_type: "etf" },
      { ticker: "JNJ", name: "Johnson & Johnson", weight: 8, asset_type: "stock" },
      { ticker: "PG", name: "Procter & Gamble", weight: 7, asset_type: "stock" },
      { ticker: "KO", name: "Coca-Cola Company", weight: 5, asset_type: "stock" },
      { ticker: "VZ", name: "Verizon Communications", weight: 5, asset_type: "stock" },
      { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", weight: 20, asset_type: "etf" },
      { ticker: "LQD", name: "iShares iBoxx $ Investment Grade Corporate Bond ETF", weight: 15, asset_type: "etf" },
      { ticker: "CASH", name: "Cash & Equivalents", weight: 5, asset_type: "cash" }
    ],
    benchmark: "S&P Dividend Aristocrats",
    portfolio_risk: "moderate"
  },
  {
    id: "esg-sustainable",
    name: "ESG Sustainable",
    category: "esg",
    riskLevel: "moderate",
    description: "Environmentally and socially responsible investments aligned with sustainable values",
    targetHorizon: "5-10 years",
    allocations: {
      stocks_pct: 55,
      bonds_pct: 25,
      etfs_pct: 15,
      cash_pct: 5,
      alternatives_pct: 0
    },
    holdings: [
      { ticker: "ESGU", name: "iShares MSCI USA ESG Select ETF", weight: 25, asset_type: "etf" },
      { ticker: "VSGX", name: "Vanguard ESG International Stock ETF", weight: 15, asset_type: "etf" },
      { ticker: "SUSL", name: "iShares ESG MSCI USA Leaders ETF", weight: 15, asset_type: "etf" },
      { ticker: "ICLN", name: "iShares Global Clean Energy ETF", weight: 10, asset_type: "etf" },
      { ticker: "CRBN", name: "iShares MSCI ACWI Low Carbon Target ETF", weight: 10, asset_type: "etf" },
      { ticker: "EAGG", name: "iShares ESG Aware U.S. Aggregate Bond ETF", weight: 15, asset_type: "etf" },
      { ticker: "SUSB", name: "iShares ESG Aware 1-5 Year USD Corporate Bond ETF", weight: 10, asset_type: "etf" },
      { ticker: "CASH", name: "Cash & Equivalents", weight: 5, asset_type: "cash" }
    ],
    benchmark: "MSCI USA ESG Leaders Index",
    portfolio_risk: "moderate"
  },
  {
    id: "capital-preservation",
    name: "Capital Preservation",
    category: "risk",
    riskLevel: "conservative",
    description: "Low-risk portfolio focused on preserving capital with minimal volatility",
    targetHorizon: "1-3 years",
    allocations: {
      stocks_pct: 15,
      bonds_pct: 60,
      etfs_pct: 15,
      cash_pct: 10,
      alternatives_pct: 0
    },
    holdings: [
      { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", weight: 30, asset_type: "etf" },
      { ticker: "BND", name: "Vanguard Total Bond Market ETF", weight: 20, asset_type: "etf" },
      { ticker: "SHY", name: "iShares 1-3 Year Treasury Bond ETF", weight: 15, asset_type: "etf" },
      { ticker: "TIP", name: "iShares TIPS Bond ETF", weight: 10, asset_type: "etf" },
      { ticker: "VTI", name: "Vanguard Total Stock Market ETF", weight: 10, asset_type: "etf" },
      { ticker: "VUG", name: "Vanguard Growth ETF", weight: 5, asset_type: "etf" },
      { ticker: "CASH", name: "Cash & Equivalents", weight: 10, asset_type: "cash" }
    ],
    benchmark: "Bloomberg U.S. Aggregate Bond Index",
    portfolio_risk: "conservative"
  },
  {
    id: "inflation-hedge",
    name: "Inflation Hedge",
    category: "alternatives",
    riskLevel: "moderate",
    description: "Portfolio designed to protect against inflation with commodities and real assets",
    targetHorizon: "5-10 years",
    allocations: {
      stocks_pct: 35,
      bonds_pct: 30,
      etfs_pct: 20,
      cash_pct: 5,
      alternatives_pct: 10
    },
    holdings: [
      { ticker: "TIP", name: "iShares TIPS Bond ETF", weight: 20, asset_type: "etf" },
      { ticker: "GLD", name: "SPDR Gold Shares", weight: 10, asset_type: "alternative" },
      { ticker: "DBC", name: "Invesco DB Commodity Index Tracking Fund", weight: 8, asset_type: "etf" },
      { ticker: "VNQ", name: "Vanguard Real Estate ETF", weight: 12, asset_type: "etf" },
      { ticker: "SPY", name: "SPDR S&P 500 ETF", weight: 20, asset_type: "etf" },
      { ticker: "VWO", name: "Vanguard Emerging Markets ETF", weight: 10, asset_type: "etf" },
      { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", weight: 15, asset_type: "etf" },
      { ticker: "CASH", name: "Cash & Equivalents", weight: 5, asset_type: "cash" }
    ],
    benchmark: "CPI + 3%",
    portfolio_risk: "moderate"
  }
];

export function getCategoryBadgeColor(category) {
  const colors = {
    risk: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    sector: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    style: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    income: "bg-green-500/20 text-green-300 border-green-500/30",
    esg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    alternatives: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  };
  return colors[category] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

export function getRiskBadgeColor(riskLevel) {
  const colors = {
    conservative: "bg-green-500/20 text-green-300 border-green-500/30",
    moderate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    aggressive: "bg-red-500/20 text-red-300 border-red-500/30"
  };
  return colors[riskLevel] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}