import React, { useMemo } from 'react';
import { Tender } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  PieChart as PieChartIcon, 
  BarChart3, 
  DollarSign, 
  Target
} from 'lucide-react';

interface AnalyticsDashboardProps {
  tenders: Tender[];
}

const COLORS = {
  LOW: '#10b981', // emerald-500
  MEDIUM: '#f59e0b', // amber-500
  HIGH: '#ef4444', // red-500
  CRITICAL: '#7f1d1d', // red-900
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tenders }) => {
  // Calculate metrics
  const totalBudget = useMemo(() => tenders.reduce((acc, t) => acc + (t.budgetUah || 0), 0), [tenders]);
  const avgFoulScore = useMemo(() => tenders.length > 0 ? Math.round(tenders.reduce((acc, t) => acc + (t.foulScore || 0), 0) / tenders.length) : 0, [tenders]);
  const highRiskCount = useMemo(() => tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length, [tenders]);

  // Risk distribution for Pie Chart
  const riskData = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    tenders.forEach(t => {
      if (counts[t.riskLevel as keyof typeof counts] !== undefined) {
        counts[t.riskLevel as keyof typeof counts]++;
      } else {
        counts.MEDIUM++;
      }
    });
    return Object.entries(counts).filter(([_, count]) => count > 0).map(([name, value]) => ({ name, value }));
  }, [tenders]);

  // Status distribution for Bar Chart
  const statusData = useMemo(() => {
    const statuses = tenders.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statuses).map(([name, count]) => ({ name, count }));
  }, [tenders]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <PieChartIcon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Аналітика Портфеля</h1>
          <p className="text-sm text-slate-400">Загальна статистика збережених тендерів та ризиків</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Збережено тендерів</p>
              <h3 className="text-2xl font-bold text-white">{tenders.length}</h3>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Загальний бюджет</p>
              <h3 className="text-2xl font-bold text-emerald-400">
                {(totalBudget / 1000000).toFixed(1)}M ₴
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Середній Foul Score</p>
              <h3 className="text-2xl font-bold text-amber-400">{avgFoulScore} / 100</h3>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Ризикові (High/Crit)</p>
              <h3 className="text-2xl font-bold text-red-400">{highRiskCount}</h3>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center">
            <PieChartIcon className="w-4 h-4 mr-2 text-indigo-400" /> Розподіл за рівнем ризику
          </h3>
          <div className="h-64">
            {tenders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.MEDIUM} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Немає даних</div>
            )}
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-400" /> Статуси тендерів
          </h3>
          <div className="h-64">
            {tenders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '0.5rem' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Немає даних</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
