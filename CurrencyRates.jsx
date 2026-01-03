import React, { useState } from 'react';
import { Calculator, RefreshCw, TrendingUp, X } from 'lucide-react';

const CurrencyRates = ({ darkMode, t, rates, loading, lastUpdated, onRefresh }) => {
  
  // Hesap Makinesi State'leri
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcEquation, setCalcEquation] = useState('');

  const handleCalcInput = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcEquation('');
      return;
    }
    
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(calcEquation.replace(/x/g, '*')); 
        setCalcDisplay(String(Number(result.toFixed(2)))); // 2 basamak hassasiyet
        setCalcEquation('');
      } catch {
        setCalcDisplay('Hata');
        setCalcEquation('');
      }
      return;
    }

    if (['+', '-', 'x', '/'].includes(val)) {
      setCalcEquation(calcDisplay + val);
      setCalcDisplay(val);
    } else {
      if (calcDisplay === '0' || ['+', '-', 'x', '/'].includes(calcDisplay)) {
        setCalcDisplay(val);
        setCalcEquation(calcEquation + val);
      } else {
        setCalcDisplay(calcDisplay + val);
        setCalcEquation(calcEquation + val);
      }
    }
  };

  const calcButtons = [
    '7', '8', '9', '/',
    '4', '5', '6', 'x',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          Döviz Kurları
        </h2>
        <div className="flex gap-2">
           <button 
            onClick={() => setShowCalculator(!showCalculator)}
            className={`p-2 rounded-lg transition-colors ${showCalculator ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
            title="Hesap Makinesi"
          >
            {showCalculator ? <X className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
          </button>
          <button 
            onClick={onRefresh}
            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showCalculator ? (
        <div className="animate-fade-in">
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl mb-4 text-right">
            <div className="text-xs text-slate-400 h-4">{calcEquation}</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white truncate">{calcDisplay}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {calcButtons.map(btn => (
              <button
                key={btn}
                onClick={() => handleCalcInput(btn)}
                className={`p-3 rounded-lg font-bold transition-all active:scale-95 ${
                  btn === '=' 
                    ? 'bg-indigo-600 text-white col-span-1' 
                    : ['/', 'x', '-', '+', 'C'].includes(btn)
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {[
            { code: 'USD', icon: '🇺🇸', name: 'Amerikan Doları' },
            { code: 'EUR', icon: '🇪🇺', name: 'Euro' },
            { code: 'GBP', icon: '🇬🇧', name: 'İngiliz Sterlini' },
            { code: 'BTC', icon: '₿', name: 'Bitcoin' },
            { code: 'ETH', icon: 'Ξ', name: 'Ethereum' },
            { code: 'GOLD', icon: '🟡', name: 'Gram Altın' },
            { code: 'SILVER', icon: '⚪', name: 'Gram Gümüş' }
          ].map(curr => (
            <div key={curr.code} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{curr.icon}</span>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{curr.code} / TRY</p>
                  <p className="text-xs text-slate-400">{curr.name}</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-white text-lg">
                {loading ? '...' : rates[curr.code]?.toFixed(2)} ₺
              </span>
            </div>
          ))}
          
          {lastUpdated && (
            <p className="text-xs text-center text-slate-400 mt-2">
              Son güncelleme: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyRates;