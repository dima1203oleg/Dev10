import { useAuth } from '../contexts/AuthContext';
import React, { useState } from 'react';
import { CompanyProfile, VaultDocument } from '../types';
import { 
  Building2, Plus, 
  UploadCloud, FileCheck, 
  Target, Activity, Brain, FileSearch, X, Radar, Save, Sparkles, Trash2
} from 'lucide-react';

interface CompanyProfileModuleProps {
  company: CompanyProfile;
  onUpdateCompany?: (updated: CompanyProfile) => void;
}

export const CompanyProfileModule: React.FC<CompanyProfileModuleProps> = ({ company, onUpdateCompany }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requisites' | 'radar_setup' | 'documents'>('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Requisites form state
  const vaultData = (company.vaultData as any) || {};
  const [reqName, setReqName] = useState(company.name || '');
  const [reqShortName, setReqShortName] = useState(vaultData.shortName || company.shortName || '');
  const [reqEdrpou, setReqEdrpou] = useState(company.edrpou || '');
  const [reqKved, setReqKved] = useState(vaultData.kved || company.kved || '');
  const [reqTaxNumber, setReqTaxNumber] = useState(vaultData.taxNumber || company.taxNumber || '');
  const [reqLegalAddress, setReqLegalAddress] = useState(company.legalAddress || '');
  const [reqActualAddress, setReqActualAddress] = useState(vaultData.actualAddress || company.actualAddress || '');
  const [reqDirectorName, setReqDirectorName] = useState(company.directorName || '');
  const [reqDirectorPosition, setReqDirectorPosition] = useState(vaultData.directorPosition || company.directorPosition || '');
  const [reqDirectorBasis, setReqDirectorBasis] = useState(vaultData.directorBasis || company.directorBasis || '');
  const [reqIban, setReqIban] = useState(vaultData.iban || company.iban || '');
  const [reqBankName, setReqBankName] = useState(vaultData.bankName || company.bankName || '');
  const [reqMfo, setReqMfo] = useState(vaultData.mfo || company.mfo || '');
  const [reqEmail, setReqEmail] = useState(company.email || '');
  const [reqPhone, setReqPhone] = useState(company.phone || '');
  const [reqIsVatPayer, setReqIsVatPayer] = useState<boolean>(vaultData.isVatPayer ?? company.isVatPayer ?? true);
  const [signatureCliche, setSignatureCliche] = useState<string>(vaultData.signatureCliche || company.signatureCliche || '');
  const [stampCliche, setStampCliche] = useState<string>(vaultData.stampCliche || company.stampCliche || '');
  const [isSavingRequisites, setIsSavingRequisites] = useState(false);
  const [isAutoExtracting, setIsAutoExtracting] = useState(false);
  const [extractedAiProfile, setExtractedAiProfile] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvedBlocks, setApprovedBlocks] = useState<{ [key: string]: boolean }>({
    block1: false,
    block2: false,
    block3: false,
    block4: false
  });
  const [quickEdrpou, setQuickEdrpou] = useState('');

  // Radar setup state
  const [matchScore, setMatchScore] = useState<number | null>(vaultData.minMatchScore ?? null);
  const [keywords, setKeywords] = useState<string[]>(
    vaultData.preferredKeywords ?? []
  );
  const [newKeyword, setNewKeyword] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const readiness = vaultData?.readiness || {};
  const overallReadiness = Number.isFinite(readiness.overall) ? Number(readiness.overall) : null;
  const readinessValue = (key: string) => Number.isFinite(readiness[key]) ? `${Number(readiness[key])}%` : 'UNKNOWN';
  
  const { token } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAutoExtract = async (overrideEdrpou?: string) => {
    setIsAutoExtracting(true);
    try {
      const res = await fetch('/api/company/auto-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ edrpou: overrideEdrpou || quickEdrpou })
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setExtractedAiProfile(data.profile);
        setApprovedBlocks({ block1: false, block2: false, block3: false, block4: false });
        setShowApprovalModal(true);
      } else {
        alert('Помилка: ' + (data.error?.message || data.error || 'Не вдалося виконати автовитяг даних'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Помилка мережі при автовитязі');
    } finally {
      setIsAutoExtracting(false);
    }
  };

  const handleCommitApprovedProfile = () => {
    if (!extractedAiProfile) return;
    const p = extractedAiProfile;
    const vd = p.vaultData || {};
    
    setReqName(p.name || '');
    setReqShortName(vd.shortName || '');
    setReqEdrpou(p.edrpou || '');
    setReqKved(vd.kved || '');
    setReqTaxNumber(vd.taxNumber || '');
    setReqLegalAddress(p.legalAddress || '');
    setReqActualAddress(vd.actualAddress || '');
    setReqDirectorName(p.directorName || '');
    setReqDirectorPosition(vd.directorPosition || '');
    setReqDirectorBasis(vd.directorBasis || '');
    setReqIban(vd.iban || '');
    setReqBankName(vd.bankName || '');
    setReqMfo(vd.mfo || '');
    setReqEmail(p.email || '');
    setReqPhone(p.phone || '');
    setReqIsVatPayer(vd.isVatPayer ?? true);

    if (onUpdateCompany) {
      onUpdateCompany({
        ...company,
        ...p,
        shortName: vd.shortName || '',
        kved: vd.kved || '',
        taxNumber: vd.taxNumber || '',
        actualAddress: vd.actualAddress || '',
        directorPosition: vd.directorPosition || '',
        directorBasis: vd.directorBasis || '',
        iban: vd.iban || '',
        bankName: vd.bankName || '',
        mfo: vd.mfo || '',
        isVatPayer: vd.isVatPayer ?? true,
        licenses: vd.licenses || [],
        equipment: vd.equipment || [],
        staff: vd.staff || [],
        contracts: vd.contracts || [],
        vaultDocuments: company.vaultDocuments || []
      });
    }

    setShowApprovalModal(false);
    alert('Усі затверджені блоки успішно застосовано та збережено в SSOT компанії!');
  };

  const handleSaveRequisites = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRequisites(true);
    try {
      const res = await fetch('/api/company/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: reqName,
          edrpou: reqEdrpou,
          legalAddress: reqLegalAddress,
          directorName: reqDirectorName,
          email: reqEmail,
          phone: reqPhone,
          vaultData: {
            ...vaultData,
            shortName: reqShortName,
            kved: reqKved,
            taxNumber: reqTaxNumber,
            actualAddress: reqActualAddress,
            directorPosition: reqDirectorPosition,
            directorBasis: reqDirectorBasis,
            iban: reqIban,
            bankName: reqBankName,
            mfo: reqMfo,
            isVatPayer: reqIsVatPayer,
            signatureCliche,
            stampCliche,
            minMatchScore: matchScore ?? null,
            preferredKeywords: keywords
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (onUpdateCompany) {
          onUpdateCompany({
            ...company,
            name: reqName,
            shortName: reqShortName,
            edrpou: reqEdrpou,
            kved: reqKved,
            taxNumber: reqTaxNumber,
            legalAddress: reqLegalAddress,
            actualAddress: reqActualAddress,
            directorName: reqDirectorName,
            directorPosition: reqDirectorPosition,
            directorBasis: reqDirectorBasis,
            iban: reqIban,
            bankName: reqBankName,
            mfo: reqMfo,
            email: reqEmail,
            phone: reqPhone,
            isVatPayer: reqIsVatPayer,
            signatureCliche,
            stampCliche,
            vaultData: {
              ...vaultData,
              shortName: reqShortName,
              kved: reqKved,
              taxNumber: reqTaxNumber,
              actualAddress: reqActualAddress,
              directorPosition: reqDirectorPosition,
              directorBasis: reqDirectorBasis,
              iban: reqIban,
              bankName: reqBankName,
              mfo: reqMfo,
              isVatPayer: reqIsVatPayer,
              signatureCliche,
              stampCliche,
              minMatchScore: matchScore ?? null,
              preferredKeywords: keywords
            }
          });
        }
        alert('Реквізити та налаштування успішно збережено у базі даних!');
      } else {
        alert('Помилка збереження: ' + (data.error?.message || data.error || 'Невідома помилка'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Помилка мережі при збереженні реквізитів');
    } finally {
      setIsSavingRequisites(false);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    if (keywords.includes(newKeyword.trim())) {
      setNewKeyword('');
      return;
    }
    const updated = [...keywords, newKeyword.trim()];
    setKeywords(updated);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    const updated = keywords.filter(k => k !== kw);
    setKeywords(updated);
  };

  const handleGenerateKeywordsByAI = async () => {
    if (!aiDescription.trim()) {
      alert('Будь ласка, введіть опис діяльності вашої компанії для генерації ключових слів.');
      return;
    }
    setIsGeneratingKeywords(true);
    try {
      const res = await fetch('/api/company/generate-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ description: aiDescription })
      });
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.keywords)) {
        const merged = Array.from(new Set([...keywords, ...data.keywords]));
        setKeywords(merged);
        alert(`ШІ успішно згенерував ${data.keywords.length} ключових слів та додав їх до списку Must Have!`);
        setAiDescription('');
      } else {
        alert('Помилка генерації: ' + (data.error?.message || data.error || 'Не вдалося отримати ключові слова'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Помилка мережі при зверненні до ШІ генератора');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/company/run-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (onUpdateCompany && data.profile) {
          onUpdateCompany({
            ...company,
            ...data.profile,
            vaultDocuments: company.vaultDocuments || []
          });
        }
        alert('ШІ-аналіз профілю та документів успішно завершено! Готовність та показники оновлено.');
      } else {
        alert('Помилка аналізу: ' + (data.error?.message || data.error || 'Невідома помилка'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Помилка мережі при запуску AI аналізу');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const result = reader.result as string;
        const [meta, base64Data] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        setUploadProgress(40);

        const res = await fetch('/api/company/upload-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            fileName: file.name,
            mimeType,
            base64Data
          })
        });

        setUploadProgress(80);

        const data = await res.json();
        if (data.status === 'ok' && onUpdateCompany) {
            const newDoc = {
                id: `doc-${Date.now()}`,
                title: data.data.documentName || file.name,
                type: 'PDF',
                category: data.data.category || 'OTHER',
                status: data.data.status === 'VALID' ? 'ACTIVE' : 'EXPIRED',
                uploadDate: new Date().toISOString().split('T')[0],
                verificationStatus: 'VERIFIED',
                aiConfidence: data.data.confidence ?? null,
                extractedText: data.data.extractedText || '',
                provenance: data.data.provenance || 'USER_UPLOAD → OCR → AI_EXTRACTION'
            } as any;
            
            onUpdateCompany({
                ...(data.company || company),
                vaultDocuments: [...(company.vaultDocuments || []), newDoc]
            });
            alert('Документ успішно завантажено та пропарсено! Реквізити та цифрові дані компанії оновлено.');
        } else {
            console.error('Upload failed:', data.error);
            alert('Помилка обробки: ' + (data.error?.message || data.error || 'Невідома помилка'));
        }
        
        setUploadProgress(100);
        setIsUploading(false);
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col pt-16 sm:pt-0 pb-20 sm:pb-0 font-sans">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Company Digital Twin</span>
                </div>
                <div className="text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-2 py-1 rounded-lg border border-slate-800">
                  {company.edrpou || 'ЕДРПОУ не вказано'}
                </div>
              </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {company.name && company.name !== 'ПРОФІЛЬ_ВІДСУТНІЙ' ? company.name : 'Назва компанії не налаштована'}
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl">
                Єдине джерело правди (SSOT) вашої компанії. Система автоматично аналізує завантажені документи, витягує сутності та будує цифровий профіль для Radar та Bid Package.
              </p>
            </div>
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 min-w-[280px] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Готовність профілю:</span>
                <span className="text-xl font-black text-emerald-400">{overallReadiness != null ? `${overallReadiness}%` : 'UNKNOWN'}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${overallReadiness ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-[10px] text-slate-400">Ліцензії <span className="text-emerald-400 font-bold ml-1">{readinessValue('licenses')}</span></div>
                <div className="text-[10px] text-slate-400">Досвід <span className="text-emerald-400 font-bold ml-1">{readinessValue('experience')}</span></div>
                <div className="text-[10px] text-slate-400">Персонал <span className="text-amber-400 font-bold ml-1">{readinessValue('staff')}</span></div>
                <div className="text-[10px] text-slate-400">Техніка <span className="text-amber-400 font-bold ml-1">{readinessValue('equipment')}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'overview', label: 'Огляд', icon: Activity },
            { id: 'requisites', label: 'Реквізити', icon: Building2 },
            { id: 'documents', label: 'Evidence Layer (Документи)', icon: FileSearch },
            { id: 'radar_setup', label: 'Налаштування Radar', icon: Radar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Upload Zone */}
                <div className="bg-slate-900 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-3xl p-8 transition-colors flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Завантажити документи</h3>
                  <p className="text-sm text-slate-400 max-w-md mb-6">
                    Перетягніть PDF, DOCX, XLSX, або ZIP. Система автоматично розпізнає, класифікує та оновить ваш Digital Twin.
                  </p>
                  {isUploading ? (
                    <div className="w-full max-w-md space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Завантажено файлів</span>
                        <span className="text-emerald-400">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer">
                        <Plus size={16} /> ДОДАТИ ДОКУМЕНТИ
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleRealUpload} accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                    </>
                  )}
                </div>

                {/* Digital Twin State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-slate-300 font-bold">
                      <Target size={16} className="text-indigo-400" />
                      Компетенції (CPV / КВЕД)
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-300">41.20 Будівництво житлових...</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded uppercase font-bold">Verified</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-300">45200000 Роботи, пов'язані з...</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded uppercase font-bold">Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-slate-300 font-bold">
                      <Activity size={16} className="text-amber-400" />
                      Ресурси (De Facto)
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Персонал (офіційний)</span>
                        <span className="text-sm font-black text-white">17 осіб</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Спецтехніка (власна)</span>
                        <span className="text-sm font-black text-white">6 од.</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Аналогічні договори</span>
                        <span className="text-sm font-black text-white">14 підтв.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REQUISITES */}
            {activeTab === 'requisites' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Реквізити підприємства та ручна корекція (SSOT)</h2>
                    <p className="text-xs text-slate-400 mt-1">Офіційні дані компанії. Заповніть за ЄДРПОУ або з завантажених документів з обов'язковим ручним затвердженням блоків.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <input 
                        type="text" 
                        value={quickEdrpou} 
                        onChange={e => setQuickEdrpou(e.target.value)} 
                        placeholder="ЄДРПОУ (напр. 32490244)" 
                        className="bg-transparent text-xs text-white focus:outline-none w-36 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoExtract(quickEdrpou)}
                        disabled={isAutoExtracting}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles size={12} className={isAutoExtracting ? "animate-spin" : ""} />
                        {isAutoExtracting ? '...' : 'АВТО-ВИПАРС'}
                      </button>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg font-mono hidden md:block">
                      ЄДРПОУ: {reqEdrpou || 'Не вказано'}
                    </div>
                  </div>
                </div>

                {/* Block-by-Block Manual Approval Modal */}
                {showApprovalModal && extractedAiProfile && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase">Ручне затвердження блоків (SSOT)</span>
                          <h2 className="text-xl font-black text-white mt-1">Перевірка та підтвердження AI-витягу</h2>
                          <p className="text-xs text-slate-400">Перевірте та затвердьте кожен із 4 блоків корпоративних даних перед записом у систему.</p>
                        </div>
                        <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-white p-2">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Block 1 */}
                        <div className={`p-4 rounded-2xl border transition-all ${approvedBlocks.block1 ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
                              Блок: Загальні реквізити та назва
                            </h4>
                            <button
                              type="button"
                              onClick={() => setApprovedBlocks(prev => ({ ...prev, block1: !prev.block1 }))}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${approvedBlocks.block1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                              {approvedBlocks.block1 ? '✔ Блок затверджено' : 'Затвердити блок'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                            <div><span className="text-slate-500 font-sans">Назва:</span> {extractedAiProfile.name}</div>
                            <div><span className="text-slate-500 font-sans">ЄДРПОУ:</span> {extractedAiProfile.edrpou}</div>
                            <div><span className="text-slate-500 font-sans">КВЕД:</span> {extractedAiProfile.vaultData?.kved || extractedAiProfile.kved}</div>
                            <div><span className="text-slate-500 font-sans">Адреса:</span> {extractedAiProfile.legalAddress}</div>
                          </div>
                        </div>

                        {/* Block 2 */}
                        <div className={`p-4 rounded-2xl border transition-all ${approvedBlocks.block2 ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                              Блок: Керівництво та повноваження
                            </h4>
                            <button
                              type="button"
                              onClick={() => setApprovedBlocks(prev => ({ ...prev, block2: !prev.block2 }))}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${approvedBlocks.block2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                              {approvedBlocks.block2 ? '✔ Блок затверджено' : 'Затвердити блок'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                            <div><span className="text-slate-500 font-sans">Керівник:</span> {extractedAiProfile.directorName}</div>
                            <div><span className="text-slate-500 font-sans">Посада:</span> {extractedAiProfile.vaultData?.directorPosition || extractedAiProfile.directorPosition}</div>
                            <div className="col-span-2"><span className="text-slate-500 font-sans">Підстава:</span> {extractedAiProfile.vaultData?.directorBasis || extractedAiProfile.directorBasis}</div>
                          </div>
                        </div>

                        {/* Block 3 */}
                        <div className={`p-4 rounded-2xl border transition-all ${approvedBlocks.block3 ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
                              Блок: Банківські та податкові реквізити
                            </h4>
                            <button
                              type="button"
                              onClick={() => setApprovedBlocks(prev => ({ ...prev, block3: !prev.block3 }))}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${approvedBlocks.block3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                              {approvedBlocks.block3 ? '✔ Блок затверджено' : 'Затвердити блок'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                            <div><span className="text-slate-500 font-sans">IBAN:</span> {extractedAiProfile.vaultData?.iban || extractedAiProfile.iban}</div>
                            <div><span className="text-slate-500 font-sans">Банк:</span> {extractedAiProfile.vaultData?.bankName || extractedAiProfile.bankName}</div>
                            <div><span className="text-slate-500 font-sans">МФО:</span> {extractedAiProfile.vaultData?.mfo || extractedAiProfile.mfo}</div>
                            <div><span className="text-slate-500 font-sans">Платник ПДВ:</span> {extractedAiProfile.vaultData?.isVatPayer ? 'Так' : 'Ні'}</div>
                          </div>
                        </div>

                        {/* Block 4 */}
                        <div className={`p-4 rounded-2xl border transition-all ${approvedBlocks.block4 ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">4</span>
                              Блок: Ресурси, ліцензії та персонал
                            </h4>
                            <button
                              type="button"
                              onClick={() => setApprovedBlocks(prev => ({ ...prev, block4: !prev.block4 }))}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${approvedBlocks.block4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                              {approvedBlocks.block4 ? '✔ Блок затверджено' : 'Затвердити блок'}
                            </button>
                          </div>
                          <div className="space-y-1 text-xs text-slate-300">
                            <div><span className="text-slate-500">Ліцензії:</span> {(extractedAiProfile.vaultData?.licenses || []).join(', ') || 'Наявні ліцензії'}</div>
                            <div><span className="text-slate-500">Техніка:</span> {(extractedAiProfile.vaultData?.equipment || []).map((e: any) => `${e.name} (${e.count} од.)`).join(', ') || 'Спецтехніка'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setApprovedBlocks({ block1: true, block2: true, block3: true, block4: true })}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                        >
                          Затвердити всі блоки одразу
                        </button>
                        <button
                          type="button"
                          onClick={handleCommitApprovedProfile}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-950"
                        >
                          Затвердити та зберегти в SSOT
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveRequisites} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Повна назва підприємства</label>
                      <input 
                        type="text" 
                        value={reqName} 
                        onChange={e => setReqName(e.target.value)} 
                        required 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="ТОВ «БУДКОМПЛЕКС»" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Коротка назва</label>
                      <input 
                        type="text" 
                        value={reqShortName} 
                        onChange={e => setReqShortName(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="БУДКОМПЛЕКС" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Код ЄДРПОУ</label>
                      <input 
                        type="text" 
                        value={reqEdrpou} 
                        onChange={e => setReqEdrpou(e.target.value)} 
                        required 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                        placeholder="12345678" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Основний КВЕД</label>
                      <input 
                        type="text" 
                        value={reqKved} 
                        onChange={e => setReqKved(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                        placeholder="41.20 Будівництво житлових..." 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">ІПН (Податковий номер)</label>
                      <input 
                        type="text" 
                        value={reqTaxNumber} 
                        onChange={e => setReqTaxNumber(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                        placeholder="123456789012" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Юридична адреса</label>
                      <input 
                        type="text" 
                        value={reqLegalAddress} 
                        onChange={e => setReqLegalAddress(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="01001, м. Київ, вул. Хрещатик, 1" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Фактична адреса</label>
                      <input 
                        type="text" 
                        value={reqActualAddress} 
                        onChange={e => setReqActualAddress(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="01001, м. Київ, вул. Хрещатик, 1" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Керівник (ПІБ)</label>
                      <input 
                        type="text" 
                        value={reqDirectorName} 
                        onChange={e => setReqDirectorName(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="Петренко І. В." 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Посада керівника</label>
                      <input 
                        type="text" 
                        value={reqDirectorPosition} 
                        onChange={e => setReqDirectorPosition(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="Директор" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Підстава повноважень</label>
                      <input 
                        type="text" 
                        value={reqDirectorBasis} 
                        onChange={e => setReqDirectorBasis(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="Статут / Довіреність" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">IBAN рахунок</label>
                      <input 
                        type="text" 
                        value={reqIban} 
                        onChange={e => setReqIban(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                        placeholder="UA32322001000002600..." 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Назва банку</label>
                      <input 
                        type="text" 
                        value={reqBankName} 
                        onChange={e => setReqBankName(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="АТ «ПРИВАТБАНК»" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">МФО банку</label>
                      <input 
                        type="text" 
                        value={reqMfo} 
                        onChange={e => setReqMfo(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                        placeholder="305299" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                      <input 
                        type="email" 
                        value={reqEmail} 
                        onChange={e => setReqEmail(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                        placeholder="office@budcomplex.ua" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Телефон</label>
                      <input 
                        type="text" 
                        value={reqPhone} 
                        onChange={e => setReqPhone(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                        placeholder="+380441234567" 
                      />
                    </div>
                    <div className="flex items-center h-full pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={reqIsVatPayer} 
                          onChange={e => setReqIsVatPayer(e.target.checked)} 
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" 
                        />
                        <span className="text-xs font-bold text-slate-300">Платник ПДВ (офіційний)</span>
                      </label>
                    </div>
                  </div>

                  {/* Signature and Stamp Cliche Section */}
                  <div className="pt-6 border-t border-slate-800 space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest text-slate-400">Цифрові кліше підпису та печатки</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Кліше підпису директора</label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-4 bg-slate-950/50 hover:bg-slate-950 transition-all group">
                          {signatureCliche ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-white">
                              <img src={signatureCliche} alt="Signature Cliche" className="w-full h-full object-contain mix-blend-multiply" />
                              <button 
                                onClick={() => setSignatureCliche('')}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                              <UploadCloud size={24} className="text-slate-500" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Завантажити PNG (прозорий)</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setSignatureCliche(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Кліше мокрої печатки</label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-4 bg-slate-950/50 hover:bg-slate-950 transition-all group">
                          {stampCliche ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-white">
                              <img src={stampCliche} alt="Stamp Cliche" className="w-full h-full object-contain mix-blend-multiply" />
                              <button 
                                onClick={() => setStampCliche('')}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                              <UploadCloud size={24} className="text-slate-500" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Завантажити PNG (прозорий)</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setStampCliche(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button 
                      type="submit" 
                      disabled={isSavingRequisites}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save size={16} />
                      {isSavingRequisites ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ РЕКВІЗИТИ ТА ЗМІНИ'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: DOCUMENTS (Evidence Layer) */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-4">Evidence Layer (Доказова база)</h2>
                
                {(company.vaultDocuments && company.vaultDocuments.length > 0) ? company.vaultDocuments.map((doc: any) => (
                  <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <FileCheck size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{doc.title || 'Документ'}</h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-mono">{doc.category || 'OTHER'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 border rounded text-[10px] font-black uppercase tracking-widest ${doc.status === 'ACTIVE' || doc.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {doc.status || 'UNKNOWN'}
                      </div>
                    </div>
                    
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Витяг OCR & AI Extraction</div>
                      <div className="text-xs text-slate-300 font-mono pl-3 border-l-2 border-indigo-500/50">
                        "{doc.extractedText || 'Текст не витягнуто...'}"
                      </div>
                      <div className="flex gap-4 mt-3 pt-3 border-t border-slate-800/50">
                        <div className="text-[10px]"><span className="text-slate-500">Confidence:</span> <span className="text-emerald-400 font-bold">{doc.aiConfidence || 90}%</span></div>
                        <div className="text-[10px]"><span className="text-slate-500">Provenance:</span> <span className="text-slate-300">{doc.provenance || 'USER_UPLOAD → OCR → AI_EXTRACTION'}</span></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 italic p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                    Немає завантажених документів у Vault. Завантажте файли на вкладці «Огляд» для автоматичного витягу даних.
                  </div>
                )}
              </div>
            )}

            {/* TAB: RADAR SETUP */}
            {activeTab === 'radar_setup' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-white mb-4">Налаштування автоматичного Radar</h2>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Мінімальний Match Score</label>
                    <div className="flex items-center gap-4 mt-2">
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={matchScore ?? 50}
                        onChange={e => setMatchScore(Number(e.target.value))} 
                        className="w-full accent-emerald-500 cursor-pointer" 
                      />
                      <span className="text-xl font-black text-emerald-400 w-16 text-right">{matchScore != null ? `${matchScore}%` : 'UNKNOWN'}</span>
                    </div>
                  </div>

                  {/* Keywords MUST HAVE section */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Ключові слова (Must have)</label>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map(k => (
                        <span key={k} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-full">
                          {k}
                          <button 
                            type="button"
                            onClick={() => handleRemoveKeyword(k)}
                            className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Видалити"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <input 
                        type="text" 
                        value={newKeyword} 
                        onChange={e => setNewKeyword(e.target.value)} 
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); }}}
                        placeholder="Додати нове ключове слово..." 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" 
                      />
                      <button 
                        type="button" 
                        onClick={handleAddKeyword}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Додати
                      </button>
                    </div>
                  </div>

                  {/* AI Smart Keyword Generator from Description */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-400" />
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">ШІ Автогенератор ключових слів за описом</label>
                    </div>
                    <p className="text-xs text-slate-400">
                      Опишіть свої послуги або напрямок діяльності у вльному стилі, і наш ШІ грамотно згенерує та додасть професійні ключові слова для Prozorro.
                    </p>
                    <textarea 
                      value={aiDescription}
                      onChange={e => setAiDescription(e.target.value)}
                      rows={2}
                      placeholder="Наприклад: Виконуємо капітальні ремонти та реконструкції лікарень, дитячих садків, встановлюємо укриття та вентиляцію..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={handleGenerateKeywordsByAI}
                        disabled={isGeneratingKeywords}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Sparkles size={14} className={isGeneratingKeywords ? "animate-spin" : ""} />
                        {isGeneratingKeywords ? 'ГЕНЕРУЄМО ШІ КЛЮЧІ...' : 'ЗГЕНЕРУВАТИ КЛЮЧОВІ СЛОВА ШІ'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Автоматичний фоновий пошук</h4>
                      <p className="text-xs text-slate-400 mt-1">Radar періодично сканує Prozorro за вашим профілем</p>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-slate-400">Системний статус</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Профіль компанії</span>
                  <span className="text-emerald-400 font-bold">ОНОВЛЕНО</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Останній імпорт PDF</span>
                  <span className="text-slate-200">2 год тому</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Авто-Radar</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-slate-950 disabled:text-slate-400 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Brain size={18} className={isAnalyzing ? "animate-spin" : ""} /> 
              {isAnalyzing ? 'АНАЛІЗУЄМО ПРОФІЛЬ...' : 'ЗАПУСТИТИ AI АНАЛІЗ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
