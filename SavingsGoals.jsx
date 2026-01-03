import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Trophy, Save, X, TrendingUp } from 'lucide-react';

const SavingsGoals = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, currency }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', currentAmount: 0 });
  const [addMoneyAmount, setAddMoneyAmount] = useState({}); // Hangi hedefe ne kadar eklenecek

  // Konfeti kütüphanesini yükle
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  const triggerConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
      });
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;
    
    onAddGoal({
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0
    });
    
    setNewGoal({ name: '', targetAmount: '', currentAmount: 0 });
    setShowAddForm(false);
  };

  const handleAddMoney = (goal) => {
    const amount = parseFloat(addMoneyAmount[goal.id]);
    if (!amount || amount <= 0) return;

    const newCurrentAmount = (goal.currentAmount || 0) + amount;
    const updatedGoal = { ...goal, currentAmount: newCurrentAmount };
    
    onUpdateGoal(updatedGoal);
    setAddMoneyAmount({ ...addMoneyAmount, [goal.id]: '' });

    // Eğer hedef tamamlandıysa konfeti patlat
    if (newCurrentAmount >= goal.targetAmount && (goal.currentAmount || 0) < goal.targetAmount) {
      triggerConfetti();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          Birikim Hedefleri
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all"
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Hedef Adı</label>
              <input 
                type="text" 
                placeholder="Örn: Araba, Tatil" 
                value={newGoal.name}
                onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Hedef Tutar</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={newGoal.targetAmount}
                onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <Save size={16} />
              Hedef Ekle
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div key={goal.id} className={`p-4 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {goal.name}
                    {isCompleted && <Trophy className="w-4 h-4 text-emerald-500 animate-bounce" />}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <button onClick={() => onDeleteGoal(goal.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Add Money Input */}
              {!isCompleted && (
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Tutar ekle..." 
                    value={addMoneyAmount[goal.id] || ''}
                    onChange={e => setAddMoneyAmount({ ...addMoneyAmount, [goal.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-emerald-500 dark:text-white"
                  />
                  <button 
                    onClick={() => handleAddMoney(goal)}
                    className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <TrendingUp size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {goals.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            Henüz birikim hedefi eklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;