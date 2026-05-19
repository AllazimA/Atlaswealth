import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, ChevronRight, ChevronLeft, User, DollarSign,
  Shield, Target, FileCheck, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: 1, key: "client",    label: "Select Client",       icon: User },
  { id: 2, key: "financial", label: "Financial Snapshot",  icon: DollarSign },
  { id: 3, key: "risk",      label: "Risk & Behavior",     icon: Shield },
  { id: 4, key: "goals",     label: "Goals & Preferences", icon: Target },
  { id: 5, key: "review",    label: "Review & Confirm",    icon: FileCheck },
];

function calculateRiskScore(answers) {
  let score = 0;
  const lossMap = { sell_all: 0, sell_some: 10, hold: 20, buy_more: 30 };
  score += lossMap[answers.q1_loss_reaction] || 0;
  score += ((answers.q2_risk_comfort || 5) / 10) * 20;
  const returnMap = { "2-4%": 0, "4-7%": 5, "7-12%": 10, "12%+": 15 };
  score += returnMap[answers.q3_return_expectation] || 0;
  const expMap = { none: 0, beginner: 3, intermediate: 7, advanced: 10 };
  score += expMap[answers.q4_investment_experience] || 0;
  const incMap = { very_stable: 5, stable: 3, variable: 1, unstable: 0 };
  score += incMap[answers.q5_income_stability] || 0;
  const timeMap = { short_term: 0, medium_term: 5, long_term: 10 };
  score += timeMap[answers.q6_time_horizon_preference] || 0;
  const portMap = { all_bonds: 0, mostly_bonds: 3, balanced: 5, mostly_stocks: 8, all_stocks: 10 };
  score += portMap[answers.q7_portfolio_preference] || 0;
  return Math.round(score);
}

function getRiskCategory(score) {
  if (score <= 20) return "conservative";
  if (score <= 40) return "moderate_conservative";
  if (score <= 60) return "moderate";
  if (score <= 80) return "moderate_aggressive";
  return "aggressive";
}

function getSuggestedAllocation(category) {
  const map = {
    conservative:         { stocks: 20, bonds: 50, etfs: 10, cash: 15, alternatives: 5 },
    moderate_conservative:{ stocks: 35, bonds: 40, etfs: 10, cash: 10, alternatives: 5 },
    moderate:             { stocks: 50, bonds: 25, etfs: 15, cash: 5,  alternatives: 5 },
    moderate_aggressive:  { stocks: 65, bonds: 15, etfs: 10, cash: 5,  alternatives: 5 },
    aggressive:           { stocks: 75, bonds: 10, etfs: 10, cash: 2,  alternatives: 3 },
  };
  return map[category] || map.moderate;
}

export default function ClientAssessment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedClientId = urlParams.get("clientId");

  const [step, setStep] = useState(preselectedClientId ? 2 : 1);
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || "");

  const [financial, setFinancial] = useState({
    monthly_income: 0, monthly_expenses: 0, net_surplus: 0,
    cash_savings: 0, equities_value: 0, bonds_value: 0,
    real_estate_value: 0, other_assets: 0, total_assets: 0,
    total_net_worth: 0, mortgage: 0, loans: 0, credit_card_debt: 0,
    total_liabilities: 0, liquidity_needs: "moderate", advisor_notes: "",
  });

  const [riskAnswers, setRiskAnswers] = useState({
    q1_loss_reaction: "", q2_risk_comfort: 5, q3_return_expectation: "",
    q4_investment_experience: "", q5_income_stability: "",
    q6_time_horizon_preference: "", q7_portfolio_preference: "",
  });

  const [goals, setGoals] = useState({
    financial_goal: "", investment_horizon: "", investment_amount: 0,
    currency: "USD", risk_profile: "", goal_target_amount: 0,
    goal_target_date: "", goal_priority: "medium",
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 100),
  });

  const { data: existingReview } = useQuery({
    queryKey: ["review", selectedClientId],
    queryFn: () => base44.entities.FinancialReview.filter({ client_id: selectedClientId }).then(r => r[0]),
    enabled: !!selectedClientId,
  });

  const { data: existingRisk } = useQuery({
    queryKey: ["riskAssessment", selectedClientId],
    queryFn: () => base44.entities.RiskAssessment.filter({ client_id: selectedClientId }).then(r => r[0]),
    enabled: !!selectedClientId,
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  useEffect(() => {
    if (existingReview) {
      setFinancial(prev => ({ ...prev, ...existingReview }));
    }
  }, [existingReview]);

  useEffect(() => {
    if (existingRisk) {
      setRiskAnswers(prev => ({ ...prev, ...existingRisk }));
    }
  }, [existingRisk]);

  useEffect(() => {
    if (selectedClient) {
      setGoals(prev => ({
        ...prev,
        financial_goal: selectedClient.financial_goal || "",
        investment_horizon: selectedClient.investment_horizon || "",
        investment_amount: selectedClient.investment_amount || 0,
        currency: selectedClient.currency || "USD",
        risk_profile: selectedClient.risk_profile || "",
      }));
    }
  }, [selectedClient]);

  const riskScore = calculateRiskScore(riskAnswers);
  const riskCategory = getRiskCategory(riskScore);
  const suggestedAlloc = getSuggestedAllocation(riskCategory);

  const handleFinancialChange = (field, value) => {
    const numVal = parseFloat(value) || 0;
    setFinancial(prev => {
      const updated = { ...prev, [field]: numVal };
      updated.net_surplus = updated.monthly_income - updated.monthly_expenses;
      updated.total_assets = updated.cash_savings + updated.equities_value + updated.bonds_value + updated.real_estate_value + updated.other_assets;
      updated.total_liabilities = updated.mortgage + updated.loans + updated.credit_card_debt;
      updated.total_net_worth = updated.total_assets - updated.total_liabilities;
      return updated;
    });
  };

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      // Save financial review
      const financialPayload = { ...financial, client_id: selectedClientId, review_date: new Date().toISOString().split("T")[0] };
      if (existingReview?.id) {
        await base44.entities.FinancialReview.update(existingReview.id, financialPayload);
      } else {
        await base44.entities.FinancialReview.create(financialPayload);
      }

      // Save risk assessment
      const riskPayload = {
        ...riskAnswers,
        risk_score: riskScore,
        risk_category: riskCategory,
        suggested_stocks_pct: suggestedAlloc.stocks,
        suggested_bonds_pct: suggestedAlloc.bonds,
        suggested_cash_pct: suggestedAlloc.cash,
        suggested_alternatives_pct: suggestedAlloc.alternatives,
        client_id: selectedClientId,
        assessment_date: new Date().toISOString().split("T")[0],
      };
      if (existingRisk?.id) {
        await base44.entities.RiskAssessment.update(existingRisk.id, riskPayload);
      } else {
        await base44.entities.RiskAssessment.create(riskPayload);
      }

      // Update client profile
      await base44.entities.Client.update(selectedClientId, {
        financial_goal: goals.financial_goal,
        investment_horizon: goals.investment_horizon,
        investment_amount: goals.investment_amount,
        currency: goals.currency,
        risk_profile: goals.risk_profile || riskCategory,
        risk_score: riskScore,
        status: "active",
        next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      queryClient.invalidateQueries({ queryKey: ["riskAssessment"] });
      toast.success("Assessment saved successfully");
    },
    onError: () => toast.error("Failed to save assessment"),
  });

  const canProceed = () => {
    if (step === 1) return !!selectedClientId;
    if (step === 2) return financial.monthly_income > 0 || financial.total_assets > 0;
    if (step === 3) return !!riskAnswers.q1_loss_reaction && !!riskAnswers.q4_investment_experience;
    if (step === 4) return !!goals.financial_goal && !!goals.investment_horizon;
    return true;
  };

  const completedSteps = () => {
    const done = [];
    if (selectedClientId) done.push(1);
    if (financial.monthly_income > 0 || financial.total_assets > 0) done.push(2);
    if (riskAnswers.q1_loss_reaction) done.push(3);
    if (goals.financial_goal) done.push(4);
    return done;
  };

  const completed = completedSteps();
  const overallPct = Math.round((completed.length / 4) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Client Assessment</h1>
          <p className="text-sm text-slate-400 mt-1">Complete financial review and risk profiling to unlock portfolio builder</p>
        </div>
        {selectedClient && (
          <Badge className={overallPct >= 75 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border" : "bg-amber-500/20 text-amber-400 border-amber-500/30 border"}>
            {overallPct >= 75 ? "Ready for Allocation" : `${overallPct}% Complete`}
          </Badge>
        )}
      </div>

      {/* Step Progress Bar */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
        <div className="flex items-center gap-0 mb-4">
          {STEPS.map((s, i) => {
            const isDone = completed.includes(s.id);
            const isActive = step === s.id;
            const Icon = s.icon;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => selectedClientId || s.id === 1 ? setStep(s.id) : null}
                  className={`flex flex-col items-center gap-1 flex-1 group ${selectedClientId || s.id === 1 ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone ? "bg-emerald-500 border-emerald-500" :
                    isActive ? "bg-orange-600 border-orange-600" :
                    "bg-[#0f172a] border-[#334155]"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:block ${isActive ? "text-orange-400" : isDone ? "text-emerald-400" : "text-slate-500"}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mt-[-18px] mb-5 mx-1 transition-all ${completed.includes(s.id) ? "bg-emerald-500" : "bg-[#334155]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {selectedClient && (
          <div className="mt-2">
            <Progress value={overallPct} className="h-1.5" />
            <p className="text-[11px] text-slate-500 mt-1">{overallPct}% complete</p>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        {step === 1 && <StepSelectClient clients={clients} selectedClientId={selectedClientId} onSelect={setSelectedClientId} />}
        {step === 2 && <StepFinancial financial={financial} onChange={handleFinancialChange} onSelectChange={(f,v) => setFinancial(p => ({...p,[f]:v}))} />}
        {step === 3 && <StepRisk answers={riskAnswers} onChange={(k,v) => setRiskAnswers(p => ({...p,[k]:v}))} riskScore={riskScore} riskCategory={riskCategory} suggestedAlloc={suggestedAlloc} />}
        {step === 4 && <StepGoals goals={goals} onChange={(k,v) => setGoals(p => ({...p,[k]:v}))} client={selectedClient} />}
        {step === 5 && <StepReview client={selectedClient} financial={financial} riskAnswers={riskAnswers} goals={goals} riskScore={riskScore} riskCategory={riskCategory} suggestedAlloc={suggestedAlloc} />}
      </div>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="border-[#334155] text-slate-300 hover:bg-slate-700/40"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="flex gap-3">
          {step === 5 ? (
            <>
              <Button
                onClick={() => saveAllMutation.mutate()}
                disabled={!selectedClientId || saveAllMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {saveAllMutation.isPending ? "Saving..." : "Save Assessment"}
              </Button>
              <Button
                onClick={() => {
                  saveAllMutation.mutate();
                  setTimeout(() => navigate(createPageUrl("PortfolioBuilder") + `?clientId=${selectedClientId}`), 800);
                }}
                disabled={!selectedClientId || overallPct < 50}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Save & Proceed to Portfolio Builder <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {step === 1 ? "Start Assessment" : "Continue"} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── STEP 1 ──────────────── */
function StepSelectClient({ clients, selectedClientId, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );
  const selected = clients.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Select a Client</h2>
        <p className="text-sm text-slate-400 mt-0.5">Choose the client you want to assess</p>
      </div>
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-[#0f172a] border-[#334155] text-slate-100 placeholder:text-slate-600"
      />
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              selectedClientId === c.id
                ? "border-orange-500 bg-orange-500/10"
                : "border-[#334155] hover:border-[#475569] hover:bg-slate-700/30"
            }`}
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-orange-500/20 text-orange-400 text-sm font-semibold">
                {c.first_name?.[0]}{c.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100">{c.first_name} {c.last_name}</p>
              <p className="text-xs text-slate-400 truncate">{c.email || "No email"}</p>
            </div>
            <div className="shrink-0 text-right">
              {c.risk_profile && (
                <Badge className="text-[10px] bg-slate-700/50 text-slate-300 capitalize">{c.risk_profile}</Badge>
              )}
              {selectedClientId === c.id && <CheckCircle2 className="w-4 h-4 text-orange-400 mt-1 ml-auto" />}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">No clients found</p>
        )}
      </div>
    </div>
  );
}

/* ──────────────── STEP 2 ──────────────── */
function StepFinancial({ financial, onChange, onSelectChange }) {
  const surplus = financial.net_surplus;
  const surplusColor = surplus >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Financial Snapshot</h2>
        <p className="text-sm text-slate-400 mt-0.5">Income, assets, and liabilities overview</p>
      </div>

      {/* Income */}
      <section>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Income & Expenses</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumField label="Monthly Income" value={financial.monthly_income} onChange={v => onChange("monthly_income", v)} />
          <NumField label="Monthly Expenses" value={financial.monthly_expenses} onChange={v => onChange("monthly_expenses", v)} />
          <div>
            <Label className="text-xs text-slate-400">Net Surplus / Month</Label>
            <div className={`mt-1 text-xl font-bold ${surplusColor}`}>
              ${Math.abs(surplus).toLocaleString()}{surplus < 0 ? " deficit" : " surplus"}
            </div>
          </div>
        </div>
      </section>

      {/* Assets */}
      <section>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Assets</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumField label="Cash & Savings" value={financial.cash_savings} onChange={v => onChange("cash_savings", v)} />
          <NumField label="Equities" value={financial.equities_value} onChange={v => onChange("equities_value", v)} />
          <NumField label="Bonds" value={financial.bonds_value} onChange={v => onChange("bonds_value", v)} />
          <NumField label="Real Estate" value={financial.real_estate_value} onChange={v => onChange("real_estate_value", v)} />
          <NumField label="Other Assets" value={financial.other_assets} onChange={v => onChange("other_assets", v)} />
          <NumField label="Total Assets" value={financial.total_assets} readOnly highlight />
        </div>
      </section>

      {/* Liabilities */}
      <section>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Liabilities</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumField label="Mortgage" value={financial.mortgage} onChange={v => onChange("mortgage", v)} />
          <NumField label="Loans" value={financial.loans} onChange={v => onChange("loans", v)} />
          <NumField label="Credit Card Debt" value={financial.credit_card_debt} onChange={v => onChange("credit_card_debt", v)} />
        </div>
      </section>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-[#0f172a] rounded-xl">
        <div>
          <p className="text-xs text-slate-400">Total Liabilities</p>
          <p className="text-lg font-bold text-red-400">${financial.total_liabilities.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Net Worth</p>
          <p className={`text-lg font-bold ${financial.total_net_worth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            ${financial.total_net_worth.toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="text-xs text-slate-400">Liquidity Needs</Label>
          <Select value={financial.liquidity_needs} onValueChange={v => onSelectChange("liquidity_needs", v)}>
            <SelectTrigger className="mt-1 h-8 bg-[#1e293b] border-[#334155] text-slate-100 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs text-slate-400">Advisor Notes</Label>
        <Textarea
          value={financial.advisor_notes}
          onChange={e => onSelectChange("advisor_notes", e.target.value)}
          placeholder="Special circumstances, assumptions..."
          rows={2}
          className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100 text-sm"
        />
      </div>
    </div>
  );
}

/* ──────────────── STEP 3 ──────────────── */
const RISK_QUESTIONS = [
  { key: "q1_loss_reaction", label: "If your portfolio dropped 20%, what would you do?", options: [
    { value: "sell_all", label: "Sell everything immediately" },
    { value: "sell_some", label: "Sell some to reduce exposure" },
    { value: "hold", label: "Hold and wait for recovery" },
    { value: "buy_more", label: "Buy more at lower prices" },
  ]},
  { key: "q3_return_expectation", label: "What annual return do you realistically expect?", options: [
    { value: "2-4%", label: "2–4% (Capital preservation)" },
    { value: "4-7%", label: "4–7% (Moderate growth)" },
    { value: "7-12%", label: "7–12% (Growth focused)" },
    { value: "12%+", label: "12%+ (Aggressive growth)" },
  ]},
  { key: "q4_investment_experience", label: "How would you describe your investment experience?", options: [
    { value: "none", label: "None" },
    { value: "beginner", label: "Beginner (< 2 years)" },
    { value: "intermediate", label: "Intermediate (2–7 years)" },
    { value: "advanced", label: "Advanced (7+ years)" },
  ]},
  { key: "q5_income_stability", label: "How stable is your primary income source?", options: [
    { value: "very_stable", label: "Very stable (government, tenured)" },
    { value: "stable", label: "Stable (full-time employment)" },
    { value: "variable", label: "Variable (commission, freelance)" },
    { value: "unstable", label: "Unstable or uncertain" },
  ]},
  { key: "q6_time_horizon_preference", label: "What is your investment time horizon?", options: [
    { value: "short_term", label: "Short term (1–3 years)" },
    { value: "medium_term", label: "Medium term (3–7 years)" },
    { value: "long_term", label: "Long term (7+ years)" },
  ]},
  { key: "q7_portfolio_preference", label: "Which portfolio mix feels most comfortable?", options: [
    { value: "all_bonds", label: "100% bonds / fixed income" },
    { value: "mostly_bonds", label: "Mostly bonds, some stocks" },
    { value: "balanced", label: "50 / 50 balanced" },
    { value: "mostly_stocks", label: "Mostly stocks, some bonds" },
    { value: "all_stocks", label: "100% equities" },
  ]},
];

function StepRisk({ answers, onChange, riskScore, riskCategory, suggestedAlloc }) {
  const ALLOC_BARS = [
    { label: "Stocks", value: suggestedAlloc.stocks, color: "bg-blue-500" },
    { label: "Bonds", value: suggestedAlloc.bonds, color: "bg-emerald-500" },
    { label: "ETFs", value: suggestedAlloc.etfs, color: "bg-violet-500" },
    { label: "Cash", value: suggestedAlloc.cash, color: "bg-amber-500" },
    { label: "Alternatives", value: suggestedAlloc.alternatives, color: "bg-pink-500" },
  ];

  const categoryLabel = riskCategory.replace(/_/g, " ");
  const scoreColor = riskScore <= 33 ? "text-emerald-400" : riskScore <= 66 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Risk & Behavior Assessment</h2>
        <p className="text-sm text-slate-400 mt-0.5">Understanding client risk tolerance and investment behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions */}
        <div className="lg:col-span-2 space-y-4">
          {RISK_QUESTIONS.map(q => (
            <div key={q.key} className="p-4 bg-[#0f172a] rounded-xl">
              <p className="text-sm font-medium text-slate-200 mb-3">{q.label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(q.key, opt.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      answers[q.key] === opt.value
                        ? "border-orange-500 bg-orange-500/15 text-orange-300"
                        : "border-[#334155] hover:border-[#475569] text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Slider */}
          <div className="p-4 bg-[#0f172a] rounded-xl">
            <p className="text-sm font-medium text-slate-200 mb-4">
              Comfort with risk volatility (1–10): <span className="font-bold text-orange-400">{answers.q2_risk_comfort}</span>
            </p>
            <Slider
              value={[answers.q2_risk_comfort]}
              onValueChange={([v]) => onChange("q2_risk_comfort", v)}
              min={1} max={10} step={1}
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-2">
              <span>Very Conservative</span><span>Very Aggressive</span>
            </div>
          </div>
        </div>

        {/* Live Risk Result */}
        <div className="space-y-4">
          <div className="p-4 bg-[#0f172a] rounded-xl">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">Live Risk Score</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center shrink-0">
                <span className={`text-xl font-bold ${scoreColor}`}>{riskScore}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100 capitalize">{categoryLabel}</p>
                <p className="text-xs text-slate-400">out of 100</p>
              </div>
            </div>
            <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-500 ${
                riskScore <= 33 ? "bg-emerald-500" : riskScore <= 66 ? "bg-amber-500" : "bg-red-500"
              }`} style={{ width: `${riskScore}%` }} />
            </div>
          </div>

          <div className="p-4 bg-[#0f172a] rounded-xl">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">Suggested Allocation</p>
            <div className="space-y-2.5">
              {ALLOC_BARS.map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{b.label}</span>
                    <span className="font-semibold text-slate-200">{b.value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div className={`h-full ${b.color} rounded-full transition-all duration-500`} style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── STEP 4 ──────────────── */
function StepGoals({ goals, onChange, client }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Goals & Preferences</h2>
        <p className="text-sm text-slate-400 mt-0.5">Define investment objectives and time horizon</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label className="text-xs text-slate-400">Primary Financial Goal</Label>
          <Select value={goals.financial_goal} onValueChange={v => onChange("financial_goal", v)}>
            <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select goal..." /></SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="retirement">Retirement Planning</SelectItem>
              <SelectItem value="wealth_preservation">Wealth Preservation</SelectItem>
              <SelectItem value="wealth_growth">Wealth Growth</SelectItem>
              <SelectItem value="education">Education Fund</SelectItem>
              <SelectItem value="income_generation">Income Generation</SelectItem>
              <SelectItem value="capital_preservation">Capital Preservation</SelectItem>
              <SelectItem value="estate_planning">Estate Planning</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Investment Horizon</Label>
          <Select value={goals.investment_horizon} onValueChange={v => onChange("investment_horizon", v)}>
            <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select horizon..." /></SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="1-3 years">1–3 Years (Short term)</SelectItem>
              <SelectItem value="3-5 years">3–5 Years (Medium term)</SelectItem>
              <SelectItem value="5-7 years">5–7 Years (Medium-long)</SelectItem>
              <SelectItem value="7-10 years">7–10 Years (Long term)</SelectItem>
              <SelectItem value="10+ years">10+ Years (Very long)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Investable Amount (AUM)</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <Input
              type="number"
              value={goals.investment_amount || ""}
              onChange={e => onChange("investment_amount", parseFloat(e.target.value) || 0)}
              className="pl-7 bg-[#0f172a] border-[#334155] text-slate-100"
              placeholder="500000"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Base Currency</Label>
          <Select value={goals.currency} onValueChange={v => onChange("currency", v)}>
            <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="USD">USD – US Dollar</SelectItem>
              <SelectItem value="EUR">EUR – Euro</SelectItem>
              <SelectItem value="GBP">GBP – British Pound</SelectItem>
              <SelectItem value="AED">AED – UAE Dirham</SelectItem>
              <SelectItem value="SAR">SAR – Saudi Riyal</SelectItem>
              <SelectItem value="CHF">CHF – Swiss Franc</SelectItem>
              <SelectItem value="CAD">CAD – Canadian Dollar</SelectItem>
              <SelectItem value="SGD">SGD – Singapore Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Goal Target Amount</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <Input
              type="number"
              value={goals.goal_target_amount || ""}
              onChange={e => onChange("goal_target_amount", parseFloat(e.target.value) || 0)}
              className="pl-7 bg-[#0f172a] border-[#334155] text-slate-100"
              placeholder="1000000"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Target Date</Label>
          <Input
            type="date"
            value={goals.goal_target_date}
            onChange={e => onChange("goal_target_date", e.target.value)}
            className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
          />
        </div>

        <div>
          <Label className="text-xs text-slate-400">Risk Profile Override (optional)</Label>
          <Select value={goals.risk_profile} onValueChange={v => onChange("risk_profile", v)}>
            <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Use calculated score..." /></SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Goal Priority</Label>
          <Select value={goals.goal_priority} onValueChange={v => onChange("goal_priority", v)}>
            <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── STEP 5 ──────────────── */
function StepReview({ client, financial, goals, riskScore, riskCategory, suggestedAlloc }) {
  const fmtUSD = v => `$${(v || 0).toLocaleString()}`;
  const categoryLabel = riskCategory.replace(/_/g, " ");
  const scoreColor = riskScore <= 33 ? "text-emerald-400" : riskScore <= 66 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Review & Confirm</h2>
        <p className="text-sm text-slate-400 mt-0.5">Verify all information before saving the assessment</p>
      </div>

      {client && (
        <div className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-xl">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-orange-500/20 text-orange-400 font-bold">
              {client.first_name?.[0]}{client.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-100">{client.first_name} {client.last_name}</p>
            <p className="text-xs text-slate-400">{client.email}</p>
          </div>
          <Badge className="ml-auto capitalize bg-slate-700/50 text-slate-300">{client.status}</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Financial */}
        <div className="p-4 bg-[#0f172a] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <p className="text-sm font-semibold text-slate-100">Financial</p>
          </div>
          <div className="space-y-2 text-sm">
            <ReviewRow label="Monthly Income" value={fmtUSD(financial.monthly_income)} />
            <ReviewRow label="Net Surplus" value={fmtUSD(financial.net_surplus)} color={financial.net_surplus >= 0 ? "text-emerald-400" : "text-red-400"} />
            <ReviewRow label="Total Assets" value={fmtUSD(financial.total_assets)} />
            <ReviewRow label="Net Worth" value={fmtUSD(financial.total_net_worth)} />
            <ReviewRow label="Liquidity" value={financial.liquidity_needs} />
          </div>
        </div>

        {/* Risk */}
        <div className="p-4 bg-[#0f172a] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-orange-400" />
            <p className="text-sm font-semibold text-slate-100">Risk Profile</p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
              <span className={`text-base font-bold ${scoreColor}`}>{riskScore}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100 capitalize">{categoryLabel}</p>
              <p className="text-xs text-slate-400">Risk Score</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { l: "Stocks", v: suggestedAlloc.stocks, c: "bg-blue-500" },
              { l: "Bonds", v: suggestedAlloc.bonds, c: "bg-emerald-500" },
              { l: "Cash", v: suggestedAlloc.cash, c: "bg-amber-500" },
            ].map(b => (
              <div key={b.l} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${b.c}`} />
                <span className="text-xs text-slate-400">{b.l}</span>
                <span className="text-xs font-semibold text-slate-200 ml-auto">{b.v}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="p-4 bg-[#0f172a] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-orange-400" />
            <p className="text-sm font-semibold text-slate-100">Goals</p>
          </div>
          <div className="space-y-2 text-sm">
            <ReviewRow label="Goal" value={(goals.financial_goal || "—").replace(/_/g, " ")} />
            <ReviewRow label="Horizon" value={goals.investment_horizon || "—"} />
            <ReviewRow label="AUM" value={goals.investment_amount ? fmtUSD(goals.investment_amount) : "—"} />
            <ReviewRow label="Target" value={goals.goal_target_amount ? fmtUSD(goals.goal_target_amount) : "—"} />
            <ReviewRow label="Currency" value={goals.currency} />
          </div>
        </div>
      </div>

      <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">Ready to save</p>
          <p className="text-xs text-slate-400 mt-0.5">Click "Save Assessment" to store all data, or "Save & Proceed" to go directly to Portfolio Builder.</p>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, color }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium text-slate-200 capitalize ${color || ""}`}>{value}</span>
    </div>
  );
}

function NumField({ label, value, onChange, readOnly, highlight }) {
  return (
    <div>
      <Label className="text-xs text-slate-400">{label}</Label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
        <Input
          type="number"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          readOnly={readOnly}
          className={`pl-7 bg-[#0f172a] border-[#334155] text-slate-100 ${readOnly ? "opacity-70" : ""} ${highlight ? "font-bold text-emerald-400" : ""}`}
        />
      </div>
    </div>
  );
}
