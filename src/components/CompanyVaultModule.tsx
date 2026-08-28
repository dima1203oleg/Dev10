import React, { useState } from 'react';
import { CompanyProfile, VaultDocument, EquipmentItem, StaffMember, ExperienceContract } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  Users, 
  FileText, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Clock, 
  ExternalLink,
  Edit3,
  Download,
  FileCheck,
  Calendar
} from 'lucide-react';

interface CompanyVaultModuleProps {
  company: CompanyProfile;
  onUpdateCompany: (updated: CompanyProfile) => void;
}

export const CompanyVaultModule: React.FC<CompanyVaultModuleProps> = ({
  company,
  onUpdateCompany,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'vault' | 'equipment' | 'staff' | 'contracts' | 'radar_profile'>('vault');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // New Document State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<VaultDocument['category']>('ISO_CERTIFICATES');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newDocIssuer, setNewDocIssuer] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(company.name);
  const [profileShortName, setProfileShortName] = useState(company.shortName);
  const [profileEdrpou, setProfileEdrpou] = useState(company.edrpou);
  const [profileKved, setProfileKved] = useState(company.kved);
  const [profileTaxNumber, setProfileTaxNumber] = useState(company.taxNumber);
  const [profileLegalAddress, setProfileLegalAddress] = useState(company.legalAddress);
  const [profileActualAddress, setProfileActualAddress] = useState(company.actualAddress);
  const [profileDirectorName, setProfileDirectorName] = useState(company.directorName);
  const [profileDirectorPosition, setProfileDirectorPosition] = useState(company.directorPosition);
  const [profileDirectorBasis, setProfileDirectorBasis] = useState(company.directorBasis);
  const [profileIban, setProfileIban] = useState(company.iban);
  const [profileBankName, setProfileBankName] = useState(company.bankName);
  const [profileMfo, setProfileMfo] = useState(company.mfo);
  const [profileEmail, setProfileEmail] = useState(company.email);
  const [profilePhone, setProfilePhone] = useState(company.phone);

  React.useEffect(() => {
    if (company) {
      setProfileName(company.name);
      setProfileShortName(company.shortName);
      setProfileEdrpou(company.edrpou);
      setProfileKved(company.kved);
      setProfileTaxNumber(company.taxNumber);
      setProfileLegalAddress(company.legalAddress);
      setProfileActualAddress(company.actualAddress);
      setProfileDirectorName(company.directorName);
      setProfileDirectorPosition(company.directorPosition);
      setProfileDirectorBasis(company.directorBasis);
      setProfileIban(company.iban);
      setProfileBankName(company.bankName);
      setProfileMfo(company.mfo);
      setProfileEmail(company.email);
      setProfilePhone(company.phone);
    }
  }, [company]);

  const handleSaveProfile = () => {
    onUpdateCompany({
      ...company,
      name: profileName,
      shortName: profileShortName,
      edrpou: profileEdrpou,
      kved: profileKved,
      taxNumber: profileTaxNumber,
      legalAddress: profileLegalAddress,
      actualAddress: profileActualAddress,
      directorName: profileDirectorName,
      directorPosition: profileDirectorPosition,
      directorBasis: profileDirectorBasis,
      iban: profileIban,
      bankName: profileBankName,
      mfo: profileMfo,
      email: profileEmail,
      phone: profilePhone,
    });
    setIsEditingProfile(false);
  };

  // Count expiring / expired docs
  const expiringDocs = (company?.vaultDocuments || []).filter(d => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED');
  const expiringStaff = (company?.staff || []).filter(s => s.status === 'EXPIRING_SOON' || s.status === 'EXPIRED');
  const expiringEquipment = (company?.equipment || []).filter(e => e.status === 'EXPIRING_SOON' || e.status === 'EXPIRED');
  const totalExpiringAlerts = expiringDocs.length + expiringStaff.length + expiringEquipment.length;

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle || !company) return;

    const newDoc: VaultDocument = {
      id: 'doc-v-' + Date.now(),
      title: newDocTitle,
      category: newDocCategory,
      fileNumber: newDocNumber || '№ Doc-' + Date.now().toString().slice(-4),
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: newDocExpiry || undefined,
      issuer: newDocIssuer || 'Орган сертифікації / ДПС',
      status: 'VALID',
      tags: [newDocCategory, 'Активний'],
      fileSize: '1.8 MB'
    };

    onUpdateCompany({
      ...company,
      vaultDocuments: [newDoc, ...(company.vaultDocuments || [])]
    });

    setNewDocTitle('');
    setNewDocNumber('');
    setNewDocIssuer('');
    setNewDocExpiry('');
    setShowAddDocModal(false);
  };

  const filteredDocs = (company?.vaultDocuments || []).filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="company-vault-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{company.shortName}</h1>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ЄДРПОУ: {company.edrpou}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Платник ПДВ 20%
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{company.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Директор: {company.directorName} • {company.legalAddress}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Документів у Vault</div>
            <div className="text-lg font-bold text-emerald-400">{company.vaultDocuments.length}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Спецтехніки</div>
            <div className="text-lg font-bold text-blue-400">{company.equipment.length} од.</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Кваліф. персонал</div>
            <div className="text-lg font-bold text-indigo-400">{company.staff.length} осіб</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Аналогічні договори</div>
            <div className="text-lg font-bold text-amber-400">{company.contracts.length} об'єкти</div>
          </div>
        </div>
      </div>

      {/* Expiry Warning Banner if any */}
      {totalExpiringAlerts > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-sm">
              <strong>Увага! {totalExpiringAlerts} документів/сертифікатів потребують оновлення:</strong>
              {expiringDocs.map(d => d.title).concat(expiringStaff.map(s => s.fullName + ' (посвідчення ОП)')).slice(0, 2).map((item, idx) => (
                <span key={idx} className="ml-2 text-amber-300 underline underline-offset-2">"{item}"</span>
              ))}
              {totalExpiringAlerts > 2 && <span> та ще {totalExpiringAlerts - 2}...</span>}
            </div>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-3 py-1.5 rounded-lg border border-amber-500/40">
            Оновити заздалегідь
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'vault'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Smart Document Vault ({company.vaultDocuments.length})
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'equipment'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          Матеріально-технічна база ({company.equipment.length})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'staff'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Кваліфікований персонал ({company.staff.length})
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'contracts'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          Аналогічні договори ({company.contracts.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'profile'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Реквізити компанії
        </button>

        <button
          onClick={() => setActiveTab('radar_profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'radar_profile'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Target className="w-4 h-4" />
          Radar Profile
        </button>
      </div>

      {/* TAB 6: Radar Profile Settings */}
      {activeTab === 'radar_profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">AI Tender Radar Profile</h2>
              <p className="text-sm text-slate-400 mt-1">Ці параметри використовуються AI для автоматичного пошуку та оцінки Match Score тендерів.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Географія та Бюджет</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Регіони роботи (через кому)</label>
                  <input 
                    type="text" 
                    defaultValue={company.regionsOfWork?.join(', ') || 'Київська обл., м. Київ'} 
                    onChange={(e) => onUpdateCompany({ ...company, regionsOfWork: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Мін. бюджет (грн)</label>
                    <input 
                      type="number" 
                      defaultValue={company.minBudgetUah || 1000000} 
                      onChange={(e) => onUpdateCompany({ ...company, minBudgetUah: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Макс. бюджет (грн)</label>
                    <input 
                      type="number" 
                      defaultValue={company.maxBudgetUah || 100000000} 
                      onChange={(e) => onUpdateCompany({ ...company, maxBudgetUah: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Бажана маржа (%)</label>
                  <input 
                    type="number" 
                    defaultValue={company.preferredMarginPercent || 15} 
                    onChange={(e) => onUpdateCompany({ ...company, preferredMarginPercent: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Спеціалізація та Ресурси</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">CPV Коди (через кому)</label>
                  <input 
                    type="text" 
                    defaultValue={company.cpvCodes?.join(', ') || '45000000-7, 45200000-9'} 
                    onChange={(e) => onUpdateCompany({ ...company, cpvCodes: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Готовність до субпідряду</span>
                    <button 
                      onClick={() => onUpdateCompany({ ...company, subcontractingReadiness: !company.subcontractingReadiness })}
                      className={`w-12 h-6 rounded-full transition-all relative ${company.subcontractingReadiness ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${company.subcontractingReadiness ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Швидке залучення бригад</span>
                    <button 
                      onClick={() => onUpdateCompany({ ...company, rapidScalingCapability: !company.rapidScalingCapability })}
                      className={`w-12 h-6 rounded-full transition-all relative ${company.rapidScalingCapability ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${company.rapidScalingCapability ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Smart Document Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Пошук документа, номера, органу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Всі категорії</option>
                <option value="ISO_CERTIFICATES">ISO Сертифікати</option>
                <option value="LICENSES_PERMITS">Ліцензії та Дозволи</option>
                <option value="FINANCIAL_LEGAL">Фінанси та ЄДР</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddDocModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Додати документ до Vault
            </button>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.category === 'ISO_CERTIFICATES' && 'ISO Сертифікат'}
                      {doc.category === 'LICENSES_PERMITS' && 'Ліцензія / Дозвіл'}
                      {doc.category === 'FINANCIAL_LEGAL' && 'Фінансова звітність'}
                    </span>
                    {doc.status === 'VALID' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Чинний
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Закінчується
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 line-clamp-2 mb-2">{doc.title}</h3>
                  <div className="text-xs text-slate-400 space-y-1 mb-4">
                    <div>Номер: <strong className="text-slate-300">{doc.fileNumber}</strong></div>
                    <div>Орган/Емітент: <span className="text-slate-300">{doc.issuer}</span></div>
                    {doc.expiryDate && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Діє до: <strong className={doc.status === 'EXPIRING_SOON' ? 'text-amber-400' : 'text-slate-200'}>{doc.expiryDate}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Розмір: {doc.fileSize}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="Завантажити копію">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" title="Переглянути">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Equipment */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Реєстр спецтехніки, машин та механізмів</h2>
              <p className="text-xs text-slate-400">Використовується для автоматичного заповнення Довідки про МТБ (Таблиця 1 Додатку 1 ТД)</p>
            </div>
            <button 
              onClick={() => alert('Форма додавання спецтехніки')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Додати техніку
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Найменування машини / механізму</th>
                  <th className="px-4 py-3">Модель та параметри</th>
                  <th className="px-4 py-3">Право власності</th>
                  <th className="px-4 py-3">Підтверджуючий документ</th>
                  <th className="px-4 py-3 text-center">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {company.equipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-100">{eq.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{eq.model}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${
                        eq.ownership === 'OWNED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {eq.ownership === 'OWNED' ? 'Власна' : 'Орендована'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{eq.docNumber}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                        Готова до тендеру
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Staff */}
      {activeTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Реєстр кваліфікованого інженерного та робочого персоналу</h2>
              <p className="text-xs text-slate-400">Автоматичне формування Довідки про персонал за ст. 16 Закону</p>
            </div>
            <button 
              onClick={() => alert('Форма додавання співробітника')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Додати співробітника
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.staff.map((st) => (
              <div key={st.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100">{st.fullName}</h4>
                      <p className="text-xs text-emerald-400 font-medium mt-0.5">{st.position}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Досвід: {st.experienceYears} р.
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">Освіта: {st.education}</p>

                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-semibold text-slate-400">Сертифікати та допуски:</div>
                    {st.certificates.map((c, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Працевлаштування: <strong>Основне</strong></span>
                  {st.safetyCertExpiry && (
                    <span className={st.status === 'EXPIRING_SOON' ? 'text-amber-400' : 'text-slate-400'}>
                      Охорона праці до: {st.safetyCertExpiry}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Contracts */}
      {activeTab === 'contracts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Досвід виконання аналогічних договорів (ст. 16 ЗУ)</h2>
              <p className="text-xs text-slate-400">Договори з актами КБ-2в/КБ-3 та офіційними відгуками замовників</p>
            </div>
            <button 
              onClick={() => alert('Додати договір')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Додати договір
            </button>
          </div>

          <div className="space-y-4">
            {company.contracts.map((cnt) => (
              <div key={cnt.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/30">
                      Договір {cnt.contractNumber} від {cnt.contractDate}
                    </span>
                    <h4 className="text-base font-bold text-slate-100 mt-1">{cnt.subjectOfProcurement}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Сума виконання</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {cnt.amountUah.toLocaleString('uk-UA')} грн
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Замовник: <strong className="text-slate-300">{cnt.customerName}</strong>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <FileCheck className="w-4 h-4" /> Акти КБ-2в завантажено
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <FileCheck className="w-4 h-4" /> Лист-відгук наявний
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Контакт замовника: {cnt.contactPerson} ({cnt.phone})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Profile Requisites */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Офіційні реквізити підприємства для форм Prozorro</h2>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 font-bold py-2 px-4 rounded-xl transition-all text-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Редагувати реквізити
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-xl transition-all text-xs cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Зберегти зміни
                </button>
              </div>
            )}
          </div>
          
          {!isEditingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h3 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">Юридичні реквізити</h3>
                <div><span className="text-slate-500">Повна назва:</span> <p className="font-medium text-slate-200">{company.name}</p></div>
                <div><span className="text-slate-500">Коротке ім'я:</span> <p className="font-medium text-slate-200">{company.shortName}</p></div>
                <div><span className="text-slate-500">Код ЄДРПОУ:</span> <p className="font-medium text-slate-200">{company.edrpou}</p></div>
                <div><span className="text-slate-500">ІПН платника ПДВ:</span> <p className="font-medium text-slate-200">{company.taxNumber || 'не вказано'}</p></div>
                <div><span className="text-slate-500">Юридична адреса:</span> <p className="font-medium text-slate-200">{company.legalAddress || 'не вказано'}</p></div>
                <div><span className="text-slate-500">Фактична адреса:</span> <p className="font-medium text-slate-200">{company.actualAddress || 'не вказано'}</p></div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">Банківські реквізити та підписант</h3>
                <div><span className="text-slate-500">Керівник:</span> <p className="font-medium text-slate-200">{company.directorName || 'не вказано'} {company.directorPosition ? `(${company.directorPosition})` : ''}</p></div>
                <div><span className="text-slate-500">Діє на підставі:</span> <p className="font-medium text-slate-200">{company.directorBasis || 'не вказано'}</p></div>
                <div><span className="text-slate-500">Банк:</span> <p className="font-medium text-slate-200">{company.bankName || 'не вказано'}</p></div>
                <div><span className="text-slate-500">IBAN:</span> <p className="font-mono text-emerald-400 font-semibold">{company.iban || 'не вказано'}</p></div>
                <div><span className="text-slate-500">Контакти для зв'язку:</span> <p className="font-medium text-slate-200">{company.email || 'не вказано'} • {company.phone || 'не вказано'}</p></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">Юридичні реквізити</h3>
                
                <div>
                  <label className="block text-slate-400 mb-1">Повна назва підприємства *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Коротке ім'я для інтерфейсу</label>
                  <input
                    type="text"
                    value={profileShortName}
                    onChange={(e) => setProfileShortName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Код ЄДРПОУ *</label>
                    <input
                      type="text"
                      value={profileEdrpou}
                      onChange={(e) => setProfileEdrpou(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">ІПН платника ПДВ</label>
                    <input
                      type="text"
                      value={profileTaxNumber}
                      onChange={(e) => setProfileTaxNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Юридична адреса</label>
                  <input
                    type="text"
                    value={profileLegalAddress}
                    onChange={(e) => setProfileLegalAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Фактична адреса</label>
                  <input
                    type="text"
                    value={profileActualAddress}
                    onChange={(e) => setProfileActualAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">Банківські реквізити та підписант</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">ПІБ Керівника</label>
                    <input
                      type="text"
                      value={profileDirectorName}
                      onChange={(e) => setProfileDirectorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Посада Керівника</label>
                    <input
                      type="text"
                      value={profileDirectorPosition}
                      onChange={(e) => setProfileDirectorPosition(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Діє на підставі (напр. Статуту)</label>
                  <input
                    type="text"
                    value={profileDirectorBasis}
                    onChange={(e) => setProfileDirectorBasis(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1">Назва Банку</label>
                    <input
                      type="text"
                      value={profileBankName}
                      onChange={(e) => setProfileBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">МФО Банку</label>
                    <input
                      type="text"
                      value={profileMfo}
                      onChange={(e) => setProfileMfo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">IBAN рахунок</label>
                  <input
                    type="text"
                    value={profileIban}
                    onChange={(e) => setProfileIban(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Email для зв'язку</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Телефон</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Додати документ до Smart Vault</h3>
            <form onSubmit={handleAddDocument} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Назва документу / сертифікату *</label>
                <input
                  type="text"
                  required
                  placeholder="напр. Сертифікат ISO 37001:2016 (Антикорупційний менеджмент)"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Категорія</label>
                  <select
                    value={newDocCategory}
                    onChange={(e: any) => setNewDocCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ISO_CERTIFICATES">ISO Сертифікат</option>
                    <option value="LICENSES_PERMITS">Ліцензія / Дозвіл</option>
                    <option value="FINANCIAL_LEGAL">Фінанси / ЄДР</option>
                    <option value="EQUIPMENT">МТБ</option>
                    <option value="STAFF">Персонал</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Номер документа</label>
                  <input
                    type="text"
                    placeholder="№ 12345/24"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Орган видачі / Емітент</label>
                  <input
                    type="text"
                    placeholder="напр. ТОВ «Стандарт-Орган»"
                    value={newDocIssuer}
                    onChange={(e) => setNewDocIssuer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Термін дії (якщо є)</label>
                  <input
                    type="date"
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Зберегти у Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
