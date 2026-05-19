import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Mail, Phone, Briefcase, Calendar, Target,
  DollarSign, TrendingUp, Shield, FileText, Edit, Download, Camera, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ClientForm from "../components/clients/ClientForm";
import InteractionLog from "../components/clients/InteractionLog";
import InteractionHistory from "../components/clients/InteractionHistory";
import PortfolioAIAssistant from "../components/portfolio/PortfolioAIAssistant";
import PortfolioIntelligenceReport from "../components/reports/PortfolioIntelligenceReport";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import PerformanceAnalysis from "../components/portfolio/PerformanceAnalysis";
import RebalanceMonitor from "../components/portfolio/RebalanceMonitor";
import RebalancingSuggestions from "../components/portfolio/RebalancingSuggestions";
import RebalanceHistory from "../components/portfolio/RebalanceHistory";
import {
  generateClientInvestmentSummaryPDF,
  generatePerformanceReportPDF,
  generateOnePageFactsheetPDF
} from "../components/reports/PDFGenerator";

export default function ClientDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("id");
  const [showEditForm, setShowEditForm] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const queryClient = useQueryClient();
  const photoInputRef = useRef(null);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => base44.entities.Client.list().then((all) => all.find((c) => c.id === clientId)),
    enabled: !!clientId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowEditForm(false);
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", clientId],
    queryFn: () => base44.entities.FinancialReview.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const { data: riskAssessments = [] } = useQuery({
    queryKey: ["riskAssessments", clientId],
    queryFn: () => base44.entities.RiskAssessment.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ["clientPortfolios", clientId],
    queryFn: () => base44.entities.Portfolio.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const [rebalancingPortfolio, setRebalancingPortfolio] = useState(null);
  const [driftData, setDriftData] = useState(null);

  const { data: allHoldings = [] } = useQuery({
    queryKey: ["allHoldings", clientId],
    queryFn: async () => {
      const holdings = await base44.entities.Holding.filter({ client_id: clientId });
      return holdings;
    },
    enabled: !!clientId,
  });

  // Portfolio lifecycle mutations
  const activatePortfolioMutation = useMutation({
    mutationFn: async (portfolio) => {
      // Deactivate any existing active portfolios for this client
      const activePortfolios = portfolios.filter(p => p.status === 'active' && p.id !== portfolio.id);
      for (const p of activePortfolios) {
        await base44.entities.Portfolio.update(p.id, { status: 'archived' });
      }
      // Activate the selected portfolio
      await base44.entities.Portfolio.update(portfolio.id, { status: 'active', inception_date: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientPortfolios", clientId] });
      toast.success("Portfolio activated successfully");
    },
    onError: (error) => {
      toast.error("Failed to activate portfolio");
      console.error(error);
    }
  });

  const archivePortfolioMutation = useMutation({
    mutationFn: (portfolio) => base44.entities.Portfolio.update(portfolio.id, { status: 'archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientPortfolios", clientId] });
      toast.success("Portfolio archived successfully");
    },
    onError: () => toast.error("Failed to archive portfolio")
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (portfolio) => {
      // Only allow deleting draft portfolios
      if (portfolio.status !== 'draft') {
        throw new Error("Only draft portfolios can be deleted");
      }
      // Delete associated holdings first
      const holdings = await base44.entities.Holding.filter({ portfolio_id: portfolio.id });
      for (const holding of holdings) {
        await base44.entities.Holding.delete(holding.id);
      }
      // Delete the portfolio
      await base44.entities.Portfolio.delete(portfolio.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientPortfolios", clientId] });
      toast.success("Portfolio deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete portfolio");
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Client not found</p>
        <Link to={createPageUrl("Clients")} className="text-blue-600 text-sm mt-2 inline-block">
          Back to Clients
        </Link>
      </div>
    );
  }

  const latestReview = reviews[0];
  const latestRisk = riskAssessments[0];
  const totalAUM = portfolios.reduce((sum, p) => sum + (p.total_value || 0), 0);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 240;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        updateMutation.mutate(
          { id: client.id, data: { photo_url: compressed } },
          {
            onSuccess: () => toast.success("Photo saved"),
            onError: () => toast.error("Failed to save photo — try a smaller image"),
          }
        );
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const profileColor = {
    conservative: "bg-blue-50 text-blue-700",
    moderate: "bg-amber-50 text-amber-700",
    aggressive: "bg-red-50 text-red-700",
  };

  const handleGenerateClientSummary = async () => {
    setGeneratingReport(true);
    try {
      const pdf = await generateClientInvestmentSummaryPDF(client, latestReview, latestRisk, portfolios);
      pdf.save(`Client_Investment_Summary_${client.first_name}_${client.last_name}.pdf`);
      toast.success("Client investment summary generated");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleGeneratePortfolioReport = async (portfolio, reportType) => {
    setGeneratingReport(true);
    try {
      const holdings = await base44.entities.Holding.filter({ portfolio_id: portfolio.id });
      
      let pdf;
      let fileName;
      
      if (reportType === 'portfolio_factsheet') {
        pdf = await generateOnePageFactsheetPDF(portfolio, holdings, client);
        fileName = `Portfolio_Factsheet_${portfolio.name}.pdf`;
      } else if (reportType === 'performance_report') {
        pdf = await generatePerformanceReportPDF(portfolio, holdings, client);
        fileName = `Performance_Report_${portfolio.name}.pdf`;
      }
      
      if (pdf) {
        pdf.save(fileName);
        toast.success("Report generated successfully");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to={createPageUrl("Clients")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div
            className="relative cursor-pointer group"
            onClick={() => photoInputRef.current?.click()}
            title="Click to upload photo"
          >
            <Avatar className="w-16 h-16 ring-2 ring-offset-2 ring-blue-200 group-hover:ring-blue-400 transition-all">
              {client.photo_url && <AvatarImage src={client.photo_url} alt={`${client.first_name} ${client.last_name}`} />}
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                {client.first_name?.[0]}{client.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 shadow group-hover:bg-blue-700 transition-colors">
              <Camera className="w-3 h-3 text-white" />
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {client.first_name} {client.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={`${profileColor[client.risk_profile] || "bg-gray-100 text-gray-600"} text-xs`}>
                {client.risk_profile ? client.risk_profile.charAt(0).toUpperCase() + client.risk_profile.slice(1) + " Risk" : "Unassessed"}
              </Badge>
              {client.investment_horizon && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" /> {client.investment_horizon}
                </Badge>
              )}
              {client.investment_objective && (
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" /> {client.investment_objective}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {client.email && (
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {client.phone}</span>
              )}
              {client.employment_status && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {client.employment_status.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setShowEditForm(true)}
              variant="outline"
              size="sm"
              className="border-[#334155] text-slate-300 hover:bg-slate-700/30"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Edit Client
            </Button>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total AUM</p>
              <p className="text-xl font-bold text-gray-900">${totalAUM.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <ClientForm
          client={client}
          onSave={(formData) => updateMutation.mutate({ id: client.id, data: formData })}
          onCancel={() => setShowEditForm(false)}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-gray-100 rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
          <TabsTrigger value="financial" className="rounded-lg text-xs">Financial Review</TabsTrigger>
          <TabsTrigger value="risk" className="rounded-lg text-xs">Risk Profile</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-lg text-xs">Portfolio</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg text-xs">Performance</TabsTrigger>
          <TabsTrigger value="rebalance" className="rounded-lg text-xs">Rebalancing</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg text-xs">Notes</TabsTrigger>
          <TabsTrigger value="crm" className="rounded-lg text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />CRM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={DollarSign} label="Net Worth" value={latestReview ? `$${(latestReview.total_net_worth || 0).toLocaleString()}` : "—"} color="text-emerald-600 bg-emerald-50" />
            <StatCard icon={Shield} label="Risk Score" value={client.risk_score ? `${client.risk_score}/100` : "—"} color="text-blue-600 bg-blue-50" />
            <StatCard icon={TrendingUp} label="Portfolios" value={portfolios.length} color="text-violet-600 bg-violet-50" />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[#334155] bg-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl("ClientAssessment") + `?clientId=${client.id}`}>
                  <Button variant="outline" className="w-full justify-start text-sm border-[#334155] text-slate-300 hover:bg-slate-700/30">
                    <FileText className="w-4 h-4 mr-2" /> Start Financial Review
                  </Button>
                </Link>
                <Link to={createPageUrl("ClientAssessment") + `?clientId=${client.id}&tab=risk`}>
                  <Button variant="outline" className="w-full justify-start text-sm border-[#334155] text-slate-300 hover:bg-slate-700/30">
                    <Shield className="w-4 h-4 mr-2" /> Risk Assessment
                  </Button>
                </Link>
                <Link to={createPageUrl("PortfolioBuilder") + `?clientId=${client.id}`}>
                  <Button variant="outline" className="w-full justify-start text-sm border-[#334155] text-slate-300 hover:bg-slate-700/30">
                    <TrendingUp className="w-4 h-4 mr-2" /> Build Portfolio
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={handleGenerateClientSummary}
                  disabled={generatingReport}
                >
                  <Download className="w-4 h-4 mr-2" /> 
                  {generatingReport ? "Generating..." : "Client Investment Summary"}
                </Button>
              </CardContent>
            </Card>
            {portfolios.length > 0 && (
              <Card className="border-[#334155] bg-[#1e293b]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-100">Portfolio Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 mb-3">View portfolio reports in the Portfolio tab</p>
                  <Link to={createPageUrl("ClientDetail") + `?id=${client.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full text-xs border-[#334155] text-slate-300 hover:bg-slate-700/30"
                      onClick={(e) => {
                        e.preventDefault();
                        const tabs = document.querySelector('[role="tablist"]');
                        const portfolioTab = Array.from(tabs?.querySelectorAll('[role="tab"]') || []).find(t => t.textContent === 'Portfolio');
                        portfolioTab?.click();
                      }}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      View All Portfolios ({portfolios.length})
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

          </div>
        </TabsContent>

        <TabsContent value="financial">
          {latestReview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-gray-100">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Income & Expenses</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Monthly Income" value={`$${(latestReview.monthly_income || 0).toLocaleString()}`} />
                  <InfoRow label="Monthly Expenses" value={`$${(latestReview.monthly_expenses || 0).toLocaleString()}`} />
                  <InfoRow label="Net Surplus" value={`$${(latestReview.net_surplus || 0).toLocaleString()}`} highlight />
                </CardContent>
              </Card>
              <Card className="border-gray-100">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Assets</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Cash & Savings" value={`$${(latestReview.cash_savings || 0).toLocaleString()}`} />
                  <InfoRow label="Equities" value={`$${(latestReview.equities_value || 0).toLocaleString()}`} />
                  <InfoRow label="Bonds" value={`$${(latestReview.bonds_value || 0).toLocaleString()}`} />
                  <InfoRow label="Total Assets" value={`$${(latestReview.total_assets || 0).toLocaleString()}`} highlight />
                </CardContent>
              </Card>
              <Card className="border-gray-100">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Liabilities</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Mortgage" value={`$${(latestReview.mortgage || 0).toLocaleString()}`} />
                  <InfoRow label="Loans" value={`$${(latestReview.loans || 0).toLocaleString()}`} />
                  <InfoRow label="Total Liabilities" value={`$${(latestReview.total_liabilities || 0).toLocaleString()}`} highlight />
                </CardContent>
              </Card>
              <Card className="border-gray-100">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Net Worth</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">${(latestReview.total_net_worth || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reviewed: {latestReview.review_date ? format(new Date(latestReview.review_date), "MMM d, yyyy") : "—"}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState text="No financial review yet" actionLabel="Start Review" actionLink={createPageUrl("ClientAssessment") + `?clientId=${client.id}`} />
          )}
        </TabsContent>

        <TabsContent value="risk">
          {latestRisk ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-gray-100">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Risk Assessment</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{latestRisk.risk_score || 0}</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{latestRisk.risk_category?.replace("_", " ") || "—"}</p>
                      <p className="text-xs text-gray-400">Risk Category</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-100">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Suggested Allocation</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <AllocationBar label="Stocks" pct={latestRisk.suggested_stocks_pct || 0} color="bg-blue-500" />
                  <AllocationBar label="Bonds" pct={latestRisk.suggested_bonds_pct || 0} color="bg-emerald-500" />
                  <AllocationBar label="Cash" pct={latestRisk.suggested_cash_pct || 0} color="bg-amber-500" />
                  <AllocationBar label="Alternatives" pct={latestRisk.suggested_alternatives_pct || 0} color="bg-violet-500" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState text="No risk assessment yet" actionLabel="Start Assessment" actionLink={createPageUrl("ClientAssessment") + `?clientId=${client.id}&tab=risk`} />
          )}
        </TabsContent>

        <TabsContent value="portfolio">
          {portfolios.length > 0 ? (
            <>
              <div className="mb-4 flex justify-end">
                <PortfolioIntelligenceReport 
                  portfolio={portfolios.find(p => p.status === 'active') || portfolios[0]}
                  client={client}
                  holdings={allHoldings.filter(h => h.portfolio_id === (portfolios.find(p => p.status === 'active') || portfolios[0])?.id)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolios.map((p) => (
                  <PortfolioCard 
                    key={p.id} 
                    portfolio={p}
                    onActivate={() => activatePortfolioMutation.mutate(p)}
                    onArchive={() => archivePortfolioMutation.mutate(p)}
                    onDelete={() => {
                      if (window.confirm(`Delete portfolio "${p.name}"? This cannot be undone.`)) {
                        deletePortfolioMutation.mutate(p);
                      }
                    }}
                    onGenerateReport={handleGeneratePortfolioReport}
                    isProcessing={activatePortfolioMutation.isPending || archivePortfolioMutation.isPending || deletePortfolioMutation.isPending || generatingReport}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState text="No portfolios yet" actionLabel="Build Portfolio" actionLink={createPageUrl("PortfolioBuilder") + `?clientId=${client.id}`} />
          )}
        </TabsContent>

        <TabsContent value="performance">
          {portfolios.length > 0 ? (
            <div className="space-y-6">
              {portfolios.filter(p => p.status === 'active').length > 0 ? (
                portfolios.filter(p => p.status === 'active').map(portfolio => (
                  <div key={portfolio.id}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-100">{portfolio.name}</h3>
                      <p className="text-sm text-slate-400">Performance Analysis</p>
                    </div>
                    <PerformanceAnalysis portfolio={portfolio} benchmark={portfolio.benchmark || "S&P 500"} />
                  </div>
                ))
              ) : (
                <Card className="border-slate-700 bg-slate-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-400 mb-4">No active portfolios. Activate a portfolio to view performance analysis.</p>
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const portfolioTab = Array.from(tabs?.querySelectorAll('[role="tab"]') || []).find(t => t.textContent === 'Portfolio');
                        portfolioTab?.click();
                      }}
                    >
                      View Portfolios
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <EmptyState text="No portfolios available for performance analysis" actionLabel="Build Portfolio" actionLink={createPageUrl("PortfolioBuilder") + `?clientId=${client.id}`} />
          )}
        </TabsContent>

        <TabsContent value="rebalance">
          {portfolios.filter(p => p.status === 'active').length > 0 ? (
            <div className="space-y-6">
              {portfolios.filter(p => p.status === 'active').map(portfolio => {
                const portfolioHoldings = allHoldings.filter(h => h.portfolio_id === portfolio.id);
                
                return (
                  <div key={portfolio.id} className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-100">{portfolio.name}</h3>
                      <p className="text-sm text-slate-400">Rebalancing Monitor & Actions</p>
                    </div>

                    <RebalanceMonitor 
                      portfolio={portfolio} 
                      holdings={portfolioHoldings}
                      onRebalanceNeeded={(drift) => {
                        setRebalancingPortfolio(portfolio);
                        setDriftData(drift);
                      }}
                    />

                    {rebalancingPortfolio?.id === portfolio.id && driftData?.needsRebalancing && (
                      <RebalancingSuggestions 
                        portfolio={portfolio}
                        holdings={portfolioHoldings}
                        driftData={driftData}
                      />
                    )}

                    <RebalanceHistory portfolioId={portfolio.id} />
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="p-12 text-center">
                <p className="text-slate-400 mb-4">No active portfolios. Activate a portfolio to monitor rebalancing.</p>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    const tabs = document.querySelector('[role="tablist"]');
                    const portfolioTab = Array.from(tabs?.querySelectorAll('[role="tab"]') || []).find(t => t.textContent === 'Portfolio');
                    portfolioTab?.click();
                  }}
                >
                  View Portfolios
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <Card className="border-gray-100">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">{client.notes || "No notes available."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Communication History</h2>
                <p className="text-sm text-slate-400 mt-1">Track all client interactions and follow-ups</p>
              </div>
              <InteractionLog
                clientId={clientId}
                client={client}
                portfolios={portfolios}
              />
            </div>
            <InteractionHistory clientId={clientId} />
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Portfolio Assistant */}
      {portfolios && portfolios.length > 0 && (
        <PortfolioAIAssistant 
          portfolio={portfolios[0]} 
          client={client}
          holdings={allHoldings.filter(h => h.portfolio_id === portfolios[0].id)}
        />
      )}

    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="border-gray-100">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-gray-900" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}

function AllocationBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ text, actionLabel, actionLink }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <p className="text-sm text-gray-400 mb-4">{text}</p>
      <Link to={actionLink}>
        <Button className="bg-blue-700 hover:bg-blue-800">{actionLabel}</Button>
      </Link>
    </div>
  );
}