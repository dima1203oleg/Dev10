import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Activity, CheckCircle2, XCircle, RefreshCcw, Lock, Database, Globe, Cpu, UserCheck, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const ProductionGateUI: React.FC = () => {
  const { token } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any>(null);

  const runVerify = async () => {
    if (!token) return;
    setIsRunning(true);
    setReport(null);
    try {
      const res = await fetch('/api/production/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const getIcon = (key: string) => {
    switch (key) {
      case 'database': return <Database size={16} />;
      case 'authentication': return <UserCheck size={16} />;
      case 'prozorro_api': return <Globe size={16} />;
      case 'prozorro_search': return <Activity size={16} />;
      case 'prozorro_pagination': return <RefreshCcw size={16} />;
      case 'ai_engine': return <Cpu size={16} />;
      case 'tenant_isolation': return <Lock size={16} />;
      case 'no_fake_data': return <ShieldCheck size={16} />;
      case 'multiplatform_aggregator': return <Globe size={16} />;
      case 'auto_estimate_engine': return <Calculator size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'WARNING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'FAIL': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Production Safety Gate</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Системний аудит та верифікація даних</p>
          </div>
        </div>
        <button 
          onClick={runVerify}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20"
        >
          {isRunning ? <RefreshCcw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          {isRunning ? 'Верифікація...' : 'Запустити тест'}
        </button>
      </div>

      <AnimatePresence>
        {report && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${report.status === 'PRODUCTION_READY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className="flex items-center gap-3">
                {report.status === 'PRODUCTION_READY' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                <div>
                  <div className="text-xs font-black uppercase tracking-widest">Статус системи</div>
                  <div className="text-lg font-black uppercase">{report.status.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono opacity-60">
                TIME: {report.durationMs}ms | {report.timestamp}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(report.results).map(([key, val]: [string, any]) => (
                <div key={key} className={`p-4 rounded-2xl border space-y-2 transition-all ${getStatusColor(val.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="opacity-70">{getIcon(key)}</div>
                    {val.status === 'PASS' ? <CheckCircle2 size={14} /> : val.status === 'WARNING' ? <ShieldAlert size={14} /> : <XCircle size={14} />}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-60">{key.replace('_', ' ')}</div>
                  <div className="text-[10px] font-bold truncate" title={val.details}>{val.details}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!report && !isRunning && (
        <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <Activity size={48} className="text-slate-700" />
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Система очікує на верифікацію</div>
          <p className="text-[10px] text-slate-600 max-w-xs font-medium">Запустіть аудит, щоб перевірити цілісність бази даних, підключення до Prozorro API та стан AI-аналітика.</p>
        </div>
      )}
    </div>
  );
};
