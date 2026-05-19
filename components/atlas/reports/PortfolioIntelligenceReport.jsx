import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function PortfolioIntelligenceReport({ portfolio, client, holdings }) {
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    if (!portfolio) {
      toast.error("Please activate a portfolio before generating the report.");
      return;
    }

    setGenerating(true);
    try {
      const advisorName = (await base44.auth.me())?.full_name || "Financial Advisor";
      const reportDate = new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
      const baseCurrency = client?.currency || "USD";

      // SECTION 1: Client & Portfolio Snapshot
      const snapshot = [
        ["Portfolio Holdings & Performance Intelligence Report"],
        [],
        ["Field", "Value"],
        ["Client Name", `${client?.first_name || ""} ${client?.last_name || ""}`],
        ["Advisor", advisorName],
        ["Portfolio Name", portfolio.name || "N/A"],
        ["Risk Profile", portfolio.portfolio_risk || "N/A"],
        ["Objective", portfolio.strategy || "N/A"],
        ["Base Currency", baseCurrency],
        ["Report Date", reportDate],
        ["Portfolio Status", portfolio.status || "N/A"],
        []
      ];

      // SECTION 2: Executive Portfolio Summary (Calculations)
      const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.total_value || 0), 0);
      const totalShares = holdings.reduce((sum, h) => sum + (h.shares || 0), 0);
      const totalCostBasis = holdings.reduce((sum, h) => sum + ((h.avg_cost || 0) * (h.shares || 0)), 0);
      const totalUnrealizedPL = totalPortfolioValue - totalCostBasis;
      const totalUnrealizedPLPct = totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0;

      const executiveSummary = [
        ["EXECUTIVE PORTFOLIO SUMMARY"],
        [],
        ["Metric", "Formula", "Value"],
        ["Total Portfolio Value", "SUM(Position Value)", `${baseCurrency} ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ["Number of Holdings", "COUNT(Symbol)", holdings.length],
        ["Total Shares Held", "SUM(Shares)", totalShares.toLocaleString()],
        ["Total Cost Basis", "SUM(Purchase Price × Shares)", `${baseCurrency} ${totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ["Total Unrealized P&L ($)", "SUM(Position P&L $)", `${baseCurrency} ${totalUnrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ["Total Unrealized P&L (%)", "(Total Value − Total Cost) ÷ Total Cost", `${totalUnrealizedPLPct.toFixed(2)}%`],
        ["YTD Return (%)", "From performance engine", portfolio.return_ytd ? `${portfolio.return_ytd.toFixed(2)}%` : "N/A"],
        ["Since Inception Return (%)", "From performance engine", portfolio.return_since_inception ? `${portfolio.return_since_inception.toFixed(2)}%` : "N/A"],
        []
      ];

      // SECTION 3: Holdings Breakdown
      const holdingsBreakdown = [
        ["HOLDINGS BREAKDOWN"],
        [],
        ["Symbol", "Company Name", "Shares", "Purchase Price", "Last Price", "Position Value", "Weight %"]
      ];

      holdings.forEach(h => {
        const positionValue = (h.shares || 0) * (h.current_price || 0);
        const weight = totalPortfolioValue > 0 ? (positionValue / totalPortfolioValue) * 100 : 0;
        
        holdingsBreakdown.push([
          h.ticker || "N/A",
          h.name || "N/A",
          h.shares || 0,
          h.avg_cost || 0,
          h.current_price || 0,
          positionValue,
          weight.toFixed(2)
        ]);
      });
      holdingsBreakdown.push([]);

      // SECTION 4: P&L Analysis
      const plAnalysis = [
        ["PROFIT & LOSS (P&L) ANALYSIS"],
        [],
        ["Symbol", "Cost Basis", "Current Value", "P&L ($)", "P&L (%)", "Status"]
      ];

      holdings.forEach(h => {
        const costBasis = (h.avg_cost || 0) * (h.shares || 0);
        const currentValue = (h.current_price || 0) * (h.shares || 0);
        const plDollar = currentValue - costBasis;
        const plPct = costBasis > 0 ? (plDollar / costBasis) * 100 : 0;
        const status = plDollar > 0 ? "Gain" : plDollar < 0 ? "Loss" : "Flat";

        plAnalysis.push([
          h.ticker || "N/A",
          costBasis,
          currentValue,
          plDollar,
          plPct.toFixed(2),
          status
        ]);
      });
      plAnalysis.push([]);

      // SECTION 5: Risk & Exposure Summary
      const riskSummary = [
        ["RISK & EXPOSURE SUMMARY"],
        [],
        ["Metric", "Value"],
        ["Portfolio Beta", "N/A"],
        ["Volatility", "N/A"],
        ["Sharpe Ratio", "N/A"],
        ["Alpha", "N/A"],
        []
      ];

      // SECTION 6: Sector Exposure
      const sectorMap = {};
      holdings.forEach(h => {
        const sector = h.sector || "Unknown";
        const value = h.total_value || 0;
        sectorMap[sector] = (sectorMap[sector] || 0) + value;
      });

      const sectorExposure = [
        ["SECTOR EXPOSURE"],
        [],
        ["Sector", "Exposure %"]
      ];

      Object.entries(sectorMap).forEach(([sector, value]) => {
        const exposure = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;
        sectorExposure.push([sector, exposure.toFixed(2)]);
      });
      sectorExposure.push([]);

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Combine all sections
      const allData = [
        ...snapshot,
        ...executiveSummary,
        ...holdingsBreakdown,
        ...plAnalysis,
        ...riskSummary,
        ...sectorExposure
      ];

      const ws = XLSX.utils.aoa_to_sheet(allData);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Portfolio Report");

      // Generate filename
      const fileName = `Portfolio_Intelligence_${portfolio.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      // Create report record
      try {
        await base44.entities.GeneratedReport.create({
          document_name: fileName,
          report_type: "Portfolio Holdings & Performance Intelligence Report",
          client_id: client?.id,
          portfolio_id: portfolio.id,
          status: "final",
          generated_by: advisorName
        });
      } catch (err) {
        console.error("Failed to save report record:", err);
      }

      toast.success("Portfolio Intelligence Report generated successfully");
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error(error.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateReport}
      disabled={generating || !portfolio}
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Portfolio Intelligence Report (Excel)
        </>
      )}
    </Button>
  );
}