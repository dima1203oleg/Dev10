import { useAuth } from '../contexts/AuthContext';
import React, { useState, useCallback } from 'react';
import { CompanyProfile, DataTruthPoint, VaultDocument } from '../types';
import { 
  Building2, ShieldCheck, Truck, Users, FileText, Plus, 
  Award, CheckCircle2, UploadCloud, FileCheck, 
  Target, Activity, Brain, FileSearch, ArrowRight, X, Radar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompanyProfileModuleProps {
  company: CompanyProfile;
  onUpdateCompany?: (updated: CompanyProfile) => void;
}

export const CompanyProfileModule: React.FC<CompanyProfileModuleProps> = ({ company, onUpdateCompany }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requisites' | 'radar_setup' | 'documents'>('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const overallReadiness = 87;
  
  
  const { token } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const result = reader.result as string;
        const [meta, base64Data] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        setUploadProgress(40); // Read complete

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

        setUploadProgress(80); // Upload and AI processing complete

        const data = await res.json();
        if (data.status === 'ok' && onUpdateCompany) {
            // Update the company profile with the new document
            const newDoc = {
                id: `doc-${Date.now()}`,
                title: data.data.documentName || file.name,
                type: 'PDF',
                category: data.data.category || 'OTHER',
                status: data.data.status === 'VALID' ? 'ACTIVE' : 'EXPIRED',
                uploadDate: new Date().toISOString().split('T')[0],
                verificationStatus: 'VERIFIED',
                aiConfidence: data.data.confidence || 95,
                extractedText: data.data.extractedText || '',
                provenance: data.data.provenance || 'USER_UPLOAD → OCR → AI_EXTRACTION'
            } as any;
            
            onUpdateCompany({
                ...company,
                vaultDocuments: [...(company.vaultDocuments || []), newDoc]
            });
        } else {
            console.error('Upload failed:', data.error);
            alert('Помилка обробки: ' + data.error);
        }
        
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 1000);
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
                  {company.edrpou}
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {company.name !== 'ПРОФІЛЬ_ВІДСУТНІЙ' ? company.name : 'ТОВ «БУДКОМПЛЕКС»'}
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl">
                Єдине джерело правди (SSOT) вашої компанії. Система автоматично аналізує завантажені документи, витягує сутності та будує цифровий профіль для Radar та Bid Package.
              </p>
            </div>
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 min-w-[280px] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Готовність профілю:</span>
                <span className="text-xl font-black text-emerald-400">{overallReadiness}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${overallReadiness}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-[10px] text-slate-400">Ліцензії <span className="text-emerald-400 font-bold ml-1">100%</span></div>
                <div className="text-[10px] text-slate-400">Досвід <span className="text-emerald-400 font-bold ml-1">92%</span></div>
                <div className="text-[10px] text-slate-400">Персонал <span className="text-amber-400 font-bold ml-1">86%</span></div>
                <div className="text-[10px] text-slate-400">Техніка <span className="text-amber-400 font-bold ml-1">73%</span></div>
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
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
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
                        <span>Завантажено: 87 файлів</span>
                        <span className="text-emerald-400">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <div className="space-y-1 mt-4 text-[10px] font-mono text-slate-500 text-left">
                        <div className="flex justify-between"><span>Розпізнавання (OCR)</span> <span className="text-emerald-400">Готово</span></div>
                        <div className="flex justify-between"><span>Класифікація</span> <span className="text-emerald-400">84%</span></div>
                        <div className="flex justify-between"><span>Витяг даних</span> <span className="text-amber-400">72%</span></div>
                        <div className="flex justify-between"><span>Валідація & Evidence</span> <span className="text-slate-600">Очікування</span></div>
                      </div>
                    </div>
                  ) : (
                    
                    <> <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2">
                      <Plus size={16} /> ДОДАТИ ДОКУМЕНТИ
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleRealUpload} accept="application/pdf,image/*" /> </>
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
                      <Users size={16} className="text-amber-400" />
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

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-4">Evidence Layer (Доказова база)</h2>
                
                {/* Real Evidence Entry */}
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
                  <div className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">Немає завантажених документів у Vault. Завантажте файли для автоматичного витягу даних.</div>
                )}
              </div>
            )}

            
            {activeTab === 'radar_setup' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-white mb-4">Налаштування автоматичного Radar</h2>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Мінімальний Match Score</label>
                    <div className="flex items-center gap-4 mt-2">
                      <input type="range" min="50" max="100" defaultValue="75" className="w-full accent-emerald-500" />
                      <span className="text-xl font-black text-emerald-400 w-16 text-right">75%</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ключові слова (Must have)</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['реконструкція', 'капітальний ремонт', 'лікарня', 'укриття'].map(k => (
                        <span key={k} className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-full">{k}</span>
                      ))}
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors">
                        + Додати
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
            
            <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2">
              <Brain size={18} /> ЗАПУСТИТИ AI АНАЛІЗ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
