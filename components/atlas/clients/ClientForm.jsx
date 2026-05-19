import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function ClientForm({ client, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    first_name: client?.first_name || "",
    last_name: client?.last_name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    age_range: client?.age_range || "",
    employment_status: client?.employment_status || "",
    currency: client?.currency || "USD",
    investment_horizon: client?.investment_horizon || "",
    investment_objective: client?.investment_objective || "",
    notes: client?.notes || "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#334155]">
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h2 className="text-lg font-bold text-slate-100">
            {client ? "Edit Client" : "New Client"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400">First Name *</Label>
              <Input
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                required
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Last Name *</Label>
              <Input
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                required
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400">Age Range</Label>
              <Select value={form.age_range} onValueChange={(v) => handleChange("age_range", v)}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {["18-25", "26-35", "36-45", "46-55", "56-65", "65+"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Employment</Label>
              <Select value={form.employment_status} onValueChange={(v) => handleChange("employment_status", v)}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {["employed", "self_employed", "retired", "student", "unemployed"].map((v) => (
                    <SelectItem key={v} value={v}>{v.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => handleChange("currency", v)}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {["USD", "EUR", "GBP", "CAD", "AUD", "CHF"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Investment Horizon</Label>
              <Select value={form.investment_horizon} onValueChange={(v) => handleChange("investment_horizon", v)}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {["1-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Investment Objective</Label>
            <Select value={form.investment_objective} onValueChange={(v) => handleChange("investment_objective", v)}>
              <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                {["growth", "income", "balanced", "preservation"].map((v) => (
                  <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button type="button" variant="outline" onClick={onCancel} className="border-[#334155] text-slate-300 hover:bg-slate-700/30">Cancel</Button>
            <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
              {isSaving ? "Saving..." : client ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}