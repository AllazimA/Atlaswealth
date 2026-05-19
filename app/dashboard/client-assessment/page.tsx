'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AssessmentResponse {
  age: string
  income: string
  netWorth: string
  investmentHorizon: string
  riskTolerance: string
  investmentExperience: string
  liquidityNeeds: string
  taxSituation: string
  goals: string[]
}

export default function ClientAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [responses, setResponses] = useState<AssessmentResponse>({
    age: '',
    income: '',
    netWorth: '',
    investmentHorizon: '',
    riskTolerance: '',
    investmentExperience: '',
    liquidityNeeds: '',
    taxSituation: '',
    goals: [],
  })
  const [showResults, setShowResults] = useState(false)

  const handleInputChange = (field: keyof AssessmentResponse, value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setResponses(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }))
  }

  const calculateRiskProfile = (): string => {
    let score = 0

    // Age factor (younger = higher risk tolerance)
    const age = parseInt(responses.age)
    if (age < 30) score += 3
    else if (age < 40) score += 2.5
    else if (age < 50) score += 2
    else if (age < 60) score += 1.5
    else score += 1

    // Risk tolerance responses
    if (responses.riskTolerance === 'high') score += 3
    else if (responses.riskTolerance === 'moderate') score += 2
    else score += 1

    // Investment experience
    if (responses.investmentExperience === 'expert') score += 2
    else if (responses.investmentExperience === 'intermediate') score += 1.5
    else score += 0.5

    // Investment horizon (longer = higher risk)
    if (responses.investmentHorizon === '20+') score += 2
    else if (responses.investmentHorizon === '10-20') score += 1.5
    else if (responses.investmentHorizon === '5-10') score += 1
    else score += 0.5

    // Normalize to 1-100
    const normalized = Math.round((score / 8.5) * 100)
    return normalized > 100 ? 100 : normalized < 0 ? 0 : normalized

  }

  const getRiskCategory = (): string => {
    const score = parseInt(calculateRiskProfile())
    if (score >= 70) return 'Aggressive'
    if (score >= 40) return 'Moderate'
    return 'Conservative'
  }

  const handleSubmit = () => {
    if (!responses.age || !responses.riskTolerance || !responses.investmentHorizon) {
      toast.error('Please complete all required fields')
      return
    }
    setShowResults(true)
    toast.success('Assessment completed!')
  }

  const steps = [
    {
      title: 'Financial Profile',
      fields: ['age', 'income', 'netWorth'],
    },
    {
      title: 'Investment Preferences',
      fields: ['investmentHorizon', 'riskTolerance', 'investmentExperience'],
    },
    {
      title: 'Additional Information',
      fields: ['liquidityNeeds', 'taxSituation'],
    },
  ]

  if (showResults) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assessment Results</h1>
          <p className="text-slate-600 mt-1">Your personalized risk profile and recommendations</p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Assessment Complete</h2>
              <p className="text-slate-700 mt-1">Your risk profile has been calculated based on your responses</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Risk Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">Risk Score</p>
              <div className="text-4xl font-bold text-blue-600">
                {calculateRiskProfile()}
              </div>
              <p className="text-sm text-slate-500 mt-1">out of 100</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Risk Category</p>
              <div className={`text-4xl font-bold ${
                getRiskCategory() === 'Aggressive' ? 'text-red-600' :
                getRiskCategory() === 'Moderate' ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {getRiskCategory()}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-slate-900 mb-4">Summary</h4>
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-medium">Age:</span> {responses.age} years</p>
              <p><span className="font-medium">Investment Horizon:</span> {responses.investmentHorizon} years</p>
              <p><span className="font-medium">Experience Level:</span> {responses.investmentExperience}</p>
              <p><span className="font-medium">Liquidity Needs:</span> {responses.liquidityNeeds}</p>
              <p><span className="font-medium">Investment Goals:</span> {responses.goals.join(', ') || 'Not specified'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-50 border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">Recommended Portfolio Allocation</h4>
          <div className="space-y-3">
            {getRiskCategory() === 'Conservative' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Bonds & Fixed Income</span>
                  <span className="font-semibold text-slate-900">60%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Large-Cap Stocks</span>
                  <span className="font-semibold text-slate-900">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Cash & Equivalents</span>
                  <span className="font-semibold text-slate-900">10%</span>
                </div>
              </>
            )}
            {getRiskCategory() === 'Moderate' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Stocks</span>
                  <span className="font-semibold text-slate-900">60%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Bonds</span>
                  <span className="font-semibold text-slate-900">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Alternatives</span>
                  <span className="font-semibold text-slate-900">10%</span>
                </div>
              </>
            )}
            {getRiskCategory() === 'Aggressive' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Stocks & Growth</span>
                  <span className="font-semibold text-slate-900">80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Alternative Assets</span>
                  <span className="font-semibold text-slate-900">15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Cash Reserve</span>
                  <span className="font-semibold text-slate-900">5%</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowResults(false)
              setCurrentStep(1)
              setResponses({
                age: '',
                income: '',
                netWorth: '',
                investmentHorizon: '',
                riskTolerance: '',
                investmentExperience: '',
                liquidityNeeds: '',
                taxSituation: '',
                goals: [],
              })
            }}
            variant="outline"
          >
            Retake Assessment
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Create Portfolio Based on Profile
          </Button>
        </div>
      </div>
    )
  }

  const step = steps[currentStep - 1]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Client Risk Assessment</h1>
        <p className="text-slate-600 mt-1">Comprehensive questionnaire to determine investment profile</p>
      </div>

      {/* ── Progress ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-slate-600">
            {step.title}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Questions ─────────────────────────────────────────────────── */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="space-y-6">
          {currentStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Age * <span className="text-slate-500">(years)</span>
                </label>
                <Input
                  type="number"
                  value={responses.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="45"
                  className="bg-white border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Annual Income <span className="text-slate-500">($)</span>
                </label>
                <Input
                  type="number"
                  value={responses.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  placeholder="150000"
                  className="bg-white border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Net Worth <span className="text-slate-500">($)</span>
                </label>
                <Input
                  type="number"
                  value={responses.netWorth}
                  onChange={(e) => handleInputChange('netWorth', e.target.value)}
                  placeholder="1000000"
                  className="bg-white border-slate-300"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Investment Horizon * <span className="text-slate-500">(years until retirement)</span>
                </label>
                <div className="space-y-2">
                  {['0-5', '5-10', '10-20', '20+'].map(option => (
                    <label key={option} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="investmentHorizon"
                        value={option}
                        checked={responses.investmentHorizon === option}
                        onChange={(e) => handleInputChange('investmentHorizon', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Risk Tolerance * <span className="text-slate-500">(comfort with volatility)</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low - I prefer stability and capital preservation' },
                    { value: 'moderate', label: 'Moderate - I accept some volatility for growth' },
                    { value: 'high', label: 'High - I seek maximum growth, accept significant volatility' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="riskTolerance"
                        value={option.value}
                        checked={responses.riskTolerance === option.value}
                        onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Investment Experience
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'beginner', label: 'Beginner - Limited investment experience' },
                    { value: 'intermediate', label: 'Intermediate - Some experience with stocks/bonds' },
                    { value: 'expert', label: 'Expert - Extensive investment knowledge' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="investmentExperience"
                        value={option.value}
                        checked={responses.investmentExperience === option.value}
                        onChange={(e) => handleInputChange('investmentExperience', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Liquidity Needs <span className="text-slate-500">(when will you need access to funds?)</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'immediate', label: 'Immediate - May need funds within 1 year' },
                    { value: 'short-term', label: 'Short-term - 1-3 years' },
                    { value: 'long-term', label: 'Long-term - 3+ years' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="liquidityNeeds"
                        value={option.value}
                        checked={responses.liquidityNeeds === option.value}
                        onChange={(e) => handleInputChange('liquidityNeeds', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Tax Situation
                </label>
                <Input
                  type="text"
                  value={responses.taxSituation}
                  onChange={(e) => handleInputChange('taxSituation', e.target.value)}
                  placeholder="e.g., High tax bracket, Tax-deferred account, etc."
                  className="bg-white border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Investment Goals
                </label>
                <div className="space-y-2">
                  {['Wealth Growth', 'Income Generation', 'Capital Preservation', 'Retirement Planning', 'College Savings'].map(goal => (
                    <label key={goal} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={responses.goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between gap-2">
        <Button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          variant="outline"
        >
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Assessment
          </Button>
        )}
      </div>
    </div>
  )
}
