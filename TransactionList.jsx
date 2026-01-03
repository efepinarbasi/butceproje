import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownRight, Calendar, Tag } from 'lucide-react';

const TransactionList = ({ transactions, onDeleteTransaction, currency, t }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center transition-colors duration-300">
        <p className="text-slate-500 dark:text-slate-400">Henüz işlem bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white">Son İşlemler</h3>
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3">{t?.date || 'Tarih'}</th>
              <th className="px-4 py-3">{t?.category || 'Kategori'}</th>
              <th className="px-4 py-3">{t?.description || 'Açıklama'}</th>
              <th className="px-4 py-3 text-right">{t?.amount || 'Tutar'}</th>
              <th className="px-4 py-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {transaction.description}
                </td>
                <td className={`px-4 py-3 text-right font-bold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2 rounded-xl shrink-0 ${transaction.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                {transaction.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-white truncate">{transaction.description || transaction.category}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(transaction.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 truncate">
                    <Tag size={12} />
                    {transaction.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
              <span className={`font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
              <button
                onClick={() => onDeleteTransaction(transaction.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;