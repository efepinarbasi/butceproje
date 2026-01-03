import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

const CalendarView = ({ transactions, selectedMonth, onMonthChange, onClose, t, currency, language = 'tr' }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [year, month] = selectedMonth.split('-').map(Number);
  
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y, m) => {
    const day = new Date(y, m - 1, 1).getDay();
    return day === 0 ? 6 : day - 1; // Pazartesi 0 olacak şekilde ayarla (0=Paz, 1=Pzt -> 0=Pzt, 6=Paz)
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getDayTransactions = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
  };

  const handlePrevMonth = () => {
    const date = new Date(year, month - 2, 1);
    onMonthChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const date = new Date(year, month, 1);
    onMonthChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthName = new Date(year, month - 1, 1).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });

  // Haftanın günlerini dinamik oluştur (Pazartesi'den başlayarak)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i + 1); // 1 Ocak 2024 Pazartesi
    return d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' });
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[85vh] animate-slide-up">
        {selectedDay ? (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {new Date(year, month - 1, selectedDay).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
              {getDayTransactions(selectedDay).length > 0 ? (
                <div className="space-y-3">
                  {getDayTransactions(selectedDay).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{t.description}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t.category}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                  <p>Bu tarihte işlem bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
                  {monthName}
                </h2>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                  <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
                  <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-2 md:p-6 bg-slate-50 dark:bg-slate-900">
              <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 md:mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center font-bold text-slate-400 uppercase text-[10px] md:text-sm tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 md:gap-3 auto-rows-fr">
                {blanks.map(i => (
                  <div key={`blank-${i}`} className="min-h-[60px] md:min-h-[100px] rounded-xl md:rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-transparent"></div>
                ))}
                {days.map(day => {
                  const dayTrans = getDayTransactions(day);
                  const income = dayTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
                  const expense = dayTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
                  const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();

                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[60px] md:min-h-[100px] p-1 md:p-3 rounded-xl md:rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 duration-200 flex flex-col gap-1 cursor-pointer ${isToday ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-1 md:ring-2 ring-indigo-500/20 z-10' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                    >
                      <span className={`text-xs md:text-sm font-bold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full mx-auto md:mx-0 ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700'}`}>
                        {day}
                      </span>
                      
                      {/* Desktop View: Amounts */}
                      <div className="hidden md:flex flex-1 flex-col justify-end gap-1 mt-1">
                        {income > 0 && <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg truncate">+{formatCurrency(income)}</div>}
                        {expense > 0 && <div className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-lg truncate">-{formatCurrency(expense)}</div>}
                      </div>

                      {/* Mobile View: Dots */}
                      <div className="flex md:hidden items-center justify-center gap-1 mt-auto pb-1">
                         {income > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                         {expense > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarView;