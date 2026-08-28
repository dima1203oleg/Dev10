import React, { useMemo } from 'react';
import { Tender } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
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

const RISK_COLORS: Record<string, string> = {
  'Низький': '#10b981', // emerald-500
  'Помірний': '#f59e0b', // amber-500
  'Високий': '#f97316', // orange-500
  'Критичний': '#ef4444', // red-500
};

const STATUS_LABELS: Record<string, string> = {
  'ACTIVE_PROPOSALS': 'Подання пропозицій',
  'ACTIVE': 'Активні',
  'IN_REVIEW': 'Кваліфікація',
  'COMPLETED': 'Перемога / Завершено',
  'CLOSED': 'Закрито',
  'UNSUCCESSFUL': 'Не відбувся',
  'DISQUALIFIED': 'Дискваліфікація',
  'DRAFT': 'Чернетки',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tenders }) => {
  // Calculate metrics
  const totalBudget = useMemo(() => tenders.reduce((acc, t) => acc + (t.budgetUah || 0), 0), [tenders]);
  const avgFoulScore = useMemo(() => tenders.length > 0 ? Math.round(tenders.reduce((acc, t) => acc + (t.foulScore || 0), 0) / tenders.length) : 0, [tenders]);
  const highRiskCount = useMemo(() => tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL' || (t.foulScore && t.foulScore >= 60)).length, [tenders]);

  // Risk distribution for Pie Chart in Ukrainian
  const riskData = useMemo(() => {
    const counts: Record<string, number> = {
      'Низький': 0,
      'Помірний': 0,
      'Високий': 0,
      'Критичний': 0
    };

    tenders.forEach(t => {
      if (t.riskLevel === 'CRITICAL' || (t.foulScore && t.foulScore >= 75)) {
        counts['Критичний']++;
      } else if (t.riskLevel === 'HIGH' || (t.foulScore && t.foulScore >= 50)) {
        counts['Високий']++;
      } else if (t.riskLevel === 'MEDIUM' || (t.foulScore && t.foulScore >= 25)) {
        counts['Помірний']++;
      } else {
        counts['Низький']++;
      }
    });

    return Object.entries(counts).filter(([_, count]) => count > 0).map(([name, value]) => ({ name, value }));
  }, [tenders]);

  // Status distribution for Bar Chart in Ukrainian
  const statusData = useMemo(() => {
    const statuses = tenders.reduce((acc, t) => {
      const label = STATUS_LABELS[t.status] || t.status;
      acc[label] = (acc[label] || 0) + 1;
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
          <h1 className="text-2xl font-bold text-white">Аналітика Портфеля Закупівель</h1>
          <p className="text-sm text-slate-400">Зведена статистика збережених закупівель, бюджетів та ризиків закупівлі</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Збережено в системі</p>
              <h3 className="text-2xl font-bold text-white">{tenders.length} тендерів</h3>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Загальний бюджет</p>
              <h3 className="text-2xl font-bold text-emerald-400">
                {(totalBudget / 1000000).toFixed(1)} млн ₴
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Ризикові закупівлі</p>
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
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
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#10b981'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value: any, name: any) => [`${value} тендерів`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Немає даних для відображення</div>
            )}
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-400" /> Статуси процедур
          </h3>
          <div className="h-64">
            {tenders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '0.5rem' }}
                    formatter={(value: any) => [`${value} тендерів`, 'Кількість']}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Немає даних для відображення</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
