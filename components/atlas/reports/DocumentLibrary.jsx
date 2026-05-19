import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Archive, Eye } from "lucide-react";
import { format } from "date-fns";

export default function DocumentLibrary({ reports, onDownload, onArchive }) {
  const reportTypeLabels = {
    client_summary: "Client Investment Summary",
    portfolio_factsheet: "Portfolio Factsheet",
    performance_report: "Performance Report",
    risk_suitability: "Risk & Suitability",
  };

  const statusColors = {
    draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    final: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    archived: "bg-slate-600/30 text-slate-400 border-slate-500",
  };

  if (reports.length === 0) {
    return (
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No reports generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Document Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-slate-100 truncate">
                    {report.document_name}
                  </h4>
                  <Badge className={`text-[9px] border ${statusColors[report.status]}`}>
                    {report.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="text-orange-400">
                    {reportTypeLabels[report.report_type]}
                  </span>
                  <span>•</span>
                  <span>{format(new Date(report.created_date), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>v{report.version}</span>
                  {report.generated_by && (
                    <>
                      <span>•</span>
                      <span>by {report.generated_by}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {report.file_url && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(report.file_url, "_blank")}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload(report)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {report.status !== "archived" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onArchive(report.id)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}