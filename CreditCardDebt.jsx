import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Save, X, CheckCircle, Minus } from 'lucide-react';

const CreditCardDebt = ({ debts, onAddDebt, onDeleteDebt, onUpdateDebt, currency }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ 
    cardName: '', 
    description: '', 
    totalAmount: '', 
    installments: '', 
    remainingInstallments: '' 
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDebt.cardName || !newDebt.totalAmount) return;

    const installments = parseInt(newDebt.installments) || 1;
    
    onAddDebt({
      ...newDebt,
      totalAmount: parseFloat(newDebt.totalAmount),
      installments: installments,
      remainingInstallments: parseInt(newDebt.remainingInstallments) || installments
    });

    setNewDebt({ cardName: '', description: '', totalAmount: '', installments: '', remainingInstallments: '' });
    setShowAddForm(false);
  };

  const handlePayInstallment = (debt) => {
    if (debt.remainingInstallments > 0) {
        onUpdateDebt({
            ...debt,
            remainingInstallments: debt.remainingInstallments - 1
        });
    }
  };

  const handleUndoInstallment = (debt) => {
    if (debt.remainingInstallments < debt.installments) {
        onUpdateDebt({
            ...debt,
            remainingInstallments: debt.remainingInstallments + 1
        });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
            <CreditCard className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          Kredi Kartı Borçları
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Kart Adı</label>
              <input 
                type="text" 
                placeholder="Örn: Bonus, Axess" 
                value={newDebt.cardName}
                onChange={e => setNewDebt({...newDebt, cardName: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Açıklama (Opsiyonel)</label>
              <input 
                type="text" 
                placeholder="Örn: Telefon Taksiti" 
                value={newDebt.description}
                onChange={e => setNewDebt({...newDebt, description: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Toplam Tutar</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={newDebt.totalAmount}
                  onChange={e => setNewDebt({...newDebt, totalAmount: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Taksit Sayısı</label>
                <input 
                  type="number" 
                  placeholder="1" 
                  value={newDebt.installments}
                  onChange={e => setNewDebt({...newDebt, installments: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <Save size={16} />
              Borç Ekle
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {debts.map(debt => {
          const installmentAmount = debt.totalAmount / debt.installments;
          const paidInstallments = debt.installments - debt.remainingInstallments;
          const progress = (paidInstallments / debt.installments) * 100;
          const remainingAmount = installmentAmount * debt.remainingInstallments;

          return (
            <div key={debt.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {debt.cardName}
                    {debt.description && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({debt.description})</span>}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Aylık Ödeme: <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(installmentAmount)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    {debt.remainingInstallments < debt.installments && (
                        <button 
                            onClick={() => handleUndoInstallment(debt)}
                            className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                            title="Ödemeyi Geri Al"
                        >
                            <Minus size={14} />
                        </button>
                    )}
                    {debt.remainingInstallments > 0 && (
                        <button 
                            onClick={() => handlePayInstallment(debt)}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                            title="1 Taksit Öde"
                        >
                            <CheckCircle size={14} />
                            Öde
                        </button>
                    )}
                    <button onClick={() => onDeleteDebt(debt.id)} className="text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{paidInstallments} / {debt.installments} Taksit</span>
                  <span>Kalan: {formatCurrency(remainingAmount)}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        {debts.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            Kayıtlı kredi kartı borcu veya taksit bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardDebt;