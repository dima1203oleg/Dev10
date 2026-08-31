import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Download, Plus, Trash2 } from 'lucide-react';
import type { Tender } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props { currentTender: Tender }
interface GanttTask { id: string; title: string; startsAt: string; endsAt: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; critical: boolean }

export const GanttChartModule: React.FC<Props> = ({ currentTender }) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const api = async (path: string, init?: RequestInit) => {
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers || {}) } });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || body?.error || 'API request failed');
    return body.data;
  };

  const load = async () => {
    if (!token) return;
    setLoading(true); setError('');
    try { setTasks(await api(`/api/tenders/${currentTender.id}/gantt`)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося завантажити графік'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [currentTender.id, token]);

  const addTask = async () => {
    if (!title.trim() || !startsAt || !endsAt) return;
    try {
      const task = await api(`/api/tenders/${currentTender.id}/gantt`, { method: 'POST', body: JSON.stringify({ title, startsAt, endsAt }) });
      setTasks(previous => [...previous, task]); setTitle(''); setStartsAt(''); setEndsAt('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося створити завдання'); }
  };

  const patchTask = async (task: GanttTask, changes: Partial<GanttTask>) => {
    try {
      const updated = await api(`/api/tenders/${currentTender.id}/gantt/${task.id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      setTasks(previous => previous.map(item => item.id === task.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося оновити завдання'); }
  };

  const removeTask = async (task: GanttTask) => {
    try { await api(`/api/tenders/${currentTender.id}/gantt/${task.id}`, { method: 'DELETE' }); setTasks(previous => previous.filter(item => item.id !== task.id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося видалити завдання'); }
  };

  const duration = useMemo(() => tasks.reduce((sum, task) => sum + Math.max(1, Math.ceil((new Date(task.endsAt).getTime() - new Date(task.startsAt).getTime()) / 86400000) + 1), 0), [tasks]);
  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [['title', 'starts_at', 'ends_at', 'status', 'critical'], ...tasks.map(task => [task.title, task.startsAt, task.endsAt, task.status, String(task.critical)])].map(row => row.map(escape).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = `gantt-${currentTender.tenderNumber}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  return <div className="space-y-6 pb-12">
    <header className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center gap-3"><Calendar className="text-emerald-400"/><div><h1 className="text-2xl font-black text-white">Календарний графік</h1><p className="text-sm text-slate-400">{currentTender.title}</p></div></div>
      <div className="mt-4 flex gap-4 text-sm text-slate-300"><span>Завдань: {tasks.length}</span><span>Сумарна тривалість: {duration} днів</span><button onClick={exportCsv} disabled={!tasks.length} className="ml-auto flex gap-2 items-center disabled:opacity-40"><Download size={16}/>CSV</button></div>
    </header>
    {error && <div role="alert" className="p-4 rounded-xl bg-rose-950 text-rose-300">{error}</div>}
    <section className="grid md:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <input aria-label="Назва завдання" value={title} onChange={e => setTitle(e.target.value)} onInput={e => setTitle(e.currentTarget.value)} placeholder="Назва завдання" className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <input aria-label="Дата початку" type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} onInput={e => setStartsAt(e.currentTarget.value)} className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <input aria-label="Дата завершення" type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} onInput={e => setEndsAt(e.currentTarget.value)} className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <button onClick={addTask} disabled={!title.trim() || !startsAt || !endsAt} className="bg-emerald-600 disabled:opacity-40 rounded-lg font-bold flex items-center justify-center gap-2"><Plus size={16}/>Додати</button>
    </section>
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
      {loading ? <p className="p-6 text-slate-400">Завантаження…</p> : !tasks.length ? <p className="p-6 text-slate-400">Графік порожній. Додайте перше підтверджене завдання.</p> : <table className="w-full text-sm"><thead className="text-slate-400"><tr><th className="p-3 text-left">Завдання</th><th>Початок</th><th>Завершення</th><th>Статус</th><th>Критичне</th><th/></tr></thead><tbody>{tasks.map(task => <tr key={task.id} className="border-t border-slate-800 text-slate-200"><td className="p-3">{task.title}</td><td>{new Date(task.startsAt).toLocaleDateString('uk-UA')}</td><td>{new Date(task.endsAt).toLocaleDateString('uk-UA')}</td><td><select aria-label={`Статус ${task.title}`} value={task.status} onChange={e => void patchTask(task, { status: e.target.value as GanttTask['status'] })} className="bg-slate-950 border border-slate-700 rounded p-1"><option value="TODO">Заплановано</option><option value="IN_PROGRESS">В роботі</option><option value="DONE">Завершено</option></select></td><td><input aria-label={`Критичне ${task.title}`} type="checkbox" checked={task.critical} onChange={e => void patchTask(task, { critical: e.target.checked })}/></td><td><button aria-label={`Видалити ${task.title}`} onClick={() => void removeTask(task)} className="p-2 text-rose-400"><Trash2 size={16}/></button></td></tr>)}</tbody></table>}
    </section>
  </div>;
};
