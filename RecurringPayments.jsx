import React, { useState } from 'react';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';

const RecurringPayments = ({ payments, onAddPayment, onDeletePayment, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPayment, setNewPayment] = useState({ name: '', amount: '', day: '' });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPayment.name || !newPayment.amount || !newPayment.day) return;
    onAddPayment({ 
      ...newPayment, 
      amount: parseFloat(newPayment.amount),
      day: parseInt(newPayment.day)
    });
    setNewPayment({ name: '', amount: '', day: '' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <CalendarClock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          Abonelikler & Sabit Giderler
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="relative overflow-hidden p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          title="Yeni Ekle"
        >
          <Plus className={`w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Ödeme Adı (Örn: Netflix)" 
              value={newPayment.name}
              onChange={e => setNewPayment({...newPayment, name: e.target.value})}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="number" 
                placeholder="Tutar" 
                value={newPayment.amount}
                onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                required
              />
              <input 
                type="number" 
                placeholder="Gün (1-31)" 
                min="1" max="31"
                value={newPayment.day}
                onChange={e => setNewPayment({...newPayment, day: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                required
              />
            </div>
            <button type="submit" className="relative overflow-hidden w-full py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-violet-500/20">
              Ekle
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
            <p className="text-slate-400 dark:text-slate-500 text-sm">Henüz sabit gider eklenmedi.</p>
          </div>
        ) : (
          payments.map((payment, index) => (
            <div key={payment.id} style={{ animationDelay: `${index * 0.1}s` }} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all animate-slide-up fill-mode-backwards group">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Gün</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{payment.day}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{payment.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Her ayın {payment.day}. günü</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(payment.amount)}</span>
                <button 
                  onClick={() => onDeletePayment(payment.id)}
                  className="relative overflow-hidden opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 p-1.5 rounded-md transition-all"
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecurringPayments;