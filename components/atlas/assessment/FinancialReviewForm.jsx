import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, CheckCircle2, AlertCircle, Target } from "lucide-react";

export default function FinancialReviewForm({ clientId, existingReview }) {
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    monthly_income: existingReview?.monthly_income || 0,
    monthly_expenses: existingReview?.monthly_expenses || 0,
    net_surplus: existingReview?.net_surplus || 0,
    cash_savings: existingReview?.cash_savings || 0,
    equities_value: existingReview?.equities_value || 0,
    bonds_value: existingReview?.bonds_value || 0,
    real_estate_value: existingReview?.real_estate_value || 0,
    other_assets: existingReview?.other_assets || 0,
    total_assets: existingReview?.total_assets || 0,
    total_net_worth: existingReview?.total_net_worth || 0,
    mortgage: existingReview?.mortgage || 0,
    loans: existingReview?.loans || 0,
    credit_card_debt: existingReview?.credit_card_debt || 0,
    total_liabilities: existingReview?.total_liabilities || 0,
    liquidity_needs: existingReview?.liquidity_needs || "moderate",
    goal_target_amount: existingReview?.goal_target_amount || 0,
    goal_target_date: existingReview?.goal_target_date || "",
    goal_priority: existingReview?.goal_priority || "medium",
    advisor_notes: existingReview?.advisor_notes || "",
  });

  const calculateLiquidityHealth = () => {
    const monthlyBuffer = form.cash_savings / (form.monthly_expenses || 1);
    const surplusRatio = form.net_surplus / (form.monthly_income || 1);
    
    if (monthlyBuffer >= 6 && surplusRatio >= 0.2) return "comfortable";
    if (monthlyBuffer >= 3 || surplusRatio >= 0.1) return "watch";
    return "tight";
  };

  const liquidityHealth = calculateLiquidityHealth();
  const liquidityConfig = {
    comfortable: { label: "Comfortable", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
    watch: { label: "Watch", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertCircle },
    tight: { label: "Tight", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
  };

  const handleChange = (field, value) => {
    const numVal = parseFloat(value) || 0;
    const updated = { ...form, [field]: numVal };

    // Auto-calculate
    updated.net_surplus = updated.monthly_income - updated.monthly_expenses;
    updated.total_assets = updated.cash_savings + updated.equities_value + updated.bonds_value + updated.real_estate_value + updated.other_assets;
    updated.total_liabilities = updated.mortgage + updated.loans + updated.credit_card_debt;
    updated.total_net_worth = updated.total_assets - updated.total_liabilities;

    setForm(updated);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (existingReview?.id) {
        return base44.entities.FinancialReview.update(existingReview.id, data);
      }
      return base44.entities.FinancialReview.create({
        ...data,
        client_id: clientId,
        review_date: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Income & Expenses */}
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <DollarSign className="w-4 h-4 text-orange-400" /> Income & Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField label="Monthly Income" value={form.monthly_income} onChange={(v) => handleChange("monthly_income", v)} />
            <NumberField label="Monthly Expenses" value={form.monthly_expenses} onChange={(v) => handleChange("monthly_expenses", v)} />
            <NumberField label="Net Surplus" value={form.net_surplus} readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-100">Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField label="Cash & Savings" value={form.cash_savings} onChange={(v) => handleChange("cash_savings", v)} />
            <NumberField label="Equities" value={form.equities_value} onChange={(v) => handleChange("equities_value", v)} />
            <NumberField label="Bonds" value={form.bonds_value} onChange={(v) => handleChange("bonds_value", v)} />
            <NumberField label="Real Estate" value={form.real_estate_value} onChange={(v) => handleChange("real_estate_value", v)} />
            <NumberField label="Other Assets" value={form.other_assets} onChange={(v) => handleChange("other_assets", v)} />
            <NumberField label="Total Assets" value={form.total_assets} readOnly highlight />
          </div>
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-100">Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField label="Mortgage" value={form.mortgage} onChange={(v) => handleChange("mortgage", v)} />
            <NumberField label="Loans" value={form.loans} onChange={(v) => handleChange("loans", v)} />
            <NumberField label="Credit Card Debt" value={form.credit_card_debt} onChange={(v) => handleChange("credit_card_debt", v)} />
            <NumberField label="Total Liabilities" value={form.total_liabilities} readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Net Worth & Liquidity */}
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-100">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField label="Total Net Worth" value={form.total_net_worth} readOnly highlight />
            <div>
              <Label className="text-xs text-slate-400">Liquidity Needs</Label>
              <Select value={form.liquidity_needs} onValueChange={(v) => setForm((p) => ({ ...p, liquidity_needs: v }))}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Liquidity Health</Label>
              <div className="mt-1">
                <Badge className={`${liquidityConfig[liquidityHealth].color} text-xs flex items-center gap-1 w-fit border`}>
                  {React.createElement(liquidityConfig[liquidityHealth].icon, { className: "w-3 h-3" })}
                  {liquidityConfig[liquidityHealth].label}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Quantification */}
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <Target className="w-4 h-4 text-orange-400" /> Goals Quantification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField label="Target Amount" value={form.goal_target_amount} onChange={(v) => handleChange("goal_target_amount", v)} />
            <div>
              <Label className="text-xs text-slate-400">Target Date</Label>
              <Input
                type="date"
                value={form.goal_target_date}
                onChange={(e) => setForm((p) => ({ ...p, goal_target_date: e.target.value }))}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Priority</Label>
              <Select value={form.goal_priority} onValueChange={(v) => setForm((p) => ({ ...p, goal_priority: v }))}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advisor Notes */}
      <Card className="border-[#334155] bg-[#1e293b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-100">Advisor Notes & Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.advisor_notes}
            onChange={(e) => setForm((p) => ({ ...p, advisor_notes: e.target.value }))}
            placeholder="Add any assumptions, special circumstances, or notes about this client's financial situation..."
            rows={3}
            className="bg-[#0f172a] border-[#334155] text-slate-100"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saveMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
          {saveMutation.isPending ? "Saving..." : "Save Financial Review"}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Saved successfully
          </span>
        )}
      </div>
    </form>
  );
}

function NumberField({ label, value, onChange, readOnly, highlight }) {
  return (
    <div>
      <Label className="text-xs text-slate-400">{label}</Label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          className={`pl-7 bg-[#0f172a] border-[#334155] text-slate-100 ${readOnly ? "opacity-70" : ""} ${highlight ? "font-bold" : ""}`}
        />
      </div>
    </div>
  );
}