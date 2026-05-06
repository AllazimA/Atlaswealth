export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content?: string
  category: string
  date: string
  readTime: string
  tags: string[]
  image?: string
  featured: boolean
  link?: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 7,
    title: 'JPMorgan Chase Tops Market Cap, ICBC Leads in Assets',
    excerpt: 'JPMorgan Chase leads in market capitalisation — reflecting profitability, investor confidence, and strategic execution. ICBC dominates in total assets — demonstrating systemic scale and lending power. Modern banking leadership depends on efficiency, return on equity, and capital discipline.',
    category: 'Banking & Finance',
    date: '2024',
    readTime: '3 min read',
    tags: ['JPMorgan', 'Global Banking', 'ICBC', 'Wealth Management'],
    featured: true,
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7418289988737392640/',
  },
  {
    id: 1,
    title: 'The Capital Commitment: From Blueprints to Billions',
    excerpt: 'As we move through Q1 2026, the regional narrative has fundamentally shifted. "The Pivot to Execution" — GCC Vision programs are no longer just strategy slides, they\'re becoming tangible capital flows.',
    category: 'Market Insights',
    date: 'March 2026',
    readTime: '5 min read',
    tags: ['GCC', 'Capital Markets', 'Investment', 'Vision 2030'],
    featured: true,
    link: 'https://www.linkedin.com/pulse/capital-commitment-from-blueprints-billions-ahmed-allazim-msayf/',
  },
  {
    id: 2,
    title: 'The Velocity Shift: Financing the Real Economy | March 2026',
    excerpt: 'Parts of this article were written with the help of AI. Not to "press a button, publish a post" but in a sense — to explore how AI augments financial analysis and insight generation.',
    category: 'MENA Financial Pulse',
    date: 'March 2026',
    readTime: '4 min read',
    tags: ['MENA', 'AI', 'Finance', 'Real Economy'],
    featured: true,
    link: 'https://www.linkedin.com/pulse/velocity-shift-edition-12-financing-real-economy-march-ahmed-allazim-hqcrf/',
  },
  {
    id: 3,
    title: 'GCC Rate Cuts: Key Takeaways for Clients',
    excerpt: 'With the Fed\'s pivot influencing GCC central banks, what does this mean for your portfolio? A breakdown of the rate environment and implications for HNWI investors in the UAE.',
    category: 'Wealth Management',
    date: 'February 2026',
    readTime: '6 min read',
    tags: ['Interest Rates', 'UAE', 'Portfolio', 'GCC'],
    featured: false,
    link: 'https://www.linkedin.com/pulse/gcc-2025-outlook-resilience-diversification-uaes-data-ahmed-allazim-bbfee/',
  },
  {
    id: 4,
    title: 'Who Really Dominates Global Banking?',
    excerpt: 'A data-driven look at the world\'s most powerful financial institutions — and what the MENA region\'s rising banks tell us about the shifting global financial order.',
    category: 'Banking & Finance',
    date: 'January 2026',
    readTime: '7 min read',
    tags: ['Global Banking', 'MENA', 'Financial Analysis'],
    featured: false,
    link: 'https://www.linkedin.com/pulse/uae-banks-q1-2026-ai-mythos-next-banking-shift-ahmed-allazim-q8s0f/',
  },
  {
    id: 5,
    title: 'UAE Banks Q1 2026 | AI Mythos & The Next Banking Shift',
    excerpt: 'Are UAE banks riding an AI wave or building real infrastructure? A deep dive into Q1 2026 earnings, the gap between AI narrative and execution, and what the next banking shift means for the region.',
    category: 'Banking & Finance',
    date: 'April 2026',
    readTime: '6 min read',
    tags: ['UAE Banking', 'AI', 'Q1 2026', 'Fintech'],
    featured: false,
    link: 'https://www.linkedin.com/pulse/uae-banks-q1-2026-ai-mythos-next-banking-shift-ahmed-allazim-q8s0f/',
  },
  {
    id: 6,
    title: 'Morocco\'s Stability Outlook: A Regional Perspective',
    excerpt: 'Morocco is quietly positioning itself as the gateway between Africa, Europe, and the GCC. An analysis of macroeconomic stability and investment opportunity for MENA-focused portfolios.',
    category: 'Emerging Markets',
    date: 'November 2025',
    readTime: '5 min read',
    tags: ['Morocco', 'Africa', 'Emerging Markets', 'MENA'],
    featured: false,
    link: 'https://www.linkedin.com/pulse/casablanca-stock-exchange-moroccos-financial-awakens-ahmed-allazim-umlae/',
  },
]

export const categories = ['All', 'Market Insights', 'Wealth Management', 'MENA Financial Pulse', 'Banking & Finance', 'Investing', 'Emerging Markets']
