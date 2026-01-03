import React from 'react';
import { Trophy, Lock, CheckCircle2, X } from 'lucide-react';

const Badges = ({ transactions, goals, assets, summary, budgetLimit, onClose }) => {
  const badges = [
    {
      id: 'starter',
      title: 'Başlangıç',
      description: 'İlk işleminizi eklediniz.',
      icon: '🚀',
      isUnlocked: transactions.length > 0
    },
    {
      id: 'saver',
      title: 'Tasarrufçu',
      description: 'Geliriniz giderinizden fazla.',
      icon: '💰',
      isUnlocked: summary.income > summary.expense && summary.income > 0
    },
    {
      id: 'goal_hunter',
      title: 'Hedef Avcısı',
      description: 'Bir birikim hedefini tamamladınız.',
      icon: '🎯',
      isUnlocked: goals.some(g => g.current >= g.target && g.target > 0)
    },
    {
      id: 'investor',
      title: 'Yatırımcı',
      description: 'Portföyünüze varlık eklediniz.',
      icon: '📈',
      isUnlocked: assets.length > 0
    },
    {
      id: 'budget_master',
      title: 'Bütçe Uzmanı',
      description: 'Aylık bütçe limitini aşmadınız.',
      icon: '🛡️',
      isUnlocked: budgetLimit > 0 && summary.expense <= budgetLimit && summary.expense > 0
    },
    {
      id: 'wealth_builder',
      title: 'Servet İnşası',
      description: 'Net bakiyeniz pozitif.',
      icon: '💎',
      isUnlocked: summary.balance > 0
    }
  ];

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const progress = (unlockedCount / badges.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Başarı Rozetleri
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Progress Bar */}
          <div className="mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">İlerleme Durumu</span>
              <span className="text-sm font-bold text-amber-500">{unlockedCount} / {badges.length}</span>
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              {progress === 100 ? 'Tebrikler! Tüm rozetleri topladınız! 🎉' : 'Rozetleri toplamak için finansal hedeflerinize ulaşın.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map(badge => (
              <div 
                key={badge.id} 
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 relative overflow-hidden group ${
                  badge.isUnlocked 
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/30' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${
                  badge.isUnlocked ? 'bg-white dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-800 grayscale opacity-50'
                }`}>
                  {badge.icon}
                </div>
                <div className={`flex-1 ${!badge.isUnlocked && 'opacity-50'}`}>
                  <h3 className={`font-bold ${badge.isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {badge.description}
                  </p>
                </div>
                <div className="absolute top-4 right-4">
                  {badge.isUnlocked ? (
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;