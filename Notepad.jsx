import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, X, Save } from 'lucide-react';

const Notepad = ({ notes, onAddNote, onDeleteNote, onClose }) => {
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    
    onAddNote({
      ...newNote,
      id: Date.now(),
      date: new Date().toISOString()
    });
    
    setNewNote({ title: '', content: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-yellow-500" />
            Not Defteri
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Başlık..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-white font-bold outline-none focus:border-yellow-500 transition-colors"
            />
            <textarea
              placeholder="Notunuzu buraya yazın..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full bg-transparent px-2 py-1 text-slate-600 dark:text-slate-300 text-sm outline-none resize-none h-24"
            />
            <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold transition-colors">
                    <Save size={16} />
                    Kaydet
                </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.length > 0 ? (
                notes.sort((a, b) => b.id - a.id).map(note => (
                    <div key={note.id} className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-xl relative group hover:shadow-md transition-all">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2 pr-6">{note.title || 'Başlıksız Not'}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                        <div className="mt-3 text-xs text-slate-400 flex justify-between items-center">
                            <span>{new Date(note.date).toLocaleDateString('tr-TR')}</span>
                            <button 
                                onClick={() => onDeleteNote(note.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-10 text-slate-400 dark:text-slate-500">
                    Henüz not eklenmemiş.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notepad;