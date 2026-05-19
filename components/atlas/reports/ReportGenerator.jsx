import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2 } from "lucide-react";

export default function ReportGenerator({ clients, portfolios, onGenerate, generating }) {
  const [reportData, setReportData] = useState({
    client_id: "",
    portfolio_id: "",
    report_type: "",
    date_range_start: "",
    date_range_end: "",
  });

  const selectedClient = clients.find(c => c.id === reportData.client_id);
  const clientPortfolios = portfolios.filter(p => p.client_id === reportData.client_id);

  const reportTypes = [
    { value: "client_investment_summary", label: "Client Investment Summary" },
    { value: "client_summary", label: "Client Summary Report" },
    { value: "portfolio_factsheet", label: "Portfolio Factsheet" },
    { value: "performance_report", label: "Performance Report" },
    { value: "risk_suitability", label: "Risk & Suitability Report" },
    { value: "kid_wrapper", label: "KID/KIID Wrapper" },
  ];

  const handleGenerate = () => {
    onGenerate(reportData);
  };

  const requiresPortfolio = ["portfolio_factsheet", "performance_report", "kid_wrapper"].includes(reportData.report_type);
  const isValid = reportData.client_id && reportData.report_type && 
    (!requiresPortfolio || reportData.portfolio_id);

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
          <FileText className="w-5 h-5 text-orange-400" />
          Generate Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-slate-400">Client *</Label>
            <Select value={reportData.client_id} onValueChange={(v) => setReportData({ ...reportData, client_id: v, portfolio_id: "" })}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Report Type *</Label>
            <Select value={reportData.report_type} onValueChange={(v) => setReportData({ ...reportData, report_type: v })}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                {reportTypes.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value}>
                    {rt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(reportData.report_type === "portfolio_factsheet" || reportData.report_type === "performance_report" || reportData.report_type === "kid_wrapper") && (
            <div>
              <Label className="text-xs text-slate-400">Portfolio *</Label>
              <Select value={reportData.portfolio_id} onValueChange={(v) => setReportData({ ...reportData, portfolio_id: v })}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                  <SelectValue placeholder="Select portfolio" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {clientPortfolios.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-xs text-slate-400">Date Range Start</Label>
            <Input
              type="date"
              value={reportData.date_range_start}
              onChange={(e) => setReportData({ ...reportData, date_range_start: e.target.value })}
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Date Range End</Label>
            <Input
              type="date"
              value={reportData.date_range_end}
              onChange={(e) => setReportData({ ...reportData, date_range_end: e.target.value })}
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!isValid || generating}
            className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}