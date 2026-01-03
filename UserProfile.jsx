import React, { useState, useRef } from 'react';
import { User, Lock, Save, X, Check, Camera } from 'lucide-react';

const UserProfile = ({ user, onClose, onUpdateUser }) => {
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        setError('Dosya boyutu 500KB\'dan küçük olmalıdır.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let shouldUpdatePassword = false;

    // Şifre değiştirme isteği varsa kontrolleri yap
    if (newPassword || currentPassword) {
      if (currentPassword !== user.password) {
        setError('Mevcut şifre hatalı.');
        return;
      }

      if (newPassword.length < 4) {
        setError('Yeni şifre en az 4 karakter olmalıdır.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Yeni şifreler eşleşmiyor.');
        return;
      }
      shouldUpdatePassword = true;
    }

    try {
      const updatedUser = { 
        ...user, 
        avatar: avatar,
        password: shouldUpdatePassword ? newPassword : user.password 
      };

      // Kullanıcı listesini güncelle
      const users = JSON.parse(localStorage.getItem('budget_users') || '[]');
      const updatedUsers = users.map(u => 
        u.username === user.username ? updatedUser : u
      );
      localStorage.setItem('budget_users', JSON.stringify(updatedUsers));
      
      // Oturumu güncelle
      localStorage.setItem('budget_current_user', JSON.stringify(updatedUser));
      
      // Ana state'i güncelle
      if (onUpdateUser) onUpdateUser(updatedUser);
      
      setSuccess('Profil başarıyla güncellendi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Güncelleme sırasında bir hata oluştu.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-500" />
            Profil Ayarları
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3 overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                {avatar ? (
                  <img src={avatar} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {user.username}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Kullanıcı Hesabı</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Mevcut Şifre</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Yeni Şifre</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Yeni Şifre (Tekrar)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Check className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-sm font-medium text-center animate-pulse">{error}</p>}
            {success && <p className="text-emerald-500 text-sm font-medium text-center animate-pulse">{success}</p>}

            <button
              type="submit"
              className="relative overflow-hidden w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Değişiklikleri Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;