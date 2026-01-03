import React, { useState, useEffect } from 'react';
import { PlusCircle, Save } from 'lucide-react';

const AddTransaction = ({ onAddTransaction, t, currency, categories, suggestions = {} }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Kategoriler yüklendiğinde varsayılan olarak ilkini seç
  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    onAddTransaction({
      amount: parseFloat(amount),
      category,
      description: description || (type === 'expense' ? 'Harcama' : 'Gelir'),
      type,
      date
    });

    // Formu temizle (Tarih ve Kategori kalır)
    setAmount('');
    setDescription('');
  };

  // Seçili kategoriye ait önerileri al
  const currentSuggestions = suggestions[category] || [];

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
      <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        {t?.addTransaction || 'İşlem Ekle'}
      </h3>

      {/* Gelir / Gider Seçimi */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {t?.expense || 'Gider'}
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {t?.income || 'Gelir'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tutar */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t?.amount || 'Tutar'}</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 dark:text-white"
              required
            />
            <span className="absolute right-4 top-3 font-bold text-slate-400">{currency}</span>
          </div>
        </div>

        {/* Kategori */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t?.category || 'Kategori'}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-white appearance-none"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Açıklama (Otomatik Önerili) */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t?.description || 'Açıklama'}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          list="description-suggestions"
          placeholder={t?.descriptionPlaceholder || 'Örn: Market alışverişi'}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-white"
        />
        <datalist id="description-suggestions">
          {currentSuggestions.map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>
      </div>

      {/* Tarih */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t?.date || 'Tarih'}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-white"
        />
      </div>

      <button
        type="submit"
        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
      >
        <Save className="w-5 h-5" />
        {t?.save || 'Kaydet'}
      </button>
    </form>
  );
};

export default AddTransaction;