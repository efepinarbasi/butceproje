
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { 
  Building2, Globe, Coins, TrendingUp, Star, Landmark, History, RefreshCw, 
  Bell, PieChart as PieChartIcon, ArrowRightLeft, X, Search, Save, Trash2, 
  BarChart3, Plus 
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db, doc, getDoc, setDoc } from './firebase';

// Popüler Semboller Listesi (Arama için)
const POPULAR_SYMBOLS = [
  // BIST 30 & Popüler
  { symbol: 'THYAO', name: 'Türk Hava Yolları', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'GARAN', name: 'Garanti Bankası', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'AKBNK', name: 'Akbank', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'EREGL', name: 'Ereğli Demir Çelik', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'ASELS', name: 'Aselsan', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'SASA', name: 'Sasa Polyester', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'SISE', name: 'Şişecam', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'KCHOL', name: 'Koç Holding', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'BIMAS', name: 'BİM Mağazalar', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'TUPRS', name: 'Tüpraş', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'FROTO', name: 'Ford Otosan', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'YKBNK', name: 'Yapı Kredi', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'ISCTR', name: 'İş Bankası (C)', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'PETKM', name: 'Petkim', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'KOZAL', name: 'Koza Altın', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'HEKTS', name: 'Hektaş', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'KRDMD', name: 'Kardemir (D)', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'ASTOR', name: 'Astor Enerji', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'KONTR', name: 'Kontrolmatik', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'ODAS', name: 'Odaş Elektrik', type: 'BIST', icon: <Building2 size={14} /> },
  { symbol: 'OSMEN', name: 'Osmanlı Yatırım', type: 'BIST', icon: <Building2 size={14} /> },
  
  // ABD & Dünya
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'META', name: 'Meta Platforms', type: 'NASDAQ', icon: <Globe size={14} /> },
  { symbol: 'NFLX', name: 'Netflix', type: 'NASDAQ', icon: <Globe size={14} /> },
  
  // Kripto
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'CRYPTO', icon: <Coins size={14} />, apiId: 'bitcoin' },
  { symbol: 'ETHUSD', name: 'Ethereum', type: 'CRYPTO', icon: <Coins size={14} />, apiId: 'ethereum' },
  { symbol: 'SOLUSD', name: 'Solana', type: 'CRYPTO', icon: <Coins size={14} />, apiId: 'solana' },
  { symbol: 'XRPUSD', name: 'Ripple', type: 'CRYPTO', icon: <Coins size={14} />, apiId: 'ripple' },
  { symbol: 'AVAXUSD', name: 'Avalanche', type: 'CRYPTO', icon: <Coins size={14} />, apiId: 'avalanche-2' },
  
  // Emtia
  { symbol: 'XAUUSD', name: 'Gold Spot', type: 'COMM', icon: <Coins size={14} /> },
  { symbol: 'XAGUSD', name: 'Silver Spot', type: 'COMM', icon: <Coins size={14} /> }
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#d946ef', '#f43f5e', '#e11d48', '#be123c'];

const StockMarket = ({ darkMode, user, onAddTransaction }) => {
  const container = useRef();
  const [activeTab, setActiveTab] = useState('market'); // 'market' veya 'portfolio'
  
  // --- State Başlatma (Migration ve Firebase Desteği ile) ---
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const key = user ? `${user.username}_stock_portfolio` : 'stock_portfolio';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);

      // Eski veri kontrolü (Migration)
      const legacy = localStorage.getItem('stock_portfolio');
      if (legacy) return JSON.parse(legacy);

      return user.stock_portfolio || [];
    } catch {
      return user.stock_portfolio || [];
    }
  });

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const key = user ? `${user.username}_stock_watchlist` : 'stock_watchlist';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('stock_watchlist');
      if (legacy) return JSON.parse(legacy);

      return user.stock_watchlist || [];
    } catch {
      return user.stock_watchlist || [];
    }
  });

  const [dividends, setDividends] = useState(() => {
    try {
      const key = user ? `${user.username}_stock_dividends` : 'stock_dividends';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('stock_dividends');
      if (legacy) return JSON.parse(legacy);

      return user.stock_dividends || [];
    } catch {
      return user.stock_dividends || [];
    }
  });

  const [stockHistory, setStockHistory] = useState(() => {
    try {
      const key = user ? `${user.username}_stock_history` : 'stock_history';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('stock_history');
      if (legacy) return JSON.parse(legacy);

      return user.stock_history || [];
    } catch {
      return user.stock_history || [];
    }
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDividendForm, setShowDividendForm] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', quantity: '', cost: '', currentPrice: '', totalCost: '' });
  const [newDividend, setNewDividend] = useState({ symbol: '', date: new Date().toISOString().split('T')[0], amount: '' });
  const [transactionType, setTransactionType] = useState('buy'); // 'buy' or 'sell'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastEditedRef = useRef(null);

  // --- Firebase Entegrasyonu ---
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

  // Firebase'den Veri Çekme
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.username);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Veritabanı boşsa yerel veriyi koru (Migration için)
          if (data.stock_portfolio && data.stock_portfolio.length > 0) setPortfolio(data.stock_portfolio);
          if (data.stock_watchlist && data.stock_watchlist.length > 0) setWatchlist(data.stock_watchlist);
          if (data.stock_dividends && data.stock_dividends.length > 0) setDividends(data.stock_dividends);
          if (data.stock_history && data.stock_history.length > 0) setStockHistory(data.stock_history);
        }
      } catch (error) {
        console.error("StockMarket Firebase load error:", error);
      } finally {
        setIsFirebaseLoaded(true);
      }
    };
    loadData();
  }, [user]);

  // Firebase'e Kayıt Yardımcısı
  const saveToFirebase = useCallback(async (key, value) => {
    if (user && isFirebaseLoaded) {
      try {
        const docRef = doc(db, "users", user.username);
        await setDoc(docRef, { [key]: value }, { merge: true });
      } catch (error) {
        console.error("StockMarket Firebase save error:", error);
      }
    }
  }, [user, isFirebaseLoaded]);

  useEffect(() => {
    const key = user ? `${user.username}_stock_portfolio` : 'stock_portfolio';
    localStorage.setItem(key, JSON.stringify(portfolio));
    saveToFirebase('stock_portfolio', portfolio);
  }, [portfolio, user, saveToFirebase]);

  useEffect(() => {
    const key = user ? `${user.username}_stock_watchlist` : 'stock_watchlist';
    localStorage.setItem(key, JSON.stringify(watchlist));
    saveToFirebase('stock_watchlist', watchlist);
  }, [watchlist, user, saveToFirebase]);

  useEffect(() => {
    const key = user ? `${user.username}_stock_dividends` : 'stock_dividends';
    localStorage.setItem(key, JSON.stringify(dividends));
    saveToFirebase('stock_dividends', dividends);
  }, [dividends, user, saveToFirebase]);

  useEffect(() => {
    const key = user ? `${user.username}_stock_history` : 'stock_history';
    localStorage.setItem(key, JSON.stringify(stockHistory));
    saveToFirebase('stock_history', stockHistory);
  }, [stockHistory, user, saveToFirebase]);

  useEffect(() => {
    if (activeTab !== 'market' || !container.current) return;

    container.current.innerHTML = '';
    
    // Kullanıcının hisselerini TradingView formatına hazırla
    const allSymbols = [...portfolio, ...watchlist];
    const uniqueSymbols = Array.from(new Set(allSymbols.map(a => a.symbol)))
      .map(symbol => {
        const item = allSymbols.find(a => a.symbol === symbol);
        return item;
      });

    const mySymbols = uniqueSymbols.map(item => {
      const symbol = item.symbol.includes(':') || item.type === 'CRYPTO' || item.type === 'NASDAQ' ? item.symbol : `BIST:${item.symbol}`;
      return {
        s: symbol,
        d: item.symbol
      };
    });

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": darkMode ? "dark" : "light",
      "dateRange": "12M",
      "showChart": true,
      "locale": "tr",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "width": "100%",
      "height": "100%",
      "plotLineColorGrowing": "rgba(16, 185, 129, 1)",
      "plotLineColorFalling": "rgba(244, 63, 94, 1)",
      "gridLineColor": "rgba(240, 243, 250, 0)",
      "scaleFontColor": "rgba(106, 109, 120, 1)",
      "belowLineFillColorGrowing": "rgba(16, 185, 129, 0.12)",
      "belowLineFillColorFalling": "rgba(244, 63, 94, 0.12)",
      "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
      "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
      "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
      "tabs": [
        ...(mySymbols.length > 0 ? [{ title: "Takip & Portföy", symbols: mySymbols }] : []),
        {
          "title": "Borsa İstanbul",
          "symbols": [
            { "s": "BIST:XU100", "d": "BIST 100" },
            { "s": "BIST:THYAO", "d": "THY" },
            { "s": "BIST:GARAN", "d": "Garanti" },
            { "s": "BIST:AKBNK", "d": "Akbank" },
            { "s": "BIST:EREGL", "d": "Ereğli" },
            { "s": "BIST:ASELS", "d": "Aselsan" },
            { "s": "BIST:SASA", "d": "Sasa" }
          ],
          "originalTitle": "Indices"
        },
        {
          "title": "Dünya",
          "symbols": [
            { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
            { "s": "FOREXCOM:NSXUSD", "d": "Nasdaq 100" },
            { "s": "FOREXCOM:DJI", "d": "Dow 30" },
            { "s": "INDEX:NKY", "d": "Nikkei 225" },
            { "s": "INDEX:DEU40", "d": "DAX Index" }
          ],
          "originalTitle": "Indices"
        },
        {
          "title": "Emtia & Döviz",
          "symbols": [
            { "s": "TVC:GOLD", "d": "Altın" },
            { "s": "TVC:SILVER", "d": "Gümüş" },
            { "s": "TVC:USOIL", "d": "Petrol" },
            { "s": "FX:USDTRY", "d": "Dolar" },
            { "s": "FX:EURTRY", "d": "Euro" }
          ],
          "originalTitle": "Commodities"
        }
      ]
    });
    container.current.appendChild(script);
  }, [darkMode, activeTab, portfolio, watchlist]);

  // Arama Fonksiyonu
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = POPULAR_SYMBOLS.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(results);
  }, [searchQuery]);

  // Portföy Özeti Hesaplama
  const summary = useMemo(() => {
    let totalCost = 0;
    let currentValue = 0;

    portfolio.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.cost) || 0;
      const current = parseFloat(item.currentPrice) || cost;

      totalCost += qty * cost;
      currentValue += qty * current;
    });

    const profitLoss = currentValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    return { totalCost, currentValue, profitLoss, profitLossPercent };
  }, [portfolio]);

  // Fiyatları Güncelleme Fonksiyonu (API Entegrasyonu)
  const refreshPrices = async () => {
    setIsRefreshing(true);
    try {
      const allItems = [...portfolio, ...watchlist];
      let newPortfolio = [...portfolio];
      let newWatchlist = [...watchlist];

      // 1. KRİPTO PARALAR (CoinGecko API)
      const cryptoItems = allItems.filter(item => item.type === 'CRYPTO');
      
      if (cryptoItems.length > 0) {
        const ids = [...new Set(cryptoItems.map(item => {
          const popular = POPULAR_SYMBOLS.find(s => s.symbol === item.symbol);
          return popular?.apiId;
        }).filter(Boolean))].join(',');

        if (ids) {
          try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=try`);
            if (response.ok) {
              const data = await response.json();
              
              const updateItems = (items) => items.map(item => {
                const popular = POPULAR_SYMBOLS.find(s => s.symbol === item.symbol);
                if (popular?.apiId && data[popular.apiId]?.try) {
                  return { ...item, currentPrice: data[popular.apiId].try };
                }
                return item;
              });

              newPortfolio = updateItems(newPortfolio);
              newWatchlist = updateItems(newWatchlist);
            }
          } catch (e) {
            console.error("Kripto API hatası:", e);
          }
        }
      }

      // 2. HİSSE SENETLERİ (Simülasyon)
      const stockItems = allItems.filter(item => item.type === 'BIST' || item.type === 'NASDAQ' || item.type === 'OTHER');
      if (stockItems.length > 0) {
         await new Promise(resolve => setTimeout(resolve, 800));
         
         const updateStockPrice = (items) => {
             return items.map(item => {
                 if (item.type === 'BIST' || item.type === 'NASDAQ' || item.type === 'OTHER') {
                     const current = parseFloat(item.currentPrice) || parseFloat(item.cost) || 10.0;
                     const change = current * (Math.random() * 0.06 - 0.03);
                     return { ...item, currentPrice: (current + change).toFixed(2) };
                 }
                 return item;
             });
         };

         newPortfolio = updateStockPrice(newPortfolio);
         newWatchlist = updateStockPrice(newWatchlist);
      }

      setPortfolio(newPortfolio);
      setWatchlist(newWatchlist);

    } catch (error) {
      console.error("Fiyat güncelleme hatası:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Grafik Verisi
  const chartData = useMemo(() => {
    return portfolio.map(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.currentPrice) || parseFloat(item.cost) || 0;
      return {
        name: item.symbol,
        value: qty * price
      };
    }).filter(i => i.value > 0).sort((a, b) => b.value - a.value);
  }, [portfolio]);

  const handleTransaction = (e) => {
    e.preventDefault();
    if (!newStock.symbol) return;

    const existingStock = portfolio.find(p => p.symbol === newStock.symbol);
    const qty = parseFloat(newStock.quantity);
    const price = parseFloat(newStock.cost);
    const currentPrice = parseFloat(newStock.currentPrice) || price;
    const type = POPULAR_SYMBOLS.find(s => s.symbol === newStock.symbol)?.type || 'OTHER';
    const apiId = POPULAR_SYMBOLS.find(s => s.symbol === newStock.symbol)?.apiId;
    const date = new Date().toISOString();

    if (transactionType === 'buy') {
      if (existingStock) {
        const oldQty = parseFloat(existingStock.quantity);
        const oldCost = parseFloat(existingStock.cost);
        
        const totalQty = oldQty + qty;
        const totalCostVal = (oldQty * oldCost) + (qty * price);
        const newAvgCost = totalCostVal / totalQty;

        setPortfolio(portfolio.map(p => p.symbol === newStock.symbol ? {
          ...p,
          quantity: totalQty,
          cost: newAvgCost,
          currentPrice: currentPrice
        } : p));
      } else {
        setPortfolio([...portfolio, { 
            ...newStock, 
            id: Date.now(),
            quantity: qty,
            cost: price,
            currentPrice: currentPrice,
            type,
            apiId
        }]);
      }
      
      setStockHistory(prev => [{
        id: Date.now(),
        date,
        type: 'ALIS',
        symbol: newStock.symbol,
        quantity: qty,
        price: price,
        total: qty * price
      }, ...prev]);

    } else if (transactionType === 'sell') {
      if (existingStock) {
        const oldQty = parseFloat(existingStock.quantity);
        const newQty = oldQty - qty;
        const avgCost = parseFloat(existingStock.cost);
        const realizedProfit = (price - avgCost) * qty;
        
        if (newQty <= 0) {
          setPortfolio(portfolio.filter(p => p.symbol !== newStock.symbol));
        } else {
          setPortfolio(portfolio.map(p => p.symbol === newStock.symbol ? { ...p, quantity: newQty, currentPrice: currentPrice } : p));
        }

        setStockHistory(prev => [{
            id: Date.now(),
            date,
            type: 'SATIS',
            symbol: newStock.symbol,
            quantity: qty,
            price: price,
            total: qty * price,
            realizedProfit
        }, ...prev]);

        if (onAddTransaction && Math.abs(realizedProfit) > 0.01) {
            onAddTransaction({
                description: `${newStock.symbol} Satış ( Adet) - ${realizedProfit >= 0 ? 'Kar' : 'Zarar'}`,
                amount: parseFloat(Math.abs(realizedProfit).toFixed(2)),
                type: realizedProfit >= 0 ? 'income' : 'expense',
                category: 'Yatırım',
                date: new Date().toISOString().split('T')[0]
            });
        }
      }
    }

    setNewStock({ symbol: '', quantity: '', cost: '', currentPrice: '', totalCost: '' });
    lastEditedRef.current = null;
    setShowAddForm(false);
  };

  const handleCostChange = (val) => {
    const cost = val;
    let { quantity: qty, totalCost: total } = newStock;

    if (cost === '') {
        setNewStock({ ...newStock, cost });
        return;
    }

    if (qty && !total) {
        total = (parseFloat(qty) * parseFloat(cost)).toFixed(2);
    } else if (total && !qty) {
        qty = (parseFloat(total) / parseFloat(cost)).toFixed(3);
    } else if (qty && total) {
        if (lastEditedRef.current === 'totalCost') {
            qty = (parseFloat(total) / parseFloat(cost)).toFixed(3);
        } else {
            total = (parseFloat(qty) * parseFloat(cost)).toFixed(2);
        }
    }
    setNewStock({ ...newStock, cost, quantity: qty, totalCost: total });
  };

  const handleQuantityChange = (val) => {
    const qty = val;
    lastEditedRef.current = 'quantity';
    let { cost, totalCost: total } = newStock;

    if (cost) {
        total = (parseFloat(qty) * parseFloat(cost)).toFixed(2);
    } else if (total) {
        cost = (parseFloat(total) / parseFloat(qty)).toFixed(2);
    }
    setNewStock({ ...newStock, quantity: qty, totalCost: total, cost });
  };

  const handleTotalChange = (val) => {
    const total = val;
    lastEditedRef.current = 'totalCost';
    let { cost, quantity: qty } = newStock;

    if (cost) {
        qty = (parseFloat(total) / parseFloat(cost)).toFixed(3);
    } else if (qty) {
        cost = (parseFloat(total) / parseFloat(qty)).toFixed(2);
    }
    setNewStock({ ...newStock, totalCost: total, quantity: qty, cost });
  };

  const handleAddDividend = (e) => {
    e.preventDefault();
    if (!newDividend.symbol || !newDividend.amount) return;
    setDividends([...dividends, { ...newDividend, id: Date.now(), amount: parseFloat(newDividend.amount) }]);
    setNewDividend({ symbol: '', date: new Date().toISOString().split('T')[0], amount: '' });
    setShowDividendForm(false);
  };

  const handleDeleteDividend = (id) => {
    setDividends(dividends.filter(d => d.id !== id));
  };

  const toggleWatchlist = (symbolData) => {
    const exists = watchlist.find(w => w.symbol === symbolData.symbol);
    if (exists) {
      setWatchlist(watchlist.filter(w => w.symbol !== symbolData.symbol));
    } else {
      setWatchlist([...watchlist, {
        id: Date.now(),
        symbol: symbolData.symbol,
        name: symbolData.name,
        type: symbolData.type,
        currentPrice: 0,
        apiId: symbolData.apiId
      }]);
    }
  };

  const handleUpdatePrice = (id, price) => {
    setPortfolio(portfolio.map(p => p.id === id ? { ...p, currentPrice: price } : p));
  };

  const handleDeleteStock = (id) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  const handleUpdateTarget = (id, target, isWatchlist = false) => {
    if (isWatchlist) {
      setWatchlist(watchlist.map(w => w.id === id ? { ...w, targetPrice: target } : w));
    } else {
      setPortfolio(portfolio.map(p => p.id === id ? { ...p, targetPrice: target } : p));
    }
  };

  const handleUpdateStopLoss = (id, stopLoss) => {
    setPortfolio(portfolio.map(p => p.id === id ? { ...p, stopLoss: stopLoss } : p));
  };

  const activeAlerts = useMemo(() => {
    const alerts = [];
    [...portfolio, ...watchlist].forEach(item => {
      if (item.targetPrice && parseFloat(item.targetPrice) > 0 && parseFloat(item.currentPrice) >= parseFloat(item.targetPrice)) {
        alerts.push({ ...item, alertType: 'target' });
      }
      if (item.stopLoss && parseFloat(item.stopLoss) > 0 && parseFloat(item.currentPrice) <= parseFloat(item.stopLoss)) {
        alerts.push({ ...item, alertType: 'stopLoss' });
      }
    });
    return alerts;
  }, [portfolio, watchlist]);

  const selectSymbol = (symbol) => {
    setNewStock({ ...newStock, symbol: symbol.symbol });
    setSearchQuery(symbol.symbol);
    setSearchResults([]);
  };

  const formatCurrency = (val) => {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 animate-slide-up flex flex-col gap-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          Borsa & Yatırım
        </h2>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl overflow-x-auto custom-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Piyasa Özeti
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'portfolio' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} whitespace-nowrap`}
          >
            Portföyüm & Takip
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'watchlist' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} whitespace-nowrap`}
          >
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Takip</span>
          </button>
          <button
            onClick={() => setActiveTab('dividends')}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'dividends' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} whitespace-nowrap`}
          >
            <Landmark className="w-4 h-4" />
            <span className="hidden sm:inline">Temettü</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} whitespace-nowrap`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Geçmiş</span>
          </button>
          <button
            onClick={refreshPrices}
            className="px-3 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Fiyatları Güncelle (Kripto)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Price Alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-2">
            <Bell className="w-5 h-5" />
            <span>Fiyat Alarmları</span>
          </div>
          <div className="space-y-1">
            {activeAlerts.map((item, index) => (
              <div key={`${item.id}-${index}`} className={`text-sm ${item.alertType === 'stopLoss' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-800 dark:text-amber-300'}`}>
                <span className="font-bold">{item.symbol}</span> 
                {item.alertType === 'target' 
                  ? ` hedef fiyatına ulaştı! (Hedef: ${formatCurrency(item.targetPrice)} - Güncel: ${formatCurrency(item.currentPrice)})`
                  : ` stop-loss seviyesinin altına düştü! (Stop: ${formatCurrency(item.stopLoss)} - Güncel: ${formatCurrency(item.currentPrice)})`
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Tab Content */}
      {activeTab === 'market' && (
        <div className="h-[500px] w-full relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in">
           <div className="tradingview-widget-container h-full w-full" ref={container}>
              <div className="tradingview-widget-container__widget h-full w-full"></div>
           </div>
        </div>
      )}

      {/* Portfolio Tab Content */}
      {activeTab === 'portfolio' && (
        <div className="animate-fade-in space-y-6">
          
          {/* Portfolio Summary Cards - Modern Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Toplam Yatırım</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2 truncate" title={formatCurrency(summary.totalCost)}>{formatCurrency(summary.totalCost)}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/40 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Anlık Değer</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 truncate">{formatCurrency(summary.currentValue)}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Kar / Zarar</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <p className={`text-2xl font-bold truncate ${summary.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {summary.profitLoss >= 0 ? '+' : ''}{formatCurrency(summary.profitLoss)}
                </p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${summary.profitLoss >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                  %{summary.profitLossPercent.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Distribution Chart */}
          {chartData.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Portföy Dağılımı
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Add Stock Button & Form */}
          {!showAddForm ? (
            <button 
              onClick={() => { setShowAddForm(true); setTransactionType('buy'); }}
              className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Alım / Satım İşlemi Ekle
            </button>
          ) : (
            <form onSubmit={handleTransaction} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in space-y-4 relative">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-4 mb-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType('buy')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${transactionType === 'buy' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                  >
                    ALIŞ (Ekle)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('sell')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${transactionType === 'sell' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                  >
                    SATIŞ (Çıkar)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Hisse / Sembol Ara</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Sembol veya isim yazın (Örn: THY, Apple)" 
                                value={searchQuery}
                                onChange={e => {
                                  setSearchQuery(e.target.value);
                                  setNewStock({...newStock, symbol: e.target.value.toUpperCase()});
                                }}
                                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                autoComplete="off"
                            />
                            {searchResults.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                {searchResults.map((result, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => selectSymbol(result)}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400 group-hover:text-indigo-500">{result.icon}</span>
                                      <span className="font-bold text-slate-700 dark:text-slate-200">{result.symbol}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500 dark:text-slate-400">{result.name}</span>
                                      <div 
                                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(result); }}
                                        className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 ${watchlist.some(w => w.symbol === result.symbol) ? 'text-amber-400' : 'text-slate-300'}`}
                                      >
                                        <Star size={14} fill={watchlist.some(w => w.symbol === result.symbol) ? "currentColor" : "none"} />
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{transactionType === 'buy' ? 'Alış Fiyatı' : 'Satış Fiyatı'}</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            value={newStock.cost}
                            onChange={e => handleCostChange(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Adet / Lot</label>
                        <input 
                            type="number" 
                            placeholder="0" 
                            value={newStock.quantity}
                            onChange={e => handleQuantityChange(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Toplam Tutar</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            value={newStock.totalCost}
                            onChange={e => handleTotalChange(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <button type="submit" className={`w-full py-3 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg ${transactionType === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'}`}>
                    <Save className="w-4 h-4" />
                    {transactionType === 'buy' ? 'Portföye Ekle / Alış Yap' : 'Satış İşlemini Kaydet'}
                </button>
            </form>
          )}

          {/* Portfolio Table */}
          {portfolio.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                      <tr>
                          <th className="px-4 py-3 rounded-l-lg">Varlık</th>
                          <th className="px-4 py-3 text-center">Adet</th>
                          <th className="px-4 py-3 text-right">Ort. Maliyet</th>
                          <th className="px-4 py-3 text-right">Top. Mal.</th>
                          <th className="px-4 py-3 text-right">Hedef Fiyat</th>
                          <th className="px-4 py-3 text-right">Stop-Loss</th>
                          <th className="px-4 py-3 text-right">Anlık Fiyat</th>
                          <th className="px-4 py-3 text-right">Güncel Değer</th>
                          <th className="px-4 py-3 text-right">K/Z</th>
                          <th className="px-4 py-3 rounded-r-lg"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {portfolio.map(item => {
                        const currentPrice = parseFloat(item.currentPrice) || 0;
                        const cost = parseFloat(item.cost) || 0;
                        const qty = parseFloat(item.quantity) || 0;
                        const pl = (currentPrice - cost) * qty;
                        const plPercent = cost > 0 ? ((currentPrice - cost) / cost) * 100 : 0;
                        const allocation = summary.currentValue > 0 ? ((qty * currentPrice) / summary.currentValue) * 100 : 0;
                        
                        // Kar/Zarar durumuna göre satır rengi
                        const rowClass = pl > 0 
                          ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20' 
                          : pl < 0 
                            ? 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-100/50 dark:hover:bg-rose-900/20' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50';

                        return (
                          <tr key={item.id} className={`transition-colors ${rowClass}`}>
                              <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                    {item.symbol.substring(0, 2)}
                                  </div>
                                  <div>
                                    <div className="text-slate-800 dark:text-white">{item.symbol}</div>
                                    {/* Allocation Bar */}
                                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden"><div className="h-full bg-indigo-500" style={{width: `${allocation}%`}}></div></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(item.cost)}</td>
                              <td className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">{formatCurrency(qty * cost)}</td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.targetPrice || ''} 
                                  onChange={(e) => handleUpdateTarget(item.id, e.target.value)}
                                  className="w-20 text-right bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-slate-600 dark:text-slate-300 text-xs"
                                  placeholder="Hedef"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.stopLoss || ''} 
                                  onChange={(e) => handleUpdateStopLoss(item.id, e.target.value)}
                                  className="w-20 text-right bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-none text-slate-600 dark:text-slate-300 text-xs"
                                  placeholder="Stop"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.currentPrice} 
                                  onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                                  className="w-20 text-right bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(qty * currentPrice)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className={`flex flex-col items-end ${pl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  <span className="font-bold">{pl >= 0 ? '+' : ''}{formatCurrency(pl)}</span>
                                  <span className="text-xs opacity-80">%{plPercent.toFixed(2)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                  <button onClick={() => handleDeleteStock(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </td>
                          </tr>
                        );
                      })}
                  </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
              <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz portföyünüze hisse eklemediniz.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Yatırımlarınızı takip etmek için yukarıdan ekleme yapın.</p>
            </div>
          )}
        </div>
      )}

      {/* Watchlist Tab Content */}
      {activeTab === 'watchlist' && (
        <div className="animate-fade-in">
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {watchlist.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm hover:border-indigo-200 dark:hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{item.symbol}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.name || item.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap justify-end">
                    <div className="text-right">
                      <input 
                        type="number" 
                        value={item.targetPrice || ''} 
                        onChange={(e) => handleUpdateTarget(item.id, e.target.value, true)}
                        className="w-20 text-right bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-slate-600 dark:text-slate-300 font-bold"
                        placeholder="Hedef"
                      />
                      <p className="text-xs text-slate-400">Hedef Fiyat</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{item.currentPrice ? formatCurrency(item.currentPrice) : '-'}</p>
                      <p className="text-xs text-slate-400">Anlık Fiyat</p>
                    </div>
                    <button 
                      onClick={() => toggleWatchlist(item)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
              <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Takip listeniz boş.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Hisse arama kısmından yıldız ikonuna tıklayarak ekleyebilirsiniz.</p>
            </div>
          )}
        </div>
      )}

      {/* Dividends Tab Content */}
      {activeTab === 'dividends' && (
        <div className="animate-fade-in space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/40 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">Toplam Temettü Geliri</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 truncate">{formatCurrency(dividends.reduce((acc, curr) => acc + curr.amount, 0))}</p>
            </div>

            {/* Add Button */}
            {!showDividendForm ? (
                <button 
                  onClick={() => setShowDividendForm(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:border-emerald-400 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Temettü Ekle
                </button>
            ) : (
                <form onSubmit={handleAddDividend} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in space-y-4 relative">
                    <button 
                      type="button" 
                      onClick={() => setShowDividendForm(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="font-bold text-slate-800 dark:text-white">Temettü Girişi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Hisse</label>
                            <select 
                                value={newDividend.symbol}
                                onChange={e => setNewDividend({...newDividend, symbol: e.target.value})}
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            >
                                <option value="">Seçiniz</option>
                                {portfolio.map(p => (
                                    <option key={p.id} value={p.symbol}>{p.symbol}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Tarih</label>
                            <input 
                                type="date" 
                                value={newDividend.date}
                                onChange={e => setNewDividend({...newDividend, date: e.target.value})}
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Tutar</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={newDividend.amount}
                                onChange={e => setNewDividend({...newDividend, amount: e.target.value})}
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </form>
            )}

            {/* Dividends Table */}
            {dividends.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Tarih</th>
                                <th className="px-4 py-3">Hisse</th>
                                <th className="px-4 py-3 text-right">Tutar</th>
                                <th className="px-4 py-3 rounded-r-lg"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {dividends.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{item.symbol}</td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(item.amount)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDeleteDividend(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                    <Landmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz temettü kaydı yok.</p>
                </div>
            )}
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="animate-fade-in space-y-6">
            {/* Summary Card for Realized P/L */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Gerçekleşen Kar / Zarar (Satışlar)</p>
              <p className={`text-2xl font-bold mt-2 truncate ${
                  stockHistory.reduce((acc, curr) => acc + (curr.realizedProfit || 0), 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                  {formatCurrency(stockHistory.reduce((acc, curr) => acc + (curr.realizedProfit || 0), 0))}
              </p>
            </div>

            {/* History Table */}
            {stockHistory.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Tarih</th>
                                <th className="px-4 py-3">İşlem</th>
                                <th className="px-4 py-3">Varlık</th>
                                <th className="px-4 py-3 text-center">Adet</th>
                                <th className="px-4 py-3 text-right">Fiyat</th>
                                <th className="px-4 py-3 text-right">Toplam</th>
                                <th className="px-4 py-3 text-right rounded-r-lg">Kar/Zarar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {stockHistory.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {new Date(item.date).toLocaleDateString('tr-TR')} <span className="text-xs opacity-50">{new Date(item.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.type === 'ALIS' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                                            {item.type === 'ALIS' ? 'ALIŞ' : 'SATIŞ'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{item.symbol}</td>
                                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(item.price)}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">{formatCurrency(item.total)}</td>
                                    <td className="px-4 py-3 text-right font-bold">
                                        {item.type === 'SATIS' ? (
                                            <span className={item.realizedProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                                                {item.realizedProfit >= 0 ? '+' : ''}{formatCurrency(item.realizedProfit)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-600">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                    <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz işlem geçmişi yok.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default memo(StockMarket);