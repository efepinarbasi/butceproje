import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const EMOJI_LIST = [
  '🛒', '📄', '🚌', '🍽️', '🎬', '💊', '💰', '📈', '🔹',
  '🏠', '🚗', '✈️', '🎮', '📚', '🎁', '👶', '🐾', '🔧',
  '💻', '📱', '👗', '👠', '🎓', '🎵', '🎨', '🏋️', '🏥',
  '🧾', '💳', '💵', '🏦', '🚕', '🚂', '🍔', '🍕', '☕',
  '🍺', '🍷', '🚭', '💅', '💇', '🧹', '🛏️', '🛋️', '🚿',
  '🏋️‍♀️', '🏊‍♂️', '🚴', '🧘', '🏕️', '🏖️', '🏔️', '🎡', '🎢'
];

const CategorySettings = ({ categories, onAddCategory, onDeleteCategory, onClose }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🔹');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: selectedIcon
    };

    onAddCategory(newCategory);
    setNewCategoryName('');
    setSelectedIcon('🔹');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl dark:shadow-black/50 flex flex-col max-h-[85vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kategori Yönetimi</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {/* Add New Category Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Yeni Kategori Ekle</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Kategori İsmi</label>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Örn: Tatil, Kira..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">İkon Seç</label>
              <div className="grid grid-cols-7 gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                {EMOJI_LIST.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedIcon(emoji)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xl transition-all ${selectedIcon === emoji ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 scale-110' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!newCategoryName.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-5 h-5" />
              Kategori Oluştur
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Mevcut Kategoriler</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl group hover:border-indigo-200 dark:hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl shadow-sm">
                      {cat.icon}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                  </div>
                  
                  <button 
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CategorySettings;