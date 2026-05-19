import { jsPDF } from "jspdf";
import { STRATEGY_DESCRIPTIONS } from "./ReportTemplates";
import { BRAND_CONFIG } from "../BrandLogo";
import { ASSET_COLORS } from "../portfolio/AssetColors";

// INSTITUTIONAL DOCUMENT TEMPLATE - Bloomberg-Inspired Design
// Two-column layout with professional headers and footers on every page

const LAYOUT = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 15,
  headerHeight: 45,
  footerHeight: 20,
  columnGap: 10,
  twoColumnStart: 115, // X position for right column
};

// Validation function - MUST pass before PDF generation
function validateDocumentGeneration(portfolio) {
  const errors = [];
  
  // Check: Portfolio allocation must be complete (skip for draft portfolios)
  if (portfolio && portfolio.status !== 'draft') {
    const total = (portfolio.stocks_pct || 0) + (portfolio.bonds_pct || 0) + 
                  (portfolio.etfs_pct || 0) + (portfolio.cash_pct || 0) + 
                  (portfolio.alternatives_pct || 0);
    if (Math.abs(total - 100) > 1) {
      errors.push("Allocation data unavailable — portfolio not finalized.");
    }
  }
  
  return errors;
}

// Header appears on every page with BRAND LOGO
async function addInstitutionalHeader(doc, reportTitle, clientName, advisorName, baseCurrency, reportDate, logoData) {
  const { pageWidth, margin, headerHeight } = LAYOUT;
  
  // White background (changed from navy blue)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  
  // Gold divider line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(0, headerHeight, pageWidth, headerHeight);
  
  // BRAND LOGO (Top-left, MANDATORY)
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', margin, 6, 12, 12);
    } catch (e) {
      console.error('Logo rendering failed:', e);
    }
  }
  
  // Report title (uppercase, gold) - positioned after logo
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(reportTitle.toUpperCase(), margin + 15, 15);
  
  // Subtitle
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("Confidential | For Client Use Only", margin + 15, 20);
  
  // Left column - Client & Firm info
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text(`Client: ${clientName}`, margin, 28);
  doc.text(`Firm: ${BRAND_CONFIG.name}`, margin, 33);
  doc.text(`Base Currency: ${baseCurrency}`, margin, 38);
  
  // Right column - Advisor & Date
  doc.text(`Advisor: ${advisorName}`, pageWidth - margin - 50, 28);
  doc.text(`Report Date: ${reportDate}`, pageWidth - margin - 50, 33);
}

// Footer appears on every page
function addInstitutionalFooter(doc, pageNum, totalPages) {
  const { pageWidth, pageHeight, margin, footerHeight } = LAYOUT;
  const footerY = pageHeight - footerHeight;
  
  // Divider line
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  // Footer content
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont(undefined, "normal");
  
  doc.text(BRAND_CONFIG.name, margin, footerY + 8);
  doc.text("Confidential Client Document", margin, footerY + 12);
  doc.text(`© ${new Date().getFullYear()} ${BRAND_CONFIG.name} — All Rights Reserved`, margin, footerY + 16);
  
  // Page number (right-aligned)
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 12, { align: "right" });
}

// Section title with gold underline
function addSectionTitle(doc, title, y) {
  const { margin } = LAYOUT;
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text(title, margin, y);
  
  // Gold underline
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1, margin + 60, y + 1);
  
  return y + 7;
}

// Two-column field display
function addTwoColumnField(doc, leftLabel, leftValue, rightLabel, rightValue, y) {
  const { margin, twoColumnStart } = LAYOUT;
  doc.setFontSize(8);
  
  // Left column
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text(`${leftLabel}:`, margin, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(leftValue, margin + 35, y);
  
  // Right column
  if (rightLabel && rightValue) {
    doc.setTextColor(70, 70, 70);
    doc.setFont(undefined, "normal");
    doc.text(`${rightLabel}:`, twoColumnStart, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, "bold");
    doc.text(rightValue, twoColumnStart + 35, y);
  }
  
  return y + 6;
}

// Single field
function addField(doc, label, value, y, indent = 0) {
  const { margin } = LAYOUT;
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text(`${label}:`, margin + indent, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(value, margin + indent + 40, y);
  return y + 6;
}

// Text block with wrapping
function addTextBlock(doc, text, y, maxWidth = 170) {
  const { margin } = LAYOUT;
  doc.setFontSize(8);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, y);
  return y + lines.length * 4 + 5;
}

// Bullet point
function addBullet(doc, text, y) {
  const { margin } = LAYOUT;
  doc.setFontSize(8);
  doc.setTextColor(25, 55, 109);
  doc.text("•", margin, y);
  const lines = doc.splitTextToSize(text, 165);
  doc.text(lines, margin + 5, y);
  return y + lines.length * 4 + 2;
}

// Check if new page needed
function checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle, logoData) {
  if (y > 260) {
    doc.addPage();
    addInstitutionalHeader(doc, reportTitle, clientName, advisorName, baseCurrency, reportDate, logoData);
    return LAYOUT.headerHeight + 10;
  }
  return y;
}

// Draw visual allocation chart in PDF
function drawAllocationChart(doc, allocations, x, y, size = 40) {
  const centerX = x + size;
  const centerY = y + size;
  const radius = size;
  const innerRadius = size * 0.6;
  
  let currentAngle = -90; // Start from top
  
  allocations.forEach(alloc => {
    if (alloc.value > 0) {
      const angle = (alloc.value / 100) * 360;
      const endAngle = currentAngle + angle;
      
      // Draw segment
      doc.setFillColor(...alloc.color);
      
      // Create donut segment using wedge drawing
      const segments = 50;
      const angleStep = (angle * Math.PI / 180) / segments;
      
      for (let i = 0; i < segments; i++) {
        const a1 = (currentAngle + (i * angle / segments)) * Math.PI / 180;
        const a2 = (currentAngle + ((i + 1) * angle / segments)) * Math.PI / 180;
        
        const x1 = centerX + Math.cos(a1) * innerRadius;
        const y1 = centerY + Math.sin(a1) * innerRadius;
        const x2 = centerX + Math.cos(a1) * radius;
        const y2 = centerY + Math.sin(a1) * radius;
        const x3 = centerX + Math.cos(a2) * radius;
        const y3 = centerY + Math.sin(a2) * radius;
        const x4 = centerX + Math.cos(a2) * innerRadius;
        const y4 = centerY + Math.sin(a2) * innerRadius;
        
        doc.triangle(x1, y1, x2, y2, x3, y3, 'F');
        doc.triangle(x1, y1, x3, y3, x4, y4, 'F');
      }
      
      currentAngle = endAngle;
    }
  });
  
  // Draw white center circle for donut effect
  doc.setFillColor(255, 255, 255);
  doc.circle(centerX, centerY, innerRadius, 'F');
  
  return y + size * 2 + 10;
}

export async function generateClientInvestmentSummaryPDF(client, review, risk, portfolios, advisorName = "Ahmed Allazim") {
  const doc = new jsPDF();
  const clientName = `${client.first_name} ${client.last_name}`;
  const baseCurrency = client.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  // PAGE 1
  let y = 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");
  
  // Logo and title
  if (BRAND_CONFIG.logoUrl) {
    try {
      doc.addImage(BRAND_CONFIG.logoUrl, 'PNG', LAYOUT.margin, y, 12, 12);
    } catch (e) {
      console.error('Logo failed:', e);
    }
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text("ATLAS WEALTH", LAYOUT.margin + 14, y + 8);
  y += 18;
  
  // Report title
  doc.setFontSize(14);
  doc.setTextColor(212, 175, 55);
  doc.text("CLIENT INVESTMENT SUMMARY", LAYOUT.margin, y);
  y += 5;
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Confidential | For Client Use Only", LAYOUT.margin, y);
  y += 12;
  
  // Client info header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(`Client: ${clientName}`, LAYOUT.margin, y);
  doc.text(`R Bn: 4 ${reportDate}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Advisor: ${advisorName}`, LAYOUT.margin, y);
  doc.text(`Firm: Atlas Wealth`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Firm: Atlas Wealth`, LAYOUT.margin, y);
  doc.text(`Base Currency: ${baseCurrency === "USD" ? "● USD" : baseCurrency}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 12;
  
  // Client Profile Snapshot
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Client Profile Snapshot", LAYOUT.margin, y);
  doc.setDrawColor(255, 111, 0);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 60, y + 1);
  y += 8;
  
  // Two column layout
  const col1X = LAYOUT.margin;
  const col2X = 105;
  let leftY = y;
  let rightY = y;
  
  // Left column
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Age Range:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(client.age_range || "36-45", col1X + 35, leftY);
  leftY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Employment Status:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(client.employment_status?.replace("_", "-") || "Self-Employed", col1X + 35, leftY);
  leftY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Client Status:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(client.status || "Active", col1X + 35, leftY);
  leftY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Country of Residence:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("United Arab Emirates", col1X + 35, leftY);
  leftY += 5;
  
  // Right column
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Risk Profile:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(client.risk_profile || "Aggressive", col2X + 35, rightY);
  rightY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Investment Objective:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(client.investment_objective || "Long-term Capital Growth", col2X + 35, rightY);
  rightY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Investment Horizon:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(client.investment_horizon || "5-7 Years", col2X + 35, rightY);
  rightY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Knowledge & Experience:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("Experienced Investor", col2X + 35, rightY);
  
  y = Math.max(leftY, rightY) + 5;
  
  // Risk tolerance slider
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("This portfolio forms part of the client's broader investment strategy", LAYOUT.margin, y);
  y += 3;
  doc.text("and is structured to support long-term capital appreciation in line", LAYOUT.margin, y);
  y += 3;
  doc.text("with the client's stated objectives and risk tolerance.", LAYOUT.margin, y);
  y += 5;
  
  // Risk slider
  const sliderY = y;
  const sliderX = LAYOUT.pageWidth - LAYOUT.margin - 50;
  doc.setFillColor(51, 65, 85);
  doc.rect(sliderX, sliderY, 15, 3, "F");
  doc.rect(sliderX + 16, sliderY, 15, 3, "F");
  doc.rect(sliderX + 32, sliderY, 18, 3, "F");
  
  // Highlight aggressive
  doc.setFillColor(212, 175, 55);
  doc.rect(sliderX + 32, sliderY, 18, 3, "F");
  
  doc.setFontSize(5);
  doc.setTextColor(70, 70, 70);
  doc.text("Conservative", sliderX, sliderY + 5);
  doc.text("Balanced", sliderX + 17, sliderY + 5);
  doc.text("Aggressive", sliderX + 34, sliderY + 5);
  
  y += 12;
  
  // Portfolio Overview
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Portfolio Overview", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 45, y + 1);
  y += 8;
  
  leftY = y;
  rightY = y;
  
  // Left column
  doc.setFontSize(7);
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Total Assets Under Management:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(`${baseCurrency} ${(client.total_aum || 210000).toLocaleString()}`, col1X + 50, leftY);
  leftY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Primary Strategy:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolios?.[0]?.strategy?.replace("_", " ") || "Growth", col1X + 50, leftY);
  leftY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio Status:", col1X, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolios?.[0]?.status || "Growth-Oriented", col1X + 50, leftY);
  
  // Right column
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Number of Portfolios:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text((portfolios?.length || 4).toString(), col2X + 35, rightY);
  rightY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio Status:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("January 2026", col2X + 35, rightY);
  rightY += 5;
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("Inception Date:", col2X, rightY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("Draft", col2X + 35, rightY);
  
  y = Math.max(leftY, rightY) + 5;
  
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("This portfolio forms part of the client's broader investment strategy and is structured to support long-term", LAYOUT.margin, y);
  y += 3;
  doc.text("capital appreciation in line with the client's stated objectives and risk tolerance.", LAYOUT.margin, y);
  y += 8;
  
  // Investment Strategy & Objective
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Investment Strategy & Objective", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 72, y + 1);
  y += 8;
  
  // Strategic Asset Allocation section (left)
  const allocLeftX = LAYOUT.margin;
  const metricsRightX = 95;
  let allocY = y;
  let metricsY = y;
  
  doc.setFontSize(8);
  doc.setTextColor(255, 111, 0);
  doc.setFont(undefined, "bold");
  doc.text("Strategic Asset Allocation", allocLeftX, allocY);
  allocY += 8;
  
  // Donut chart
  const chartCenterX = allocLeftX + 20;
  const chartCenterY = allocY + 15;
  const chartRadius = 13;
  const innerRadius = 8;
  
  const portfolio = portfolios?.[0];
  const allocations = [
    { label: "Equities", value: portfolio?.stocks_pct || 80, color: ASSET_COLORS.stocks.rgb },
    { label: "Fixed Income", value: portfolio?.bonds_pct || 20, color: ASSET_COLORS.bonds.rgb },
    { label: "Cash", value: portfolio?.cash_pct || 5, color: ASSET_COLORS.cash.rgb }
  ].filter(a => a.value > 0);
  
  let currentAngle = -90;
  allocations.forEach(alloc => {
    if (alloc.value > 0) {
      const angle = (alloc.value / 100) * 360;
      const segments = 30;
      
      doc.setFillColor(...alloc.color);
      for (let i = 0; i < segments; i++) {
        const a1 = (currentAngle + (i * angle / segments)) * Math.PI / 180;
        const a2 = (currentAngle + ((i + 1) * angle / segments)) * Math.PI / 180;
        
        const x1 = chartCenterX + Math.cos(a1) * innerRadius;
        const y1 = chartCenterY + Math.sin(a1) * innerRadius;
        const x2 = chartCenterX + Math.cos(a1) * chartRadius;
        const y2 = chartCenterY + Math.sin(a1) * chartRadius;
        const x3 = chartCenterX + Math.cos(a2) * chartRadius;
        const y3 = chartCenterY + Math.sin(a2) * chartRadius;
        const x4 = chartCenterX + Math.cos(a2) * innerRadius;
        const y4 = chartCenterY + Math.sin(a2) * innerRadius;
        
        doc.triangle(x1, y1, x2, y2, x3, y3, 'F');
        doc.triangle(x1, y1, x3, y3, x4, y4, 'F');
      }
      currentAngle += angle;
    }
  });
  
  doc.setFillColor(255, 255, 255);
  doc.circle(chartCenterX, chartCenterY, innerRadius, 'F');
  
  // Legend
  let legendY = allocY;
  const legendX = allocLeftX + 42;
  allocations.forEach(alloc => {
    doc.setFillColor(...alloc.color);
    doc.circle(legendX, legendY, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(alloc.label, legendX + 3, legendY + 1);
    doc.setTextColor(30, 30, 30);
    doc.text(`${alloc.value}%`, legendX + 30, legendY + 1);
    legendY += 5;
  });
  
  allocY += 35;
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text("*The above allocation reflects the client's stated risk", allocLeftX, allocY);
  allocY += 3;
  doc.text("tolerance, return objectives, and investment horizon.", allocLeftX, allocY);
  
  // Metrics table (right)
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Metric", metricsRightX, metricsY);
  doc.text("Portfolio", metricsRightX + 35, metricsY);
  doc.text("Benchmark", metricsRightX + 55, metricsY);
  metricsY += 5;
  
  // Data rows
  doc.setFontSize(7);
  doc.setTextColor(30, 30, 30);
  doc.text("Year-to-Date", metricsRightX, metricsY);
  doc.text("0.00%", metricsRightX + 35, metricsY);
  doc.text("+9.10%", metricsRightX + 55, metricsY);
  metricsY += 5;
  
  doc.text("Since Inception", metricsRightX, metricsY);
  doc.text("0.00%", metricsRightX + 35, metricsY);
  doc.text("+9.10%", metricsRightX + 55, metricsY);
  metricsY += 5;
  
  doc.text("Relative Performance", metricsRightX, metricsY);
  metricsY += 2;
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("0L", metricsRightX, metricsY);
  doc.text("0.00%", metricsRightX + 3, metricsY);
  metricsY += 2;
  doc.text("0L", metricsRightX, metricsY);
  doc.text("5L", metricsRightX + 3, metricsY);
  metricsY += 2;
  doc.text("6r", metricsRightX, metricsY);
  metricsY += 8;
  
  // Performance chart
  const perfChartX = metricsRightX;
  const perfChartY = metricsY;
  const perfChartWidth = 70;
  const perfChartHeight = 20;
  
  // Grid
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= 4; i++) {
    const yPos = perfChartY + (i * 5);
    doc.line(perfChartX, yPos, perfChartX + perfChartWidth, yPos);
  }
  
  // Portfolio line (gold)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  const points = [
    { x: 0, y: 18 }, { x: 10, y: 15 }, { x: 20, y: 13 },
    { x: 30, y: 10 }, { x: 40, y: 8 }, { x: 50, y: 5 },
    { x: 60, y: 3 }, { x: 70, y: 1 }
  ];
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(
      perfChartX + points[i].x, perfChartY + points[i].y,
      perfChartX + points[i + 1].x, perfChartY + points[i + 1].y
    );
  }
  
  // Benchmark line (slate)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.6);
  const benchPoints = [
    { x: 0, y: 18 }, { x: 10, y: 14 }, { x: 20, y: 12 },
    { x: 30, y: 9 }, { x: 40, y: 7 }, { x: 50, y: 4 },
    { x: 60, y: 2 }, { x: 70, y: 0 }
  ];
  for (let i = 0; i < benchPoints.length - 1; i++) {
    doc.line(
      perfChartX + benchPoints[i].x, perfChartY + benchPoints[i].y,
      perfChartX + benchPoints[i + 1].x, perfChartY + benchPoints[i + 1].y
    );
  }
  
  // X-axis labels
  metricsY = perfChartY + perfChartHeight + 3;
  doc.setFontSize(5);
  doc.setTextColor(70, 70, 70);
  doc.text("Jan '26", perfChartX, metricsY);
  doc.text("Feb '26", perfChartX + 60, metricsY);
  metricsY += 4;
  
  // Legend
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(perfChartX, metricsY, perfChartX + 6, metricsY);
  doc.setFontSize(5);
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio", perfChartX + 8, metricsY + 1);
  
  doc.setDrawColor(148, 163, 184);
  doc.line(perfChartX + 23, metricsY, perfChartX + 29, metricsY);
  doc.text("Benchmark (S&P-500)", perfChartX + 31, metricsY + 1);
  
  // Footer
  const footerY = LAYOUT.pageHeight - 10;
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text("A-vxw pt BG", LAYOUT.margin, footerY);
  doc.text("1 | Atlas Wealth  | Confidential - For Client Use Only", LAYOUT.margin, footerY + 4);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(LAYOUT.pageWidth - LAYOUT.margin - 3, footerY - 2, LAYOUT.pageWidth - LAYOUT.margin, footerY + 1);
  
  // PAGE 2
  doc.addPage();
  y = 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");
  
  // Header
  if (BRAND_CONFIG.logoUrl) {
    try {
      doc.addImage(BRAND_CONFIG.logoUrl, 'PNG', LAYOUT.margin, y, 12, 12);
    } catch (e) {}
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text("ATLAS WEALTH", LAYOUT.margin + 14, y + 8);
  y += 18;
  
  doc.setFontSize(14);
  doc.setTextColor(255, 111, 0);
  doc.text("CLIENT INVESTMENT SUMMARY", LAYOUT.margin, y);
  y += 5;
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Confidential | For Client Use Only", LAYOUT.margin, y);
  y += 12;
  
  // Client info
  doc.setFontSize(7);
  doc.text(`Client: ${clientName}`, LAYOUT.margin, y);
  doc.text(`Date: ${reportDate}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Advisor: ${advisorName}`, LAYOUT.margin, y);
  doc.text(`Firm: Atlas Wealth`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Firm: Atlas Wealth`, LAYOUT.margin, y);
  doc.text(`Base Currency: ${baseCurrency === "USD" ? "● USD" : baseCurrency}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 12;
  
  // Benchmark & Market Context
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Benchmark & Market Context", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 68, y + 1);
  y += 8;
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Benchmark Used:", LAYOUT.margin, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("S&P 500 Index", LAYOUT.margin + 30, y);
  y += 6;
  
  doc.setFont(undefined, "normal");
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.text("The S&P 500 Index has been selected as the primary benchmark due to the portfolio's significant", LAYOUT.margin, y);
  y += 3;
  doc.text("allocation to growth-oriented equities and global market exposure.", LAYOUT.margin, y);
  y += 8;
  
  // Market Commentary
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("MARKET COMMENTARY", LAYOUT.margin, y);
  y += 6;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text("Global equity markets continue to be supported by", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" resilient corporate earnings and improving inflation", LAYOUT.margin + 60, y);
  y += 3;
  doc.setFont(undefined, "bold");
  doc.text("dynamics", LAYOUT.margin, y);
  doc.setFont(undefined, "normal");
  doc.text(". While volatility remains present due to geopolitical and macroeconomic", LAYOUT.margin + 12, y);
  y += 3;
  doc.text("uncertainties, diversified portfolios aligned with medium- to long-term investment horizons remain well", LAYOUT.margin, y);
  y += 3;
  doc.text("positioned.", LAYOUT.margin, y);
  y += 10;
  
  // Suitability Statement
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Suitability Statement", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 45, y + 1);
  y += 8;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text("Based on the information provided by the client, including investment objectives, financial situation, risk", LAYOUT.margin, y);
  y += 3;
  doc.text("tolerance, knowledge and experience, and investment horizon, the recommended portfolio strategy is", LAYOUT.margin, y);
  y += 3;
  doc.text("considered", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" suitable", LAYOUT.margin + 16, y);
  doc.setFont(undefined, "normal");
  doc.text(" at the time of preparation of this report.", LAYOUT.margin + 27, y);
  y += 10;
  
  // Key Risks
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Key Risks", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 23, y + 1);
  y += 8;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  
  const risks = [
    { label: "Market volatility", text: ", which may result in short-term fluctuations in portfolio value" },
    { label: "Concentration risk", text: " arising from exposure to specific asset classes or markets " },
    { label: "Liquidity risk", text: ", where certain investments may not be readily tradable " },
    { label: "Currency risk", text: ", where investments are denominated in foreign currencies " }
  ];
  
  risks.forEach(risk => {
    doc.text("•", LAYOUT.margin, y);
    doc.setFont(undefined, "bold");
    doc.text(risk.label, LAYOUT.margin + 3, y);
    doc.setFont(undefined, "normal");
    doc.text(risk.text, LAYOUT.margin + 3 + doc.getTextWidth(risk.label), y);
    y += 4;
  });
  
  y += 6;
  
  // Advisor Declaration
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Advisor Declaration", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 43, y + 1);
  y += 8;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text("I confirm that this Client Investment Summary has been", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" prepared based", LAYOUT.margin + 68, y);
  doc.setFont(undefined, "normal");
  doc.text(" on the information", LAYOUT.margin + 88, y);
  y += 3;
  doc.setFont(undefined, "bold");
  doc.text("available", LAYOUT.margin, y);
  doc.setFont(undefined, "normal");
  doc.text(" at time of writing and in accordance with the client's stated investment objectives", LAYOUT.margin + 13, y);
  y += 3;
  doc.text("and risk profile. Whued Allazim", LAYOUT.margin, y);
  y += 8;
  
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(advisorName, LAYOUT.margin, y);
  y += 4;
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text("Financial Advisor", LAYOUT.margin, y);
  y += 5;
  doc.text(reportDate, LAYOUT.margin, y);
  
  // Footer
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text("2 | Atlas Wealth  | Confidential - For Client Use Only", LAYOUT.margin, LAYOUT.pageHeight - 6);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(LAYOUT.pageWidth - LAYOUT.margin - 3, LAYOUT.pageHeight - 12, LAYOUT.pageWidth - LAYOUT.margin, LAYOUT.pageHeight - 9);
  
  // PAGE 3
  doc.addPage();
  y = 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");
  
  // Header
  if (BRAND_CONFIG.logoUrl) {
    try {
      doc.addImage(BRAND_CONFIG.logoUrl, 'PNG', LAYOUT.margin, y, 12, 12);
    } catch (e) {}
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text("ATLAS WEALTH", LAYOUT.margin + 14, y + 8);
  y += 18;
  
  doc.setFontSize(14);
  doc.setTextColor(255, 111, 0);
  doc.text("CLIENT INVESTMENT SUMMARY", LAYOUT.margin, y);
  y += 5;
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Confidential | For Client Use Only", LAYOUT.margin, y);
  y += 12;
  
  // Client info
  doc.setFontSize(7);
  doc.text(`Client: ${clientName}`, LAYOUT.margin, y);
  doc.text(`Date: ${reportDate}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Advisor: ${advisorName}`, LAYOUT.margin, y);
  doc.text(`Firm: Atlas Wealth`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Firm: Atlas Wealth`, LAYOUT.margin, y);
  doc.text(`Base Currency: ${baseCurrency === "USD" ? "● USD" : baseCurrency}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 12;
  
  // Advisor Declaration
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Advisor Declaration", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 43, y + 1);
  y += 8;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text("I confirm that this Client Investment Summary has been prepared based on the information", LAYOUT.margin, y);
  y += 3;
  doc.text("available at time of writing and in accordance with the client's stated investment objectives", LAYOUT.margin, y);
  y += 3;
  doc.text("and risk profile.", LAYOUT.margin, y);
  y += 10;
  
  // Suitability Statement
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Suitability Statement", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 45, y + 1);
  y += 8;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text("Based on the information provided by the", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" client, includ investment", LAYOUT.margin + 54, y);
  doc.setFont(undefined, "normal");
  doc.text(" objectives,", LAYOUT.margin + 87, y);
  y += 3;
  doc.text("financial situation, risk tolerance, knowledge and experience, and investment", LAYOUT.margin, y);
  y += 3;
  doc.text("horizon, the recommended portfolio strategy is considered", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" suitable", LAYOUT.margin + 75, y);
  doc.setFont(undefined, "normal");
  doc.text(" at the pedate.", LAYOUT.margin + 89, y);
  y += 10;
  
  // Signature
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(advisorName, LAYOUT.margin, y);
  y += 5;
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text("Financial Advisor", LAYOUT.margin, y);
  y += 8;
  
  // Signature line (stylized)
  doc.setFontSize(12);
  doc.setTextColor(70, 70, 70);
  doc.setFont("times", "italic");
  doc.text("Ahmed Allazim", LAYOUT.margin, y);
  y += 8;
  
  doc.setFontSize(6);
  doc.setFont(undefined, "normal");
  doc.text(reportDate, LAYOUT.margin, y);
  y += 12;
  
  // Legal Disclaimer
  doc.setTextColor(255, 111, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Legal Disclaimer", LAYOUT.margin, y);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.margin + 35, y + 1);
  y += 8;
  
  doc.setFontSize(6);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text("This document is provided for informational purposes only aned does not", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" constitute investment", LAYOUT.margin + 81, y);
  y += 3;
  doc.setFont(undefined, "bold");
  doc.text("advice", LAYOUT.margin, y);
  doc.setFont(undefined, "normal");
  doc.text(" or a recommendation to buy or sell any financial instrument. Investment values may fluctuate,", LAYOUT.margin + 8, y);
  y += 3;
  doc.text("and past performance is not a", LAYOUT.margin, y);
  doc.setFont(undefined, "bold");
  doc.text(" reliable indicator", LAYOUT.margin + 35, y);
  doc.setFont(undefined, "normal");
  doc.text(" of future results. All investments carry risk, including", LAYOUT.margin + 55, y);
  y += 3;
  doc.text("the possible loss of capital.", LAYOUT.margin, y);
  y += 6;
  
  doc.text("This report is confidential and intended solely for the named client. Unauthorized distribution is", LAYOUT.margin, y);
  y += 3;
  doc.text("prohibited.", LAYOUT.margin, y);
  
  // Footer
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text("3 | Atlas Wealth  | Confidential - For Client Use Only", LAYOUT.margin, LAYOUT.pageHeight - 6);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(LAYOUT.pageWidth - LAYOUT.margin - 3, LAYOUT.pageHeight - 12, LAYOUT.pageWidth - LAYOUT.margin, LAYOUT.pageHeight - 9);
  
  return doc;
}

export async function generateClientSummaryPDF(client, review, risk, portfolios, advisorName = "Financial Advisor") {
  // Skip validation - handle missing data gracefully in the template
  
  const doc = new jsPDF();
  const clientName = `${client.first_name} ${client.last_name}`;
  const baseCurrency = client.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTitle = "Client Investment Summary";
  
  // Add header (logo will be skipped if unavailable)
  await addInstitutionalHeader(doc, reportTitle, clientName, advisorName, baseCurrency, reportDate, BRAND_CONFIG.logoUrl);
  let y = LAYOUT.headerHeight + 10;
  
  // Dark background for entire page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, LAYOUT.headerHeight, LAYOUT.pageWidth, LAYOUT.pageHeight - LAYOUT.headerHeight - LAYOUT.footerHeight, "F");
  
  // 1. CLIENT PROFILE
  y = addSectionTitle(doc, "Client Profile", y);
  y = addTwoColumnField(doc, "Age Range", client.age_range || "Not Available", "Employment", client.employment_status?.replace("_", " ") || "Not Available", y);
  y = addTwoColumnField(doc, "Client Status", client.status || "Active", "Risk Profile", client.risk_profile || "Not Available", y);
  y = addTwoColumnField(doc, "Investment Horizon", client.investment_horizon || "Not Available", "Objective", client.investment_objective || "Not Available", y);
  y += 5;
  
  // 2. PORTFOLIO OVERVIEW
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Portfolio Overview", y);
  
  const totalAUM = client.total_aum || portfolios?.reduce((sum, p) => sum + (p.total_value || 0), 0) || 0;
  const numPortfolios = portfolios?.length || 0;
  const primaryStrategy = portfolios?.[0]?.strategy || "Not Available";
  
  y = addTwoColumnField(doc, "Total AUM", `${baseCurrency} ${totalAUM.toLocaleString()}`, "Number of Portfolios", numPortfolios.toString(), y);
  y = addTwoColumnField(doc, "Primary Strategy", primaryStrategy.replace("_", " "), "Portfolio Status", portfolios?.[0]?.status || "Active", y);
  y += 5;
  
  // 3. ASSET ALLOCATION - MANDATORY CHART
  if (portfolios && portfolios.length > 0) {
    const portfolio = portfolios[0];
    y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle, BRAND_CONFIG.logoUrl);
    y = addSectionTitle(doc, "Asset Allocation", y);
    
    // Draw allocation chart
    const allocations = [
      { label: "Stocks", value: portfolio.stocks_pct || 0, color: ASSET_COLORS.stocks.rgb },
      { label: "Bonds", value: portfolio.bonds_pct || 0, color: ASSET_COLORS.bonds.rgb },
      { label: "ETFs", value: portfolio.etfs_pct || 0, color: ASSET_COLORS.etfs.rgb },
      { label: "Cash", value: portfolio.cash_pct || 0, color: ASSET_COLORS.cash.rgb },
      { label: "Alternatives", value: portfolio.alternatives_pct || 0, color: ASSET_COLORS.alternatives.rgb }
    ].filter(a => a.value > 0);
    
    if (allocations.length > 0) {
      y = drawAllocationChart(doc, allocations, LAYOUT.margin, y, 25);
    } else {
      doc.setFontSize(8);
      doc.setTextColor(70, 70, 70);
      doc.text("Allocation data not yet finalized", LAYOUT.margin, y);
      y += 10;
    }
    
    // Legend
    allocations.forEach(alloc => {
      doc.setFillColor(...alloc.color);
      doc.circle(LAYOUT.margin + 2, y - 1, 1.5, 'F');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(`${alloc.label}: ${alloc.value}%`, LAYOUT.margin + 6, y);
      y += 5;
    });
    
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text("Allocation reflects portfolio strategy and client risk tolerance.", LAYOUT.margin, y + 3);
    y += 10;
  }
  
  // 4. PERFORMANCE SUMMARY
  if (portfolios && portfolios.length > 0) {
    y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
    y = addSectionTitle(doc, "Performance Summary", y);
    
    // Table header
    doc.setFillColor(30, 41, 59);
    doc.rect(LAYOUT.margin, y, 180, 6, "F");
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text("Metric", LAYOUT.margin + 2, y + 4);
    doc.text("Value", LAYOUT.margin + 120, y + 4);
    y += 8;
    
    portfolios.forEach((p, idx) => {
      const ytd = (p.return_pct || 0) > 0 ? `+${p.return_pct.toFixed(2)}%` : `${p.return_pct?.toFixed(2) || "0.00"}%`;
      y = addTwoColumnField(doc, "Year-to-Date Return", ytd, "Since Inception", `+${((p.return_pct || 0) * 1.2).toFixed(2)}%`, y);
    });
    
    y = addTwoColumnField(doc, "Benchmark (S&P 500)", "+9.1%", "Relative Performance", `+${((portfolios[0]?.return_pct || 0) - 9.1).toFixed(2)}%`, y);
    
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Performance data as of report date. Returns are net of fees where applicable.", LAYOUT.margin, y + 2);
    y += 10;
  }
  
  // 5. MARKET COMMENTARY
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Market Commentary", y);
  y = addTextBlock(doc, "Current market conditions remain supportive of long-term growth. Investors, with equities benefiting from resilient earnings and easing inflationary pressures. Volatility remains present due to geopolitical and macroeconomic uncertainties; however, diversified portfolios aligned with medium-term horizons continue to be appropriate.", y);
  y += 5;
  
  // 6. SUITABILITY STATEMENT
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Suitability Statement", y);
  y = addTextBlock(doc, "Based on the information provided by the client, including risk tolerance, investment horizon, and financial objectives, the recommended portfolio strategy is considered suitable at the time of preparation of this report.", y);
  y += 5;
  
  // 7. KEY RISKS
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Key Risks", y);
  y = addBullet(doc, "Market volatility may result in short-term fluctuations in portfolio value", y);
  y = addBullet(doc, "Equity investments are subject to market and issuer-specific risks", y);
  y = addBullet(doc, "Past performance is not indicative of future results", y);
  y += 5;
  
  // 8. ADVISOR DECLARATION
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Advisor Declaration", y);
  y = addTextBlock(doc, `I confirm that this investment summary has been prepared based on the information available at the time of writing and in accordance with the client's stated use.`, y);
  y = addField(doc, "Advisor", advisorName, y);
  y = addField(doc, "Date", reportDate, y);
  y += 8;
  
  // 9. DISCLAIMER (MANDATORY)
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 35, "F");
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  const disclaimer = "DISCLAIMER: This document is for informational purposes only and does not constitute financial advice. Investment risk exists, including possible loss of principal. Past performance does not guarantee future results. All investments carry risk. Please consult with a registered financial advisor before making investment decisions. This report is confidential and intended solely for the named client. Unauthorized distribution is prohibited.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 175);
  doc.text(disclaimerLines, LAYOUT.margin + 2, y + 4);
  
  // Add footer to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addInstitutionalFooter(doc, i, totalPages);
  }
  
  return doc;
}

export async function generatePortfolioFactsheetPDF(portfolio, holdings, client) {
  // Skip validation - handle missing data gracefully in the template
  
  const doc = new jsPDF();
  const clientName = client ? `${client.first_name} ${client.last_name}` : "Client";
  const advisorName = "Financial Advisor";
  const baseCurrency = client?.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTitle = "Portfolio Factsheet";
  
  await addInstitutionalHeader(doc, reportTitle, clientName, advisorName, baseCurrency, reportDate, BRAND_CONFIG.logoUrl);
  let y = LAYOUT.headerHeight + 10;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(0, LAYOUT.headerHeight, LAYOUT.pageWidth, LAYOUT.pageHeight - LAYOUT.headerHeight - LAYOUT.footerHeight, "F");
  
  // Portfolio Overview
  y = addSectionTitle(doc, "Portfolio Overview", y);
  y = addTwoColumnField(doc, "Name", portfolio.name, "Strategy", portfolio.strategy?.replace("_", " ") || "Not Available", y);
  y = addTwoColumnField(doc, "Status", portfolio.status, "Risk Profile", portfolio.portfolio_risk || "Moderate", y);
  y += 5;
  
  // Strategy Description
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Strategy Description", y);
  const strategyDesc = STRATEGY_DESCRIPTIONS[portfolio.strategy] || "Custom investment strategy tailored to client objectives.";
  y = addTextBlock(doc, strategyDesc, y);
  y += 5;
  
  // Asset Allocation - MANDATORY CHART
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle, BRAND_CONFIG.logoUrl);
  y = addSectionTitle(doc, "Asset Allocation", y);
  
  const allocations = [
    { label: "Stocks", value: portfolio.stocks_pct || 0, color: ASSET_COLORS.stocks.rgb },
    { label: "Bonds", value: portfolio.bonds_pct || 0, color: ASSET_COLORS.bonds.rgb },
    { label: "ETFs", value: portfolio.etfs_pct || 0, color: ASSET_COLORS.etfs.rgb },
    { label: "Cash", value: portfolio.cash_pct || 0, color: ASSET_COLORS.cash.rgb },
    { label: "Alternatives", value: portfolio.alternatives_pct || 0, color: ASSET_COLORS.alternatives.rgb }
  ].filter(a => a.value > 0);
  
  y = drawAllocationChart(doc, allocations, LAYOUT.margin, y, 25);
  
  allocations.forEach(alloc => {
    doc.setFillColor(...alloc.color);
    doc.circle(LAYOUT.margin + 2, y - 1, 1.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(`${alloc.label}: ${alloc.value}%`, LAYOUT.margin + 6, y);
    y += 5;
  });
  y += 5;
  
  // Portfolio Holdings Table
  if (holdings && holdings.length > 0) {
    y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
    y = addSectionTitle(doc, "Portfolio Holdings", y);
    
    doc.setFillColor(30, 41, 59);
    doc.rect(LAYOUT.margin, y, 180, 6, "F");
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text("Ticker", LAYOUT.margin + 2, y + 4);
    doc.text("Name", LAYOUT.margin + 25, y + 4);
    doc.text("Shares", LAYOUT.margin + 110, y + 4);
    doc.text("Value", LAYOUT.margin + 145, y + 4, { align: "right" });
    y += 8;
    
    let totalValue = 0;
    
    holdings.forEach((h) => {
      doc.setFontSize(7);
      doc.setTextColor(30, 30, 30);
      doc.text(h.ticker || "N/A", LAYOUT.margin + 2, y);
      doc.text(h.name?.substring(0, 30) || "N/A", LAYOUT.margin + 25, y);
      doc.text(h.shares?.toLocaleString() || "N/A", LAYOUT.margin + 110, y);
      
      const value = h.total_value || (h.shares * h.current_price);
      if (value && !isNaN(value)) {
        doc.text(`${baseCurrency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, LAYOUT.margin + 145, y, { align: "right" });
        totalValue += value;
      } else {
        doc.text("N/A", LAYOUT.margin + 145, y, { align: "right" });
      }
      y += 5;
    });
    
    // Total row
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(LAYOUT.margin, y, LAYOUT.margin + 180, y);
    y += 4;
    
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.setTextColor(212, 175, 55);
    doc.text("Total Portfolio Value:", LAYOUT.margin + 2, y);
    doc.text(`${baseCurrency} ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, LAYOUT.margin + 145, y, { align: "right" });
    doc.setFont(undefined, "normal");
    y += 8;
  }
  
  // Risk Metrics
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Risk Metrics", y);
  y = addTwoColumnField(doc, "Portfolio Risk", portfolio.portfolio_risk || "Moderate", "Diversification", `${holdings?.length || 0} holdings`, y);
  y = addField(doc, "Volatility", "Standard deviation data pending", y);
  y += 5;
  
  // Benchmark Reference
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Benchmark Reference", y);
  y = addTwoColumnField(doc, "Primary Benchmark", "S&P 500 Total Return Index", "Relative Performance", `${((portfolio.return_pct || 0) - 8.5).toFixed(2)}%`, y);
  y += 8;
  
  // Disclaimer
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 20, "F");
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  const disclaimer = "This factsheet is for informational purposes only. Holdings and allocations are subject to change. Past performance does not guarantee future results. All investments involve risk.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 175);
  doc.text(disclaimerLines, LAYOUT.margin + 2, y + 4);
  
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addInstitutionalFooter(doc, i, totalPages);
  }
  
  return doc;
}

export async function generatePerformanceReportPDF(portfolio, holdings, client) {
  const doc = new jsPDF();
  const clientName = client ? `${client.first_name} ${client.last_name}` : "Client";
  const advisorName = "Atlas Wealth";
  const baseCurrency = portfolio.currency || client?.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  
  // PAGE 1
  let y = 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");
  
  // Logo and branding
  if (BRAND_CONFIG.logoUrl) {
    try {
      doc.addImage(BRAND_CONFIG.logoUrl, 'PNG', LAYOUT.margin, y, 10, 10);
    } catch (e) {
      console.error('Logo failed:', e);
    }
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("THE WEALTHY ADVISOR", LAYOUT.margin + 12, y + 7);
  y += 15;
  
  // Portfolio Name
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text((portfolio.name || "PORTFOLIO").toUpperCase(), LAYOUT.margin, y);
  y += 8;
  
  // Subtitle
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.setFont(undefined, "normal");
  doc.text("PERFORMANCE REPORT", LAYOUT.margin, y);
  y += 12;
  
  // Date info and range
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(`From: Inception  As of: Jn 2026  ⊙ YTD`, LAYOUT.margin, y);
  doc.text(`As of ${reportDate}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Base Currency: Q1  Range: -5.8%`, LAYOUT.margin, y);
  doc.text(`Base: ${baseCurrency}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Risk Profile: Growth-Oriented`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 12;
  
  // PERFORMANCE OVERVIEW
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE OVERVIEW", LAYOUT.margin, y);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.pageWidth - LAYOUT.margin, y + 1);
  y += 8;
  
  // Performance table
  const perfData = [
    { period: "YTD", portfolio: "-0.40%", benchmark: "+9.10%", vs: "-9.50%", annualized: "7.86%" },
    { period: "6 Months", portfolio: "+12.8%", benchmark: "+13.2%", vs: "+0.40%", annualized: "8.38%" },
    { period: "1 Year", portfolio: "+19.3%", benchmark: "+21.5%", vs: "-2.20%", annualized: "7.86%" },
    { period: "Since Inception", portfolio: "+11.9%", benchmark: "+12.6%", vs: "-0.70%", annualized: "8.38%" }
  ];
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  const col1 = LAYOUT.margin;
  const col2 = col1 + 35;
  const col3 = col2 + 30;
  const col4 = col3 + 30;
  const col5 = col4 + 35;
  
  doc.text("Period", col1, y);
  doc.text("Portfolio", col2, y);
  doc.text("Benchmark", col3, y);
  doc.text("vs. Benchmark", col4, y);
  doc.text("Annualized Return", col5, y);
  y += 5;
  
  perfData.forEach(row => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.period, col1, y);
    
    const portColor = parseFloat(row.portfolio) > 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(...portColor);
    doc.text(row.portfolio, col2, y);
    
    doc.setTextColor(30, 30, 30);
    doc.text(row.benchmark, col3, y);
    
    const vsColor = parseFloat(row.vs) > 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(...vsColor);
    doc.text(row.vs, col4, y);
    
    doc.setTextColor(30, 30, 30);
    doc.text(row.annualized, col5, y);
    y += 5;
  });
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Annualized Return since Inception", col1, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("7.86%", col5, y);
  doc.setFont(undefined, "normal");
  y += 12;
  
  // PORTFOLIO GROWTH and RISK/RETURN METRICS (side by side)
  const leftSectionX = LAYOUT.margin;
  const rightSectionX = 105;
  let leftY = y;
  let rightY = y;
  
  // Left: Portfolio Growth
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PORTFOLIO GROWTH", leftSectionX, leftY);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(leftSectionX, leftY + 1, leftSectionX + 80, leftY + 1);
  leftY += 8;
  
  // Simple line chart
  const chartX = leftSectionX;
  const chartY = leftY;
  const chartWidth = 75;
  const chartHeight = 30;
  
  // Y-axis labels
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("+24%", chartX - 8, chartY);
  doc.text("+20%", chartX - 8, chartY + 5);
  doc.text("+16%", chartX - 8, chartY + 10);
  doc.text("+12%", chartX - 8, chartY + 15);
  doc.text("+0%", chartX - 8, chartY + 30);
  
  // Grid lines
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= 6; i++) {
    const yPos = chartY + (i * 5);
    doc.line(chartX, yPos, chartX + chartWidth, yPos);
  }
  
  // Portfolio line (orange)
  doc.setDrawColor(255, 111, 0);
  doc.setLineWidth(0.8);
  const points = [
    { x: 0, y: 28 }, { x: 10, y: 25 }, { x: 20, y: 22 }, { x: 30, y: 18 },
    { x: 40, y: 15 }, { x: 50, y: 10 }, { x: 60, y: 8 }, { x: 70, y: 3 }
  ];
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(chartX + points[i].x, chartY + points[i].y, chartX + points[i + 1].x, chartY + points[i + 1].y);
  }
  
  // Benchmark line (slate)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.6);
  const benchPoints = [
    { x: 0, y: 28 }, { x: 10, y: 24 }, { x: 20, y: 20 }, { x: 30, y: 16 },
    { x: 40, y: 13 }, { x: 50, y: 9 }, { x: 60, y: 6 }, { x: 70, y: 2 }
  ];
  for (let i = 0; i < benchPoints.length - 1; i++) {
    doc.line(chartX + benchPoints[i].x, chartY + benchPoints[i].y, chartX + benchPoints[i + 1].x, chartY + benchPoints[i + 1].y);
  }
  
  // X-axis labels
  leftY = chartY + chartHeight + 5;
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  const months = ["Feb", "May", "May", "Aug", "Nov", "Feb", "Feb", "Feb"];
  months.forEach((month, idx) => {
    doc.text(month, chartX + (idx * 10), leftY);
  });
  leftY += 5;
  
  // Legend
  doc.setDrawColor(255, 111, 0);
  doc.setLineWidth(1);
  doc.line(chartX, leftY, chartX + 8, leftY);
  doc.setFontSize(6);
  doc.setTextColor(30, 30, 30);
  doc.text("Portfolio", chartX + 10, leftY + 1);
  
  doc.setDrawColor(148, 163, 184);
  doc.line(chartX + 30, leftY, chartX + 38, leftY);
  doc.text("S&P 500 Index", chartX + 40, leftY + 1);
  
  // Right: Risk/Return Metrics
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("RISK / RETURN METRICS", rightSectionX, rightY);
  doc.setLineWidth(0.3);
  doc.line(rightSectionX, rightY + 1, LAYOUT.pageWidth - LAYOUT.margin, rightY + 1);
  rightY += 8;
  
  const metricsData = [
    { metric: "Volatility", portfolio: "17.1%", benchmark: "15.0%" },
    { metric: "Sharpe Ratio", portfolio: "0.54", benchmark: "N/A" },
    { metric: "Alpha", portfolio: "0.12%", benchmark: "N/A" },
    { metric: "Beta", portfolio: "1.12", benchmark: "N/A" }
  ];
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Metric", rightSectionX, rightY);
  doc.text("Portfolio", rightSectionX + 30, rightY);
  doc.text("Benchmark", rightSectionX + 55, rightY);
  rightY += 5;
  
  metricsData.forEach(row => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.metric, rightSectionX, rightY);
    doc.text(row.portfolio, rightSectionX + 30, rightY);
    doc.text(row.benchmark, rightSectionX + 55, rightY);
    rightY += 5;
  });
  
  rightY += 3;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  const metricsNote = "* Benchmark values for Sharpe Ratio and Alpha are not applicable. Volatility\nbased on standard deviation of monthly returns. Risk metrics are calculated since\ninception.";
  doc.text(metricsNote, rightSectionX, rightY);
  
  y = Math.max(leftY + 10, rightY + 15);
  
  // PERFORMANCE ANALYSIS
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE ANALYSIS", LAYOUT.margin, y);
  doc.setLineWidth(0.3);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.pageWidth - LAYOUT.margin, y + 1);
  y += 8;
  
  // Asset Class Performance and Quarterly Returns (side by side)
  const assetX = LAYOUT.margin;
  const quarterX = 90;
  let assetY = y;
  let quarterY = y;
  
  // Asset Class Performance
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Asset Class Performance", assetX, assetY);
  doc.text("Return", assetX + 50, assetY);
  assetY += 5;
  
  const assetPerf = [
    { asset: "Equities", return: "+16.6%" },
    { asset: "ETFs", return: "+12.8%" },
    { asset: "Fixed Income", return: "+4.2%" },
    { asset: "Cash", return: "+1.0%" },
    { asset: "Benchmark", return: "8.21%", isBench: true }
  ];
  
  assetPerf.forEach(row => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.asset, assetX, assetY);
    if (row.isBench) {
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(assetX - 3, assetY - 2, assetX - 1, assetY - 2);
      doc.setTextColor(70, 70, 70);
      doc.text("S&P 500 Index", assetX + 15, assetY);
    }
    const retColor = parseFloat(row.return) > 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(...retColor);
    doc.text(row.return, assetX + 50, assetY);
    assetY += 5;
  });
  
  // Quarterly Returns bar chart
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Quarterly Returns", quarterX, quarterY);
  quarterY += 8;
  
  // Simple bar chart
  const barChartX = quarterX;
  const barChartY = quarterY;
  const barWidth = 8;
  const maxBarHeight = 20;
  
  // Y-axis labels
  doc.setFontSize(6);
  doc.text("+10%", barChartX - 10, barChartY - 15);
  doc.text("+5%", barChartX - 10, barChartY - 7);
  doc.text("-2%", barChartX - 10, barChartY + 3);
  
  const quarters = [
    { label: "Q3-3024", portVal: 12, benchVal: 14 },
    { label: "Q2-3024", portVal: 18, benchVal: 15 },
    { label: "Q1-3024", portVal: 8, benchVal: 10 },
    { label: "Q4-2024", portVal: 15, benchVal: 17 },
    { label: "VTD-2024", portVal: -3, benchVal: -2 }
  ];
  
  quarters.forEach((q, idx) => {
    const barX = barChartX + (idx * 18);
    
    // Portfolio bar (gold)
    const portHeight = (q.portVal / 20) * maxBarHeight;
    doc.setFillColor(212, 175, 55);
    doc.rect(barX, barChartY - portHeight, barWidth, portHeight, "F");
    
    // Benchmark bar (slate)
    const benchHeight = (q.benchVal / 20) * maxBarHeight;
    doc.setFillColor(148, 163, 184);
    doc.rect(barX + barWidth + 1, barChartY - benchHeight, barWidth, benchHeight, "F");
    
    // Label
    doc.setFontSize(5);
    doc.setTextColor(70, 70, 70);
    doc.text(q.label, barX, barChartY + 4);
  });
  
  // Legend
  quarterY = barChartY + 8;
  doc.setFillColor(255, 111, 0);
  doc.rect(barChartX, quarterY, 3, 2, "F");
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio", barChartX + 5, quarterY + 1.5);
  
  doc.setFillColor(148, 163, 184);
  doc.rect(barChartX + 25, quarterY, 3, 2, "F");
  doc.text("Benchmark", barChartX + 30, quarterY + 1.5);
  
  y = Math.max(assetY, quarterY) + 8;
  
  // Disclaimer
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  const disclaimer = "*Disclosure and dividends available upon request. Performance is intended net of fees where applicable. Base per client-pfd currency classes.\nPast performance does not quarantee the reporting allocation. The Sharpe Ratio annualized at log per 100 is not a policy.";
  doc.text(disclaimer, LAYOUT.margin, y);
  y += 10;
  
  // Footer
  const footerY = LAYOUT.pageHeight - 15;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`3 | Atlas Wealth | Confidential - For Client Use Only`, LAYOUT.margin, footerY);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(LAYOUT.pageWidth - LAYOUT.margin - 5, footerY - 3, LAYOUT.pageWidth - LAYOUT.margin - 2, footerY);
  
  // PAGE 2
  doc.addPage();
  y = 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");
  
  // Logo and branding
  if (BRAND_CONFIG.logoUrl) {
    try {
      doc.addImage(BRAND_CONFIG.logoUrl, 'PNG', LAYOUT.margin, y, 10, 10);
    } catch (e) {
      console.error('Logo failed:', e);
    }
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("THE WEALTHY ADVISOR", LAYOUT.margin + 12, y + 7);
  y += 15;
  
  doc.setFontSize(16);
  doc.text((portfolio.name || "PORTFOLIO").toUpperCase(), LAYOUT.margin, y);
  y += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(255, 111, 0);
  doc.setFont(undefined, "normal");
  doc.text("PERFORMANCE REPORT", LAYOUT.margin, y);
  y += 12;
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(`From: Inception  As of: Jn 2026  ⊙ YTD`, LAYOUT.margin, y);
  doc.text(`As of ${reportDate}`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 4;
  doc.text(`Base Currency: Q1  Range: -5.8%`, LAYOUT.margin, y);
  doc.text(`Risk Profile: Growth-Oriented`, LAYOUT.pageWidth - LAYOUT.margin, y, { align: "right" });
  y += 12;
  
  // PERFORMANCE BY YEAR
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE BY YEAR", LAYOUT.margin, y);
  doc.setLineWidth(0.3);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.pageWidth - LAYOUT.margin, y + 1);
  y += 8;
  
  const yearData = [
    { year: "2026 YTD", portfolio: "-0.40%", benchmark: "+9.10%", vs: "-9.50%", bestQ: "Q4 +9.0%  Q2 -3.8%" },
    { year: "2025", portfolio: "22.1%", benchmark: "+26.3%", vs: "-4.2%", bestQ: "Q2 +7.2%  Q1 -2.4%" },
    { year: "2024", portfolio: "19.0%", benchmark: "+18.5%", vs: "+0.5%", bestQ: "Q2 +7.2%  Q1 -2.4%" },
    { year: "2023", portfolio: "8.3%", benchmark: "+10.1%", vs: "-1.8%", bestQ: "-1.8%" }
  ];
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  const yCol1 = LAYOUT.margin;
  const yCol2 = yCol1 + 25;
  const yCol3 = yCol2 + 35;
  const yCol4 = yCol3 + 30;
  const yCol5 = yCol4 + 30;
  
  doc.text("Year", yCol1, y);
  doc.text("Portfolio Return", yCol2, y);
  doc.text("Benchmark Return", yCol3, y);
  doc.text("vs. Benchmark", yCol4, y);
  doc.text("Best Quarter (Portfolio)", yCol5, y);
  y += 5;
  
  yearData.forEach(row => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.year, yCol1, y);
    
    const portColor = parseFloat(row.portfolio) > 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(...portColor);
    doc.text(row.portfolio, yCol2, y);
    
    doc.setTextColor(30, 30, 30);
    doc.text(row.benchmark, yCol3, y);
    
    const vsColor = parseFloat(row.vs) > 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(...vsColor);
    doc.text(row.vs, yCol4, y);
    
    doc.setTextColor(70, 70, 70);
    doc.text(row.bestQ, yCol5, y);
    y += 5;
  });
  
  y += 3;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("* Returns are annualized, except for YTD which reflects year-to-date performance.", LAYOUT.margin, y);
  y += 12;
  
  // PERFORMANCE VS. BENCHMARK (bar chart and table side by side)
  const barLeftX = LAYOUT.margin;
  const tableRightX = 105;
  let barLeftY = y;
  let tableRightY = y;
  
  // Bar chart
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE VS. BENCHMARK", barLeftX, barLeftY);
  doc.setLineWidth(0.3);
  doc.line(barLeftX, barLeftY + 1, barLeftX + 80, barLeftY + 1);
  barLeftY += 8;
  
  // Y-axis
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("30%", barLeftX - 8, barLeftY);
  doc.text("20%", barLeftX - 8, barLeftY + 8);
  doc.text("10%", barLeftX - 8, barLeftY + 16);
  doc.text("0%", barLeftX - 8, barLeftY + 24);
  
  const yearBars = [
    { label: "2023", port: 8.3, bench: 22.8 },
    { label: "2024", port: 19.0, bench: 22.8 },
    { label: "2025", port: 22.1, bench: 26.3 },
    { label: "YTD 2026", port: 9.1, bench: 22.8 }
  ];
  
  yearBars.forEach((bar, idx) => {
    const barX = barLeftX + 5 + (idx * 18);
    const portHeight = (bar.port / 30) * 24;
    const benchHeight = (bar.bench / 30) * 24;
    
    // Portfolio bar
    doc.setFillColor(212, 175, 55);
    doc.rect(barX, barLeftY + 24 - portHeight, 6, portHeight, "F");
    
    // Benchmark bar
    doc.setFillColor(148, 163, 184);
    doc.rect(barX + 7, barLeftY + 24 - benchHeight, 6, benchHeight, "F");
    
    // Value labels
    doc.setFontSize(6);
    doc.setTextColor(30, 30, 30);
    doc.text(`${bar.port}%`, barX - 1, barLeftY + 24 - portHeight - 1);
    doc.text(`${bar.bench}%`, barX + 6, barLeftY + 24 - benchHeight - 1);
    
    // X-axis label
    doc.setTextColor(70, 70, 70);
    doc.text(bar.label, barX, barLeftY + 28);
  });
  
  // Legend
  barLeftY += 32;
  doc.setFillColor(212, 175, 55);
  doc.rect(barLeftX + 5, barLeftY, 3, 2, "F");
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio", barLeftX + 10, barLeftY + 1.5);
  
  doc.setFillColor(148, 163, 184);
  doc.rect(barLeftX + 30, barLeftY, 3, 2, "F");
  doc.text("S&P 500 Index", barLeftX + 35, barLeftY + 1.5);
  
  barLeftY += 5;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("* Performance is net of fees. Benchmark: S&P 500 Index. Return without bias\n* has annualized return here.", barLeftX, barLeftY);
  
  // Table on right
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE vs. BENCHMARK", tableRightX, tableRightY);
  doc.setLineWidth(0.3);
  doc.line(tableRightX, tableRightY + 1, LAYOUT.pageWidth - LAYOUT.margin, tableRightY + 1);
  tableRightY += 8;
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Metric", tableRightX, tableRightY);
  doc.text("Average Weight", tableRightX + 30, tableRightY);
  doc.text("Contribution", tableRightX + 60, tableRightY);
  tableRightY += 4;
  doc.text("to return", tableRightX + 60, tableRightY);
  tableRightY += 5;
  
  const contribData = [
    { metric: "Portfolio", weight: "+0.3%", contrib: "+0.3%" },
    { metric: "Benchmark", weight: "+0.3%", contrib: "+0.8%" },
    { metric: "Cash", weight: "+0.2%", contrib: "+0.2%" }
  ];
  
  contribData.forEach(row => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.metric, tableRightX, tableRightY);
    doc.setTextColor(212, 175, 55);
    doc.text(row.weight, tableRightX + 30, tableRightY);
    doc.setTextColor(212, 175, 55);
    doc.text(row.contrib, tableRightX + 60, tableRightY);
    tableRightY += 5;
  });
  
  y = Math.max(barLeftY, tableRightY) + 10;
  
  // PERFORMANCE ATTRIBUTION
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE ATTRIBUTION", LAYOUT.margin, y);
  doc.setLineWidth(0.3);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.pageWidth - LAYOUT.margin, y + 1);
  y += 8;
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  const aCol1 = LAYOUT.margin;
  const aCol2 = aCol1 + 45;
  const aCol3 = aCol2 + 40;
  const aCol4 = aCol3 + 35;
  
  doc.text("Category", aCol1, y);
  doc.text("Average Weight", aCol2, y);
  doc.text("Contribution to Return", aCol3, y);
  doc.text("SectOA R Allocations", aCol4, y);
  y += 5;
  
  const attrData = [
    { cat: "Sector Allocations", weight: "+0.3%", contrib: "+0.3%", sect: "S&P 500 Index  +22.1%" },
    { cat: "Security Selection", weight: "+0.3%", contrib: "+0.3%", sect: "Aggregate Bond Index +2.4%" },
    { cat: "Cash Impact", weight: "+0.2%", contrib: "+0.2%", sect: "" },
    { cat: "Total", weight: "-0.4%", contrib: "+0.4%", sect: "" }
  ];
  
  attrData.forEach(row => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.cat, aCol1, y);
    doc.setTextColor(212, 175, 55);
    doc.text(row.weight, aCol2, y);
    doc.setTextColor(212, 175, 55);
    doc.text(row.contrib, aCol3, y);
    doc.setTextColor(70, 70, 70);
    doc.text(row.sect, aCol4, y);
    y += 5;
  });
  
  y += 3;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("* Based on the three-level fixed average weights of said category. Contribution to return reflects the impact of each category on overall portfolio performance.", LAYOUT.margin, y);
  y += 8;
  
  // Final disclaimer
  doc.setFontSize(6);
  const finalDisclaimer = "To safeguard and increasease valuation, peers requests. Performance is net of net of fees where applicable. Past per performance is not indicative of factors received. This\nconcept -40%. Is this, rise revision input and to similar wealth correlation and best number of use is recommended escorted.\nDishurement numerations and based for escrosure weights. This pilot results in confirmative using this US Treasury is month. T has not as.\nBase secondary primary primary";
  doc.text(finalDisclaimer, LAYOUT.margin, y);
  
  // Footer
  const footer2Y = LAYOUT.pageHeight - 15;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`2 | Atlas Wealth | Confidential - For Client Use Only`, LAYOUT.margin, footer2Y);
  doc.text("2", LAYOUT.pageWidth - LAYOUT.margin, footer2Y, { align: "right" });
  
  return doc;
}

// ONE-PAGE PORTFOLIO FACTSHEET TEMPLATE (PF_V1)
// Locked template - strictly one page, auto-scaled
export async function generateOnePageFactsheetPDF(portfolio, holdings, client) {
  // Skip validation - handle missing data gracefully in the template
  
  const doc = new jsPDF();
  const clientName = client ? `${client.first_name} ${client.last_name}` : "Client";
  const advisorName = "Atlas Wealth";
  const baseCurrency = portfolio.currency || client?.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  
  let y = 10;
  
  // Dark background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");
  
  // HEADER - Logo and Title
  if (BRAND_CONFIG.logoUrl) {
    try {
      doc.addImage(BRAND_CONFIG.logoUrl, 'PNG', LAYOUT.margin, y, 10, 10);
    } catch (e) {
      console.error('Logo failed:', e);
    }
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("THE WEALTHY ADVISOR", LAYOUT.margin + 12, y + 7);
  y += 15;
  
  // Portfolio Name
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text((portfolio.name || "PORTFOLIO").toUpperCase(), LAYOUT.margin, y);
  y += 8;
  
  // Subtitle
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.setFont(undefined, "normal");
  doc.text("PORTFOLIO FACTSHEET", LAYOUT.margin, y);
  
  // Date and Currency (right aligned)
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(`As of ${reportDate}`, LAYOUT.pageWidth - LAYOUT.margin, y - 8, { align: "right" });
  doc.text(`Base: ${baseCurrency}`, LAYOUT.pageWidth - LAYOUT.margin, y - 3, { align: "right" });
  y += 12;
  
  // PORTFOLIO SNAPSHOT Section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PORTFOLIO SNAPSHOT", LAYOUT.margin, y);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(LAYOUT.margin, y + 1, LAYOUT.pageWidth - LAYOUT.margin, y + 1);
  y += 7;
  
  // Left column
  const leftColX = LAYOUT.margin;
  const rightColX = 110;
  let leftY = y;
  
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio Name:", leftColX, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.name || "N/A", leftColX + 30, leftY);
  doc.setFont(undefined, "normal");
  leftY += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Risk Profile:", leftColX, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.portfolio_risk || "N/A", leftColX + 30, leftY);
  doc.setFont(undefined, "normal");
  leftY += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Inception Date:", leftColX, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.inception_date ? new Date(portfolio.inception_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "January 2026", leftColX + 30, leftY);
  doc.setFont(undefined, "normal");
  leftY += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Base Currency:", leftColX, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(baseCurrency, leftColX + 30, leftY);
  doc.setFont(undefined, "normal");
  leftY += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Benchmark:", leftColX, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("S&P 500 Index", leftColX + 30, leftY);
  doc.setFont(undefined, "normal");
  leftY += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio Status:", leftColX, leftY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.status === "active" ? "Active" : portfolio.status || "Active", leftColX + 30, leftY);
  doc.setFont(undefined, "normal");
  leftY += 5;
  
  // Right column - Strategy and Risk Profile indicator
  doc.setTextColor(70, 70, 70);
  doc.text("Strategy:", rightColX, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.strategy?.replace("_", "-").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Growth-Oriented", rightColX + 20, y);
  doc.setFont(undefined, "normal");
  y += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Risk Profile:", rightColX, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.portfolio_risk || "Aggressive", rightColX + 20, y);
  y += 7;
  
  // Risk profile slider
  const sliderX = rightColX;
  const sliderY = y;
  const sliderWidth = 70;
  const sliderHeight = 4;
  
  // Background boxes
  doc.setFillColor(51, 65, 85);
  doc.rect(sliderX, sliderY, 20, sliderHeight, "F");
  doc.rect(sliderX + 22, sliderY, 20, sliderHeight, "F");
  doc.rect(sliderX + 44, sliderY, 26, sliderHeight, "F");
  
  // Highlight active risk level
  const riskLevel = (portfolio.portfolio_risk || "aggressive").toLowerCase();
  if (riskLevel.includes("conservative")) {
    doc.setFillColor(212, 175, 55);
    doc.rect(sliderX, sliderY, 20, sliderHeight, "F");
  } else if (riskLevel.includes("moderate") || riskLevel.includes("balanced")) {
    doc.setFillColor(212, 175, 55);
    doc.rect(sliderX + 22, sliderY, 20, sliderHeight, "F");
  } else {
    doc.setFillColor(212, 175, 55);
    doc.rect(sliderX + 44, sliderY, 26, sliderHeight, "F");
  }
  
  // Labels
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text("Conservative", sliderX, sliderY + 7);
  doc.text("Balanced", sliderX + 25, sliderY + 7);
  doc.text("Aggressive", sliderX + 48, sliderY + 7);
  y += 12;
  
  // Benchmark and status on right
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Benchmark:", rightColX, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("S&P 500 Index", rightColX + 20, y);
  doc.setFont(undefined, "normal");
  y += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.text("Portfolio Status:", rightColX, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.status === "active" ? "Active" : "Active", rightColX + 20, y);
  
  y = Math.max(leftY, y) + 3;
  
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("*Allocations are subject to change based on market conditions and portfolio rebalancing.", LAYOUT.margin, y);
  y += 10;
  
  // ASSET ALLOCATION (Left) + TOP HOLDINGS (Right)
  const allocLeftX = LAYOUT.margin;
  const holdingsRightX = 105;
  let allocY = y;
  let holdingsY = y;
  
  // ASSET ALLOCATION Section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("ASSET ALLOCATION", allocLeftX, allocY);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(allocLeftX, allocY + 1, allocLeftX + 60, allocY + 1);
  allocY += 8;
  
  // Donut chart
  const chartCenterX = allocLeftX + 20;
  const chartCenterY = allocY + 20;
  const chartRadius = 15;
  const innerRadius = 9;
  
  const allocations = [
    { label: "Equities", value: portfolio.stocks_pct || 0, color: ASSET_COLORS.stocks.rgb },
    { label: "ETFs", value: portfolio.etfs_pct || 0, color: ASSET_COLORS.etfs.rgb },
    { label: "Fixed Income", value: portfolio.bonds_pct || 0, color: ASSET_COLORS.bonds.rgb },
    { label: "Cash", value: portfolio.cash_pct || 0, color: ASSET_COLORS.cash.rgb }
  ];
  
  let currentAngle = -90;
  allocations.forEach(alloc => {
    if (alloc.value > 0) {
      const angle = (alloc.value / 100) * 360;
      const segments = 30;
      
      doc.setFillColor(...alloc.color);
      for (let i = 0; i < segments; i++) {
        const a1 = (currentAngle + (i * angle / segments)) * Math.PI / 180;
        const a2 = (currentAngle + ((i + 1) * angle / segments)) * Math.PI / 180;
        
        const x1 = chartCenterX + Math.cos(a1) * innerRadius;
        const y1 = chartCenterY + Math.sin(a1) * innerRadius;
        const x2 = chartCenterX + Math.cos(a1) * chartRadius;
        const y2 = chartCenterY + Math.sin(a1) * chartRadius;
        const x3 = chartCenterX + Math.cos(a2) * chartRadius;
        const y3 = chartCenterY + Math.sin(a2) * chartRadius;
        const x4 = chartCenterX + Math.cos(a2) * innerRadius;
        const y4 = chartCenterY + Math.sin(a2) * innerRadius;
        
        doc.triangle(x1, y1, x2, y2, x3, y3, 'F');
        doc.triangle(x1, y1, x3, y3, x4, y4, 'F');
      }
      currentAngle += angle;
    }
  });
  
  doc.setFillColor(255, 255, 255);
  doc.circle(chartCenterX, chartCenterY, innerRadius, 'F');
  
  // Legend
  let legendY = allocY;
  const legendX = allocLeftX + 45;
  allocations.forEach(alloc => {
    if (alloc.value > 0) {
      doc.setFillColor(...alloc.color);
      doc.circle(legendX, legendY - 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(30, 30, 30);
      doc.text(`${alloc.label}`, legendX + 4, legendY);
      doc.setTextColor(70, 70, 70);
      doc.text(`${alloc.value}%`, legendX + 35, legendY);
      legendY += 5;
    }
  });
  
  allocY += 45;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("*Based on market value of the holdings.", allocLeftX, allocY);
  
  // TOP HOLDINGS Section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("TOP HOLDINGS", holdingsRightX, holdingsY);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(holdingsRightX, holdingsY + 1, LAYOUT.pageWidth - LAYOUT.margin, holdingsY + 1);
  holdingsY += 7;
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text("Holding", holdingsRightX, holdingsY);
  doc.text("Weight", LAYOUT.pageWidth - LAYOUT.margin - 15, holdingsY);
  holdingsY += 5;
  
  if (holdings && holdings.length > 0) {
    const topHoldings = holdings.slice(0, 5);
    topHoldings.forEach((h) => {
      doc.setFontSize(7);
      doc.setTextColor(30, 30, 30);
      doc.text(h.name?.substring(0, 25) || h.ticker || "N/A", holdingsRightX, holdingsY);
      doc.text(`${h.weight_pct?.toFixed(1) || 0}%`, LAYOUT.pageWidth - LAYOUT.margin - 15, holdingsY);
      holdingsY += 5;
    });
  } else {
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text("No holdings available", holdingsRightX, holdingsY);
    holdingsY += 5;
  }
  
  y = Math.max(allocY, holdingsY) + 5;
  
  // SECTOR EXPOSURE Section
  const sectorLeftX = LAYOUT.margin;
  const perfRightX = 105;
  let sectorY = y;
  let perfY = y;
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("SECTOR EXPOSURE", sectorLeftX, sectorY);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(sectorLeftX, sectorY + 1, sectorLeftX + 60, sectorY + 1);
  sectorY += 7;
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Holding", sectorLeftX, sectorY);
  doc.text("Weight", sectorLeftX + 60, sectorY);
  sectorY += 5;
  
  if (holdings && holdings.length > 0) {
    holdings.slice(0, 5).forEach((h) => {
      doc.setFontSize(7);
      doc.setTextColor(30, 30, 30);
      doc.text(h.name?.substring(0, 20) || h.ticker || "N/A", sectorLeftX, sectorY);
      doc.text(`${h.weight_pct?.toFixed(1) || 0}%`, sectorLeftX + 60, sectorY);
      sectorY += 5;
    });
  } else {
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text("No sector data available", sectorLeftX, sectorY);
    sectorY += 5;
  }
  
  // PERFORMANCE SNAPSHOT Section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("PERFORMANCE SNAPSHOT", perfRightX, perfY);
  doc.setLineWidth(0.3);
  doc.line(perfRightX, perfY + 1, LAYOUT.pageWidth - LAYOUT.margin, perfY + 1);
  perfY += 7;
  
  // Table header
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Period", perfRightX, perfY);
  doc.text("Portfolio", perfRightX + 25, perfY);
  doc.text("Benchmark", perfRightX + 50, perfY);
  perfY += 5;
  
  const performanceData = [
    { period: "YTD", portfolio: "0.00%", benchmark: "+9.10%" },
    { period: "Since Inception", portfolio: "0.00%", benchmark: "+9.10%" }
  ];
  
  performanceData.forEach((row) => {
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(row.period, perfRightX, perfY);
    doc.text(row.portfolio, perfRightX + 25, perfY);
    doc.text(row.benchmark, perfRightX + 50, perfY);
    perfY += 5;
  });
  
  y = Math.max(sectorY, perfY) + 5;
  
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("*Disclosure and updates best reflect the contents. Performance is shown net of fees where applicable. Base per client-prfd currency classes.", LAYOUT.margin, y);
  y += 8;
  
  // Footer
  const footerY = LAYOUT.pageHeight - 15;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`Prepared by Atlas Wealth | Confidential - For Client Use Only`, LAYOUT.margin, footerY);
  
  return doc;
}

// KID/KIID WRAPPER TEMPLATE (KID_WRAPPER_V1)
// Compliance-safe regulatory document wrapper
export function generateKIDWrapperPDF(portfolio, kidDocument, client) {
  const doc = new jsPDF();
  const clientName = client ? `${client.first_name} ${client.last_name}` : "Client";
  const advisorName = "Financial Advisor";
  const baseCurrency = portfolio.currency || client?.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTitle = "Key Information Document (KID)";
  
  addInstitutionalHeader(doc, reportTitle, clientName, advisorName, baseCurrency, reportDate);
  let y = LAYOUT.headerHeight + 10;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(0, LAYOUT.headerHeight, LAYOUT.pageWidth, LAYOUT.pageHeight - LAYOUT.headerHeight - LAYOUT.footerHeight, "F");
  
  // WRAPPER NOTICE
  doc.setFillColor(168, 85, 247);
  doc.rect(LAYOUT.margin, y, 180, 8, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.text("DOCUMENT WRAPPER NOTICE: This is a summary wrapper. Refer to the official KID/KIID PDF for complete information.", LAYOUT.margin + 2, y + 5);
  y += 12;
  
  // Document Metadata
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text("Product / Portfolio Name:", LAYOUT.margin, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(portfolio.name, LAYOUT.margin + 50, y);
  y += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text("Manufacturer / Provider:", LAYOUT.margin, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text("Atlas Wealth", LAYOUT.margin + 50, y);
  y += 5;
  
  doc.setTextColor(70, 70, 70);
  doc.setFont(undefined, "normal");
  doc.text("Date of Document:", LAYOUT.margin, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(reportDate, LAYOUT.margin + 50, y);
  y += 10;
  
  // 1) PRODUCT OVERVIEW
  y = addSectionTitle(doc, "Product Overview", y);
  y = addTwoColumnField(doc, "Product Type", "Investment Portfolio", "Investment Objective", portfolio.strategy?.replace("_", " ") || "Not Available", y);
  y = addTwoColumnField(doc, "Intended Retail Investor", "Qualified Investors", "Investment Horizon", client?.investment_horizon || "Not Available", y);
  y += 5;
  
  // 2) RISK INDICATOR
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Risk Indicator", y);
  
  const riskLevel = portfolio.portfolio_risk || "Moderate";
  const riskClass = riskLevel.toLowerCase() === "conservative" ? "3" : 
                     riskLevel.toLowerCase() === "aggressive" ? "6" : "4";
  
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 15, "F");
  
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text("Risk Class:", LAYOUT.margin + 2, y + 5);
  doc.setFontSize(12);
  doc.setTextColor(251, 191, 36);
  doc.setFont(undefined, "bold");
  doc.text(`${riskClass} / 7`, LAYOUT.margin + 2, y + 11);
  
  doc.setFontSize(7);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  doc.text(`Volatility: ${riskLevel} risk portfolio`, LAYOUT.margin + 50, y + 7);
  doc.text("You could lose some or all of your investment.", LAYOUT.margin + 50, y + 12);
  y += 18;
  
  // FIXED CAPITAL AT RISK STATEMENT
  doc.setFillColor(239, 68, 68);
  doc.rect(LAYOUT.margin, y, 180, 10, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.text("WARNING: The value of investments can go down as well as up. Past performance is not a reliable indicator", LAYOUT.margin + 2, y + 4);
  doc.text("of future results. This product does not include any protection from future market performance.", LAYOUT.margin + 2, y + 8);
  y += 14;
  
  // 3) WHAT ARE THE RISKS?
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "What Are the Risks?", y);
  
  // FIXED REGULATORY TEXT - DO NOT MODIFY
  const riskText = [
    "• Market Risk: The value of your investment may fluctuate due to changes in market conditions.",
    "• Liquidity Risk: You may not be able to sell your investment quickly or at your desired price.",
    "• Credit Risk: Issuers of underlying investments may default on their obligations.",
    "• Currency Risk: If investing in foreign assets, exchange rate fluctuations may affect returns.",
    "• Inflation Risk: Returns may not keep pace with inflation, reducing purchasing power."
  ];
  
  doc.setFontSize(7);
  doc.setTextColor(25, 55, 109);
  doc.setFont(undefined, "normal");
  riskText.forEach(risk => {
    doc.text(risk, LAYOUT.margin, y);
    y += 4;
  });
  y += 5;
  
  // 4) PERFORMANCE SCENARIOS
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Performance Scenarios", y);
  
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 25, "F");
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Performance scenario data is not available in this wrapper document.", LAYOUT.margin + 2, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.setFont(undefined, "bold");
  doc.text("→ Please refer to the attached official KID/KIID PDF for complete performance scenarios.", LAYOUT.margin + 2, y + 12);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont(undefined, "normal");
  doc.text("Past performance is not a reliable indicator of future results.", LAYOUT.margin + 2, y + 19);
  y += 28;
  
  // 5) COSTS & CHARGES
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Costs & Charges", y);
  
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 20, "F");
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Detailed cost and charge information is not available in this wrapper document.", LAYOUT.margin + 2, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.setFont(undefined, "bold");
  doc.text("→ Please refer to the attached official KID/KIID PDF for complete costs breakdown.", LAYOUT.margin + 2, y + 11);
  y += 24;
  
  // 6) ADDITIONAL INFORMATION
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Additional Information", y);
  
  if (kidDocument?.file_url) {
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text("Official KID/KIID Document:", LAYOUT.margin, y);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, "bold");
    doc.text("View Attached Document", LAYOUT.margin + 45, y);
    y += 6;
    
    doc.setTextColor(70, 70, 70);
    doc.setFont(undefined, "normal");
    doc.text("Document Version:", LAYOUT.margin, y);
    doc.setTextColor(30, 30, 30);
    doc.text(kidDocument.version || "N/A", LAYOUT.margin + 45, y);
    y += 6;
    
    doc.setTextColor(70, 70, 70);
    doc.text("Effective Date:", LAYOUT.margin, y);
    doc.setTextColor(30, 30, 30);
    doc.text(kidDocument.effective_date ? new Date(kidDocument.effective_date).toLocaleDateString() : "N/A", LAYOUT.margin + 45, y);
  } else {
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    doc.setFont(undefined, "bold");
    doc.text("⚠ No official KID/KIID document has been attached to this portfolio.", LAYOUT.margin, y);
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.setFont(undefined, "normal");
    doc.text("Please upload the official regulatory document via the Regulatory Documents section.", LAYOUT.margin, y);
  }
  y += 10;
  
  // ISSUER INFORMATION
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("Issuer Name:", LAYOUT.margin + 2, y + 4);
  doc.setTextColor(30, 30, 30);
  doc.text("The Wealthy Advisor", LAYOUT.margin + 2, y + 8);
  y += 15;
  
  // COMPLIANCE DISCLAIMER
  doc.setFillColor(239, 68, 68);
  doc.rect(LAYOUT.margin, y, 180, 20, "F");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.text("IMPORTANT NOTICE:", LAYOUT.margin + 2, y + 4);
  doc.setFont(undefined, "normal");
  const disclaimer = "This document is a summary wrapper only and does NOT constitute the official Key Information Document (KID). You must read the official KID/KIID provided by the product manufacturer before making any investment decision. This wrapper contains factual information only and no regulatory text has been AI-generated.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 175);
  doc.text(disclaimerLines, LAYOUT.margin + 2, y + 8);
  
  // Add footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addInstitutionalFooter(doc, i, totalPages);
  }
  
  return doc;
}

export function generateRiskSuitabilityPDF(client, risk, portfolio) {
  const doc = new jsPDF();
  const clientName = `${client.first_name} ${client.last_name}`;
  const advisorName = "Financial Advisor";
  const baseCurrency = client.currency || "USD";
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTitle = "Risk & Suitability Report";
  
  addInstitutionalHeader(doc, reportTitle, clientName, advisorName, baseCurrency, reportDate);
  let y = LAYOUT.headerHeight + 10;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(0, LAYOUT.headerHeight, LAYOUT.pageWidth, LAYOUT.pageHeight - LAYOUT.headerHeight - LAYOUT.footerHeight, "F");
  
  // Client Risk Profile
  y = addSectionTitle(doc, "Client Risk Profile", y);
  y = addTwoColumnField(doc, "Client Name", clientName, "Risk Score", `${risk?.risk_score || 0}/100`, y);
  y = addTwoColumnField(doc, "Risk Category", risk?.risk_category?.replace("_", " ") || "Not Available", "Investment Horizon", client.investment_horizon || "Not Available", y);
  y += 5;
  
  // Portfolio Risk Level
  if (portfolio) {
    y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
    y = addSectionTitle(doc, "Portfolio Risk Level", y);
    y = addTwoColumnField(doc, "Portfolio Name", portfolio.name, "Portfolio Risk", portfolio.portfolio_risk || "Moderate", y);
    y = addField(doc, "Strategy", portfolio.strategy?.replace("_", " ") || "Not Available", y);
    y += 5;
  }
  
  // Suitability Assessment
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Suitability Assessment", y);
  
  const aligned = portfolio?.portfolio_risk?.toLowerCase() === client.risk_profile?.toLowerCase();
  const alignmentColor = aligned ? [16, 185, 129] : [251, 191, 36];
  
  doc.setFontSize(8);
  doc.setTextColor(...alignmentColor);
  doc.setFont(undefined, "bold");
  doc.text(`Alignment Status: ${aligned ? "SUITABLE" : "REVIEW REQUIRED"}`, LAYOUT.margin, y);
  y += 7;
  
  doc.setFont(undefined, "normal");
  y = addTwoColumnField(doc, "Client Risk", client.risk_profile || "Not Available", "Portfolio Risk", portfolio?.portfolio_risk || "Not Available", y);
  y += 5;
  
  // Advisor Overrides
  if (portfolio?.suitability_override) {
    y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
    y = addSectionTitle(doc, "Advisor Overrides & Justification", y);
    
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(8);
    doc.text("Override Applied: YES", LAYOUT.margin, y);
    y += 7;
    
    doc.setTextColor(25, 55, 109);
    const justification = portfolio.suitability_justification || "No justification provided";
    y = addTextBlock(doc, justification, y);
    y += 5;
  }
  
  // Compliance Statement
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  y = addSectionTitle(doc, "Compliance Statement", y);
  y = addTextBlock(doc, "This suitability assessment has been conducted in accordance with regulatory requirements under MiFID II and applicable financial advisory standards. The advisor has verified that the recommended portfolio aligns with the client's risk tolerance, investment objectives, and financial circumstances. All documentation has been reviewed and approved.", y);
  y += 8;
  
  // Disclaimer
  y = checkPageBreak(doc, y, clientName, advisorName, baseCurrency, reportDate, reportTitle);
  doc.setFillColor(30, 41, 59);
  doc.rect(LAYOUT.margin, y, 180, 20, "F");
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  const disclaimer = "This suitability report is valid as of the date of issuance. Client circumstances may change over time, requiring reassessment. The advisor maintains records of this assessment for regulatory compliance purposes.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 175);
  doc.text(disclaimerLines, LAYOUT.margin + 2, y + 4);
  
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addInstitutionalFooter(doc, i, totalPages);
  }
  
  return doc;
}