import React, { useState, useMemo } from 'react';
import { Target, Edit2, Save, X } from 'lucide-react';

const CategoryLimits = ({ limits, onUpdateLimit, transactions, currency, categories }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  // Kategori bazlı harcamaları hesapla (Net Harcama: Gider - Gelir)
  const spendingByCategory = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const val = parseFloat(t.amount) || 0;
      const amount = t.type === 'expense' ? val : -val;
      acc[t.category] = (acc[t.category] || 0) + amount;
      return acc;
    }, {});
  }, [transactions]);

  const handleEditClick = (category, currentLimit) => {
    setEditingCategory(category);
    setTempLimit(currentLimit || '');
  };

  const handleSave = (category) => {
    const val = parseFloat(tempLimit);
    onUpdateLimit(category, isNaN(val) ? 0 : val);
    setEditingCategory(null);
  };

  const handleCancel = () => {
    setEditingCategory(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        Kategori Limitleri
      </h3>
      
      <div className="space-y-6">
        {categories.map(cat => {
          const limit = limits[cat.name] || 0;
          // Kategori ismine veya ID'sine göre harcamayı bul (Veri tutarlılığı için)
          const spent = spendingByCategory[cat.name] || spendingByCategory[cat.id] || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          
          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                </div>
                
                {editingCategory === cat.name ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <input
                      type="number"
                      min="0"
                      value={tempLimit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) setTempLimit(val);
                      }}
                      className="w-24 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Limit"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(cat.name);
                        if (e.key === 'Escape') handleCancel();
                      }}
                    />
                    <button onClick={() => handleSave(cat.name)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"><Save size={16} /></button>
                    <button onClick={handleCancel} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className={`text-sm font-medium ${limit > 0 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {limit > 0 ? formatCurrency(limit) : 'Limit Yok'}
                    </span>
                    <button 
                      onClick={() => handleEditClick(cat.name, limit)} 
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Limiti Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                {limit > 0 && (
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                      percentage >= 100 ? 'bg-rose-500' : 
                      percentage >= 80 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }}
                  />
                )}
              </div>
              
              <div className="flex justify-between text-xs">
                <span className={`${spent > limit && limit > 0 ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {formatCurrency(spent)} harcandı
                </span>
                {limit > 0 && (
                  <span className={`${percentage >= 100 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                    {Math.max(0, limit - spent) > 0 ? `${formatCurrency(limit - spent)} kaldı` : 'Limit aşıldı!'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {categories.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-4">Kategori bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryLimits;