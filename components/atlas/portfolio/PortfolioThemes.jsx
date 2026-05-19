// SMART PORTFOLIO THEMES - Institutional Grade
// Each theme includes investment thesis, risk profile, and suggested allocation

export const PORTFOLIO_THEMES = {
  all_weather: {
    name: "All Weather",
    description: "Ray Dalio-inspired balanced approach for all economic environments",
    risk: "moderate",
    thesis: "Designed to perform across inflation, deflation, rising and falling economic growth by balancing exposure to stocks, bonds, commodities, and alternatives.",
    allocation: { stocks: 30, bonds: 40, etfs: 15, cash: 5, alternatives: 10 },
    suggestedTickers: ["SPY", "TLT", "GLD", "IEF", "VTI"],
    icon: "🌤️"
  },
  
  growth: {
    name: "Growth",
    description: "Capital appreciation through high-growth equities",
    risk: "aggressive",
    thesis: "Focus on companies with above-average revenue and earnings growth potential. Suitable for long-term investors with high risk tolerance.",
    allocation: { stocks: 55, bonds: 15, etfs: 20, cash: 5, alternatives: 5 },
    suggestedTickers: ["QQQ", "NVDA", "MSFT", "TSLA", "AAPL"],
    icon: "📈"
  },
  
  income: {
    name: "Income",
    description: "Regular income through dividends and fixed income",
    risk: "conservative",
    thesis: "Prioritizes current income over capital appreciation through dividend-paying stocks, bonds, and REITs.",
    allocation: { stocks: 15, bonds: 45, etfs: 20, cash: 15, alternatives: 5 },
    suggestedTickers: ["SCHD", "VYM", "TLT", "LQD", "VNQ"],
    icon: "💰"
  },
  
  balanced: {
    name: "Balanced",
    description: "Traditional 60/40 portfolio with moderate risk",
    risk: "moderate",
    thesis: "Classic diversified approach balancing growth and stability through a mix of equities and fixed income.",
    allocation: { stocks: 40, bonds: 30, etfs: 20, cash: 10, alternatives: 0 },
    suggestedTickers: ["VTI", "AGG", "SPY", "BND", "VXUS"],
    icon: "⚖️"
  },
  
  ai_technology: {
    name: "AI & Technology",
    description: "Exposure to artificial intelligence and tech innovation",
    risk: "aggressive",
    thesis: "Capitalize on the AI revolution and technological disruption through leaders in cloud computing, semiconductors, and software.",
    allocation: { stocks: 50, bonds: 10, etfs: 30, cash: 5, alternatives: 5 },
    suggestedTickers: ["NVDA", "MSFT", "GOOGL", "META", "AMD"],
    icon: "🤖"
  },
  
  sustainability: {
    name: "Sustainability",
    description: "ESG-focused investments for sustainable future",
    risk: "moderate",
    thesis: "Invest in companies meeting environmental, social, and governance criteria while pursuing competitive returns.",
    allocation: { stocks: 40, bonds: 25, etfs: 25, cash: 5, alternatives: 5 },
    suggestedTickers: ["ESGU", "ICLN", "TAN", "SMOG", "DSI"],
    icon: "🌱"
  },
  
  healthcare: {
    name: "Healthcare",
    description: "Medical innovation and healthcare services",
    risk: "moderate",
    thesis: "Benefit from aging demographics and medical innovation through pharmaceuticals, biotechnology, and healthcare services.",
    allocation: { stocks: 45, bonds: 20, etfs: 25, cash: 10, alternatives: 0 },
    suggestedTickers: ["XLV", "JNJ", "UNH", "LLY", "ABBV"],
    icon: "🏥"
  },
  
  low_volatility: {
    name: "Low Volatility",
    description: "Defensive strategy for risk-averse investors",
    risk: "conservative",
    thesis: "Minimize portfolio volatility through defensive stocks, high-quality bonds, and stable dividend payers.",
    allocation: { stocks: 25, bonds: 45, etfs: 15, cash: 15, alternatives: 0 },
    suggestedTickers: ["USMV", "PG", "KO", "JNJ", "BND"],
    icon: "🛡️"
  },
  
  crypto_exposure: {
    name: "Crypto Exposure",
    description: "Digital assets and blockchain technology",
    risk: "aggressive",
    thesis: "Gain exposure to cryptocurrency markets and blockchain innovation. High risk, high potential reward.",
    allocation: { stocks: 20, bonds: 10, etfs: 20, cash: 10, alternatives: 40 },
    suggestedTickers: ["BTC", "ETH", "COIN", "MSTR", "SQ"],
    icon: "₿"
  },
  
  global_macro: {
    name: "Global Macro",
    description: "Multi-asset approach to global economic themes",
    risk: "moderate",
    thesis: "Tactical allocation across global equities, bonds, currencies, and commodities based on macroeconomic trends.",
    allocation: { stocks: 30, bonds: 25, etfs: 30, cash: 5, alternatives: 10 },
    suggestedTickers: ["VEA", "VWO", "BNDX", "GLD", "DBC"],
    icon: "🌍"
  },
  
  commodities: {
    name: "Commodities",
    description: "Inflation hedge through real assets",
    risk: "moderate",
    thesis: "Protect against inflation and currency debasement through exposure to gold, oil, agriculture, and other commodities.",
    allocation: { stocks: 20, bonds: 20, etfs: 25, cash: 10, alternatives: 25 },
    suggestedTickers: ["GLD", "USO", "DBA", "SLV", "DBC"],
    icon: "🛢️"
  }
};

export function getTheme(themeKey) {
  return PORTFOLIO_THEMES[themeKey];
}

export function getAllThemes() {
  return Object.entries(PORTFOLIO_THEMES).map(([key, theme]) => ({
    key,
    ...theme
  }));
}