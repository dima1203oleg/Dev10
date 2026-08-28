import React, { useState } from 'react';
import { Tender, TenderVersionDiff } from '../types';
import { 
  GitCompare, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';

interface VersionDiffModuleProps {
  currentTender: Tender;
  onNavigateToAmcu: () => void;
}

export const VersionDiffModule: React.FC<VersionDiffModuleProps> = ({
  currentTender,
  onNavigateToAmcu,
}) => {
  const [versionDiff, setVersionDiff] = useState<TenderVersionDiff | undefined>(currentTender.versionDiff);
  const [isComparing, setIsComparing] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [customV1Text, setCustomV1Text] = useState('');
  const [customV2Text, setCustomV2Text] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleRunAiDiff = async () => {
    setIsComparing(true);
    setDiffError(null);
    try {
      const response = await fetch('/api/tenderai/version-diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: currentTender.tenderNumber,
          version1Text: customV1Text || 'Первинна редакція ТД (термін 60 днів, без обмеження 12 км)',
          version2Text: customV2Text || 'Нова редакція ТД (термін 18 днів, вимога бази не далі 12 км, забезпечення 5%)'
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Помилка порівняння версій');
      }
      const data = await response.json();
      setVersionDiff(data);
      setShowCustomModal(false);
    } catch (e: any) {
      console.error(e);
      setDiffError(e.message || 'Не вдалося виконати порівняння редакцій');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div id="version-diff-module" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Tender Documentation Version Diff Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentTender.tenderNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Контроль змін та версійності тендерної документації</h1>
            <p className="text-sm text-slate-400">
              Виявлення раптово внесених замовником дискримінаційних правок, зміни строків та прихованих умов
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setShowCustomModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all border border-slate-700"
            >
              Вставити власні редакції для Diff
            </button>
            <button
              onClick={handleRunAiDiff}
              disabled={isComparing}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isComparing ? 'animate-spin' : ''}`} />
              {isComparing ? 'Аналіз змін...' : 'AI Повторний аналіз версій'}
            </button>
          </div>
        </div>
      </div>

      {diffError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Помилка аналізу змін: </span>
              {diffError}
            </div>
          </div>
          <button 
            onClick={() => setDiffError(null)} 
            className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
          >
            Закрити
          </button>
        </div>
      )}

      {versionDiff && (
        <>
          {/* Version Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
                  {versionDiff.previousVersion}
                </span>
                <span className="text-emerald-400 font-bold text-sm">➔</span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {versionDiff.currentVersion}
                </span>
              </div>
              <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                Виявлено {versionDiff.changesCount} критичних змін
              </span>
            </div>

            <p className="text-sm text-slate-200 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              {versionDiff.summary}
            </p>
          </div>

          {/* List of Version Changes */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-400" />
              Детальний перелік виявлених змін та оцінка ризиків
            </h2>

            {versionDiff.changes.map((change) => (
              <div
                key={change.id}
                className={`border rounded-2xl p-5 bg-slate-900/90 space-y-3 transition-all ${
                  change.riskImpact === 'CRITICAL_TRAP'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : change.riskImpact === 'INCREASED_RISK'
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {change.type === 'ADDED' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                        <PlusCircle className="w-3.5 h-3.5" /> ДОДАНО НОВУ ВИМОГУ
                      </span>
                    )}
                    {change.type === 'MODIFIED' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                        <Edit3 className="w-3.5 h-3.5" /> ЗМІНЕНО УМОВУ
                      </span>
                    )}
                    {change.type === 'REMOVED' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30">
                        <MinusCircle className="w-3.5 h-3.5" /> ВИДАЛЕНО
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-semibold">{change.clause}</span>
                  </div>

                  {change.riskImpact === 'CRITICAL_TRAP' && (
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full">
                      ⚠️ КРИТИЧНА ПАСТКА ДЛЯ ФАВОРИТА
                    </span>
                  )}
                  {change.riskImpact === 'INCREASED_RISK' && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                      ⚠️ ПІДВИЩЕННЯ РИЗИКУ ДЛЯ УЧАСНИКА
                    </span>
                  )}
                </div>

                {/* Old vs New Value Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {change.oldValue && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/20 text-slate-300">
                      <span className="text-rose-400 font-semibold block mb-1">Попередня редакція:</span>
                      <del className="text-slate-400">{change.oldValue}</del>
                    </div>
                  )}
                  {change.newValue && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 text-slate-200">
                      <span className="text-emerald-400 font-semibold block mb-1">Нова редакція:</span>
                      <strong>{change.newValue}</strong>
                    </div>
                  )}
                </div>

                {/* AI Commentary */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">AI Коментар аудитора:</strong> {change.aiCommentary}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Custom Diff Input Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Вставити тексти для AI порівняння</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Редакція 1 (стара)</label>
                <textarea
                  rows={8}
                  placeholder="Вставте фрагмент старого тексту ТД..."
                  value={customV1Text}
                  onChange={(e) => setCustomV1Text(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Редакція 2 (нова зі змінами)</label>
                <textarea
                  rows={8}
                  placeholder="Вставте новий текст ТД або Додатка зі змінами..."
                  value={customV2Text}
                  onChange={(e) => setCustomV2Text(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold"
              >
                Скасувати
              </button>
              <button
                onClick={handleRunAiDiff}
                disabled={isComparing}
                className="px-4 py-2 rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                {isComparing ? 'Обробка...' : 'Запустити AI Diff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
