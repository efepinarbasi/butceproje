import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';

const DashboardSummary = ({ income, expense, balance, budgetLimit, t, currency }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  // Bütçe kullanım oranı
  const usagePercentage = budgetLimit > 0 ? Math.min((expense / budgetLimit) * 100, 100) : 0;
  const isOverBudget = expense > budgetLimit && budgetLimit > 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bakiye Kartı */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{t.netBalance}</p>
              <p className={`text-3xl font-bold tracking-tight ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Gelir Kartı */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{t.totalIncome}</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{formatCurrency(income)}</p>
            </div>
          </div>
        </div>

        {/* Gider Kartı */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{t.totalExpense}</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">{formatCurrency(expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bütçe Durumu */}
      {budgetLimit > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
              <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <span>{t.budgetTarget}: {formatCurrency(budgetLimit)}</span>
            </div>
            <span className={`text-sm font-bold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
              %{usagePercentage.toFixed(1)} {t.used}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;