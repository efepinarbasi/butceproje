import React, { useState } from 'react';
import { Receipt, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

const BillTracker = ({ bills, onAddBill, onDeleteBill, onToggleBillStatus, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '' });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !newBill.dueDate) return;
    onAddBill({
      ...newBill,
      amount: parseFloat(newBill.amount),
      isPaid: false
    });
    setNewBill({ name: '', amount: '', dueDate: '' });
    setIsAdding(false);
  };

  // Faturaları sırala: Ödenmemişler önce, sonra tarihe göre
  const sortedBills = [...bills].sort((a, b) => {
    if (a.isPaid === b.isPaid) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return a.isPaid ? 1 : -1;
  });

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          Fatura Takibi
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="relative overflow-hidden p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          title="Fatura Ekle"
        >
          <Plus className={`w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Fatura Adı (Örn: Elektrik)"
              value={newBill.name}
              onChange={e => setNewBill({...newBill, name: e.target.value})}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Tutar"
                value={newBill.amount}
                onChange={e => setNewBill({...newBill, amount: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
              />
              <input
                type="date"
                value={newBill.dueDate}
                onChange={e => setNewBill({...newBill, dueDate: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
              />
            </div>
            <button type="submit" className="relative overflow-hidden w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-500/20">
              Faturayı Kaydet
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sortedBills.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
            <p className="text-slate-400 dark:text-slate-500 text-sm">Henüz fatura eklenmedi.</p>
          </div>
        ) : (
          sortedBills.map((bill, index) => {
            const isOverdue = !bill.isPaid && new Date(bill.dueDate) < new Date().setHours(0,0,0,0);
            
            return (
              <div key={bill.id} style={{ animationDelay: `${index * 0.1}s` }} className={`flex items-center justify-between p-3 rounded-xl border transition-all animate-slide-up fill-mode-backwards group ${bill.isPaid ? 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-75' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onToggleBillStatus(bill.id)}
                    className={`p-2 rounded-full transition-colors ${bill.isPaid ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-300 hover:text-orange-500 bg-slate-100 dark:bg-slate-700'}`}
                    title={bill.isPaid ? "Ödenmedi Olarak İşaretle" : "Ödendi Olarak İşaretle"}
                  >
                    {bill.isPaid ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                  </button>
                  <div>
                    <p className={`font-bold text-sm ${bill.isPaid ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{bill.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar size={12} />
                      <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                        {new Date(bill.dueDate).toLocaleDateString('tr-TR')}
                        {isOverdue && ' (Gecikmiş)'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${bill.isPaid ? 'text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{formatCurrency(bill.amount)}</span>
                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="relative overflow-hidden opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 p-1.5 rounded-md transition-all"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BillTracker;