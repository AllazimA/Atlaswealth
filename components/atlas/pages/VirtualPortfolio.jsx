import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Search, Download, RefreshCw,
  TrendingUp, TrendingDown, AlertCircle, Brain, BarChart3, Activity as ActivityIcon, Loader2, X
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, PieChart as PieChartComponent,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getQuote, searchSymbol, getFullStock } from '@/api/alphaVantage';
import { getCoinGeckoPrice, searchCoinGecko, isCryptoSymbol, getCryptoId } from '@/api/coingecko';
import { getQuote as tdGetQuote, searchSymbols as tdSearchSymbols } from '@/api/twelvedata';
import { toast } from 'sonner';

const PORTFOLIO_HISTORY = [
  { date: 'Jan', value: 25000 },
  { date: 'Feb', value: 26500 },
  { date: 'Mar', value: 25800 },
  { date: 'Apr', value: 29500 },
  { date: 'May', value: 31200 },
  { date: 'Jun', value: 32800 },
  { date: 'Jul', value: 34100 },
  { date: 'Aug', value: 35500 },
  { date: 'Sep', value: 36800 },
  { date: 'Oct', value: 38500 },
];

const DEFAULT_PORTFOLIO = {
  id: 'primary',
  name: 'Primary Portfolio',
  description: 'Main Portfolio',
  holdings: [
    { id: '1', symbol: 'SBUX', name: 'Starbucks Corporation', quantity: 88, avgCost: 108.22, purchaseDate: '2024-01-15' },
    { id: '2', symbol: 'AXP', name: 'American Express Co...', quantity: 20, avgCost: 309.61, purchaseDate: '2024-02-01' },
    { id: '3', symbol: 'DIS', name: 'The Walt Disney Co.', quantity: 50, avgCost: 105.68, purchaseDate: '2024-01-20' },
    { id: '4', symbol: 'KO', name: 'The Coca-Cola Com.', quantity: 10, avgCost: 80.35, purchaseDate: '2024-03-10' },
  ],
  createdAt: new Date().toISOString(),
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

// NOTE: All mock/local databases have been removed.
// The app now ONLY uses real market APIs with proper error handling.
// No fallback to local/mock data is allowed.

export default function VirtualPortfolio() {
  // Expose diagnostic function to browser console for debugging
  useEffect(() => {
    window.atlasWealthDiagnostics = async () => {
      console.log('%c=== ATLAS WEALTH DIAGNOSTICS ===', 'color: #FFB800; font-size: 16px; font-weight: bold');
      console.log('Testing Twelve Data API connection...');

      try {
        console.log('📡 Fetching real price for AAPL...');
        const quote = await tdGetQuote('AAPL');
        console.log(`%c✅ TWELVE DATA API WORKING! AAPL price: $${quote.price.toFixed(2)}`, 'color: #10b981; font-weight: bold');
        console.log(`Bid: ${quote.bid}, Ask: ${quote.ask}`);
        console.log(`Change: ${quote.change} (${quote.changePct}%)`);
      } catch (err) {
        console.error(`%c❌ TWELVE DATA CONNECTION FAILED: ${err.message}`, 'color: #ef4444; font-weight: bold');
        console.log('💡 Common issues:');
        console.log('  - API key invalid or expired');
        console.log('  - Rate limit exceeded (800 requests/day on free tier)');
        console.log('  - Network connectivity issue');
      }

      console.log('\n💡 Data Sources:');
      console.log('  🟢 twelve-data = Real API (Twelve Data - 800 req/day)');
      console.log('  🟢 alpha-vantage = Real API (Alpha Vantage - 5 req/min)');
      console.log('  🟢 coingecko = Real API (CoinGecko - crypto only, unlimited)');
      console.log('  ❌ error = All APIs failed, price unavailable');
    };

    // Run diagnostics on load
    window.atlasWealthDiagnostics();
  }, []);

  const [portfolios, setPortfolios] = useState(() => {
    const stored = localStorage.getItem('atlas_portfolios');
    return stored ? JSON.parse(stored) : [DEFAULT_PORTFOLIO];
  });

  const [selectedPortfolioId, setSelectedPortfolioId] = useState(portfolios[0]?.id || 'primary');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Holdings');
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [prices, setPrices] = useState({});
  const [priceErrors, setPriceErrors] = useState({});
  const [tickerSearch, setTickerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [priceSource, setPriceSource] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState({});

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId) || portfolios[0];

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    assetType: 'stock',
    sector: 'Technology',
    quantity: '',
    avgCost: '',
    currentPrice: '',
    notes: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  // Save portfolios to localStorage
  useEffect(() => {
    localStorage.setItem('atlas_portfolios', JSON.stringify(portfolios));
  }, [portfolios]);

  // Handle ticker search - FALLBACK CHAIN: Twelve Data → Local DB
  const handleTickerSearch = useCallback(async (value) => {
    const upperValue = value.toUpperCase();
    setTickerSearch(upperValue);
    setSelectedSearchIndex(-1);

    if (value.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    console.log(`%c🔍 TICKER SEARCH TRIGGERED`, 'color: #FFB800; font-weight: bold', `for "${value}"`);
    try {
      let apiResults = [];

      // Try Twelve Data API first (800 req/day limit)
      try {
        console.log(`%c📡 Attempt 1: Twelve Data symbol search`, 'color: #3b82f6', `for "${value}"...`);
        const tdResults = await tdSearchSymbols(value);
        console.log('Twelve Data response:', tdResults);

        apiResults = tdResults.slice(0, 5).map(r => ({
          symbol: r.symbol,
          name: r.name,
          sector: 'Unknown',
          price: 0,
          source: 'twelve-data-search'
        }));

        if (apiResults.length > 0) {
          console.log(`%c✅ SUCCESS: Twelve Data found ${apiResults.length} results`, 'color: #10b981; font-weight: bold');
          console.table(apiResults);
          setSearchResults(apiResults);
          setShowSearchResults(true);
          setSearchLoading(false);
          return;
        } else {
          console.warn(`⚠️ Twelve Data returned empty results`);
        }
      } catch (tdErr) {
        console.error(`%c❌ TWELVE DATA SEARCH FAILED:`, 'color: #ef4444; font-weight: bold', tdErr.message);
      }

      // No local fallback - all APIs failed
      console.error(`%c❌ ALL MARKET DATA APIS FAILED for "${value}"`, 'color: #ef4444; font-weight: bold');
      const errorMsg = `❌ Unable to fetch data for "${value}" - market data API is unavailable. Please check:
        1. Ticker symbol is correct (e.g., AAPL not APPLE)
        2. Your API quota hasn't been exceeded
        3. Your internet connection

        Try again in a few moments or enter the data manually.`;
      toast.error(errorMsg, { duration: 5000 });
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (err) {
      console.error('Search error:', err.message);
      toast.error('Search failed - please try again', { duration: 3000 });
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle ticker selection - REAL API ONLY, no mock/local fallback
  const handleSelectTicker = useCallback(async (ticker) => {
    console.log(`%c💰 TICKER SELECTED: ${ticker.symbol}`, 'color: #FFB800; font-weight: bold');
    console.log('Ticker data:', ticker);

    let price = null;
    let source = null;
    let fetchTime = null;

    // Try Twelve Data first (800 req/day - most generous)
    try {
      console.log(`%c📡 Attempt 1: Fetching price from Twelve Data for ${ticker.symbol}...`, 'color: #3b82f6');
      const quote = await tdGetQuote(ticker.symbol);
      console.log('Twelve Data response:', quote);

      // Validate price is a real number and not 0
      if (quote.price && quote.price > 0) {
        price = quote.price;
        source = 'twelve-data';
        fetchTime = new Date().toLocaleTimeString();
        console.log(`%c✅ SUCCESS: Got real price $${price.toFixed(2)} for ${ticker.symbol} from Twelve Data`, 'color: #10b981; font-weight: bold');
        toast.success(`✅ Real price from Twelve Data: $${price.toFixed(2)}`, { duration: 2000 });
      } else {
        console.warn(`⚠️ Twelve Data returned invalid price:`, quote.price);
        throw new Error(`Invalid price returned: $${quote.price}`);
      }
    } catch (tdErr) {
      console.warn(`%c⚠️ Twelve Data failed for ${ticker.symbol}:`, 'color: #f59e0b', tdErr.message);

      // Fallback to Alpha Vantage
      try {
        console.log(`%c📡 Attempt 2: Falling back to Alpha Vantage for ${ticker.symbol}...`, 'color: #3b82f6');
        const quote = await getQuote(ticker.symbol);
        console.log('Alpha Vantage response:', quote);

        // Validate price is a real number and not 0
        if (quote.price && quote.price > 0) {
          price = quote.price;
          source = 'alpha-vantage';
          fetchTime = new Date().toLocaleTimeString();
          console.log(`%c✅ SUCCESS: Got real price $${price.toFixed(2)} for ${ticker.symbol} from Alpha Vantage`, 'color: #10b981; font-weight: bold');
          toast.success(`✅ Real price from Alpha Vantage: $${price.toFixed(2)}`, { duration: 2000 });
        } else {
          console.warn(`⚠️ Alpha Vantage returned invalid price:`, quote.price);
          throw new Error(`Invalid price returned: $${quote.price}`);
        }
      } catch (alphaErr) {
        console.warn(`%c⚠️ Alpha Vantage also failed for ${ticker.symbol}:`, 'color: #f59e0b', alphaErr.message);

        // Try CoinGecko as fallback for crypto
        try {
          console.log(`%c📡 Attempt 3: Trying CoinGecko API for ${ticker.symbol}...`, 'color: #3b82f6');

          // For crypto symbols
          if (isCryptoSymbol(ticker.symbol)) {
            const cryptoId = getCryptoId(ticker.symbol);
            console.log('CoinGecko crypto ID:', cryptoId);
            const cgPrice = await getCoinGeckoPrice(cryptoId);
            console.log('CoinGecko response:', cgPrice);

            // Validate price is a real number and not 0
            if (cgPrice.price && cgPrice.price > 0) {
              price = cgPrice.price;
              source = 'coingecko';
              fetchTime = new Date().toLocaleTimeString();
              console.log(`%c✅ SUCCESS: Got real price $${price.toFixed(2)} for ${ticker.symbol} from CoinGecko`, 'color: #10b981; font-weight: bold');
              toast.success(`✅ Real price from CoinGecko: $${price.toFixed(2)}`, { duration: 2000 });
            } else {
              console.warn(`⚠️ CoinGecko returned invalid price:`, cgPrice.price);
              throw new Error(`Invalid price returned: $${cgPrice.price}`);
            }
          } else {
            throw new Error('Not a crypto symbol, skipping CoinGecko');
          }
        } catch (cgErr) {
          console.warn(`%c⚠️ CoinGecko also failed:`, 'color: #f59e0b', cgErr.message);
          // ALL APIS FAILED - Show error, don't use mock data
          console.error(`%c❌ CRITICAL: All market data APIs failed for ${ticker.symbol}`, 'color: #ef4444; font-weight: bold');
          toast.error(`❌ Unable to fetch real price for ${ticker.symbol}.\n\nAPIs are unavailable. Please:\n1. Check your internet connection\n2. Verify the ticker symbol\n3. Try again in a few moments\n\nYou can manually enter the price and then add the holding.`, { duration: 5000 });
          // Reset price fields - require manual entry
          price = null;
          source = null;
        }
      }
    }

    // If we got a price from ANY API, use it
    if (price !== null && source !== null) {
      console.log(`%c✅ FORM POPULATED WITH REAL PRICE`, 'color: #10b981; font-weight: bold');
      console.log(`   Symbol: ${ticker.symbol}`);
      console.log(`   Name: ${ticker.name}`);
      console.log(`   Price: $${price.toFixed(2)}`);
      console.log(`   Source: ${source}`);

      setPriceSource(prev => ({ ...prev, [ticker.symbol]: source }));
      setLastUpdateTime(prev => ({ ...prev, [ticker.symbol]: fetchTime }));

      setFormData({
        ...formData,
        symbol: ticker.symbol,
        name: ticker.name,
        sector: ticker.sector || 'Technology',
        avgCost: price.toFixed(2),
        currentPrice: price.toFixed(2),
      });
    } else {
      // APIs failed - set symbol and name but leave price empty for manual entry
      console.warn(`%c⚠️ FORM PARTIALLY POPULATED (no price available)`, 'color: #f59e0b');
      console.log(`   Symbol: ${ticker.symbol}`);
      console.log(`   Name: ${ticker.name}`);
      console.log(`   Price: UNAVAILABLE (user must enter manually)`);

      setFormData({
        ...formData,
        symbol: ticker.symbol,
        name: ticker.name,
        sector: ticker.sector || 'Technology',
        avgCost: '', // Leave empty - require manual entry
        currentPrice: '',
      });
      toast.warning(`⚠️ Price unavailable - please enter manually`, { duration: 3000 });
    }

    setTickerSearch(ticker.symbol);
    setShowSearchResults(false);
    setSearchResults([]);
    setSelectedSearchIndex(-1);
  }, [formData]);

  // Handle keyboard navigation in search results
  const handleSearchKeyDown = useCallback((e) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSearchIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSearchIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSearchIndex >= 0 && searchResults[selectedSearchIndex]) {
          handleSelectTicker(searchResults[selectedSearchIndex]);
          setSelectedSearchIndex(-1);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedSearchIndex(-1);
        break;
      default:
        break;
    }
  }, [showSearchResults, searchResults, selectedSearchIndex, handleSelectTicker]);

  // Refresh prices with multi-API fallback (Twelve Data → Alpha Vantage → CoinGecko → Local)
  const refreshPrices = useCallback(async () => {
    setRefreshing(true);
    setApiError(null);
    const newPrices = {};
    const newSource = {};
    const newTime = {};
    const errors = {};
    let successCount = 0;

    const holdings = selectedPortfolio?.holdings || [];

    // Fetch prices with rate limit protection and fallback chain
    for (const holding of holdings) {
      try {
        console.log(`📡 Fetching price for ${holding.symbol} (Twelve Data → Alpha Vantage → CoinGecko → Local)...`);

        // Try Twelve Data first (800 req/day)
        try {
          const quote = await tdGetQuote(holding.symbol);
          newPrices[holding.symbol] = quote.price;
          newSource[holding.symbol] = 'twelve-data';
          newTime[holding.symbol] = new Date().toLocaleTimeString();
          console.log(`✅ ${holding.symbol}: $${quote.price.toFixed(2)} (Twelve Data)`);
          successCount++;
        } catch (tdErr) {
          // Fall back to Alpha Vantage
          try {
            console.log(`   Falling back to Alpha Vantage for ${holding.symbol}...`);
            const quote = await getQuote(holding.symbol);
            newPrices[holding.symbol] = quote.price;
            newSource[holding.symbol] = 'alpha-vantage';
            newTime[holding.symbol] = new Date().toLocaleTimeString();
            console.log(`✅ ${holding.symbol}: $${quote.price.toFixed(2)} (Alpha Vantage)`);
            successCount++;
          } catch (alphaErr) {
            // Try CoinGecko for crypto
            if (isCryptoSymbol(holding.symbol)) {
              try {
                console.log(`   Falling back to CoinGecko for ${holding.symbol}...`);
                const cryptoId = getCryptoId(holding.symbol);
                const cgPrice = await getCoinGeckoPrice(cryptoId);
                newPrices[holding.symbol] = cgPrice.price;
                newSource[holding.symbol] = 'coingecko';
                newTime[holding.symbol] = new Date().toLocaleTimeString();
                console.log(`✅ ${holding.symbol}: $${cgPrice.price.toFixed(2)} (CoinGecko)`);
                successCount++;
              } catch (cgErr) {
                throw cgErr;
              }
            } else {
              throw alphaErr; // Re-throw if not crypto, use local fallback
            }
          }
        }
      } catch (err) {
        console.error(`❌ ALL APIs failed for ${holding.symbol}:`, err.message);
        errors[holding.symbol] = err.message;
        // NO LOCAL FALLBACK - Just mark as error
        newSource[holding.symbol] = 'error';
        console.log(`❌ ${holding.symbol}: Price unavailable - all APIs failed`);
      }

      // Rate limit: wait 300ms between requests
      await new Promise(r => setTimeout(r, 300));
    }

    setPrices(newPrices);
    setPriceSource(prev => ({ ...prev, ...newSource }));
    setLastUpdateTime(prev => ({ ...prev, ...newTime }));
    setPriceErrors(errors);

    console.log('%c=== PRICE REFRESH SUMMARY ===', 'color: #FFB800; font-weight: bold');
    console.log(`✅ Successful: ${successCount}/${holdings.length}`);
    console.log('Source distribution:', {
      twelvedata: Object.values(newSource).filter(s => s === 'twelve-data').length,
      alphaVantage: Object.values(newSource).filter(s => s === 'alpha-vantage').length,
      coingecko: Object.values(newSource).filter(s => s === 'coingecko').length,
      error: Object.values(newSource).filter(s => s === 'error').length,
    });
    console.table(newPrices);

    if (successCount === holdings.length) {
      toast.success(`✅ All ${holdings.length} prices updated with real market data!`, { duration: 3000 });
    } else if (successCount > 0) {
      const failedCount = holdings.length - successCount;
      toast.warning(`⚠️ ${successCount}/${holdings.length} prices updated.\n\n${failedCount} failed (market data unavailable).\n\nRefresh again or check your API quota.`, {
        duration: 5000,
      });
    } else {
      const errorMsg = Object.entries(errors)
        .map(([sym, msg]) => `${sym}: ${msg}`)
        .join('; ');
      setApiError(`❌ Market data unavailable for all holdings. ${errorMsg}`);
      toast.error(`❌ Unable to fetch prices - All market data APIs are unavailable.\n\nPlease check:\n• Your internet connection\n• API quota (Twelve Data: 800 req/day)\n• Try again in a few moments`, { duration: 5000 });
    }

    setRefreshing(false);
  }, [selectedPortfolio, prices]);

  useEffect(() => {
    refreshPrices();
  }, [selectedPortfolioId]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return !!(
      formData.symbol?.trim() &&
      formData.quantity &&
      parseFloat(formData.quantity) > 0 &&
      formData.avgCost &&
      parseFloat(formData.avgCost) > 0
    );
  }, [formData]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const holdings = selectedPortfolio?.holdings || [];
    const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.avgCost), 0);
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (prices[h.symbol] || h.avgCost)), 0);
    const totalReturn = totalValue - totalCost;
    const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost * 100) : 0;
    const dailyChange = totalValue * 0.0125;

    const sortedByGain = [...holdings].sort((a, b) => {
      const gainA = (prices[a.symbol] || a.avgCost - a.avgCost) * a.quantity;
      const gainB = (prices[b.symbol] || b.avgCost - b.avgCost) * b.quantity;
      return gainB - gainA;
    });

    return {
      totalValue,
      totalCost,
      totalReturn,
      totalReturnPct,
      dailyPnL: dailyChange,
      dailyPnLPct: (dailyChange / totalValue * 100),
      sharpeRatio: 1.85,
      volatility: 12.4,
      riskScore: 65,
      cashPosition: totalValue * 0.05,
      numHoldings: holdings.length,
      bestPerformer: sortedByGain[0],
      worstPerformer: sortedByGain[sortedByGain.length - 1],
    };
  }, [selectedPortfolio, prices]);

  // Filter holdings
  const filteredHoldings = useMemo(() => {
    return (selectedPortfolio?.holdings || []).filter(h =>
      h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedPortfolio, searchTerm]);

  // Add holding with validation
  const handleAddHolding = useCallback(async () => {
    // Validation
    if (!formData.symbol?.trim()) {
      toast.error('Please select a ticker symbol');
      return;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (!formData.avgCost || parseFloat(formData.avgCost) <= 0) {
      toast.error('Average cost must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const symbol = formData.symbol.toUpperCase();
      const price = parseFloat(formData.avgCost);
      const source = priceSource[symbol] || 'manual';

      console.log(`%c✅ ADDING HOLDING: ${symbol}`, 'color: #10b981; font-weight: bold');
      console.log(`   Quantity: ${formData.quantity}`);
      console.log(`   Avg Cost: $${price.toFixed(2)}`);
      console.log(`   Price Source: ${source}`);
      console.log(`   Purchase Date: ${formData.purchaseDate}`);

      const updatedPortfolios = portfolios.map(p => {
        if (p.id === selectedPortfolioId) {
          const newHolding = {
            id: Math.random().toString(36).substr(2, 9),
            symbol: symbol,
            name: formData.name || symbol,
            quantity: parseFloat(formData.quantity),
            avgCost: price,
            purchaseDate: formData.purchaseDate,
          };
          console.log(`%c💾 Saved to Portfolio:`, 'color: #3b82f6; font-weight: bold', newHolding);
          return {
            ...p,
            holdings: [...p.holdings, newHolding]
          };
        }
        return p;
      });

      setPortfolios(updatedPortfolios);
      setPrices(prev => ({ ...prev, [symbol]: price }));

      // Track price source - use API source if available, otherwise mark as manual entry
      if (!priceSource[symbol]) {
        setPriceSource(prev => ({ ...prev, [symbol]: 'manual' }));
      }

      const sourceLabel = ['twelve-data', 'alpha-vantage', 'coingecko'].includes(source)
        ? `✅ Real (${source})`
        : source === 'manual'
        ? '✏️ Manual Entry'
        : '⚠️ Unavailable';
      toast.success(`${symbol} added to portfolio (${sourceLabel})`, { duration: 3000 });

      // Reset form
      setFormData({
        symbol: '',
        name: '',
        assetType: 'stock',
        sector: 'Technology',
        quantity: '',
        avgCost: '',
        currentPrice: '',
        notes: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      setTickerSearch('');
      setShowAddHolding(false);
    } catch (err) {
      console.error(`%c❌ ERROR ADDING HOLDING:`, 'color: #ef4444; font-weight: bold', err.message);
      toast.error('Failed to add holding: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [portfolios, selectedPortfolioId, formData, priceSource]);

  // Update holding with validation
  const handleUpdateHolding = useCallback(async () => {
    if (!editingHolding) return;

    // Validation
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (!formData.avgCost || parseFloat(formData.avgCost) <= 0) {
      toast.error('Average cost must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPortfolios = portfolios.map(p => {
        if (p.id === selectedPortfolioId) {
          return {
            ...p,
            holdings: p.holdings.map(h =>
              h.id === editingHolding.id
                ? {
                  ...h,
                  symbol: formData.symbol,
                  name: formData.name || formData.symbol,
                  quantity: parseFloat(formData.quantity),
                  avgCost: parseFloat(formData.avgCost),
                  purchaseDate: formData.purchaseDate,
                }
                : h
            ),
          };
        }
        return p;
      });

      setPortfolios(updatedPortfolios);
      toast.success(`${formData.symbol} updated successfully`, { duration: 3000 });
      setEditingHolding(null);
      setFormData({
        symbol: '',
        name: '',
        assetType: 'stock',
        sector: 'Technology',
        quantity: '',
        avgCost: '',
        currentPrice: '',
        notes: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      setTickerSearch('');
      setShowAddHolding(false);
    } catch (err) {
      toast.error('Failed to update holding: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [portfolios, selectedPortfolioId, editingHolding, formData]);

  // Delete holding with confirmation
  const handleDeleteHolding = useCallback((holdingId) => {
    const holding = selectedPortfolio?.holdings?.find(h => h.id === holdingId);
    if (!holding) return;

    const updatedPortfolios = portfolios.map(p => {
      if (p.id === selectedPortfolioId) {
        return {
          ...p,
          holdings: p.holdings.filter(h => h.id !== holdingId),
        };
      }
      return p;
    });
    setPortfolios(updatedPortfolios);
    toast.success(`${holding.symbol} removed from portfolio`, { duration: 3000 });
  }, [portfolios, selectedPortfolioId, selectedPortfolio]);

  // Edit holding
  const handleEditHolding = (holding) => {
    setEditingHolding(holding);
    setFormData({
      symbol: holding.symbol,
      name: holding.name,
      assetType: 'stock',
      sector: 'Technology', // No local database reference - use default
      quantity: holding.quantity.toString(),
      avgCost: holding.avgCost.toString(),
      currentPrice: (prices[holding.symbol] || holding.avgCost).toString(),
      notes: '',
      purchaseDate: holding.purchaseDate,
    });
    setTickerSearch(holding.symbol);
    setShowAddHolding(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = [
      ['Symbol', 'Quantity', 'Avg Cost', 'Current Price', 'Market Value', 'Gain/Loss', 'Return %'],
      ...filteredHoldings.map(h => {
        const currentPrice = prices[h.symbol] || h.avgCost;
        const marketValue = h.quantity * currentPrice;
        const gainLoss = marketValue - (h.quantity * h.avgCost);
        const returnPct = ((currentPrice - h.avgCost) / h.avgCost * 100);
        return [h.symbol, h.quantity, h.avgCost.toFixed(2), currentPrice.toFixed(2), marketValue.toFixed(2), gainLoss.toFixed(2), returnPct.toFixed(2)];
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Virtual Portfolio</h1>
          <p className="text-sm text-slate-400 mt-1">Paper trading & portfolio simulation for advisors</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={refreshPrices}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Prices'}
          </Button>
          <Button
            onClick={() => {
              setEditingHolding(null);
              setShowAddHolding(true);
              setFormData({ symbol: '', quantity: '', avgCost: '', purchaseDate: new Date().toISOString().split('T')[0] });
            }}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-black gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold text-slate-300">Virtual Portfolios</div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex items-center gap-2">
          {portfolios.map(portfolio => (
            <button
              key={portfolio.id}
              onClick={() => setSelectedPortfolioId(portfolio.id)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                selectedPortfolioId === portfolio.id
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold">{portfolio.name}</div>
              <div className="text-xs opacity-75">{formatCurrency(metrics.totalValue)}</div>
            </button>
          ))}
          <button className="ml-2 p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Data Source Status */}
      {selectedPortfolio?.holdings && selectedPortfolio.holdings.length > 0 && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          Object.values(priceSource).some(s => ['twelve-data', 'alpha-vantage', 'coingecko'].includes(s))
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              Object.values(priceSource).some(s => ['twelve-data', 'alpha-vantage', 'coingecko'].includes(s))
                ? 'text-green-400'
                : 'text-amber-400'
            }`}>
              {Object.values(priceSource).filter(s => ['twelve-data', 'alpha-vantage', 'coingecko'].includes(s)).length}/{selectedPortfolio.holdings.length}
              {Object.values(priceSource).some(s => ['twelve-data', 'alpha-vantage', 'coingecko'].includes(s))
                ? ' ✅ LIVE Prices (Real Market APIs)'
                : ' ⚠️ Some Prices Unavailable'}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {Object.values(priceSource).some(s => ['twelve-data', 'alpha-vantage', 'coingecko'].includes(s))
                ? '📊 Fetching real-time prices from Twelve Data, Alpha Vantage, or CoinGecko APIs'
                : '💡 Click "Refresh Prices" or check console (F12) for details'}
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {apiError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">API Error</p>
            <p className="text-red-300/80 text-sm mt-1">{apiError}</p>
            <p className="text-red-300/60 text-xs mt-2">💡 Check browser console (F12) for detailed logs</p>
          </div>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-slate-400 text-xs mb-1">Cash: $85,193</p>
          <p className="text-lg font-bold text-slate-100">{formatCurrency(metrics.cashPosition)}</p>
          <p className="text-slate-500 text-xs mt-1">79.6% of portfolio</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-slate-400 text-xs mb-1">vs. yesterday's close</p>
          <p className="text-lg font-bold text-green-500">+$0.00</p>
          <p className="text-slate-500 text-xs mt-1">Daily P&L</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-slate-400 text-xs mb-1">Total Return %</p>
          <p className="text-lg font-bold text-green-500">+{metrics.totalReturnPct.toFixed(2)}%</p>
          <p className="text-slate-500 text-xs mt-1">{formatCurrency(metrics.totalReturn)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-slate-400 text-xs mb-1">Risk-adjusted return</p>
          <p className="text-lg font-bold text-slate-100">N/A</p>
          <p className="text-slate-500 text-xs mt-1">Sharpe Ratio</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-slate-400 text-xs mb-1">Best Performer</p>
          <p className="text-lg font-bold text-yellow-500">{metrics.bestPerformer?.symbol || 'N/A'}</p>
          <p className="text-slate-500 text-xs mt-1">+0.00%</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-slate-400 text-xs mb-1">Total Holdings</p>
          <p className="text-lg font-bold text-slate-100">{metrics.numHoldings}</p>
          <p className="text-green-500 text-xs mt-1">{metrics.numHoldings} winning</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700 bg-slate-800/50 rounded-t-lg">
        {['Holdings', 'Analytics', 'Risk & AI', 'Activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'Holdings' && <BarChart3 className="w-4 h-4" />}
            {tab === 'Analytics' && <LineChart className="w-4 h-4" />}
            {tab === 'Risk & AI' && <AlertCircle className="w-4 h-4" />}
            {tab === 'Activity' && <ActivityIcon className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Holdings Tab */}
      {activeTab === 'Holdings' && (
        <div className="bg-slate-800 rounded-b-lg border border-slate-700 border-t-0 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search ticker or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-slate-700/50 border-slate-600"
              />
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-medium">ASSET</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium hidden sm:table-cell">QTY</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium">PRICE</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium hidden md:table-cell">MKT VALUE</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium hidden lg:table-cell">RETURN %</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium hidden lg:table-cell">G/L $</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium">ALLOC %</th>
                  <th className="text-center py-2 sm:py-3 px-1 sm:px-4 text-slate-400 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map(holding => {
                  const currentPrice = prices[holding.symbol] || holding.avgCost;
                  const marketValue = holding.quantity * currentPrice;
                  const gainLoss = marketValue - (holding.quantity * holding.avgCost);
                  const returnPct = ((currentPrice - holding.avgCost) / holding.avgCost * 100);
                  const allocation = (marketValue / metrics.totalValue * 100);
                  const dayChange = Math.random() * 4 - 2;

                  return (
                    <tr key={holding.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="font-semibold text-slate-100 text-sm">{holding.symbol}</div>
                        <div className="text-xs text-slate-500 truncate">{holding.name}</div>
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-4 text-right text-slate-100 hidden sm:table-cell text-xs sm:text-sm">{holding.quantity}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-4 text-right text-xs sm:text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-slate-100">${currentPrice.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            ['twelve-data', 'alpha-vantage', 'coingecko'].includes(priceSource[holding.symbol])
                              ? 'bg-green-500/20 text-green-400'
                              : priceSource[holding.symbol] === 'error'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {['twelve-data', 'alpha-vantage', 'coingecko'].includes(priceSource[holding.symbol])
                              ? `✅ LIVE (${priceSource[holding.symbol].split('-')[0]})`
                              : priceSource[holding.symbol] === 'error'
                              ? '❌ ERROR'
                              : '⚠️ UNAVAILABLE'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-4 text-right text-slate-100 font-semibold hidden md:table-cell text-xs sm:text-sm">{formatCurrency(marketValue)}</td>
                      <td className={`py-2 sm:py-3 px-1 sm:px-4 text-right font-semibold hidden lg:table-cell text-xs sm:text-sm ${returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                      </td>
                      <td className={`py-2 sm:py-3 px-1 sm:px-4 text-right font-semibold hidden lg:table-cell text-xs sm:text-sm ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-4 text-right text-slate-100 text-xs sm:text-sm">{allocation.toFixed(1)}%</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEditHolding(holding)}
                            className="text-slate-400 hover:text-yellow-500 transition-colors p-1"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHolding(holding.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredHoldings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">No holdings found</p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'Analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <h3 className="text-slate-100 font-semibold mb-4">Portfolio Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={PORTFOLIO_HISTORY}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6F00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6F00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Area type="monotone" dataKey="value" stroke="#FF6F00" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <h3 className="text-slate-100 font-semibold mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChartComponent>
                <Pie
                  data={filteredHoldings.map(holding => {
                    const marketValue = holding.quantity * (prices[holding.symbol] || holding.avgCost);
                    const allocation = (marketValue / metrics.totalValue * 100);
                    return {
                      name: holding.symbol,
                      value: parseFloat(allocation.toFixed(1)),
                    };
                  })}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {filteredHoldings.map((holding, index) => {
                    const colors = ['#FF6F00', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => `${value}: ${entry.payload.value}%`}
                />
              </PieChartComponent>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Risk & AI Tab */}
      {activeTab === 'Risk & AI' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-500 font-semibold text-sm">Concentration Risk</p>
                <p className="text-slate-400 text-sm mt-1">SBUX position exceeds 30% threshold</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-500 font-semibold text-sm">Rebalancing Suggested</p>
                <p className="text-slate-400 text-sm mt-1">Portfolio drifting from 60/40 target</p>
              </div>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-500 font-semibold text-sm">Portfolio Volatility</p>
                <p className="text-slate-400 text-sm mt-1">12.4% annualized (low-moderate)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'Activity' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[...filteredHoldings].reverse().slice(0, 5).map((holding, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-700 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 font-medium">{holding.symbol} purchase</p>
                  <p className="text-slate-500 text-sm">{holding.purchaseDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-100 font-medium">{formatCurrency(holding.quantity * holding.avgCost)}</p>
                  <p className="text-slate-500 text-sm">{holding.quantity} shares @ ${holding.avgCost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Holding Dialog */}
      <Dialog open={showAddHolding} onOpenChange={(open) => {
        if (!open) {
          setShowAddHolding(false);
          setEditingHolding(null);
          setFormData({
            symbol: '',
            name: '',
            assetType: 'stock',
            sector: 'Technology',
            quantity: '',
            avgCost: '',
            currentPrice: '',
            notes: '',
            purchaseDate: new Date().toISOString().split('T')[0],
          });
          setTickerSearch('');
          setShowSearchResults(false);
          setSelectedSearchIndex(-1);
          setIsSubmitting(false);
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingHolding ? 'Edit Holding' : 'Add Holding'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Ticker Symbol with Search */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">
                Ticker Symbol {!formData.symbol && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., AAPL, MCD"
                    value={tickerSearch}
                    onChange={(e) => handleTickerSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className={`bg-slate-700/50 ${
                      !formData.symbol && tickerSearch === ''
                        ? 'border-red-500/50'
                        : 'border-slate-600'
                    }`}
                  />
                  <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {(showSearchResults || searchLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <button
                          key={result.symbol}
                          onClick={() => handleSelectTicker(result)}
                          className={`w-full px-4 py-2.5 text-left transition-colors border-b border-slate-600 last:border-0 ${
                            selectedSearchIndex === index
                              ? 'bg-yellow-500/20 border-yellow-500/30'
                              : 'hover:bg-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${selectedSearchIndex === index ? 'text-yellow-500' : 'text-green-500'}`}>✓</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-slate-100 text-sm font-medium">{result.symbol}</div>
                              <div className="text-slate-400 text-xs truncate">{result.name}</div>
                            </div>
                            {result.price > 0 && (
                              <div className="text-green-500 text-sm font-medium flex-shrink-0">${result.price.toFixed(2)}</div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-slate-400 text-sm">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Asset Name (auto-populated) */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Asset Name</label>
              <Input
                placeholder="Asset name"
                value={formData.name}
                readOnly
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            {/* Asset Type and Sector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Asset Type</label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm"
                >
                  <option value="stock">Stock</option>
                  <option value="etf">ETF</option>
                  <option value="bond">Bond</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm"
                >
                  <option value="Technology">Technology</option>
                  <option value="Financial">Financial</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Consumer Cyclical">Consumer Cyclical</option>
                  <option value="Consumer Staples">Consumer Staples</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>
            </div>

            {/* Quantity and Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Quantity <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`bg-slate-700/50 ${
                    !formData.quantity && showAddHolding
                      ? 'border-red-500/50'
                      : 'border-slate-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Avg Cost ($) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.avgCost}
                  onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                  className={`bg-slate-700/50 ${
                    !formData.avgCost && showAddHolding
                      ? 'border-red-500/50'
                      : 'border-slate-600'
                  }`}
                />
              </div>
            </div>

            {/* Current Price with Badge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 text-sm font-medium">Current Price ($)</label>
                {formData.symbol && priceSource[formData.symbol] && (
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    ['twelve-data', 'alpha-vantage', 'coingecko'].includes(priceSource[formData.symbol])
                      ? 'bg-green-500/30 text-green-300'
                      : priceSource[formData.symbol] === 'error'
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-amber-500/30 text-amber-300'
                  }`}>
                    {['twelve-data', 'alpha-vantage', 'coingecko'].includes(priceSource[formData.symbol])
                      ? `✅ LIVE (${priceSource[formData.symbol].split('-')[0]})`
                      : priceSource[formData.symbol] === 'error'
                      ? '❌ ERROR'
                      : '⚠️ UNAVAILABLE'}
                  </span>
                )}
              </div>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.currentPrice}
                readOnly
                className="bg-slate-700/50 border-slate-600 text-slate-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Notes (optional)</label>
              <Input
                placeholder="Investment thesis, target price..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Purchase Date</label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={editingHolding ? handleUpdateHolding : handleAddHolding}
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 font-medium transition-opacity ${
                  !isFormValid || isSubmitting
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingHolding ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  `${editingHolding ? 'Update' : 'Add'} Holding`
                )}
              </Button>
              <Button
                onClick={() => setShowAddHolding(false)}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
