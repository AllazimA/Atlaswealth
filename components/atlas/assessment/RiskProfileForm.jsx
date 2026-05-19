import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Shield } from "lucide-react";

function calculateRiskScore(answers) {
  let score = 0;
  // Loss reaction: sell_all=0, sell_some=10, hold=20, buy_more=30
  const lossMap = { sell_all: 0, sell_some: 10, hold: 20, buy_more: 30 };
  score += lossMap[answers.q1_loss_reaction] || 0;
  // Risk comfort: 1-10 scaled to 0-20
  score += ((answers.q2_risk_comfort || 5) / 10) * 20;
  // Return expectation
  const returnMap = { "2-4%": 0, "4-7%": 5, "7-12%": 10, "12%+": 15 };
  score += returnMap[answers.q3_return_expectation] || 0;
  // Experience
  const expMap = { none: 0, beginner: 3, intermediate: 7, advanced: 10 };
  score += expMap[answers.q4_investment_experience] || 0;
  // Income stability
  const incMap = { very_stable: 5, stable: 3, variable: 1, unstable: 0 };
  score += incMap[answers.q5_income_stability] || 0;
  // Time horizon
  const timeMap = { short_term: 0, medium_term: 5, long_term: 10 };
  score += timeMap[answers.q6_time_horizon_preference] || 0;
  // Portfolio preference
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
  const allocations = {
    conservative: { stocks: 20, bonds: 50, cash: 20, alternatives: 10 },
    moderate_conservative: { stocks: 35, bonds: 40, cash: 15, alternatives: 10 },
    moderate: { stocks: 50, bonds: 30, cash: 10, alternatives: 10 },
    moderate_aggressive: { stocks: 65, bonds: 20, cash: 5, alternatives: 10 },
    aggressive: { stocks: 80, bonds: 10, cash: 5, alternatives: 5 },
  };
  return allocations[category] || allocations.moderate;
}

export default function RiskProfileForm({ clientId, existingAssessment }) {
  const [saved, setSaved] = useState(false);
  const [showResults, setShowResults] = useState(!!existingAssessment?.risk_score);
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState({
    q1_loss_reaction: existingAssessment?.q1_loss_reaction || "",
    q2_risk_comfort: existingAssessment?.q2_risk_comfort || 5,
    q3_return_expectation: existingAssessment?.q3_return_expectation || "",
    q4_investment_experience: existingAssessment?.q4_investment_experience || "",
    q5_income_stability: existingAssessment?.q5_income_stability || "",
    q6_time_horizon_preference: existingAssessment?.q6_time_horizon_preference || "",
    q7_portfolio_preference: existingAssessment?.q7_portfolio_preference || "",
  });

  const riskScore = calculateRiskScore(answers);
  const riskCategory = getRiskCategory(riskScore);
  const allocation = getSuggestedAllocation(riskCategory);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingAssessment?.id) {
        await base44.entities.RiskAssessment.update(existingAssessment.id, data);
      } else {
        await base44.entities.RiskAssessment.create({ ...data, client_id: clientId, assessment_date: new Date().toISOString().split("T")[0] });
      }
      // Update client risk profile
      await base44.entities.Client.update(clientId, {
        risk_score: data.risk_score,
        risk_profile: data.risk_score <= 33 ? "conservative" : data.risk_score <= 66 ? "moderate" : "aggressive",
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskAssessments"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
    saveMutation.mutate({
      ...answers,
      risk_score: riskScore,
      risk_category: riskCategory,
      suggested_stocks_pct: allocation.stocks,
      suggested_bonds_pct: allocation.bonds,
      suggested_cash_pct: allocation.cash,
      suggested_alternatives_pct: allocation.alternatives,
    });
  };

  const questions = [
    { key: "q1_loss_reaction", label: "If your portfolio dropped 20%, what would you do?", options: [
      { value: "sell_all", label: "Sell everything" },
      { value: "sell_some", label: "Sell some holdings" },
      { value: "hold", label: "Hold and wait" },
      { value: "buy_more", label: "Buy more at lower prices" },
    ]},
    { key: "q3_return_expectation", label: "What annual return do you expect?", options: [
      { value: "2-4%", label: "2-4% (Safe)" },
      { value: "4-7%", label: "4-7% (Moderate)" },
      { value: "7-12%", label: "7-12% (Growth)" },
      { value: "12%+", label: "12%+ (Aggressive)" },
    ]},
    { key: "q4_investment_experience", label: "Your investment experience level?", options: [
      { value: "none", label: "None" },
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ]},
    { key: "q5_income_stability", label: "How stable is your income?", options: [
      { value: "very_stable", label: "Very Stable" },
      { value: "stable", label: "Stable" },
      { value: "variable", label: "Variable" },
      { value: "unstable", label: "Unstable" },
    ]},
    { key: "q6_time_horizon_preference", label: "Investment time horizon preference?", options: [
      { value: "short_term", label: "Short Term (1-3 yrs)" },
      { value: "medium_term", label: "Medium Term (3-7 yrs)" },
      { value: "long_term", label: "Long Term (7+ yrs)" },
    ]},
    { key: "q7_portfolio_preference", label: "Preferred portfolio mix?", options: [
      { value: "all_bonds", label: "All Bonds" },
      { value: "mostly_bonds", label: "Mostly Bonds" },
      { value: "balanced", label: "Balanced" },
      { value: "mostly_stocks", label: "Mostly Stocks" },
      { value: "all_stocks", label: "All Stocks" },
    ]},
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.key} className="border-[#334155] bg-[#1e293b]">
            <CardContent className="p-5">
              <Label className="text-sm font-medium text-slate-100">{q.label}</Label>
              <Select value={answers[q.key]} onValueChange={(v) => setAnswers((p) => ({ ...p, [q.key]: v }))}>
                <SelectTrigger className="mt-2 bg-[#0f172a] border-[#334155] text-slate-100"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {q.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}

        {/* Slider for risk comfort */}
        <Card className="border-[#334155] bg-[#1e293b]">
          <CardContent className="p-5">
            <Label className="text-sm font-medium text-slate-100">
              Comfort with risk (1-10): <span className="font-bold text-orange-400">{answers.q2_risk_comfort}</span>
            </Label>
            <Slider
              value={[answers.q2_risk_comfort]}
              onValueChange={([v]) => setAnswers((p) => ({ ...p, q2_risk_comfort: v }))}
              min={1} max={10} step={1}
              className="mt-4"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Very Conservative</span><span>Very Aggressive</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {showResults && (
        <Card className="border-orange-500/30 bg-orange-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-100">
              <Shield className="w-4 h-4 text-orange-400" /> Risk Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{riskScore}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100 capitalize">{riskCategory.replace("_", " ")}</p>
                <p className="text-xs text-slate-400">Risk Score: {riskScore}/100</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-300 mb-3">Suggested Allocation</p>
            <div className="space-y-2">
              <AllocBar label="Stocks" pct={allocation.stocks} color="bg-blue-500" />
              <AllocBar label="Bonds" pct={allocation.bonds} color="bg-emerald-500" />
              <AllocBar label="Cash" pct={allocation.cash} color="bg-amber-500" />
              <AllocBar label="Alternatives" pct={allocation.alternatives} color="bg-violet-500" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saveMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
          {saveMutation.isPending ? "Saving..." : "Calculate & Save"}
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

function AllocBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-slate-100">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}