import React, { useState } from 'react';
import { Tender, AppSection } from '../types';
import { TenderDetailModal } from './TenderDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { 
  FolderSearch, 
  Search, 
  Filter, 
  ShieldAlert, 
  Building2, 
  Plus, 
  Scale, 
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';

import { useProzorroSearch, SearchFilters, SortOption } from '../hooks/useProzorroSearch';

interface TenderCatalogProps {
  tenders: Tender[];
  onSelectTender: (tender: Tender) => void;
  onNavigate: (section: AppSection) => void;
  onAddNewTender: (tender: Tender) => void;
}

export const TenderCatalog: React.FC<TenderCatalogProps> = ({
  tenders,
  onSelectTender,
  onNavigate,
  onAddNewTender,
}) => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH_RISK' | 'CLEAN' | 'BOQ_READY'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeModalTenderId, setActiveModalTenderId] = useState<string | null>(null);

  // Prozorro Search via Hook
  const { 
    isSearching, 
    hasMore, 
    results: prozorroResults, 
    telemetry: searchTelemetry, 
    error: searchError, 
    search: runProzorroSearch 
  } = useProzorroSearch();

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [prozorroIdInput, setProzorroIdInput] = useState('');
  const [importingState, setImportingState] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');
  const [importError, setImportError] = useState<string | null>(null);
  const [importedPreview, setImportedPreview] = useState<any>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newRegion, setNewRegion] = useState('');

  const [prozorroSearchQuery, setProzorroSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters state
  const [filters, setFilters] = useState<SearchFilters>({
    region: '',
    cpv: '',
    minBudget: undefined,
    maxBudget: undefined
  });
  const [sort, setSort] = useState<SortOption>('date_desc');
  const [pageSize, setPageSize] = useState(25);

  const handleProzorroSearch = async (isAppend = false) => {
    runProzorroSearch(prozorroSearchQuery, isAppend, {
      filters: filters,
      sort: sort,
      limit: pageSize
    });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const hasFoulScore = t.foulScore !== null && t.foulScore !== undefined;
    if (filterType === 'HIGH_RISK') return hasFoulScore && (t.foulScore ?? 0) >= 60;
    if (filterType === 'CLEAN') return hasFoulScore && (t.foulScore ?? 0) < 40;
    if (filterType === 'BOQ_READY') return !!t.multiAgentAnalysis;

    return true;
  });

  const handleFetchProzorro = async () => {
    if (!prozorroIdInput.trim() || !token) return;
    setImportingState('LOADING');
    setImportError(null);
    setImportedPreview(null);
    try {
      let id = prozorroIdInput.trim();
      if (id.includes('tenders/')) {
        const parts = id.split('tenders/');
        id = parts[parts.length - 1].split('?')[0];
      }
      
      const res = await fetch(`/api/prozorro/tender/${encodeURIComponent(id)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Закупівлю з таким ID не знайдено в базі Prozorro. Будь ласка, перевірте правильність ID.");
      }
      const data = await res.json();
      setImportedPreview(data.structured || data);
      setImportingState('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Не вдалося завантажити дані.");
      setImportingState('ERROR');
    }
  };

  const handleConfirmImport = async () => {
    if (!importedPreview || !token) return;
    setImportingState('LOADING');
    try {
      const body = {
        tenderNumber: importedPreview.tenderNumber || importedPreview.id,
        title: importedPreview.title,
        customer: importedPreview.customer || "Невідомий замовник",
        budgetUah: importedPreview.budgetUah || 0,
        status: 'ACTIVE',
        foulScore: importedPreview.foulScore,
        riskLevel: importedPreview.riskLevel || 'NOT_ANALYZED',
        summary: importedPreview.summary || 'Імпортовано з Prozorro.',
        detailedData: importedPreview
      };
      
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        throw new Error("Не вдалося зберегти закупівлю в каталозі.");
      }
      
      const savedTender = await res.json();
      
      const tenderForUI: Tender = {
        id: savedTender.id.toString(),
        tenderNumber: savedTender.tenderNumber,
        title: savedTender.title,
        customer: savedTender.customer,
        customerEdrpou: savedTender.detailedData?.customerEdrpou || 'НЕВІДОМО',
        customerCity: savedTender.detailedData?.customerCity || 'НЕВІДОМО',
        budgetUah: parseFloat(savedTender.budgetUah) || 0,
        deadline: savedTender.detailedData?.deadline || 'НЕВІДОМО',
        region: savedTender.detailedData?.region || 'Україна',
        status: savedTender.status,
        category: savedTender.detailedData?.category || 'Інше',
        foulScore: savedTender.foulScore || undefined,
        riskLevel: savedTender.riskLevel || 'LOW',
        summary: savedTender.summary || '',
        tenderText: savedTender.detailedData?.tenderText || '',
        boqItems: savedTender.detailedData?.boqItems || [],
        violations: savedTender.detailedData?.violations || [],
        createdDate: savedTender.detailedData?.datePublished || savedTender.createdAt
      };
      
      onAddNewTender(tenderForUI);
      onSelectTender(tenderForUI);
      setShowAddModal(false);
      setProzorroIdInput('');
      setImportedPreview(null);
      setImportingState('IDLE');
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Не вдалося імпортувати.");
      setImportingState('ERROR');
    }
  };

  const handleCreatePrivateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCustomer || !token) return;
    
    setImportingState('LOADING');
    try {
      const tempId = `INTERNAL-PROJECT-${Date.now().toString().slice(-6)}`;
      const body = {
        tenderNumber: tempId,
        title: newTitle,
        customer: newCustomer,
        budgetUah: parseFloat(newBudget) || 0,
        status: 'INTERNAL_PROJECT',
        foulScore: null,
        riskLevel: 'LOW',
        summary: 'Внутрішній приватний проект організації (не є публічною закупівлею Prozorro).',
        detailedData: {
          category: newCategory,
          region: newRegion,
          customerCity: newRegion,
          customerEdrpou: 'INTERNAL',
          deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
        }
      };
      
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        throw new Error("Не вдалося створити приватний проект.");
      }
      
      const saved = await res.json();
      
      const tenderForUI: Tender = {
        id: saved.id.toString(),
        tenderNumber: saved.tenderNumber,
        title: saved.title,
        customer: saved.customer,
        customerEdrpou: 'INTERNAL',
        customerCity: newRegion,
        budgetUah: parseFloat(saved.budgetUah) || 0,
        deadline: saved.detailedData?.deadline || '',
        region: newRegion,
        status: 'INTERNAL_PROJECT',
        category: newCategory,
        foulScore: undefined,
        riskLevel: 'LOW',
        summary: saved.summary || '',
        tenderText: '',
        boqItems: [],
        violations: [],
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      onAddNewTender(tenderForUI);
      onSelectTender(tenderForUI);
      setShowAddModal(false);
      
      setNewTitle('');
      setNewCustomer('');
      setNewBudget('25000000');
      setImportingState('IDLE');
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Помилка при створенні проекту.");
      setImportingState('ERROR');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <FolderSearch className="w-4 h-4" />
            <span>Єдиний реєстр закупівель</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Каталог будівельних та державних тендерів
          </h1>
          <p className="text-sm text-slate-300">
            Пошук, фільтрація за рівнем Foul Score та прямий перехід до кошторисного чи юридичного аналізу
          </p>
        </div>

        <button
          id="add-custom-tender-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Додати закупівлю</span>
        </button>
      </div>

      {/* Live Prozorro Search Engine */}
      <div className="bg-slate-900 border-2 border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Live Prozorro Connector
             </div>
             <h2 className="text-xl font-black text-white">Глобальний пошук Prozorro</h2>
          </div>
          {searchTelemetry && (
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
              <div className="px-2 py-1 bg-slate-950 rounded border border-slate-800">
                SCANNED: {searchTelemetry.recordsScanned}
              </div>
              <div className="px-2 py-1 bg-slate-950 rounded border border-slate-800">
                MATCHED: {searchTelemetry.recordsMatched}
              </div>
              {searchTelemetry.rejectionDetails && (
                <div className="flex items-center gap-2">
                  <span className="text-rose-500/70 ml-2">REJECTED:</span>
                  <span title="CPV mismatch" className="px-1.5 py-0.5 bg-rose-500/5 border border-rose-500/10 rounded">CPV:{searchTelemetry.rejectionDetails.rejected_cpv}</span>
                  <span title="Budget out of range" className="px-1.5 py-0.5 bg-rose-500/5 border border-rose-500/10 rounded">💰:{searchTelemetry.rejectionDetails.rejected_budget}</span>
                  <span title="Region mismatch" className="px-1.5 py-0.5 bg-rose-500/5 border border-rose-500/10 rounded">📍:{searchTelemetry.rejectionDetails.rejected_region}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Введіть запит (напр. будівництво шкіл у київській області)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white outline-none transition-all"
              value={prozorroSearchQuery}
              onChange={(e) => setProzorroSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProzorroSearch(false)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              showFilters ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Фільтри</span>
          </button>
          <button 
            onClick={() => handleProzorroSearch(false)}
            disabled={isSearching}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSearching ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
            <span>{isSearching ? 'Пошук...' : 'Знайти в Prozorro'}</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Регіон</label>
              <input 
                type="text" 
                placeholder="Київська область"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Код CPV</label>
              <input 
                type="text" 
                placeholder="45000000-7"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                value={filters.cpv || ''}
                onChange={(e) => handleFilterChange('cpv', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Мінімальний бюджет</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                value={filters.minBudget || ''}
                onChange={(e) => handleFilterChange('minBudget', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Сортування за</label>
              <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              >
                <option value="date_desc">Новіші спочатку</option>
                <option value="date_asc">Старіші спочатку</option>
                <option value="price_desc">Дорожчі спочатку</option>
                <option value="price_asc">Дешевші спочатку</option>
                <option value="deadline_asc">Дедлайн (найближчий)</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Тендерів на сторінку</label>
               <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
              >
                <option value="10">10 результатів</option>
                <option value="25">25 результатів</option>
                <option value="50">50 результатів</option>
                <option value="100">100 результатів</option>
              </select>
            </div>
          </div>
        )}

        {searchError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2">
            <ShieldAlert size={16} />
            {searchError}
          </div>
        )}

        {prozorroResults.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prozorroResults.map((tender) => (
                <div key={tender.id} className="bg-slate-950 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-5 space-y-4 transition-all group">
                   <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{tender.tenderNumber}</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">New Result</span>
                   </div>
                   <h4 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 h-10">{tender.title}</h4>
                   <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-2 border-t border-slate-900">
                      <span className="text-emerald-400 font-mono">{(tender.budgetUah).toLocaleString()} ₴</span>
                      <span>{tender.customerCity}</span>
                   </div>
                   <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => setActiveModalTenderId(tender.id)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-800 transition-all"
                      >
                        Деталі
                      </button>
                      <button 
                        onClick={async () => {
                          if (!token) return;
                          try {
                            const res = await fetch('/api/tenders', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify(tender)
                            });
                            if (!res.ok) throw new Error();
                            const saved = await res.json();
                            onAddNewTender(tender);
                            onSelectTender(tender);
                            alert('Тендер успішно імпортовано до вашої бази!');
                          } catch(e) { alert('Помилка при імпорті.'); }
                        }}
                        className="flex-1 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all"
                      >
                        Імпортувати
                      </button>
                   </div>
                </div>
              ))}
            </div>
            
            {hasMore ? (
              <button 
                onClick={() => handleProzorroSearch(true)}
                disabled={isSearching}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                Завантажити ще результати з Prozorro
              </button>
            ) : (
              <div className="w-full py-4 bg-slate-950 border border-dashed border-slate-800 rounded-2xl text-center">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Всі релевантні тендери завантажено або джерело вичерпано</span>
              </div>
            )}
          </div>
        )}

        {prozorroResults.length === 0 && !isSearching && searchTelemetry && (
          <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-4 bg-slate-950 rounded-full text-slate-700">
                <Search size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-tight">За вашим запитом тендерів не знайдено</h3>
                <p className="text-[10px] text-slate-500 font-medium max-w-xs mx-auto">
                   Ми просканували {searchTelemetry.recordsScanned} записів у Prozorro, але жоден не пройшов ваші фільтри.
                </p>
             </div>
             {searchTelemetry.rejectionDetails && (
               <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                     <div className="text-[9px] font-black text-slate-500 uppercase">CPV відсіяно</div>
                     <div className="text-xs font-bold text-rose-400">{searchTelemetry.rejectionDetails.rejected_cpv}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                     <div className="text-[9px] font-black text-slate-500 uppercase">Бюджет відсіяно</div>
                     <div className="text-xs font-bold text-rose-400">{searchTelemetry.rejectionDetails.rejected_budget}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                     <div className="text-[9px] font-black text-slate-500 uppercase">Регіон відсіяно</div>
                     <div className="text-xs font-bold text-rose-400">{searchTelemetry.rejectionDetails.rejected_region}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                     <div className="text-[9px] font-black text-slate-500 uppercase">Keywords відсіяно</div>
                     <div className="text-xs font-bold text-rose-400">{searchTelemetry.rejectionDetails.rejected_keywords}</div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Пошук за назвою, замовником, ID (наприклад UA-2024...)"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Всі ({tenders.length})
          </button>

          <button
            onClick={() => setFilterType('HIGH_RISK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'HIGH_RISK'
                ? 'bg-red-900/80 text-red-200 border border-red-700'
                : 'bg-slate-800 text-red-400/80 hover:text-red-300'
            }`}
          >
            FoulTender Ризик
          </button>

          <button
            onClick={() => setFilterType('CLEAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'CLEAN'
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                : 'bg-slate-800 text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            Чисті торги
          </button>

          <button
            onClick={() => setFilterType('BOQ_READY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'BOQ_READY'
                ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                : 'bg-slate-800 text-blue-400/80 hover:text-blue-300'
            }`}
          >
            Готовий BoQ
          </button>
        </div>

      </div>

      {/* Tender Cards List */}
      <div className="space-y-3">
        {filteredTenders.map((tender) => {
          const hasScore = tender.foulScore !== null && tender.foulScore !== undefined;
          const scoreVal = tender.foulScore ?? 0;
          const isHighRisk = hasScore && scoreVal >= 60;
          const isClean = hasScore && scoreVal < 40;

          return (
            <div
              key={tender.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                    {tender.tenderNumber}
                  </span>
                  
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{tender.region}</span>
                  </span>

                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                    !hasScore
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : isHighRisk 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                      : isClean 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    <ShieldAlert className="w-3 h-3" />
                    <span>Foul Score: {hasScore ? `${scoreVal}/100` : 'Не аналізовано'}</span>
                  </span>

                  {tender.violations.length > 0 && (
                    <span className="text-xs text-amber-300/90 font-medium">
                      • {tender.violations.length} порушень ТД
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {tender.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {tender.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <div>Замовник: <strong className="text-slate-200">{tender.customer}</strong></div>
                  <div>Очікувана вартість: <strong className="text-emerald-400 font-mono">{(tender.budgetUah).toLocaleString()} ₴</strong></div>
                  <div>Термін подання: <strong className="text-slate-300">{tender.deadline}</strong></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end lg:self-center">
                <button
                  onClick={() => setActiveModalTenderId(tender.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Переглянути офіційні деталі та файли з Prozorro"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Деталі</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTender(tender);
                    onNavigate('foultender');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>FoulTender</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTender(tender);
                    onNavigate('construction');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TenderAI BoQ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Tender Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Додати нову закупівлю</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setImportedPreview(null);
                  setProzorroIdInput('');
                  setImportingState('IDLE');
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Tab switchers */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('IMPORT');
                  setImportError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'IMPORT'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Імпорт з Prozorro
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PRIVATE');
                  setImportError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'PRIVATE'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Приватний проект
              </button>
            </div>

            {activeTab === 'IMPORT' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Prozorro ID або повне посилання на закупівлю
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prozorroIdInput}
                      onChange={(e) => setProzorroIdInput(e.target.value)}
                      placeholder="наприклад: UA-2024-09-15-001234-a"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={importingState === 'LOADING'}
                      onClick={handleFetchProzorro}
                      className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold transition-all cursor-pointer"
                    >
                      {importingState === 'LOADING' ? 'Пошук...' : 'Перевірити'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Введіть офіційний ідентифікатор Prozorro для завантаження оригінальних файлів документації, специфікацій та BoQ.
                  </p>
                </div>

                {importError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300">
                    {importError}
                  </div>
                )}

                {importedPreview && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Знайдено в Prozorro API</div>
                    <h4 className="font-bold text-white text-sm line-clamp-2">{importedPreview.title}</h4>
                    <div className="space-y-1 text-slate-300">
                      <div>Замовник: <strong className="text-slate-200">{importedPreview.customer || importedPreview.customerName}</strong></div>
                      <div>Очікувана вартість: <strong className="text-emerald-400 font-mono">{(importedPreview.budgetUah || importedPreview.value?.amount || 0).toLocaleString()} ₴</strong></div>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50 flex justify-end">
                      <button
                        type="button"
                        disabled={importingState === 'LOADING'}
                        onClick={handleConfirmImport}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        {importingState === 'LOADING' ? 'Збереження...' : 'Підтвердити імпорт в каталог'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCreatePrivateProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Назва проекту (Внутрішній)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="наприклад: Капітальний ремонт офісного приміщення..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Очікувана вартість (грн)
                    </label>
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Категорія робіт
                    </label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Замовник / Клієнт
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomer}
                      onChange={(e) => setNewCustomer(e.target.value)}
                      placeholder="наприклад: Приватний інвестор..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Регіон реалізації
                    </label>
                    <input
                      type="text"
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {importError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300">
                    {importError}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={importingState === 'LOADING'}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    {importingState === 'LOADING' ? 'Створення...' : 'Створити проект'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Real Prozorro Tender Detail Modal */}
      {activeModalTenderId && (
        <TenderDetailModal
          tenderId={activeModalTenderId}
          onClose={() => setActiveModalTenderId(null)}
          onRunAudit={(tender) => {
            onSelectTender(tender);
            onNavigate('foultender');
          }}
          onOpenWarRoom={(tender) => {
            onSelectTender(tender);
            onNavigate('warroom');
          }}
        />
      )}

    </div>
  );
};
