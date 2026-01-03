import React, { useState } from 'react';
import { Mail, Check, X, Bell, Send } from 'lucide-react';

const EmailSettings = ({ emailSettings, onUpdateSettings, onClose, summary, currency }) => {
  const [email, setEmail] = useState(emailSettings.email || '');
  const [enabled, setEnabled] = useState(emailSettings.enabled || false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings({ email, enabled });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleSendNow = () => {
    if (!email) {
        alert("Lütfen önce bir e-posta adresi girin.");
        return;
    }
    const subject = "Aylık Bütçe Raporu";
    const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency });
    const body = `Merhaba,\n\nBu ayki bütçe özetiniz aşağıdadır:\n\nToplam Gelir: ${formatter.format(summary.income)}\nToplam Gider: ${formatter.format(summary.expense)}\nNet Bakiye: ${formatter.format(summary.balance)}\n\nSaygılarımızla,\nBütçe Takipçisi`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-500" />
            E-posta Raporu
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Aylık bütçe raporunuzun her ayın 1'inde otomatik olarak e-posta adresinize gönderilmesini sağlayın.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">E-posta Adresi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 font-medium"
                  placeholder="ornek@email.com"
                  required={enabled}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Otomatik Gönderim</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Her ayın başında</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex gap-3">
                <button
                type="button"
                onClick={handleSendNow}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                <Send className="w-5 h-5" />
                Şimdi Gönder
                </button>
                <button
                type="submit"
                className={`flex-1 relative overflow-hidden py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}`}
                >
                {saved ? (
                    <>
                    <Check className="w-5 h-5" />
                    Kaydedildi
                    </>
                ) : (
                    'Kaydet'
                )}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;