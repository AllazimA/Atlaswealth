import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Home, CreditCard, TrendingUp, AlertCircle } from "lucide-react";

export default function AdvisorCalculators() {
  // Mortgage Calculator
  const [mortgage, setMortgage] = useState({ principal: 300000, rate: 5.5, years: 30 });
  const monthlyMortgage = mortgage.principal > 0 && mortgage.rate > 0 && mortgage.years > 0
    ? (mortgage.principal * (mortgage.rate / 100 / 12) * Math.pow(1 + mortgage.rate / 100 / 12, mortgage.years * 12)) / 
      (Math.pow(1 + mortgage.rate / 100 / 12, mortgage.years * 12) - 1)
    : 0;
  const totalMortgage = monthlyMortgage * mortgage.years * 12;
  const interestMortgage = totalMortgage - mortgage.principal;

  // Loan Calculator
  const [loan, setLoan] = useState({ amount: 50000, rate: 8, months: 60 });
  const monthlyLoan = loan.amount > 0 && loan.rate > 0 && loan.months > 0
    ? (loan.amount * (loan.rate / 100 / 12) * Math.pow(1 + loan.rate / 100 / 12, loan.months)) / 
      (Math.pow(1 + loan.rate / 100 / 12, loan.months) - 1)
    : 0;
  const totalLoan = monthlyLoan * loan.months;
  const interestLoan = totalLoan - loan.amount;

  // DBR Calculator
  const [dbr, setDbr] = useState({ monthlyIncome: 8000, debtPayments: 2500 });
  const dbrRatio = dbr.monthlyIncome > 0 ? (dbr.debtPayments / dbr.monthlyIncome) * 100 : 0;
  const dbrStatus = dbrRatio < 35 ? "healthy" : dbrRatio < 50 ? "caution" : "high";

  // Investment Growth Calculator
  const [investment, setInvestment] = useState({ initial: 10000, monthly: 500, rate: 7, years: 20 });
  const months = investment.years * 12;
  const r = investment.rate / 100 / 12;
  const futureValue = investment.initial > 0 && investment.rate > 0 && investment.years > 0
    ? investment.initial * Math.pow(1 + r, months) + 
      investment.monthly * ((Math.pow(1 + r, months) - 1) / r)
    : 0;
  const totalInvested = investment.initial + (investment.monthly * months);
  const gains = futureValue - totalInvested;

  return (
    <Card className="border-[#334155] bg-[#1e293b] h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-orange-400" />
          Financial Calculators
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <Tabs defaultValue="mortgage" className="h-full">
          <TabsList className="grid grid-cols-4 bg-[#0f172a] border border-[#334155] mb-4">
            <TabsTrigger value="mortgage" className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Home className="w-3 h-3 mr-1" />
              Mortgage
            </TabsTrigger>
            <TabsTrigger value="loan" className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <CreditCard className="w-3 h-3 mr-1" />
              Loan
            </TabsTrigger>
            <TabsTrigger value="dbr" className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <AlertCircle className="w-3 h-3 mr-1" />
              DBR
            </TabsTrigger>
            <TabsTrigger value="growth" className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              Growth
            </TabsTrigger>
          </TabsList>

          {/* Mortgage Calculator */}
          <TabsContent value="mortgage" className="space-y-3 mt-0">
            <div>
              <Label className="text-xs text-slate-400">Principal Amount ($)</Label>
              <Input 
                type="number"
                value={mortgage.principal}
                onChange={(e) => setMortgage({...mortgage, principal: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Annual Interest Rate (%)</Label>
              <Input 
                type="number"
                step="0.1"
                value={mortgage.rate}
                onChange={(e) => setMortgage({...mortgage, rate: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Loan Term (Years)</Label>
              <Input 
                type="number"
                value={mortgage.years}
                onChange={(e) => setMortgage({...mortgage, years: parseInt(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            
            <div className="pt-3 border-t border-slate-700/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Monthly Payment:</span>
                <span className="text-sm font-semibold text-emerald-400">${monthlyMortgage.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Payment:</span>
                <span className="text-sm font-semibold text-slate-100">${totalMortgage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Interest:</span>
                <span className="text-sm font-semibold text-orange-400">${interestMortgage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
            </div>
          </TabsContent>

          {/* Loan Calculator */}
          <TabsContent value="loan" className="space-y-3 mt-0">
            <div>
              <Label className="text-xs text-slate-400">Loan Amount ($)</Label>
              <Input 
                type="number"
                value={loan.amount}
                onChange={(e) => setLoan({...loan, amount: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Annual Interest Rate (%)</Label>
              <Input 
                type="number"
                step="0.1"
                value={loan.rate}
                onChange={(e) => setLoan({...loan, rate: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Loan Term (Months)</Label>
              <Input 
                type="number"
                value={loan.months}
                onChange={(e) => setLoan({...loan, months: parseInt(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            
            <div className="pt-3 border-t border-slate-700/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Monthly EMI:</span>
                <span className="text-sm font-semibold text-emerald-400">${monthlyLoan.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Payment:</span>
                <span className="text-sm font-semibold text-slate-100">${totalLoan.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Interest:</span>
                <span className="text-sm font-semibold text-orange-400">${interestLoan.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
            </div>
          </TabsContent>

          {/* DBR Calculator */}
          <TabsContent value="dbr" className="space-y-3 mt-0">
            <div>
              <Label className="text-xs text-slate-400">Monthly Income ($)</Label>
              <Input 
                type="number"
                value={dbr.monthlyIncome}
                onChange={(e) => setDbr({...dbr, monthlyIncome: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Total Monthly Debt Payments ($)</Label>
              <Input 
                type="number"
                value={dbr.debtPayments}
                onChange={(e) => setDbr({...dbr, debtPayments: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            
            <div className="pt-3 border-t border-slate-700/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Debt Burden Ratio:</span>
                <span className={`text-2xl font-bold ${
                  dbrStatus === "healthy" ? "text-emerald-400" : 
                  dbrStatus === "caution" ? "text-amber-400" : "text-red-400"
                }`}>
                  {dbrRatio.toFixed(1)}%
                </span>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                dbrStatus === "healthy" ? "bg-emerald-500/10 border-emerald-500/30" :
                dbrStatus === "caution" ? "bg-amber-500/10 border-amber-500/30" :
                "bg-red-500/10 border-red-500/30"
              }`}>
                <p className={`text-xs font-medium ${
                  dbrStatus === "healthy" ? "text-emerald-400" :
                  dbrStatus === "caution" ? "text-amber-400" :
                  "text-red-400"
                }`}>
                  {dbrStatus === "healthy" && "Healthy - Under 35%"}
                  {dbrStatus === "caution" && "Caution - 35-50%"}
                  {dbrStatus === "high" && "High Risk - Over 50%"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {dbrStatus === "healthy" && "Client has good capacity for additional debt"}
                  {dbrStatus === "caution" && "Monitor debt levels, limited capacity for new debt"}
                  {dbrStatus === "high" && "High debt burden, consider debt consolidation"}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Investment Growth Calculator */}
          <TabsContent value="growth" className="space-y-3 mt-0">
            <div>
              <Label className="text-xs text-slate-400">Initial Investment ($)</Label>
              <Input 
                type="number"
                value={investment.initial}
                onChange={(e) => setInvestment({...investment, initial: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Monthly Contribution ($)</Label>
              <Input 
                type="number"
                value={investment.monthly}
                onChange={(e) => setInvestment({...investment, monthly: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Expected Annual Return (%)</Label>
              <Input 
                type="number"
                step="0.1"
                value={investment.rate}
                onChange={(e) => setInvestment({...investment, rate: parseFloat(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Time Horizon (Years)</Label>
              <Input 
                type="number"
                value={investment.years}
                onChange={(e) => setInvestment({...investment, years: parseInt(e.target.value) || 0})}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              />
            </div>
            
            <div className="pt-3 border-t border-slate-700/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Future Value:</span>
                <span className="text-lg font-bold text-emerald-400">${futureValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Invested:</span>
                <span className="text-sm font-semibold text-slate-100">${totalInvested.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Gains:</span>
                <span className="text-sm font-semibold text-orange-400">${gains.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}