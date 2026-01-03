import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, TrendingUp, PieChart as PieChartIcon, List, LineChart as LineChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const AssetsPortfolio = ({ assets, onAddAsset, onDeleteAsset, rates, currency, portfolioHistory = [] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'pie', 'line'
  const [newAsset, setNewAsset] = useState({ type: 'GOLD', amount: '' });

  const assetTypes = [
    { code: 'GOLD', name: 'Gram Altın', icon: '🟡' },
    { code: 'SILVER', name: 'Gram Gümüş', icon: '⚪' },
    { code: 'USD', name: 'Dolar', icon: '🇺🇸' },
    { code: 'EUR', name: 'Euro', icon: '🇪🇺' },
    { code: 'GBP', name: 'Sterlin', icon: '🇬🇧' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'TRY', name: 'Türk Lirası', icon: '🇹🇷' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  const calculateValue = (asset) => {
    if (asset.type === 'TRY') return asset.amount;
    const rate = rates[asset.type] || 0;
    return asset.amount * rate;
  };

  const totalPortfolioValue = assets.reduce((acc, asset) => acc + calculateValue(asset), 0);

  // Grafik Verisi Hazırlama
  const assetDataMap = assets.reduce((acc, asset) => {
    const value = calculateValue(asset);
    const typeInfo = assetTypes.find(t => t.code === asset.type);
    const name = typeInfo ? typeInfo.name : asset.type;
    
    if (!acc[name]) acc[name] = 0;
    acc[name] += value;
    return acc;
  }, {});

  const chartData = Object.keys(assetDataMap).map(key => ({ name: key, value: assetDataMap[key] })).filter(i => i.value > 0).sort((a, b) => b.value - a.value);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAsset.amount) return;
    onAddAsset({
      ...newAsset,
      amount: parseFloat(newAsset.amount)
    });
    setNewAsset({ type: 'GOLD', amount: '' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <Briefcase className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          Varlıklarım
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`relative overflow-hidden p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
            title="Liste Görünümü"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`relative overflow-hidden p-2 rounded-lg transition-colors ${viewMode === 'pie' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
            title="Dağılım Grafiği"
          >
            <PieChartIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('line')}
            className={`relative overflow-hidden p-2 rounded-lg transition-colors ${viewMode === 'line' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
            title="Değer Değişimi"
          >
            <LineChartIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="relative overflow-hidden p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Varlık Ekle"
          >
            <Plus className={`w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800 flex justify-between items-center">
        <div>
          <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium">Toplam Varlık Değeri</p>
          <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{formatCurrency(totalPortfolioValue)}</p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
          <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="space-y-3">
            <select
              value={newAsset.type}
              onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            >
              {assetTypes.map(t => (
                <option key={t.code} value={t.code}>{t.icon} {t.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Miktar"
                value={newAsset.amount}
                onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                className="flex-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                step="any"
                required
              />
              <button
                type="submit"
                className="relative overflow-hidden px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </form>
      )}

      {viewMode === 'pie' && (
        <div className="animate-fade-in">
          {chartData.length > 0 ? (
            <>
              <div className="h-[200px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-600 dark:text-slate-300 truncate flex-1">{entry.name}</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {((entry.value / totalPortfolioValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">Grafik için veri yok.</div>
          )}
        </div>
      )}

      {viewMode === 'line' && (
        <div className="animate-fade-in">
          {portfolioHistory.length > 0 ? (
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short'})}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">Geçmiş verisi henüz oluşmadı.</div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-3">
          {assets.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
              <p className="text-slate-400 dark:text-slate-500 text-sm">Henüz varlık eklenmedi.</p>
            </div>
          ) : (
            assets.map((asset, index) => {
              const assetInfo = assetTypes.find(t => t.code === asset.type) || { icon: '❓', name: asset.type };
              const value = calculateValue(asset);
              
              return (
                <div key={asset.id} style={{ animationDelay: `${index * 0.1}s` }} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all animate-slide-up fill-mode-backwards group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{assetInfo.icon}</span>
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{assetInfo.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{asset.amount} {asset.type !== 'TRY' ? 'Adet/Gram' : 'TL'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(value)}</p>
                      {asset.type !== 'TRY' && (
                        <p className="text-xs text-slate-400">Kur: {rates[asset.type]?.toFixed(2)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="relative overflow-hidden opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 p-1.5 rounded-md transition-all"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AssetsPortfolio;