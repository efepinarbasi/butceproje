import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IncomeExpenseChart = ({ transactions, selectedMonth, darkMode, t, currency }) => {
  const data = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { name: day, income: 0, expense: 0 };
    });

    transactions.forEach(t => {
      if (t.date && t.date.startsWith(selectedMonth)) {
        const day = new Date(t.date).getDate();
        if (chartData[day - 1]) {
          if (t.type === 'income') chartData[day - 1].income += t.amount;
          else chartData[day - 1].expense += t.amount;
        }
      }
    });

    return chartData;
  }, [transactions, selectedMonth]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="line-chart-container" className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300 animate-scale-in">
      <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
        {t.lineChart}
      </h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={darkMode ? '#94a3b8' : '#64748b'} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke={darkMode ? '#94a3b8' : '#64748b'} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: darkMode ? '#1e293b' : '#fff', 
                borderRadius: '12px', 
                border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                color: darkMode ? '#f8fafc' : '#0f172a',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              name={t.income} 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              name={t.expense} 
              stroke="#f43f5e" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;