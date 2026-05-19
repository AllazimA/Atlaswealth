import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Upload, FileText, Download, Loader2, X } from "lucide-react";
import { format } from "date-fns";

export default function RegulatoryDocuments({ documents, portfolios, onUpload, uploading }) {
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [docData, setDocData] = useState({
    document_name: "",
    document_type: "",
    portfolio_id: "",
    ticker: "",
    effective_date: "",
    version: "",
  });

  const docTypeLabels = {
    kiid: "KIID",
    kid: "PRIIPs KID",
    prospectus: "Prospectus",
    factsheet: "Factsheet",
    other: "Other",
  };

  const handleUpload = async () => {
    if (file && docData.document_name && docData.document_type) {
      await onUpload(file, docData);
      setShowUpload(false);
      setFile(null);
      setDocData({
        document_name: "",
        document_type: "",
        portfolio_id: "",
        ticker: "",
        effective_date: "",
        version: "",
      });
    }
  };

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
            <Shield className="w-5 h-5 text-orange-400" />
            Regulatory Documents
          </CardTitle>
          {!showUpload && (
            <Button
              size="sm"
              onClick={() => setShowUpload(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showUpload && (
          <div className="mb-4 p-4 bg-slate-700/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-100">Upload Document</h4>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Document Name *</Label>
                <Input
                  value={docData.document_name}
                  onChange={(e) => setDocData({ ...docData, document_name: e.target.value })}
                  placeholder="e.g., UCITS KIID Q4 2025"
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-400">Document Type *</Label>
                <Select value={docData.document_type} onValueChange={(v) => setDocData({ ...docData, document_type: v })}>
                  <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {Object.entries(docTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-400">Portfolio (Optional)</Label>
                <Select value={docData.portfolio_id} onValueChange={(v) => setDocData({ ...docData, portfolio_id: v })}>
                  <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                    <SelectValue placeholder="Select portfolio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {portfolios.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-400">Ticker (Optional)</Label>
                <Input
                  value={docData.ticker}
                  onChange={(e) => setDocData({ ...docData, ticker: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL"
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-400">Effective Date</Label>
                <Input
                  type="date"
                  value={docData.effective_date}
                  onChange={(e) => setDocData({ ...docData, effective_date: e.target.value })}
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-400">Version</Label>
                <Input
                  value={docData.version}
                  onChange={(e) => setDocData({ ...docData, version: e.target.value })}
                  placeholder="e.g., 1.0"
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-400">PDF File *</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || !docData.document_name || !docData.document_type || uploading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No regulatory documents uploaded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {doc.document_name}
                    </h4>
                    <Badge className="text-[9px] bg-slate-600/30 text-slate-400 border-slate-500">
                      {docTypeLabels[doc.document_type]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    {doc.ticker && <span className="text-orange-400">{doc.ticker}</span>}
                    {doc.effective_date && (
                      <>
                        {doc.ticker && <span>•</span>}
                        <span>Effective {format(new Date(doc.effective_date), "MMM d, yyyy")}</span>
                      </>
                    )}
                    {doc.version && (
                      <>
                        <span>•</span>
                        <span>v{doc.version}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(doc.file_url, "_blank")}
                  className="text-slate-400 hover:text-slate-200 ml-4"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}