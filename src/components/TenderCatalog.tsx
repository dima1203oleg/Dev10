import React, { useState } from 'react';
import { Tender, AppSection } from '../types';
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
  Calendar
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH_RISK' | 'CLEAN' | 'BOQ_READY'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New tender form state
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState(`UA-2024-${Math.floor(100000 + Math.random() * 900000)}-a`);
  const [newCustomer, setNewCustomer] = useState('');
  const [newBudget, setNewBudget] = useState('25000000');
  const [newRegion, setNewRegion] = useState('м. Київ');
  const [newCategory, setNewCategory] = useState('Будівельні роботи');

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'HIGH_RISK') return t.foulScore >= 60;
    if (filterType === 'CLEAN') return t.foulScore < 40;
    if (filterType === 'BOQ_READY') return !!t.multiAgentAnalysis;

    return true;
  });

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCustomer) return;

    const created: Tender = {
      id: `tender-${Date.now()}`,
      tenderNumber: newNumber,
      title: newTitle,
      customer: newCustomer,
      customerEdrpou: '39201948',
      customerCity: newRegion,
      budgetUah: parseFloat(newBudget) || 25000000,
      deadline: '2024-12-31',
      region: newRegion,
      status: 'ACTIVE',
      category: newCategory,
      foulScore: 45,
      riskLevel: 'MEDIUM',
      summary: 'Новий тендер додано до системи для проведення комплексного аналізу FoulTender та TenderAI BoQ.',
      tenderText: 'Вимоги до учасників: наявність досвіду, МТБ та кваліфікованого персоналу згідно ст. 16 ЗУ «Про публічні закупівлі».',
      boqItems: [
        {
          id: `boq-gen-1`,
          code: 'ДБН Р-1-001',
          description: 'Основні будівельно-монтажні роботи за проєктом',
          unit: 'компл',
          quantity: 1,
          standardPriceUah: parseFloat(newBudget) || 25000000,
          marketPriceUah: (parseFloat(newBudget) || 25000000) * 0.88,
          laborHours: 500,
          anomaly: 'NORMAL',
        }
      ],
      violations: [],
      createdDate: new Date().toISOString().split('T')[0],
    };

    onAddNewTender(created);
    onSelectTender(created);
    setShowAddModal(false);
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
          const isHighRisk = tender.foulScore >= 60;
          const isClean = tender.foulScore < 40;

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
                    isHighRisk 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                      : isClean 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    <ShieldAlert className="w-3 h-3" />
                    <span>Foul Score: {tender.foulScore}/100</span>
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
              <h3 className="font-bold text-base text-white">Додати нову закупівлю для моніторингу</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTender} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Назва закупівлі
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="наприклад: Капітальний ремонт дорожнього покриття..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Ідентифікатор (Prozorro ID)
                  </label>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-mono focus:outline-none"
                  />
                </div>

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
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Замовник (Найменування)
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="наприклад: Департамент інфраструктури..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Регіон / Місто
                  </label>
                  <input
                    type="text"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Категорія
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Додати та перейти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
