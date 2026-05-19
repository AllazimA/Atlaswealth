import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportGenerator from "../components/reports/ReportGenerator";
import DocumentLibrary from "../components/reports/DocumentLibrary";
import RegulatoryDocuments from "../components/reports/RegulatoryDocuments";
import { 
  generateClientSummaryPDF, 
  generateClientInvestmentSummaryPDF, 
  generatePerformanceReportPDF,
  generateRiskSuitabilityPDF,
  generateOnePageFactsheetPDF,
  generateKIDWrapperPDF
} from "../components/reports/PDFGenerator";
import { toast } from "sonner";

export default function Reports() {
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 100),
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ["portfolios"],
    queryFn: () => base44.entities.Portfolio.list("-created_date", 100),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["generatedReports"],
    queryFn: () => base44.entities.GeneratedReport.list("-created_date", 50),
  });

  const { data: regulatoryDocs = [] } = useQuery({
    queryKey: ["regulatory-docs"],
    queryFn: () => base44.entities.RegulatoryDocument.list("-created_date", 50),
  });

  const createReportMutation = useMutation({
    mutationFn: (data) => base44.entities.GeneratedReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generatedReports"] });
      toast.success("Report generated successfully");
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GeneratedReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generatedReports"] });
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: (data) => base44.entities.RegulatoryDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulatory-docs"] });
      toast.success("Document uploaded successfully");
    },
  });

  const handleGenerateReport = async (reportData) => {
    setGenerating(true);
    try {
      const client = clients.find(c => c.id === reportData.client_id);
      if (!client) {
        toast.error("Client not found");
        return;
      }

      const user = await base44.auth.me();
      let pdf;
      let reportName = "";

      if (reportData.report_type === "client_investment_summary") {
        const reviews = await base44.entities.FinancialReview.filter({ client_id: reportData.client_id });
        const riskAssessments = await base44.entities.RiskAssessment.filter({ client_id: reportData.client_id });
        const clientPortfolios = await base44.entities.Portfolio.filter({ client_id: reportData.client_id });

        pdf = await generateClientInvestmentSummaryPDF(client, reviews[0], riskAssessments[0], clientPortfolios);
        reportName = `Client Investment Summary - ${client.first_name} ${client.last_name}`;

      } else if (reportData.report_type === "client_summary") {
        const reviews = await base44.entities.FinancialReview.filter({ client_id: reportData.client_id });
        const riskAssessments = await base44.entities.RiskAssessment.filter({ client_id: reportData.client_id });
        const clientPortfolios = await base44.entities.Portfolio.filter({ client_id: reportData.client_id });

        pdf = await generateClientSummaryPDF(client, reviews[0], riskAssessments[0], clientPortfolios);
        reportName = `Client Summary - ${client.first_name} ${client.last_name}`;

      } else if (reportData.report_type === "portfolio_factsheet") {
        const portfolio = portfolios.find(p => p.id === reportData.portfolio_id);
        if (!portfolio) {
          toast.error("Portfolio not found");
          return;
        }
        const holdings = await base44.entities.Holding.filter({ portfolio_id: reportData.portfolio_id });
        pdf = generateOnePageFactsheetPDF(portfolio, holdings, client);
        reportName = `Portfolio Factsheet - ${portfolio.name}`;

      } else if (reportData.report_type === "performance_report") {
        const portfolio = portfolios.find(p => p.id === reportData.portfolio_id);
        if (!portfolio) {
          toast.error("Portfolio not found");
          return;
        }
        const holdings = await base44.entities.Holding.filter({ portfolio_id: reportData.portfolio_id });
        pdf = await generatePerformanceReportPDF(portfolio, holdings, client);
        reportName = `Performance Report - ${portfolio.name}`;

      } else if (reportData.report_type === "risk_suitability") {
        const riskAssessments = await base44.entities.RiskAssessment.filter({ client_id: reportData.client_id });
        const clientPortfolios = await base44.entities.Portfolio.filter({ client_id: reportData.client_id });
        pdf = generateRiskSuitabilityPDF(client, riskAssessments[0], clientPortfolios[0]);
        reportName = `Risk & Suitability - ${client.first_name} ${client.last_name}`;

      } else if (reportData.report_type === "kid_wrapper") {
        const portfolio = portfolios.find(p => p.id === reportData.portfolio_id);
        if (!portfolio) {
          toast.error("Portfolio not found");
          return;
        }
        const kidDocs = await base44.entities.RegulatoryDocument.filter({ 
          portfolio_id: reportData.portfolio_id,
          document_type: "kiid"
        });
        pdf = generateKIDWrapperPDF(portfolio, kidDocs[0], client);
        reportName = `KID Wrapper - ${portfolio.name}`;
      }

      if (pdf) {
        // Save the PDF locally as well
        pdf.save(`${reportName}.pdf`);
        
        // Upload to server
        const blob = pdf.output("blob");
        const file = new File([blob], `${reportName}.pdf`, { type: "application/pdf" });
        const uploadResult = await base44.integrations.Core.UploadFile({ file });

        await createReportMutation.mutateAsync({
          document_name: reportName,
          report_type: reportData.report_type,
          client_id: reportData.client_id,
          portfolio_id: reportData.portfolio_id,
          date_range_start: reportData.date_range_start,
          date_range_end: reportData.date_range_end,
          file_url: uploadResult.file_url,
          generated_by: user.email,
          status: "final",
          version: 1,
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    if (report.file_url) {
      window.open(report.file_url, "_blank");
    }
  };

  const handleArchive = async (reportId) => {
    await updateReportMutation.mutateAsync({
      id: reportId,
      data: { status: "archived" },
    });
    toast.success("Report archived");
  };

  const handleUploadDoc = async (file, docData) => {
    setUploading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      await uploadDocMutation.mutateAsync({
        ...docData,
        file_url: uploadResult.file_url,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Reports & Documents</h1>
        <p className="text-sm text-slate-400 mt-1">Professional client reporting and document center</p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="bg-[#1e293b] border border-[#334155]">
          <TabsTrigger value="generator" className="data-[state=active]:bg-orange-600">
            Report Generator
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-orange-600">
            Document Library
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="data-[state=active]:bg-orange-600">
            Regulatory Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <ReportGenerator
            clients={clients}
            portfolios={portfolios}
            onGenerate={handleGenerateReport}
            generating={generating}
          />
        </TabsContent>

        <TabsContent value="library">
          <DocumentLibrary
            reports={reports}
            onDownload={handleDownload}
            onArchive={handleArchive}
          />
        </TabsContent>

        <TabsContent value="regulatory">
          <RegulatoryDocuments
            documents={regulatoryDocs}
            portfolios={portfolios}
            onUpload={handleUploadDoc}
            uploading={uploading}
          />
        </TabsContent>
      </Tabs>

      {/* Compliance Footer */}
      <div className="p-4 bg-slate-700/20 border border-slate-700 rounded-lg">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong>Audit Trail:</strong> All generated reports and uploaded documents are automatically tracked with timestamps and user attribution. 
          Reports are version-controlled and maintain a complete history for regulatory compliance. 
          This system maintains records in accordance with financial advisory regulations.
        </p>
      </div>
    </div>
  );
}