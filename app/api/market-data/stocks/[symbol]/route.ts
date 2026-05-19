import { NextRequest, NextResponse } from 'next/server'

// Mock stock data for development
// In production, this would call real market data APIs (Twelve Data, Alpha Vantage, etc.)
const MOCK_STOCKS: Record<string, any> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.95,
    change: 2.45,
    changePercent: 1.31,
    high52Week: 199.62,
    low52Week: 164.08,
    volume: 52_000_000,
    marketCap: 2_950_000_000_000,
    pe: 32.5,
    dividendYield: 0.0045,
    beta: 1.25,
    description:
      'Apple Inc. is an American multinational technology company that specializes in consumer electronics, computer software, and online services.',
    industry: 'Technology',
    website: 'https://www.apple.com',
    priceHistory: generateMockPriceHistory(189.95, 30),
    technicalIndicators: {
      sma50: 185.32,
      sma200: 178.45,
      rsi: 65.4,
    },
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 416.22,
    change: 5.18,
    changePercent: 1.26,
    high52Week: 437.67,
    low52Week: 327.68,
    volume: 19_500_000,
    marketCap: 3_100_000_000_000,
    pe: 35.8,
    dividendYield: 0.0072,
    beta: 0.95,
    description:
      'Microsoft Corporation is an American technology corporation that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services.',
    industry: 'Technology',
    website: 'https://www.microsoft.com',
    priceHistory: generateMockPriceHistory(416.22, 30),
    technicalIndicators: {
      sma50: 410.15,
      sma200: 395.32,
      rsi: 62.8,
    },
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 177.45,
    change: 2.15,
    changePercent: 1.23,
    high52Week: 203.48,
    low52Week: 136.57,
    volume: 21_300_000,
    marketCap: 1_750_000_000_000,
    pe: 28.4,
    dividendYield: 0.0,
    beta: 1.05,
    description:
      'Alphabet Inc. is an American multinational conglomerate and technology company. It is the parent company of Google, a search engine and advertising company that represents the majority of its business and revenue.',
    industry: 'Technology',
    website: 'https://www.google.com',
    priceHistory: generateMockPriceHistory(177.45, 30),
    technicalIndicators: {
      sma50: 173.82,
      sma200: 168.95,
      rsi: 58.3,
    },
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 242.84,
    change: -3.22,
    changePercent: -1.31,
    high52Week: 299.29,
    low52Week: 155.87,
    volume: 126_000_000,
    marketCap: 768_000_000_000,
    pe: 68.5,
    dividendYield: 0.0,
    beta: 2.35,
    description:
      'Tesla, Inc. is an American electric vehicle and clean energy company. The company specializes in electric vehicle manufacturing and solar panel production.',
    industry: 'Automotive',
    website: 'https://www.tesla.com',
    priceHistory: generateMockPriceHistory(242.84, 30),
    technicalIndicators: {
      sma50: 248.95,
      sma200: 235.12,
      rsi: 45.2,
    },
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.34,
    change: 12.45,
    changePercent: 1.44,
    high52Week: 969.27,
    low52Week: 398.82,
    volume: 35_400_000,
    marketCap: 2_150_000_000_000,
    pe: 54.2,
    dividendYield: 0.0036,
    beta: 1.82,
    description:
      'NVIDIA Corporation is an American technology company that designs graphics processing units (GPUs) for gaming and professional markets.',
    industry: 'Technology',
    website: 'https://www.nvidia.com',
    priceHistory: generateMockPriceHistory(875.34, 30),
    technicalIndicators: {
      sma50: 862.15,
      sma200: 725.48,
      rsi: 71.5,
    },
  },
}

function generateMockPriceHistory(
  currentPrice: number,
  days: number
) {
  const history = []
  let price = currentPrice * 0.92 // Start lower

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // Random walk
    price = price * (0.98 + Math.random() * 0.04)

    const open = price
    const close = price * (0.99 + Math.random() * 0.02)
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.floor(20_000_000 + Math.random() * 40_000_000)

    history.push({
      date: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })

    price = close
  }

  return history
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase()
    const timeframe = request.nextUrl.searchParams.get('timeframe') || '1M'

    // Check if symbol exists in mock data
    const stockData = MOCK_STOCKS[symbol]

    if (!stockData) {
      return NextResponse.json(
        { error: `Stock symbol "${symbol}" not found` },
        { status: 404 }
      )
    }

    // Filter price history based on timeframe
    const allHistory = stockData.priceHistory
    let filteredHistory = allHistory

    switch (timeframe) {
      case '1D':
        filteredHistory = allHistory.slice(-1)
        break
      case '1W':
        filteredHistory = allHistory.slice(-5)
        break
      case '1M':
        filteredHistory = allHistory.slice(-21)
        break
      case '3M':
        filteredHistory = allHistory.slice(-63)
        break
      case '1Y':
        filteredHistory = allHistory
        break
    }

    return NextResponse.json({
      ...stockData,
      priceHistory: filteredHistory,
    })
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
