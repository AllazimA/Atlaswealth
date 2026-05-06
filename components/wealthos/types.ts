export type IncomeFrequency = 'weekly' | 'biweekly' | 'monthly' | 'annual'
export type IncomeCategory = 'primary' | 'secondary' | 'passive' | 'bonus'
export type ExpenseCategory = 'needs' | 'wants' | 'savings'
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'other'
export type GoalStatus = 'active' | 'completed' | 'paused'

export interface IncomeSource {
  id: string
  name: string
  amount: number
  frequency: IncomeFrequency
  category: IncomeCategory
  description?: string
  createdAt: string
}

export interface Expense {
  id: string
  name: string
  amount: number
  category: ExpenseCategory
  subcategory: string
  date: string
  accountId?: string
  notes?: string
  emoji?: string
}

export interface Account {
  id: string
  name: string
  bank: string
  type: AccountType
  balance: number
  lastUpdated: string
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: 'credit' | 'debit'
  category?: string
}

export type AssetClass = 'Stocks' | 'Bonds' | 'Gold' | 'ETF' | 'Crypto' | 'REITs' | 'Cash' | 'Other'

export interface Investment {
  id: string
  assetClass: AssetClass
  allocationPercentage: number
  amount?: number
  notes?: string
}

export interface Goal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  category: string
  status: GoalStatus
  color: string
}

export interface Budget {
  id: string
  category: string
  expenseCategory: ExpenseCategory
  limit: number
  month: string
}

export interface WealthSettings {
  currency: string
  displayName: string
  email: string
  notifications: boolean
}

export interface WealthData {
  incomeSources: IncomeSource[]
  expenses: Expense[]
  accounts: Account[]
  investments: Investment[]
  goals: Goal[]
  budgets: Budget[]
  settings: WealthSettings
}
