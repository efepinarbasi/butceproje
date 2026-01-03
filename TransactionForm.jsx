import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { CATEGORIES } from './constants';

const TransactionForm = ({ onAddTransaction, t, currency }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  
  // Yerel saat dilimine göre bugün (YYYY-MM-DD)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));

  // Tür değişince kategori listesini güncelle ve ilkini seç
  useEffect(() => {
    setCategory(CATEGORIES[type][0]);
  }, [type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    // Virgülü noktaya çevirerek sayıya dönüştür
    const cleanAmount = amount.toString().replace(',', '.');
    onAddTransaction({
      description,
      amount: parseFloat(cleanAmount),
      type,
      category,
      date
    });

    // Formu temizle
    setDescription('');
    setAmount('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300 animate-slide-up">
      <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
        {t.addTransaction}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.description}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            placeholder="Örn: Market alışverişi"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.amount} ({currency})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.type}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="expense">{t.expense} (-)</option>
            <option value="income">{t.income} (+)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.category}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200"
          >
            {CATEGORIES[type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.date}</label>
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200 dark:[color-scheme:dark]"
                required
            />
        </div>

        <button
          type="submit"
          className="col-span-2 mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] hover:scale-[1.02]"
        >
          <PlusCircle className="w-5 h-5" />
          {t.add}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;