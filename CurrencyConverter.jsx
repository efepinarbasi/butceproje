import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const CurrencyConverter = ({ t }) => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('TRY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
            const data = await response.json();
            setRates(data.rates);
        }
      } catch (error) {
        console.error('Kurlar yüklenemedi', error);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (rates[fromCurrency] && rates[toCurrency]) {
      const rate = rates[toCurrency] / rates[fromCurrency];
      setResult(amount * rate);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  // Para birimi bayrağı için yardımcı fonksiyon
  const getFlagUrl = (currencyCode) => {
    const mapping = {
      'EUR': 'eu', 'USD': 'us', 'GBP': 'gb', 'AUD': 'au', 'CAD': 'ca', 'CNY': 'cn', 'JPY': 'jp',
      'RUB': 'ru', 'TRY': 'tr', 'CHF': 'ch', 'INR': 'in', 'BRL': 'br', 'ZAR': 'za'
    };
    const code = mapping[currencyCode] || currencyCode.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${code}.png`;
  };

  // Para birimlerini sırala: Önemliler en başta
  const priorityCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'RUB', 'AZN'];
  const allCurrencies = Object.keys(rates).length > 0 ? Object.keys(rates) : priorityCurrencies;
  
  const sortedCurrencies = [
    ...priorityCurrencies.filter(c => allCurrencies.includes(c)),
    ...allCurrencies.filter(c => !priorityCurrencies.includes(c)).sort()
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300 animate-slide-up">
      <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
        {t.currencyConverter}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.quantity}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200"
            min="0"
          />
        </div>

        <div className="md:col-span-3 space-y-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.currency}</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200"
          >
            {sortedCurrencies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 flex justify-center pb-3">
            <ArrowRightLeft className="w-6 h-6 text-slate-400" />
        </div>

        <div className="md:col-span-4 space-y-2">
           <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.target}</label>
           <div className="relative">
            <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200"
            >
                {sortedCurrencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
           </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.result}:</span>
        <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
            {result !== null ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: toCurrency }).format(result) : '...'}
        </span>
      </div>
    </div>
  );
};

export default CurrencyConverter;