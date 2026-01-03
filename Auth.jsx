import React, { useState } from 'react';
import { User, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kullanıcı adını küçük harfe çevirip boşlukları temizleyelim (standartlaştırma)
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) throw new Error("Kullanıcı adı boş olamaz");
      
      const userRef = doc(db, "users", cleanUsername);
      const userSnap = await getDoc(userRef);

      if (isLogin) {
        // --- GİRİŞ YAPMA ---
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.password === password) {
            // Başarılı giriş
            onLogin(userData);
          } else {
            setError('Hatalı şifre!');
          }
        } else {
          setError('Kullanıcı bulunamadı! Lütfen önce kayıt olun.');
        }
      } else {
        // --- KAYIT OLMA ---
        if (userSnap.exists()) {
          setError('Bu kullanıcı adı zaten alınmış.');
        } else {
          const newUser = {
            username: cleanUsername,
            password, // Not: Gerçek uygulamalarda şifreler hashlenmelidir
            avatar: '',
            createdAt: new Date().toISOString(),
            // Varsayılan boş veriler
            transactions: [],
            categories: [
              { id: 'market', name: 'Market & Alışveriş', icon: '🛒' },
              { id: 'fatura', name: 'Faturalar', icon: '📄' },
              { id: 'ulasim', name: 'Ulaşım', icon: '🚌' },
              { id: 'yemek', name: 'Yeme & İçme', icon: '🍽️' },
              { id: 'eglence', name: 'Eğlence', icon: '🎬' },
              { id: 'saglik', name: 'Sağlık', icon: '💊' },
              { id: 'maas', name: 'Maaş / Gelir', icon: '💰' },
              { id: 'yatirim', name: 'Yatırım', icon: '📈' },
              { id: 'diger', name: 'Diğer', icon: '🔹' }
            ]
          };
          
          // Firestore'a kaydet
          await setDoc(userRef, newUser);
          
          // Giriş yap
          onLogin(newUser);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('Bağlantı hatası. Lütfen internetinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
        <div className="text-center mb-8">
          <img src="/icon.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-md" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Bütçe Takip</h1>
          <p className="text-slate-500 dark:text-slate-400">Harcamalarınızı kontrol altına alın</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-medium animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Kullanıcı Adı</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium transition-all"
                placeholder="Kullanıcı adınız"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Kayıt Ol
                </>
              )
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;