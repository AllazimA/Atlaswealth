// Fixed PDF Report Templates - DO NOT MODIFY STRUCTURE
// These templates are persistent and reused for all reports

export const REPORT_TEMPLATES = {
  client_summary: {
    name: "Client Investment Summary",
    sections: [
      {
        id: "cover",
        title: "Cover Page",
        fields: ["client_name", "date", "advisor_name"],
        fixed: true,
      },
      {
        id: "client_profile",
        title: "Client Profile Summary",
        fields: ["name", "age_range", "employment_status", "status", "currency"],
        fixed: true,
      },
      {
        id: "risk_profile",
        title: "Risk Profile & Investment Horizon",
        fields: ["risk_score", "risk_category", "investment_horizon", "investment_objective"],
        fixed: true,
      },
      {
        id: "financial_overview",
        title: "Financial Overview",
        fields: ["total_assets", "net_worth", "monthly_income", "monthly_expenses"],
        fixed: true,
      },
      {
        id: "portfolio_allocation",
        title: "Portfolio Allocation",
        fields: ["stocks_pct", "bonds_pct", "cash_pct", "alternatives_pct"],
        fixed: true,
      },
      {
        id: "performance_summary",
        title: "Performance Summary",
        fields: ["portfolios"],
        fixed: true,
      },
      {
        id: "market_commentary",
        title: "Market Commentary",
        editable: true,
        ai_generated: true,
        default_text: "Current market conditions reflect balanced growth with moderate volatility. Diversified allocations remain appropriate for long-term objectives based on prevailing economic indicators and sector performance.",
      },
      {
        id: "suitability_statement",
        title: "Suitability Statement",
        fixed: true,
        text: "The recommended investment strategy aligns with the client's stated risk tolerance, investment horizon, and financial objectives as documented in this report. The advisor has conducted a thorough assessment and confirms the portfolio recommendations are suitable for the client's circumstances.",
      },
      {
        id: "disclaimers",
        title: "Disclaimers",
        fixed: true,
        text: "DISCLAIMER: This document is for informational purposes only and does not constitute financial advice. Past performance does not guarantee future results. All investments carry risk including possible loss of principal. Please consult with a registered financial advisor before making investment decisions. This report is confidential and intended solely for the named client.",
      },
    ],
  },

  portfolio_factsheet: {
    name: "Portfolio Factsheet",
    sections: [
      {
        id: "portfolio_overview",
        title: "Portfolio Overview",
        fields: ["name", "strategy", "status", "risk_profile"],
        fixed: true,
      },
      {
        id: "strategy_description",
        title: "Strategy Description",
        fields: ["strategy_details"],
        fixed: true,
      },
      {
        id: "asset_allocation",
        title: "Asset Allocation",
        fields: ["stocks_pct", "bonds_pct", "etfs_pct", "cash_pct", "alternatives_pct"],
        fixed: true,
      },
      {
        id: "top_holdings",
        title: "Top Holdings",
        fields: ["holdings"],
        fixed: true,
      },
      {
        id: "risk_metrics",
        title: "Risk Metrics",
        fields: ["portfolio_risk", "diversification", "volatility"],
        fixed: true,
      },
      {
        id: "benchmark_reference",
        title: "Benchmark Reference",
        fields: ["benchmark", "relative_performance"],
        fixed: true,
      },
      {
        id: "last_updated",
        title: "Last Updated",
        fields: ["date"],
        fixed: true,
      },
      {
        id: "disclaimers",
        title: "Disclaimers",
        fixed: true,
        text: "This factsheet is for informational purposes only. Holdings and allocations are subject to change. Past performance does not guarantee future results. All investments involve risk.",
      },
    ],
  },

  performance_report: {
    name: "Performance Report",
    sections: [
      {
        id: "performance_table",
        title: "Performance Table",
        fields: ["ytd_return", "one_year_return", "inception_return"],
        fixed: true,
      },
      {
        id: "benchmark_comparison",
        title: "Benchmark Comparison",
        fields: ["portfolio_return", "benchmark_return", "relative_performance"],
        fixed: true,
      },
      {
        id: "holdings_performance",
        title: "Holdings Performance",
        fields: ["top_performers", "underperformers"],
        fixed: true,
      },
      {
        id: "drawdown_analysis",
        title: "Drawdown Analysis",
        fields: ["max_drawdown", "recovery_period"],
        fixed: true,
      },
      {
        id: "notes",
        title: "Performance Notes",
        editable: true,
        default_text: "Portfolio performance reflects current market conditions and strategic positioning. Holdings have been rebalanced to maintain target allocations.",
      },
      {
        id: "disclaimers",
        title: "Disclaimers",
        fixed: true,
        text: "Performance data is calculated net of fees. Past performance does not guarantee future results. Returns may vary and principal value will fluctuate.",
      },
    ],
  },

  risk_suitability: {
    name: "Risk & Suitability Report",
    sections: [
      {
        id: "client_risk_profile",
        title: "Client Risk Profile",
        fields: ["client_name", "risk_score", "risk_category", "investment_horizon"],
        fixed: true,
      },
      {
        id: "portfolio_risk_level",
        title: "Portfolio Risk Level",
        fields: ["portfolio_name", "portfolio_risk", "strategy"],
        fixed: true,
      },
      {
        id: "suitability_assessment",
        title: "Suitability Assessment",
        fields: ["alignment_status", "client_risk", "portfolio_risk"],
        fixed: true,
      },
      {
        id: "advisor_overrides",
        title: "Advisor Overrides & Justification",
        fields: ["override_applied", "justification"],
        fixed: true,
        conditional: "suitability_override",
      },
      {
        id: "compliance_statement",
        title: "Compliance Statement",
        fixed: true,
        text: "This suitability assessment has been conducted in accordance with regulatory requirements under MiFID II and applicable financial advisory standards. The advisor has verified that the recommended portfolio aligns with the client's risk tolerance, investment objectives, and financial circumstances. All documentation has been reviewed and approved.",
      },
      {
        id: "disclaimers",
        title: "Disclaimers",
        fixed: true,
        text: "This suitability report is valid as of the date of issuance. Client circumstances may change over time, requiring reassessment. The advisor maintains records of this assessment for regulatory compliance purposes.",
      },
    ],
  },
};

// Bloomberg-style branding configuration
export const BRANDING = {
  colors: {
    primary: [255, 111, 0], // Orange
    dark: [15, 23, 42],
    text: [241, 245, 249],
    secondary: [148, 163, 184],
    muted: [100, 116, 139],
  },
  fonts: {
    title: 18,
    heading: 14,
    body: 10,
    small: 9,
    disclaimer: 8,
  },
  margins: {
    page: 20,
    section: 15,
    line: 7,
  },
};

// Strategy descriptions mapping
export const STRATEGY_DESCRIPTIONS = {
  conservative: "Capital preservation focused strategy with emphasis on stable income generation and minimal volatility. Suitable for risk-averse investors with shorter time horizons.",
  moderate: "Balanced approach combining growth potential with income generation. Diversified across asset classes to manage risk while seeking reasonable returns.",
  aggressive: "Growth-oriented strategy accepting higher volatility for potential enhanced returns. Suitable for investors with longer time horizons and higher risk tolerance.",
  balanced: "Equal emphasis on growth and income with moderate risk profile. Maintains diversification across multiple asset classes and sectors.",
  income: "Income generation focused strategy prioritizing dividend yield and interest payments. Emphasis on stable cash flow with capital preservation.",
  growth: "Capital appreciation focused strategy with emphasis on long-term growth potential. Higher allocation to equities and growth-oriented assets.",
};