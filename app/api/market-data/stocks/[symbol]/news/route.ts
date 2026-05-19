import { NextRequest, NextResponse } from 'next/server'

// Mock news data for development
const MOCK_NEWS: Record<string, any[]> = {
  AAPL: [
    {
      title: 'Apple Reports Record Quarterly Earnings',
      source: 'Reuters',
      url: 'https://example.com/news/1',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Apple Inc. reported record-breaking quarterly earnings today, driven by strong sales in the iPhone and Services segments.',
    },
    {
      title: 'Apple Announces New AI Features for Upcoming iOS',
      source: 'The Verge',
      url: 'https://example.com/news/2',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Apple unveiled a suite of new artificial intelligence features for its upcoming iOS update, focusing on on-device processing.',
    },
    {
      title: 'Apple Watch Receives New Health Monitoring Features',
      source: 'MacRumors',
      url: 'https://example.com/news/3',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'The latest Apple Watch model introduces advanced health monitoring capabilities, including new sensors and improved algorithms.',
    },
    {
      title: 'Analysts Raise Price Targets for Apple Stock',
      source: 'MarketWatch',
      url: 'https://example.com/news/4',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Multiple Wall Street analysts raised their price targets for Apple following the strong earnings report.',
    },
    {
      title: 'Apple Expands Services Business with New Partnerships',
      source: 'Bloomberg',
      url: 'https://example.com/news/5',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Apple announced strategic partnerships to expand its Services business, aiming for higher recurring revenue.',
    },
  ],
  MSFT: [
    {
      title: 'Microsoft Announces Major Cloud Infrastructure Investment',
      source: 'CNBC',
      url: 'https://example.com/news/6',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Microsoft plans to invest billions in cloud infrastructure to support growing demand for AI and enterprise services.',
    },
    {
      title: 'Microsoft Teams Reaches 300 Million Monthly Users',
      source: 'TechCrunch',
      url: 'https://example.com/news/7',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Microsoft Teams, the company\'s collaboration platform, has surpassed 300 million monthly active users.',
    },
    {
      title: 'Azure Dominance Continues in Cloud Market',
      source: 'Gartner',
      url: 'https://example.com/news/8',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Microsoft Azure maintains its strong position in the cloud computing market, gaining market share from competitors.',
    },
    {
      title: 'Microsoft Integrates OpenAI Capabilities Across Products',
      source: 'VentureBeat',
      url: 'https://example.com/news/9',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Microsoft announced deeper integration of OpenAI technologies into its Office suite and enterprise products.',
    },
    {
      title: 'Stock Price Hits New 52-Week High',
      source: 'Seeking Alpha',
      url: 'https://example.com/news/10',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Microsoft stock reached a new 52-week high today on positive sentiment around cloud growth and AI adoption.',
    },
  ],
  GOOGL: [
    {
      title: 'Google Search Enhances Results with AI',
      source: 'Search Engine Land',
      url: 'https://example.com/news/11',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Google announced AI-powered enhancements to its search results, providing more contextual and relevant answers.',
    },
    {
      title: 'Alphabet Reports Billion-Dollar Investment in AI Research',
      source: 'Reuters',
      url: 'https://example.com/news/12',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Alphabet committed to investing billions in AI research and development across multiple divisions.',
    },
  ],
  TSLA: [
    {
      title: 'Tesla Delivers Record Number of Vehicles',
      source: 'Electrek',
      url: 'https://example.com/news/13',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Tesla announced record vehicle deliveries for the quarter, exceeding analyst expectations.',
    },
    {
      title: 'Tesla Expands Manufacturing Capacity',
      source: 'CNBC',
      url: 'https://example.com/news/14',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'Tesla plans to expand manufacturing capacity at existing facilities and considers new production locations.',
    },
  ],
  NVDA: [
    {
      title: 'NVIDIA Dominates AI Chip Market',
      source: 'Tom\'s Hardware',
      url: 'https://example.com/news/15',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'NVIDIA continues to dominate the artificial intelligence chip market with strong demand for its GPU products.',
    },
    {
      title: 'Data Center Revenue Continues Strong Growth',
      source: 'AnandTech',
      url: 'https://example.com/news/16',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary:
        'NVIDIA reports strong growth in its data center business, driven by enterprise demand for AI infrastructure.',
    },
  ],
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase()

    // Get news for the symbol, or return empty array if not found
    const news = MOCK_NEWS[symbol] || []

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
