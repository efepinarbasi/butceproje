import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ExpenseChart = ({ transactions, darkMode, t, currency }) => {
  const expenses = transactions.filter(t => t.type === 'expense');

  const dataMap = expenses.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = 0;
    }
    acc[curr.category] += curr.amount;
    return acc;
  }, {});

  const data = Object.keys(dataMap).map(key => ({
    name: key,
    value: dataMap[key]
  }));

  const totalExpense = data.reduce((acc, curr) => acc + curr.value, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount);
  };

  // Özel Tooltip Bileşeni
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      // Yüzde hesaplama
      const percent = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg z-50">
          <p className="font-bold text-slate-800 dark:text-white mb-1 capitalize">{item.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.amount || 'Tutar'}: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(item.value)}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.rate || 'Oran'}: <span className="font-semibold text-indigo-500">{percent}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300 animate-slide-up flex flex-col" id="pie-chart-container">
      <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
        {t.expenseDistribution || 'Harcama Dağılımı'}
      </h2>
      
      {data.length > 0 ? (
        <div className="w-full h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={darkMode ? '#1e293b' : '#fff'} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-slate-600 dark:text-slate-300 capitalize text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Ortadaki Toplam Tutar */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Toplam</p>
             <p className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <p>{t.noData || 'Veri yok'}</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;