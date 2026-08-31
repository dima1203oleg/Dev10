import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Download, Plus, Trash2 } from 'lucide-react';
import type { Tender } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props { currentTender: Tender; onUpdateTenderBoq?: (tenderId: string, items: any[]) => void }
interface BoqRow { id: string; code: string | null; name: string; unit: string; quantity: number; unitPriceUah: number | null; sourceDocumentId: string | null; sourcePage: number | null; sourceBbox: unknown }

export const CostEstimateAnalysisModule: React.FC<Props> = ({ currentTender, onUpdateTenderBoq }) => {
  const { token } = useAuth();
  const [rows, setRows] = useState<BoqRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', name: '', unit: '', quantity: '', unitPriceUah: '' });

  const request = async (path: string, init?: RequestInit) => {
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers || {}) } });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || body?.error || 'API request failed');
    return body.data;
  };

  const publish = (items: BoqRow[]) => {
    setRows(items);
    onUpdateTenderBoq?.(currentTender.id, items.map(item => ({ id: item.id, code: item.code || '', name: item.name, unit: item.unit, quantity: item.quantity, unitPriceUah: item.unitPriceUah })));
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true); setError('');
    request(`/api/tenders/${currentTender.id}/boq`).then(publish).catch(error => setError(error.message)).finally(() => setLoading(false));
  }, [currentTender.id, token]);

  const total = useMemo(() => rows.reduce((sum, row) => sum + row.quantity * (row.unitPriceUah || 0), 0), [rows]);
  const add = async () => {
    try {
      const row = await request(`/api/tenders/${currentTender.id}/boq`, { method: 'POST', body: JSON.stringify({ ...form, quantity: Number(form.quantity), unitPriceUah: form.unitPriceUah === '' ? null : Number(form.unitPriceUah) }) });
      publish([...rows, row]); setForm({ code: '', name: '', unit: '', quantity: '', unitPriceUah: '' });
    } catch (error) { setError(error instanceof Error ? error.message : 'Не вдалося додати позицію'); }
  };
  const remove = async (row: BoqRow) => {
    try { await request(`/api/tenders/${currentTender.id}/boq/${row.id}`, { method: 'DELETE' }); publish(rows.filter(item => item.id !== row.id)); }
    catch (error) { setError(error instanceof Error ? error.message : 'Не вдалося видалити позицію'); }
  };
  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [['code', 'name', 'unit', 'quantity', 'unit_price_uah', 'source_document_id', 'source_page'], ...rows.map(row => [row.code, row.name, row.unit, row.quantity, row.unitPriceUah, row.sourceDocumentId, row.sourcePage])].map(line => line.map(escape).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = `boq-${currentTender.tenderNumber}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  return <div className="space-y-6 pb-12">
    <header className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center gap-3"><Calculator className="text-indigo-400"/><div><h1 className="text-2xl font-black text-white">Кошторис і BoQ</h1><p className="text-sm text-slate-400">Тільки збережені позиції та підтверджені джерела. Ринкові ціни не генеруються AI.</p></div></div>
      <div className="mt-4 flex gap-5 text-sm text-slate-300"><span>Позицій: {rows.length}</span><span>Підтверджена сума: {rows.some(row => row.unitPriceUah !== null) ? `${total.toLocaleString('uk-UA')} ₴` : 'немає даних'}</span><button onClick={exportCsv} disabled={!rows.length} className="ml-auto flex gap-2 items-center disabled:opacity-40"><Download size={16}/>CSV</button></div>
    </header>
    {error && <div role="alert" className="p-4 rounded-xl bg-rose-950 text-rose-300">{error}</div>}
    <section className="grid lg:grid-cols-6 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <input aria-label="Код позиції" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Код" className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <input aria-label="Назва позиції" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Назва" className="lg:col-span-2 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <input aria-label="Одиниця виміру" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Од." className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <input aria-label="Кількість" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="Кількість" className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <input aria-label="Ціна за одиницю" type="number" min="0" value={form.unitPriceUah} onChange={e => setForm({ ...form, unitPriceUah: e.target.value })} placeholder="Ціна, ₴" className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"/>
      <button onClick={add} disabled={!form.name.trim() || !form.unit.trim() || form.quantity === ''} className="lg:col-start-6 bg-indigo-600 disabled:opacity-40 rounded-lg py-2 font-bold flex items-center justify-center gap-2"><Plus size={16}/>Додати</button>
    </section>
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
      {loading ? <p className="p-6 text-slate-400">Завантаження…</p> : !rows.length ? <p className="p-6 text-slate-400">Кошторис порожній. Додайте позиції вручну або через перевірений document pipeline.</p> : <table className="w-full text-sm"><thead className="text-slate-400"><tr><th className="p-3 text-left">Код</th><th className="text-left">Назва</th><th>Од.</th><th>Кількість</th><th>Ціна</th><th>Сума</th><th>Джерело</th><th/></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-slate-800 text-slate-200"><td className="p-3">{row.code || '—'}</td><td>{row.name}</td><td className="text-center">{row.unit}</td><td className="text-right">{row.quantity}</td><td className="text-right">{row.unitPriceUah === null ? 'UNKNOWN' : row.unitPriceUah.toLocaleString('uk-UA')}</td><td className="text-right">{row.unitPriceUah === null ? 'UNKNOWN' : (row.quantity * row.unitPriceUah).toLocaleString('uk-UA')}</td><td className="text-center">{row.sourceDocumentId ? `Документ, с. ${row.sourcePage || '—'}` : 'Не вказано'}</td><td><button aria-label={`Видалити ${row.name}`} onClick={() => void remove(row)} className="p-2 text-rose-400"><Trash2 size={16}/></button></td></tr>)}</tbody></table>}
    </section>
  </div>;
};
