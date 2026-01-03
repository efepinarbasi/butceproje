import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Download, Target, Moon, Sun, ChevronLeft, ChevronRight, Save, Loader2, Bell, X, LogOut, FileKey, Upload, Settings, User, Calendar, Mail, Award, BarChart2, Menu, StickyNote, Wifi, WifiOff, Home, PlusCircle, MoreHorizontal, ArrowUp, RefreshCw, Mic, AlertTriangle } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from 'html2canvas';
import DashboardSummary from './DashboardSummary';
import AddTransaction from './AddTransaction';
import TransactionList from './TransactionList';
import ExpenseChart from './ExpenseChart';
import IncomeExpenseChart from './IncomeExpenseChart';
import CurrencyRates from './CurrencyRates';
import CurrencyConverter from './CurrencyConverter';
import SavingsGoals from './SavingsGoals';
import CategoryLimits from './CategoryLimits';
import RecurringPayments from './RecurringPayments';
import Auth from './Auth';
import CategorySettings from './CategorySettings';
import UserProfile from './UserProfile';
import CalendarView from './CalendarView';
import EmailSettings from './EmailSettings';
import AssetsPortfolio from './AssetsPortfolio';
import CreditCardDebt from './CreditCardDebt';
import BillTracker from './BillTracker';
import Badges from './Badges';
import SpendingAnalysis from './SpendingAnalysis';
import Notepad from './Notepad';
import StockMarket from './StockMarket';
import { encryptData, decryptData } from './BackupUtils';
import { LANGUAGES, TRANSLATIONS } from './constants';
import { db, doc, getDoc, setDoc } from './firebase';

// Skeleton Components
const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-fade-in mt-8">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-48 w-full" /> {/* Add Transaction Form */}
        <Skeleton className="h-80 w-full" /> {/* Stock Market / Chart */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-64 w-full" /> {/* Pie Chart */}
        <Skeleton className="h-48 w-full" /> {/* Currency/Limits */}
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

const DEFAULT_CATEGORIES = [
  { id: 'market', name: 'Market & Alışveriş', icon: '🛒' },
  { id: 'fatura', name: 'Faturalar', icon: '📄' },
  { id: 'ulasim', name: 'Ulaşım', icon: '🚌' },
  { id: 'yemek', name: 'Yeme & İçme', icon: '🍽️' },
  { id: 'eglence', name: 'Eğlence', icon: '🎬' },
  { id: 'saglik', name: 'Sağlık', icon: '💊' },
  { id: 'maas', name: 'Maaş / Gelir', icon: '💰' },
  { id: 'yatirim', name: 'Yatırım', icon: '📈' },
  { id: 'diger', name: 'Diğer', icon: '🔹' }
];

const BudgetApp = ({ user, onLogout, onUpdateUser }) => {
  // --- State Yönetimi ---
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_transactions`);
      if (saved) return JSON.parse(saved);
      
      // Eski verileri kontrol et (Migration)
      const legacy = localStorage.getItem('budget_transactions');
      if (legacy) return JSON.parse(legacy);

      return user.transactions || [];
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      return user.transactions || [];
    }
  });

  // Kategoriler State'i
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_categories`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_categories');
      if (legacy) return JSON.parse(legacy);

      return user.categories || DEFAULT_CATEGORIES;
    } catch {
      return user.categories || DEFAULT_CATEGORIES;
    }
  });

  // Birikim Hedefleri State'i
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_goals`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_goals');
      if (legacy) return JSON.parse(legacy);

      return user.goals || [];
    } catch (error) {
      return user.goals || [];
    }
  });

  // Kategori Limitleri State'i
  const [categoryLimits, setCategoryLimits] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_category_limits`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_category_limits');
      if (legacy) return JSON.parse(legacy);

      return user.categoryLimits || {};
    } catch (error) {
      return user.categoryLimits || {};
    }
  });

  // Abonelikler State'i
  const [recurringPayments, setRecurringPayments] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_recurring_payments`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_recurring_payments');
      if (legacy) return JSON.parse(legacy);

      return user.recurringPayments || [];
    } catch (error) {
      return user.recurringPayments || [];
    }
  });

  // Varlıklar State'i
  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_assets`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_assets');
      if (legacy) return JSON.parse(legacy);

      return user.assets || [];
    } catch (error) {
      return user.assets || [];
    }
  });

  // Kredi Kartı Borçları State'i
  const [creditCardDebts, setCreditCardDebts] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_credit_card_debts`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_credit_card_debts');
      if (legacy) return JSON.parse(legacy);

      return user.creditCardDebts || [];
    } catch (error) {
      return user.creditCardDebts || [];
    }
  });

  // Faturalar State'i
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_bills`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_bills');
      if (legacy) return JSON.parse(legacy);

      return user.bills || [];
    } catch (error) {
      return user.bills || [];
    }
  });

  // Notlar State'i
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_notes`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_notes');
      if (legacy) return JSON.parse(legacy);

      return user.notes || [];
    } catch (error) {
      return user.notes || [];
    }
  });

  // E-posta Ayarları State'i
  const [emailSettings, setEmailSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_email_settings`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_email_settings');
      if (legacy) return JSON.parse(legacy);

      return user.emailSettings || { email: '', enabled: false };
    } catch {
      return user.emailSettings || { email: '', enabled: false };
    }
  });

  // Varlık Geçmişi State'i
  const [portfolioHistory, setPortfolioHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`${user.username}_budget_portfolio_history`);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem('budget_portfolio_history');
      if (legacy) return JSON.parse(legacy);

      return user.portfolioHistory || [];
    } catch (error) {
      return user.portfolioHistory || [];
    }
  });

  // Yerel saat dilimine göre bugünün ayı (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleDateString('en-CA').slice(0, 7);
  });

  const [budgetLimit, setBudgetLimit] = useState(() => {
    return localStorage.getItem(`${user.username}_budget_limit`) || localStorage.getItem('budget_limit') || user.budgetLimit || '';
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    } catch (error) {
      // Hata durumunda varsayılan (false)
    }
    return false;
  });

  const [language, setLanguage] = useState('tr');
  const [currency, setCurrency] = useState('TRY');
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  const [pdfFont, setPdfFont] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [showNotifications, setShowNotifications] = useState(true);
  const [isClosingNotification, setIsClosingNotification] = useState(false);

  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const addTransactionRef = useRef(null);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const touchStartRef = useRef(0);

  // Mobil Navigasyon Fonksiyonları
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Network Durumu (Online/Offline Kontrolü)
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // --- Firebase Entegrasyonu ---
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

  // Firebase'e Kayıt Yardımcı Fonksiyonu
  const saveToFirebase = useCallback(async (key, value) => {
    if (isFirebaseLoaded && user) {
      try {
        const docRef = doc(db, "users", user.username);
        await setDoc(docRef, { [key]: value }, { merge: true });
      } catch (error) {
        console.error("Firebase kayıt hatası:", error);
      }
    }
  }, [isFirebaseLoaded, user]);

  // Döviz Kurları State'i (Merkezi Yönetim)
  const [rates, setRates] = useState({ USD: 0, EUR: 0, GBP: 0, BTC: 0, ETH: 0, GOLD: 0, SILVER: 0 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesLastUpdated, setRatesLastUpdated] = useState(null);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      // Ücretsiz API kullanımı (Frankfurter)
      const resUSD = await fetch('https://api.frankfurter.app/latest?from=USD&to=TRY');
      const dataUSD = await resUSD.json();
      
      const resEUR = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY');
      const dataEUR = await resEUR.json();
      
      const resGBP = await fetch('https://api.frankfurter.app/latest?from=GBP&to=TRY');
      const dataGBP = await resGBP.json();

      // Kripto ve Emtia (CoinGecko)
      const resCrypto = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold,kinesis-silver&vs_currencies=try');
      const dataCrypto = await resCrypto.json();

      setRates({
        USD: dataUSD.rates.TRY,
        EUR: dataEUR.rates.TRY,
        GBP: dataGBP.rates.TRY,
        BTC: dataCrypto.bitcoin?.try || 0,
        ETH: dataCrypto.ethereum?.try || 0,
        GOLD: (dataCrypto['pax-gold']?.try || 0) / 31.1035, // Ons -> Gram dönüşümü
        SILVER: (dataCrypto['kinesis-silver']?.try || 0) / 31.1035 // Ons -> Gram dönüşümü
      });
      setRatesLastUpdated(new Date());
    } catch (error) {
      console.error("Kur bilgileri alınamadı", error);
      setRates({ USD: 32.50, EUR: 35.20, GBP: 41.10, BTC: 2100000, ETH: 100000, GOLD: 2450, SILVER: 32 });
    } finally {
      setRatesLoading(false);
    }
  }, []);

  // Veri Yenileme Fonksiyonu (Firebase + Kurlar)
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.username);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.transactions && data.transactions.length > 0) setTransactions(data.transactions);
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
        if (data.goals && data.goals.length > 0) setGoals(data.goals);
        if (data.categoryLimits && Object.keys(data.categoryLimits).length > 0) setCategoryLimits(data.categoryLimits);
        if (data.recurringPayments && data.recurringPayments.length > 0) setRecurringPayments(data.recurringPayments);
        if (data.assets && data.assets.length > 0) setAssets(data.assets);
        if (data.creditCardDebts && data.creditCardDebts.length > 0) setCreditCardDebts(data.creditCardDebts);
        if (data.bills && data.bills.length > 0) setBills(data.bills);
        if (data.notes && data.notes.length > 0) setNotes(data.notes);
        if (data.emailSettings && data.emailSettings.email) setEmailSettings(data.emailSettings);
        if (data.portfolioHistory && data.portfolioHistory.length > 0) setPortfolioHistory(data.portfolioHistory);
        if (data.budgetLimit) setBudgetLimit(data.budgetLimit);
      }
      
      // Kurları da güncelle
      await fetchRates();
    } catch (error) {
      console.error("Veri yenileme hatası:", error);
    } finally {
      setIsFirebaseLoaded(true);
    }
  }, [user, fetchRates]);

  // Uygulama Açılışında Veri Çekme
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Pull to Refresh Handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartRef.current;
    if (window.scrollY === 0 && diff > 0 && !isRefreshing) {
      setPullY(Math.min(diff * 0.4, 120)); // Direnç efekti
    }
  };

  const handleTouchEnd = async () => {
    if (pullY > 60) {
      setIsRefreshing(true);
      setPullY(60);
      await refreshData();
      setTimeout(() => { setIsRefreshing(false); setPullY(0); }, 500);
    } else {
      setPullY(0);
    }
    touchStartRef.current = 0;
  };

  // Sesli Komut İşleyicisi
  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tarayıcınız sesli komut özelliğini desteklemiyor.");
      return;
    }

    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const lowerText = transcript.toLowerCase();
      
      // 1. Tutar Bulma (Regex ile sayıları yakala)
      const amountMatch = lowerText.match(/(\d+([.,]\d+)?)/);
      
      if (amountMatch) {
        const amountStr = amountMatch[0].replace(',', '.');
        const amount = parseFloat(amountStr);
        
        // 2. Açıklama (Tutarı ve para birimini metinden çıkar)
        let description = transcript
          .replace(amountMatch[0], '')
          .replace(/\b(tl|lira|dolar|euro|sterlin|kuruş)\b/gi, '')
          .trim();
        
        if (!description) description = "Sesli İşlem";
        description = description.charAt(0).toUpperCase() + description.slice(1);

        // 3. Kategori ve Tür Tahmini
        let category = 'diger';
        let type = 'expense';

        if (lowerText.includes('market') || lowerText.includes('alışveriş')) category = 'market';
        else if (lowerText.includes('fatura') || lowerText.includes('elektrik') || lowerText.includes('su') || lowerText.includes('internet')) category = 'fatura';
        else if (lowerText.includes('ulaşım') || lowerText.includes('benzin') || lowerText.includes('taksi') || lowerText.includes('otobüs')) category = 'ulasim';
        else if (lowerText.includes('yemek') || lowerText.includes('restoran') || lowerText.includes('kafe')) category = 'yemek';
        else if (lowerText.includes('sağlık') || lowerText.includes('ilaç') || lowerText.includes('doktor')) category = 'saglik';
        else if (lowerText.includes('maaş') || lowerText.includes('gelir') || lowerText.includes('avans')) { category = 'maas'; type = 'income'; }
        else if (lowerText.includes('yatırım') || lowerText.includes('altın') || lowerText.includes('döviz')) category = 'yatirim';

        handleAddTransaction({ description, amount, category, type, date: new Date().toISOString().split('T')[0] });

        // Sesli Geri Bildirim (Text-to-Speech)
        const currencyName = currency === 'TRY' ? 'Türk Lirası' : currency === 'USD' ? 'Dolar' : currency === 'EUR' ? 'Euro' : currency === 'GBP' ? 'Sterlin' : '';
        const utterance = new SpeechSynthesisUtterance(`${description}, ${amount} ${currencyName} olarak eklendi.`);
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
      }
    };
    recognition.start();
  };

  // Fontu uygulama açılışında bir kez yükle (Performans iyileştirmesi)
  useEffect(() => {
    const loadFont = async () => {
      const fontUrls = [
        '/fonts/Roboto-Regular.ttf', // 1. Öncelik: Yerel dosya
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', // 2. Öncelik: Hızlı CDN
        'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf' // 3. Öncelik: Yedek
      ];

      for (const url of fontUrls) {
        try {
          const response = await fetch(url);
          const contentType = response.headers.get('content-type');
          
          // Başarılı yanıt ve HTML olmayan içerik (Vite 404 fallback koruması)
          if (response.ok && (!contentType || !contentType.includes('text/html'))) {
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => setPdfFont(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
            return; // Başarılı olursa döngüden çık
          }
        } catch (e) {
          console.warn(`Font yüklenemedi (${url}), diğer kaynak deneniyor...`);
        }
      }
      console.error('Türkçe font hiçbir kaynaktan yüklenemedi.');
    };
    loadFont();
    fetchRates(); // Kurları çek
  }, [fetchRates]);

  // --- Side Effects (LocalStorage Kayıt) ---
  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_transactions`, JSON.stringify(transactions));
    saveToFirebase('transactions', transactions);
  }, [transactions, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_categories`, JSON.stringify(categories));
    saveToFirebase('categories', categories);
  }, [categories, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_goals`, JSON.stringify(goals));
    saveToFirebase('goals', goals);
  }, [goals, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_category_limits`, JSON.stringify(categoryLimits));
    saveToFirebase('categoryLimits', categoryLimits);
  }, [categoryLimits, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_recurring_payments`, JSON.stringify(recurringPayments));
    saveToFirebase('recurringPayments', recurringPayments);
  }, [recurringPayments, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_assets`, JSON.stringify(assets));
    saveToFirebase('assets', assets);
  }, [assets, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_credit_card_debts`, JSON.stringify(creditCardDebts));
    saveToFirebase('creditCardDebts', creditCardDebts);
  }, [creditCardDebts, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_bills`, JSON.stringify(bills));
    saveToFirebase('bills', bills);
  }, [bills, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_notes`, JSON.stringify(notes));
    saveToFirebase('notes', notes);
  }, [notes, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_email_settings`, JSON.stringify(emailSettings));
    saveToFirebase('emailSettings', emailSettings);
  }, [emailSettings, user, saveToFirebase]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_portfolio_history`, JSON.stringify(portfolioHistory));
    saveToFirebase('portfolioHistory', portfolioHistory);
  }, [portfolioHistory, user, saveToFirebase]);

  // Varlık Geçmişini Güncelle
  useEffect(() => {
    const hasForeignAssets = assets.some(a => a.type !== 'TRY');
    // Eğer yabancı varlık var ama kurlar henüz yüklenmediyse (USD 0 ise) işlem yapma
    if (hasForeignAssets && rates.USD === 0) return;

    const calculateTotal = () => {
      return assets.reduce((acc, asset) => {
        if (asset.type === 'TRY') return acc + asset.amount;
        const rate = rates[asset.type] || 0;
        return acc + (asset.amount * rate);
      }, 0);
    };

    const total = calculateTotal();
    const today = new Date().toISOString().split('T')[0];

    setPortfolioHistory(prev => {
      const newHistory = [...prev];
      const lastEntry = newHistory[newHistory.length - 1];

      if (lastEntry && lastEntry.date === today) {
        // Bugünün kaydı varsa ve değer değiştiyse güncelle
        if (Math.abs(lastEntry.value - total) > 0.01) {
           newHistory[newHistory.length - 1] = { date: today, value: total };
           return newHistory;
        }
        return prev;
      } else {
        // Bugün için yeni kayıt oluştur
        return [...newHistory, { date: today, value: total }];
      }
    });
  }, [assets, rates]);

  useEffect(() => {
    localStorage.setItem(`${user.username}_budget_limit`, budgetLimit);
    saveToFirebase('budgetLimit', budgetLimit);
  }, [budgetLimit, user, saveToFirebase]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
  }, [darkMode]);

  // --- Ripple Efekti (Global Click Listener) ---
  useEffect(() => {
    // Animasyon stillerini dinamik olarak ekle (Eksik CSS sorununu çözer)
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
      .animate-ripple {
        animation: ripple 0.6s linear;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      .animate-fade-out {
        animation: fadeOut 0.3s ease-in forwards;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up {
        animation: slideUp 0.4s ease-out forwards;
      }

      /* Dark Mode Smooth Transition */
      *, *::before, *::after {
        transition-property: background-color, border-color, color, fill, stroke, box-shadow;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
      }
    `;
    document.head.appendChild(style);

    const handleRipple = (e) => {
      const button = e.target.closest('button');
      if (button && !button.disabled) {
        const rect = button.getBoundingClientRect();

        // Ripple efektinin buton içinde kalması ve doğru konumlanması için
        // butonun position: relative (veya absolute/fixed) ve overflow: hidden olması gerekir.
        const computedStyle = window.getComputedStyle(button);
        if (computedStyle.position === 'static') {
          button.style.position = 'relative';
        }
        if (computedStyle.overflow !== 'hidden') {
          button.style.overflow = 'hidden';
        }

        const circle = document.createElement("span");
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        
        // CSS sınıflarına güvenmek yerine inline stillerle garanti altına alalım
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.backgroundColor = 'rgba(100, 116, 139, 0.3)';
        circle.style.pointerEvents = 'none';
        circle.classList.add("animate-ripple");

        button.appendChild(circle);

        setTimeout(() => {
          circle.remove();
        }, 600);
      }
    };

    // 'click' yerine 'pointerdown' kullanarak daha hızlı (dokunma anında) tepki veriyoruz
    document.addEventListener('pointerdown', handleRipple);
    return () => {
      document.removeEventListener('pointerdown', handleRipple);
      document.head.removeChild(style);
    };
  }, []);

  // --- Hesaplamalar (Memoization) ---
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.date && t.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Tarihe göre yeniden eskiye sırala
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    return recurringPayments.filter(p => {
      // Bugün veya önümüzdeki 3 gün içinde mi?
      return p.day >= currentDay && p.day <= currentDay + 3;
    }).sort((a, b) => a.day - b.day);
  }, [recurringPayments]);

  // Sık kullanılan açıklamaları hesapla (Kategori bazlı öneriler için)
  const descriptionSuggestions = useMemo(() => {
    const suggestions = {};
    transactions.forEach(t => {
      if (!t.category || !t.description) return;
      if (!suggestions[t.category]) suggestions[t.category] = {};
      suggestions[t.category][t.description] = (suggestions[t.category][t.description] || 0) + 1;
    });
    
    const result = {};
    Object.keys(suggestions).forEach(cat => {
      result[cat] = Object.entries(suggestions[cat])
        .sort((a, b) => b[1] - a[1]) // En çok kullanılandan aza sırala
        .slice(0, 5) // İlk 5 tanesini al
        .map(item => item[0]);
    });
    
    return result;
  }, [transactions]);

  // Bütçe Uyarısı Hesaplama
  const budgetAlert = useMemo(() => {
    const limit = parseFloat(budgetLimit);
    if (!limit || limit <= 0) return null;

    const percentage = (summary.expense / limit) * 100;
    
    if (percentage >= 100) {
      return { type: 'danger', message: `Dikkat! Aylık bütçe limitinizi aştınız. (%${percentage.toFixed(0)})` };
    } else if (percentage >= 80) {
      return { type: 'warning', message: `Uyarı: Aylık bütçe limitinizin %${percentage.toFixed(0)}'ine ulaştınız.` };
    }
    return null;
  }, [budgetLimit, summary.expense]);

  // --- İşleyiciler (Handlers) ---
  const handleAddTransaction = (transactionData) => {
    const newTransaction = {
      ...transactionData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddCategory = (category) => {
    setCategories([...categories, category]);
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleAddGoal = (goal) => {
    setGoals([...goals, { ...goal, id: Date.now() }]);
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddNote = (note) => {
    setNotes([note, ...notes]);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleUpdateGoal = (updatedGoal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleUpdateCategoryLimit = (category, limit) => {
    setCategoryLimits(prev => {
      const newLimits = { ...prev };
      if (limit <= 0) {
        delete newLimits[category];
      } else {
        newLimits[category] = limit;
      }
      return newLimits;
    });
  };

  const handleAddRecurringPayment = (payment) => {
    setRecurringPayments([...recurringPayments, { ...payment, id: Date.now() }]);
  };

  const handleDeleteRecurringPayment = (id) => {
    setRecurringPayments(recurringPayments.filter(p => p.id !== id));
  };

  const handleAddAsset = (asset) => {
    setAssets([...assets, { ...asset, id: Date.now() }]);
  };

  const handleDeleteAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleAddDebt = (debt) => {
    setCreditCardDebts([...creditCardDebts, { ...debt, id: Date.now() }]);
  };

  const handleDeleteDebt = (id) => {
    setCreditCardDebts(creditCardDebts.filter(d => d.id !== id));
  };

  const handleUpdateDebt = (updatedDebt) => {
    setCreditCardDebts(creditCardDebts.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  };

  const handleAddBill = (bill) => {
    setBills([...bills, { ...bill, id: Date.now() }]);
  };

  const handleDeleteBill = (id) => {
    setBills(bills.filter(b => b.id !== id));
  };

  const handleToggleBillStatus = (id) => {
    setBills(bills.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  };

  const handleUpdateEmailSettings = (settings) => {
    setEmailSettings(settings);
  };

  const handleCloseNotification = () => {
    setIsClosingNotification(true);
    setTimeout(() => {
      setShowNotifications(false);
      setIsClosingNotification(false);
    }, 500);
  };

  const handleExportBackup = async () => {
    const password = prompt("Yedekleme dosyasını şifrelemek için bir parola belirleyin:");
    if (!password) return;

    try {
      const data = {
        transactions,
        goals,
        categoryLimits,
        recurringPayments,
        budgetLimit,
        assets,
        creditCardDebts,
        bills,
        notes,
        portfolioHistory,
        categories,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };
      
      const encrypted = await encryptData(data, password);
      
      const blob = new Blob([encrypted], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `butce_yedek_${user.username}_${new Date().toISOString().slice(0,10)}.enc`;
      link.click();
    } catch (error) {
      alert("Yedekleme oluşturulurken hata oluştu: " + error.message);
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const password = prompt("Bu yedeği açmak için şifreyi girin:");
    if (!password) { e.target.value = ''; return; }

    try {
      const text = await file.text();
      const data = await decryptData(text, password);
      
      if (confirm(`"${data.exportDate}" tarihli yedek geri yüklenecek. Mevcut verilerinizin üzerine yazılacak. Onaylıyor musunuz?`)) {
        setTransactions(data.transactions || []);
        setGoals(data.goals || []);
        setCategoryLimits(data.categoryLimits || {});
        setRecurringPayments(data.recurringPayments || []);
        if (data.budgetLimit) setBudgetLimit(data.budgetLimit);
        if (data.assets) setAssets(data.assets);
        if (data.creditCardDebts) setCreditCardDebts(data.creditCardDebts);
        if (data.bills) setBills(data.bills);
        if (data.notes) setNotes(data.notes);
        if (data.portfolioHistory) setPortfolioHistory(data.portfolioHistory);
        if (data.categories) setCategories(data.categories);
        alert("Yedek başarıyla geri yüklendi!");
      }
    } catch (error) {
      alert("Geri yükleme başarısız: Şifre hatalı veya dosya bozuk.");
    }
    e.target.value = ''; // Input'u sıfırla
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }

    const headers = ['Tarih', 'Aciklama', 'Tutar', 'Tur', 'Kategori'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => `${t.date},"${t.description}",${t.amount},${t.type},${t.category}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `butce_raporu_${selectedMonth}.csv`;
    link.click();
  };

  const handleExportPDF = async () => {
    if (filteredTransactions.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: currency
        }).format(value);
      };

      // Font Yönetimi: Eğer state'te yoksa anlık olarak indir (Fallback)
      let activeFont = pdfFont;
      if (!activeFont) {
        try {
          const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
          if (response.ok) {
            const blob = await response.blob();
            activeFont = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.readAsDataURL(blob);
            });
            setPdfFont(activeFont);
          }
        } catch (e) {
          console.error("Font indirme hatası:", e);
        }
      }

      let fontRegistered = false;
      if (activeFont) {
        try {
          doc.addFileToVFS('Roboto-Regular.ttf', activeFont);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.setFont('Roboto');
          fontRegistered = true;
        } catch (e) {
          console.error("Font kayıt hatası, varsayılan fonta dönülüyor:", e);
          doc.setFont("helvetica");
        }
      }

      // Başlık
      doc.setFontSize(18);
      doc.text(t.budgetReport, 14, 22);
      
      doc.setFontSize(11);
      doc.text(`${t.creationDate}: ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`, 14, 30);
      doc.text(`${t.period}: ${formatMonthDisplay(selectedMonth)}`, 14, 36);

      // Grafikleri Ekleme
      let lineChartImg = null;
      let pieChartImg = null;

      try {
        const lineChartElement = document.querySelector("#line-chart-container");
        const pieChartElement = document.querySelector("#pie-chart-container");
        
        if (lineChartElement) {
          const lineChartCanvas = await html2canvas(lineChartElement, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: darkMode ? '#1e293b' : '#f1f5f9'
          });
          lineChartImg = lineChartCanvas.toDataURL('image/png');
        }
        if (pieChartElement) {
          const pieChartCanvas = await html2canvas(pieChartElement, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: darkMode ? '#1e293b' : '#f1f5f9'
          });
          pieChartImg = pieChartCanvas.toDataURL('image/png');
        }
      } catch (e) {
        console.error("Grafik oluşturma hatası:", e);
      }

      // Tablo Verileri
      const tableColumn = [t.date, t.description, t.category, t.amount, t.type];
      const tableRows = [];

      filteredTransactions.forEach(transaction => {
        const transactionData = [
          new Date(transaction.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US'),
          transaction.description,
          transaction.category,
          formatCurrency(transaction.amount),
          transaction.type === 'income' ? t.income : t.expense
        ];
        tableRows.push(transactionData);
      });

      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        styles: { 
          font: fontRegistered ? 'Roboto' : 'helvetica',
          fontStyle: 'normal'
        },
        headStyles: {
          font: fontRegistered ? 'Roboto' : 'helvetica',
          fontStyle: 'bold'
        }
      });

      // Tablonun bittiği yerden sonra grafikleri ekle
      let currentY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 40;
      
      doc.text(t.graphicSummary, 14, currentY + 10);
      currentY += 15;
      
      // Grafikleri yan yana ekle (Yer tasarrufu için)
      if (lineChartImg && pieChartImg) {
        // Çizgi grafiğe daha fazla alan ver, pasta grafiği biraz küçült
        const lineWidth = 110;
        const pieWidth = 65;
        const pageHeight = doc.internal.pageSize.height;
        
        const lineProps = doc.getImageProperties(lineChartImg);
        const lineHeight = (lineProps.height * lineWidth) / lineProps.width;
        
        const pieProps = doc.getImageProperties(pieChartImg);
        const pieHeight = (pieProps.height * pieWidth) / pieProps.width;
        
        // Eğer sayfada yer kalmadıysa yeni sayfaya geç
        if (currentY + Math.max(lineHeight, pieHeight) > pageHeight - 10) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.addImage(lineChartImg, 'PNG', 14, currentY, lineWidth, lineHeight);
        doc.addImage(pieChartImg, 'PNG', 130, currentY, pieWidth, pieHeight);
      } else if (lineChartImg || pieChartImg) {
        // Tek grafik varsa
        const img = lineChartImg || pieChartImg;
        const imgProps = doc.getImageProperties(img);
        const pdfHeight = (imgProps.height * 180) / imgProps.width;
        
        if (currentY + pdfHeight > doc.internal.pageSize.height - 10) {
          doc.addPage();
          currentY = 20;
        }
        doc.addImage(img, 'PNG', 14, currentY, 180, pdfHeight);
      }

      doc.save(`butce-raporu-${selectedMonth}.pdf`);
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      alert("PDF oluşturulurken bir hata meydana geldi. Lütfen konsolu kontrol edin.");
    } finally {
      setIsExporting(false);
    }
  };

  // Ay Değiştirme Fonksiyonları
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatMonthDisplay = (isoMonth) => {
    const [year, month] = isoMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });
  };

  // --- Render ---
  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 pb-24 md:pb-8 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-40 transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${pullY - 60}px)`, height: '60px' }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-slate-100 dark:border-slate-700">
          <RefreshCw className={`w-6 h-6 text-indigo-600 dark:text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Network Durumu Bildirimi (Mobil Uyumlu) */}
        {!isOnline && (
          <div className="bg-rose-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-pulse mb-4">
            <WifiOff size={20} />
            <span className="font-bold text-sm">İnternet bağlantısı yok. Veriler yerel olarak kaydediliyor.</span>
          </div>
        )}
        
        {/* Başlık */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-10 gap-4 animate-fade-in relative z-50">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 md:gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={scrollToTop} title="Yukarı Çık">
              <img src="/icon.png" alt="Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-sm" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Sesli Komut Butonu */}
            <button 
              onClick={handleVoiceCommand}
              className={`p-3 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
            >
              <Mic size={20} />
            </button>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative group">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer transition-all hover:border-indigo-300"
              >
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
            <div className="relative group">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.flag === 'us' || lang.flag === 'gb' ? '🇺🇸' : lang.flag === 'tr' ? '🇹🇷' : lang.flag === 'de' ? '🇩🇪' : lang.flag === 'es' ? '🇪🇸' : lang.flag === 'fr' ? '🇫🇷' : lang.flag === 'ru' ? '🇷🇺' : '🇯🇵'} {lang.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setShowCategorySettings(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Kategori Ayarları"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowEmailSettings(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="E-posta Raporu"
            >
              <Mail className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowBadges(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Başarı Rozetleri"
            >
              <Award className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowNotepad(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Not Defteri"
            >
              <StickyNote className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowAnalysis(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Harcama Analizi"
            >
              <BarChart2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowCalendar(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Takvim Görünümü"
            >
              <Calendar className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowProfile(true)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Profil"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </button>
            <button 
              onClick={() => setDarkMode(prev => !prev)}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Tema Değiştir"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button 
              onClick={onLogout}
              className="relative overflow-hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all hover:scale-105 active:scale-95"
              title="Çıkış Yap"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Bottom Sheet (Modern) */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
              
              {/* Sheet Content */}
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 p-6 rounded-t-3xl shadow-2xl border-t border-slate-100 dark:border-slate-700 z-[70] md:hidden animate-slide-up flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-2" />
                <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                </div>
                <div className="relative group">
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.flag === 'us' || lang.flag === 'gb' ? '🇺🇸' : lang.flag === 'tr' ? '🇹🇷' : lang.flag === 'de' ? '🇩🇪' : lang.flag === 'es' ? '🇪🇸' : lang.flag === 'fr' ? '🇫🇷' : lang.flag === 'ru' ? '🇷🇺' : '🇯🇵'} {lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                <button onClick={() => { setShowCategorySettings(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <Settings className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Ayarlar</span>
                </button>
                <button onClick={() => { setShowEmailSettings(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <Mail className="w-6 h-6" />
                  <span className="text-[10px] font-medium">E-posta</span>
                </button>
                <button onClick={() => { setShowBadges(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <Award className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Rozetler</span>
                </button>
                <button onClick={() => { setShowNotepad(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <StickyNote className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Notlar</span>
                </button>
                <button onClick={() => { setShowAnalysis(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <BarChart2 className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Analiz</span>
                </button>
                <button onClick={() => { setShowCalendar(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <Calendar className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Takvim</span>
                </button>
                <button onClick={() => { setShowProfile(true); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Profil</span>
                </button>
                <button onClick={() => { setDarkMode(prev => !prev); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  <span className="text-[10px] font-medium">Tema</span>
                </button>
                <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 border border-rose-100 dark:border-rose-900/30">
                  <LogOut className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Çıkış</span>
                </button>
              </div>
              </div>
            </>
          )}
        </header>

        {/* Araç Çubuğu (Filtreler ve Ayarlar) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col xl:flex-row gap-4 justify-between items-center transition-colors duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Modern Ay Seçici */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto max-w-full">
              <button onClick={handlePrevMonth} className="relative overflow-hidden p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors shadow-sm shrink-0">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 text-center select-none capitalize truncate px-2 min-w-0">
                {formatMonthDisplay(selectedMonth)}
              </span>
              <button onClick={handleNextMonth} className="relative overflow-hidden p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors shadow-sm shrink-0">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
              <Target className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input 
                type="number" 
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder={t.monthlyLimit}
                className="bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium w-full md:w-32 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-end">
            {/* Gizli Dosya Inputu */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportBackup} 
              className="hidden" 
              accept=".enc,.json,.txt"
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="relative overflow-hidden flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-all font-medium w-full md:w-auto justify-center hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-600"
              title="Yedekten Geri Yükle"
            >
              <Upload className="w-5 h-5" />
              <span className="hidden md:inline">Geri Yükle</span>
            </button>

            <button 
              onClick={handleExportBackup}
              className="relative overflow-hidden flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-all font-medium w-full md:w-auto justify-center hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-600"
              title="Şifreli Yedek Al"
            >
              <FileKey className="w-5 h-5" />
              <span className="hidden md:inline">Yedekle</span>
            </button>

            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`relative overflow-hidden flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all font-medium w-full md:w-auto justify-center shadow-md shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isExporting ? t.preparing : t.exportPdf}
            </button>

            <button 
              onClick={handleExportCSV}
              className="relative overflow-hidden flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 rounded-xl transition-all font-medium w-full md:w-auto justify-center hover:scale-105 active:scale-95"
            >
              <Download className="w-5 h-5" />
              {t.exportCsv}
            </button>
          </div>
        </div>

        {!isFirebaseLoaded && transactions.length === 0 ? (
          <DashboardSkeleton />
        ) : (
          <>
        {/* Bütçe Uyarısı */}
        {budgetAlert && (
          <div className={`mb-4 p-4 rounded-2xl flex items-start gap-3 animate-fade-in ${
            budgetAlert.type === 'danger' 
              ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800' 
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800'
          }`}>
            <div className={`p-2 rounded-lg shrink-0 ${
              budgetAlert.type === 'danger' 
                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' 
                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm mb-1 ${budgetAlert.type === 'danger' ? 'text-rose-900 dark:text-rose-200' : 'text-amber-900 dark:text-amber-200'}`}>
                {budgetAlert.type === 'danger' ? 'Bütçe Aşıldı' : 'Bütçe Uyarısı'}
              </h3>
              <p className={`text-sm ${budgetAlert.type === 'danger' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {budgetAlert.message}
              </p>
            </div>
          </div>
        )}

        {/* Bildirimler (Yaklaşan Ödemeler) */}
        {showNotifications && upcomingPayments.length > 0 && (
          <div className={`bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex items-start justify-between ${isClosingNotification ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg shrink-0">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-1">Yaklaşan Ödemeler</h3>
                <div className="space-y-1">
                  {upcomingPayments.map(p => (
                    <p key={p.id} className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-semibold">{p.name}</span>: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(p.amount)} 
                      <span className="opacity-75 text-xs ml-1">
                        ({p.day === new Date().getDate() ? 'Bugün' : p.day === new Date().getDate() + 1 ? 'Yarın' : `${p.day - new Date().getDate()} gün sonra`})
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={handleCloseNotification}
              className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Kategori Ayarları Modalı */}
        {showCategorySettings && (
          <CategorySettings 
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onClose={() => setShowCategorySettings(false)}
          />
        )}

        {/* Profil Ayarları Modalı */}
        {showProfile && (
          <UserProfile 
            user={user}
            onClose={() => setShowProfile(false)}
            onUpdateUser={onUpdateUser}
          />
        )}

        {/* E-posta Ayarları Modalı */}
        {showEmailSettings && (
          <EmailSettings 
            emailSettings={emailSettings}
            onUpdateSettings={handleUpdateEmailSettings}
            onClose={() => setShowEmailSettings(false)}
            summary={summary}
            currency={currency}
          />
        )}

        {/* Başarı Rozetleri Modalı */}
        {showBadges && (
          <Badges 
            transactions={transactions}
            goals={goals}
            assets={assets}
            summary={summary}
            budgetLimit={parseFloat(budgetLimit) || 0}
            onClose={() => setShowBadges(false)}
          />
        )}

        {/* Not Defteri Modalı */}
        {showNotepad && (
          <Notepad 
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onClose={() => setShowNotepad(false)}
          />
        )}

        {/* Harcama Analizi Modalı */}
        {showAnalysis && (
          <SpendingAnalysis 
            transactions={transactions}
            selectedMonth={selectedMonth}
            onClose={() => setShowAnalysis(false)}
            currency={currency}
          />
        )}

        {/* İşlem Ekleme Modalı (Mobil) */}
        {showAddTransactionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl dark:shadow-black/50 animate-slide-up relative flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">İşlem Ekle</h3>
                <button onClick={() => setShowAddTransactionModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <AddTransaction 
                  onAddTransaction={(data) => {
                    handleAddTransaction(data);
                    setShowAddTransactionModal(false);
                  }} 
                  t={t} 
                  currency={currency} 
                  categories={categories}
                  suggestions={descriptionSuggestions}
                />
              </div>
            </div>
          </div>
        )}

        {/* Takvim Görünümü Modalı */}
        {showCalendar && (
          <CalendarView 
            transactions={transactions}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onClose={() => setShowCalendar(false)}
            t={t}
            currency={currency}
            language={language}
          />
        )}

        {/* Bileşenler */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <DashboardSummary 
            income={summary.income} 
            expense={summary.expense} 
            balance={summary.balance} 
            budgetLimit={parseFloat(budgetLimit) || 0}
            currency={currency}
            t={t}
          />
        </div>

        {/* Ana İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Sol Kolon: Form, Grafikler ve Liste */}
          <div className="lg:col-span-2 space-y-8">
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }} ref={addTransactionRef}>
              <AddTransaction 
                onAddTransaction={handleAddTransaction} 
                t={t} 
                currency={currency} 
                categories={categories}
                suggestions={descriptionSuggestions}
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <StockMarket darkMode={darkMode} user={user} onAddTransaction={handleAddTransaction} />
            </div>
            
            <div className="animate-slide-up min-h-[400px]" style={{ animationDelay: '0.4s' }}>
              <IncomeExpenseChart 
                transactions={filteredTransactions} 
                selectedMonth={selectedMonth} 
                darkMode={darkMode} 
                currency={currency}
                t={t} 
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <TransactionList 
                transactions={filteredTransactions} 
                onDeleteTransaction={handleDelete} 
                currency={currency}
                t={t}
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <CurrencyConverter t={t} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <RecurringPayments 
                payments={recurringPayments}
                onAddPayment={handleAddRecurringPayment}
                onDeletePayment={handleDeleteRecurringPayment}
                currency={currency}
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <BillTracker 
                bills={bills}
                onAddBill={handleAddBill}
                onDeleteBill={handleDeleteBill}
                onToggleBillStatus={handleToggleBillStatus}
                currency={currency}
              />
            </div>
          </div>

          {/* Sağ Kolon: Pasta Grafik ve Araçlar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="animate-slide-up min-h-[350px]" style={{ animationDelay: '0.3s' }}>
              <ExpenseChart transactions={filteredTransactions} darkMode={darkMode} t={t} currency={currency} />
            </div>

            <div className="sticky top-8 space-y-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <CurrencyRates 
                  darkMode={darkMode} 
                  t={t} 
                  rates={rates}
                  loading={ratesLoading}
                  lastUpdated={ratesLastUpdated}
                  onRefresh={fetchRates}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <CategoryLimits 
                  limits={categoryLimits}
                  onUpdateLimit={handleUpdateCategoryLimit}
                  transactions={filteredTransactions}
                  currency={currency}
                  categories={categories}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <SavingsGoals 
                  goals={goals} 
                  onAddGoal={handleAddGoal} 
                  onUpdateGoal={handleUpdateGoal}
                  onDeleteGoal={handleDeleteGoal} 
                  currency={currency} 
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <AssetsPortfolio 
                  assets={assets}
                  onAddAsset={handleAddAsset}
                  onDeleteAsset={handleDeleteAsset}
                  rates={rates}
                  currency={currency}
                  portfolioHistory={portfolioHistory}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <CreditCardDebt
                  debts={creditCardDebts}
                  onAddDebt={handleAddDebt}
                  onDeleteDebt={handleDeleteDebt}
                  onUpdateDebt={handleUpdateDebt}
                  currency={currency}
                />
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-110 transition-all z-40 animate-fade-in"
          title="Yukarı Çık"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-2 pb-safe flex justify-around items-center z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none">
        <button onClick={scrollToTop} className="flex flex-col items-center gap-1 p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <Home size={24} />
          <span className="text-[10px] font-medium">Ana Sayfa</span>
        </button>
        
        <button onClick={() => setShowAnalysis(true)} className="flex flex-col items-center gap-1 p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <BarChart2 size={24} />
          <span className="text-[10px] font-medium">Analiz</span>
        </button>

        <button 
          onClick={() => setShowAddTransactionModal(true)}
          className="flex flex-col items-center justify-center -mt-8 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all border-4 border-slate-50 dark:border-slate-900"
        >
          <PlusCircle size={28} />
        </button>

        <button onClick={() => setShowCalendar(true)} className="flex flex-col items-center gap-1 p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <Calendar size={24} />
          <span className="text-[10px] font-medium">Takvim</span>
        </button>

        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <MoreHorizontal size={24} />}
          <span className="text-[10px] font-medium">Menü</span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8 pb-4 opacity-50">
        v1.1.0 - Bulut Senkronizasyonu Aktif
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('budget_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Kullanıcı oturum bilgisi okunamadı:", error);
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('budget_current_user', JSON.stringify(userData));
  };

  const handleUpdateUser = async (updatedUser) => {
    setUser(updatedUser);
    // Profil güncellemelerini Firebase'e kaydet
    try {
      const docRef = doc(db, "users", updatedUser.username);
      // Sadece kullanıcı bilgilerini (şifre, avatar vb) güncelle
      await setDoc(docRef, { 
        password: updatedUser.password,
        avatar: updatedUser.avatar
      }, { merge: true });
    } catch (error) {
      console.error("Kullanıcı güncelleme hatası:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('budget_current_user');
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return <BudgetApp key={user.username} user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
};

export default App;