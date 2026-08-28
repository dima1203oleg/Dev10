import React, { useState, useEffect } from 'react';
import { AppSection, Tender, BoQItem, MultiAgentReport, AmcuComplaintDoc, BidPackage, CompanyProfile, RequirementItem, CollusionAnalysis, SystemMode, TenderDocument } from './types';
import { DashboardView } from './components/DashboardView';
import { FoulTenderModule } from './components/FoulTenderModule';
import { TenderAIConstructionModule } from './components/TenderAIConstructionModule';
import { AmcuComplaintGenerator } from './components/AmcuComplaintGenerator';
import { BidPackageGenerator } from './components/BidPackageGenerator';
import { MultiAgentChat } from './components/MultiAgentChat';
import { TenderCatalog } from './components/TenderCatalog';
import { CompanyProfileModule } from './components/CompanyProfileModule';
import { RequirementMatrixModule } from './components/RequirementMatrixModule';
import { CompetitorCollusionModule } from './components/CompetitorCollusionModule';
import { VersionDiffModule } from './components/VersionDiffModule';
import { PreSubmissionAuditModule } from './components/PreSubmissionAuditModule';
import { TenderRadarModule } from './components/TenderRadarModule';
import { TenderWarRoomModule } from './components/TenderWarRoomModule';
import { PostTenderModule } from './components/PostTenderModule';
import { ServicesModelModule } from './components/ServicesModelModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DocumentWorkspace } from './components/DocumentWorkspace';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { TeamWorkspaceModule } from './components/TeamWorkspaceModule';
import { CostEstimateAnalysisModule } from './components/CostEstimateAnalysisModule';
import { GanttChartModule } from './components/GanttChartModule';
import { useAuth } from './contexts/AuthContext';
import { Bot, User as UserIcon, ShieldAlert, Search } from 'lucide-react';

import { ResponsiveAppShell } from './design-system/ResponsiveAppShell';

export default function App() {
  const { user, loading: authLoading, token, signIn, signInAsDev } = useAuth();
  
  const [currentSection, setCurrentSection] = useState<AppSection>('dashboard');
  const [systemMode, setSystemMode] = useState<SystemMode>('TEAM');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [currentTender, setCurrentTender] = useState<Tender | null>(null);
  const [tenderDocuments, setTenderDocuments] = useState<TenderDocument[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [complaints, setComplaints] = useState<AmcuComplaintDoc[]>([]);
  const [bidPackages, setBidPackages] = useState<BidPackage[]>([]);
  const [starredTenders, setStarredTenders] = useState<Set<string>>(new Set());
  
  const [dbLoading, setDbLoading] = useState(false);

  // Fetch documents when tender changes
  useEffect(() => {
    if (currentTender && token) {
      fetch(`/api/tenders/${currentTender.id}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setTenderDocuments(data))
      .catch(console.error);
    } else {
      setTenderDocuments([]);
    }
  }, [currentTender, token]);

  useEffect(() => {
    if (user && token) {
      setDbLoading(true);
      fetch('/api/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.tenders && data.tenders.length > 0) {
          const mappedTenders: Tender[] = data.tenders.map((t: any) => ({
            id: t.id.toString(),
            tenderNumber: t.tenderNumber,
            title: t.title,
            customer: t.customer || 'Невідомий замовник',
            customerEdrpou: t.detailedData?.customerEdrpou || 'NOT_AVAILABLE',
            customerCity: t.detailedData?.customerCity || 'NOT_AVAILABLE',
            budgetUah: t.budgetUah || null,
            deadline: t.detailedData?.deadline || 'NOT_AVAILABLE',
            region: t.detailedData?.region || 'NOT_AVAILABLE',
            status: t.status || 'ACTIVE',
            category: t.detailedData?.category || 'NOT_AVAILABLE',
            foulScore: t.foulScore || 0,
            riskLevel: t.riskLevel || 'LOW',
            summary: t.summary || '',
            boqItems: t.detailedData?.boqItems || [],
            violations: t.detailedData?.violations || [],
            requirements: t.detailedData?.requirements || [],
            ...(t.detailedData || {})
          }));
          setTenders(mappedTenders);
          setCurrentTender(mappedTenders[0]);
        }
        if (data.favorites) {
          setStarredTenders(new Set(data.favorites.map((id: any) => id.toString())));
        }
        if (data.profile) {
          const rawProfile = data.profile;
          const vault = rawProfile.vaultData || {};
          const mappedProfile: CompanyProfile = {
            id: rawProfile.id.toString(),
            name: rawProfile.name || '',
            edrpou: rawProfile.edrpou || '',
            legalAddress: rawProfile.legalAddress || '',
            directorName: rawProfile.directorName || '',
            email: rawProfile.email || '',
            phone: rawProfile.phone || '',
            shortName: vault.shortName || rawProfile.name || '',
            kved: vault.kved || '',
            taxNumber: vault.taxNumber || '',
            actualAddress: vault.actualAddress || '',
            directorPosition: vault.directorPosition || '',
            directorBasis: vault.directorBasis || '',
            iban: vault.iban || '',
            bankName: vault.bankName || '',
            mfo: vault.mfo || '',
            isVatPayer: vault.isVatPayer || false,
            licenses: vault.licenses || [],
            equipment: vault.equipment || [],
            staff: vault.staff || [],
            contracts: vault.contracts || [],
            vaultDocuments: vault.vaultDocuments || []
          };
          setCompanyProfile(mappedProfile);
        }
      })
      .catch(console.error)
      .finally(() => setDbLoading(false));
    } else {
      setTenders([]);
      setCurrentTender(null);
      setCompanyProfile(null);
    }
  }, [user, token]);

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400">
        <span className="relative flex h-12 w-12 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-12 w-12 bg-emerald-500"></span>
        </span>
        <div className="font-bold text-lg animate-pulse">Завантаження TenderAI...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600"></div>
          
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              TenderAI <span className="text-emerald-400">&</span> FoulTender
            </h1>
            <p className="text-sm text-slate-400">
              Корпоративна платформа підготовки та антикорупційного захисту тендерних пропозицій
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={signIn}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer text-sm"
            >
              <UserIcon className="w-5 h-5" />
              <span>Увійти з Google Workspace</span>
            </button>

            {((import.meta as any).env.DEV || (import.meta as any).env.MODE !== 'production') && (
              <button
                onClick={signInAsDev}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-sm"
              >
                <Bot className="w-5 h-5 animate-pulse" />
                <span>Увійти локально (Режим розробника)</span>
              </button>
            )}
          </div>
          
          <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-800">
            Secure connection via Google Cloud SQL & Firebase Auth
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateTenderBoq = (tenderId: string, boqItems: BoQItem[]) => {
    setTenders(prev => prev.map(t => {
      if (t.id === tenderId) {
        return { ...t, boqItems };
      }
      return t;
    }));
    if (currentTender && currentTender.id === tenderId) {
      setCurrentTender(prev => prev ? ({ ...prev, boqItems }) : null);
    }
  };

  const handleUpdateTenderAnalysis = (tenderId: string, report: MultiAgentReport) => {
    setTenders(prev => prev.map(t => {
      if (t.id === tenderId) {
        return { ...t, multiAgentAnalysis: report };
      }
      return t;
    }));
    if (currentTender && currentTender.id === tenderId) {
      setCurrentTender(prev => prev ? ({ ...prev, multiAgentAnalysis: report }) : null);
    }
  };

  const handleUpdateTenderRequirements = (tenderId: string, requirements: RequirementItem[]) => {
    setTenders(prev => prev.map(t => {
      if (t.id === tenderId) {
        return { ...t, requirements };
      }
      return t;
    }));
    if (currentTender && currentTender.id === tenderId) {
      setCurrentTender(prev => prev ? ({ ...prev, requirements }) : null);
    }
  };

  const handleUpdateTenderCollusion = (tenderId: string, collusionAnalysis: CollusionAnalysis) => {
    setTenders(prev => prev.map(t => {
      if (t.id === tenderId) {
        return { ...t, collusionAnalysis };
      }
      return t;
    }));
    if (currentTender && currentTender.id === tenderId) {
      setCurrentTender(prev => prev ? ({ ...prev, collusionAnalysis }) : null);
    }
  };

  const handleAddComplaint = (complaint: AmcuComplaintDoc) => {
    setComplaints(prev => [complaint, ...prev]);
  };

  const handleAddBidPackage = (pkg: BidPackage) => {
    setBidPackages(prev => [pkg, ...prev]);
  };

  const handleAddNewTender = (newTender: Tender) => {
    setTenders(prev => [newTender, ...prev]);
    setCurrentTender(newTender);
  };

  const handleSelectTender = (tender: Tender) => {
    setCurrentTender(tender);
    setTenders(prev => {
      const exists = prev.some(t => t.id === tender.id || t.tenderNumber === tender.tenderNumber);
      if (!exists) {
        return [tender, ...prev];
      }
      return prev.map(t => (t.id === tender.id || t.tenderNumber === tender.tenderNumber) ? { ...t, ...tender } : t);
    });
  };

  const toggleFavorite = async (tenderId: string) => {
    if (!token) return;
    
    const isStarred = starredTenders.has(tenderId);
    const method = isStarred ? 'DELETE' : 'POST';
    
    try {
      const res = await fetch(`/api/tenders/${tenderId}/favorite`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setStarredTenders(prev => {
          const next = new Set(prev);
          if (isStarred) next.delete(tenderId);
          else next.add(tenderId);
          return next;
        });
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

  const handleNavigateSection = (sec: string) => {
    let target = sec;
    if (target === 'warroom') target = 'war-room';
    setCurrentSection(target as AppSection);
  };

  const handleUploadDocuments = async (files: File[]) => {
    if (!currentTender || !token) return;
    
    for (const file of files) {
      try {
        const response = await fetch(`/api/tenders/${currentTender.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: file.name,
            type: file.name.toUpperCase().includes('BOQ') ? 'BOQ' : 'TECHNICAL',
            size: file.size
          })
        });
        const newDoc = await response.json();
        setTenderDocuments(prev => [...prev, newDoc]);
      } catch (err) {
        console.error('Failed to upload doc:', err);
      }
    }
  };

  const handleProcessDocumentAI = async (docId: string) => {
    if (!currentTender || !token) return;
    
    // Optimistic UI
    setTenderDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'PROCESSING' } : d));
    
    try {
      const response = await fetch(`/api/tenders/${currentTender.id}/documents/${docId}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('AI Analysis failed');
      const updatedDoc = await response.json();
      setTenderDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setTenderDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'ERROR' } : d));
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!currentTender || !token) return;
    try {
      await fetch(`/api/tenders/${currentTender.id}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTenderDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Delete doc failed:', err);
    }
  };

  const handleUpdateCompany = async (updated: CompanyProfile) => {
    setCompanyProfile(updated);
    if (!token) return;
    try {
      const response = await fetch('/api/company/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: updated.name,
          edrpou: updated.edrpou,
          legalAddress: updated.legalAddress,
          directorName: updated.directorName,
          email: updated.email,
          phone: updated.phone,
          vaultData: {
            shortName: updated.shortName,
            kved: updated.kved,
            taxNumber: updated.taxNumber,
            actualAddress: updated.actualAddress,
            directorPosition: updated.directorPosition,
            directorBasis: updated.directorBasis,
            iban: updated.iban,
            bankName: updated.bankName,
            mfo: updated.mfo,
            isVatPayer: updated.isVatPayer,
            licenses: updated.licenses,
            equipment: updated.equipment,
            staff: updated.staff,
            contracts: updated.contracts,
            vaultDocuments: updated.vaultDocuments
          }
        })
      });
      if (!response.ok) throw new Error('Не вдалося зберегти профіль підприємства.');
    } catch (err) {
      console.error('Failed to sync company profile:', err);
    }
  };

  const defaultCompany: CompanyProfile = {
    id: 'comp-unconfigured',
    name: 'ПРОФІЛЬ НЕ НАЛАШТОВАНО',
    shortName: 'ПРОФІЛЬ НЕ НАЛАШТОВАНО',
    edrpou: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    kved: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    taxNumber: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    legalAddress: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    actualAddress: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    directorName: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    directorPosition: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    directorBasis: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    iban: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    bankName: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    mfo: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    email: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    phone: 'ПРОФІЛЬ_ВІДСУТНІЙ',
    isVatPayer: false,
    licenses: [],
    equipment: [],
    staff: [],
    contracts: [],
    vaultDocuments: []
  };

  const activeCompany = companyProfile || defaultCompany;
  const requiresTender = ['war-room', 'matrix', 'foultender', 'construction', 'cost-analysis', 'gantt-chart', 'competitors', 'diff', 'audit', 'complaints', 'bid-packages', 'multiagent-chat', 'documents'].includes(currentSection);

  return (
    <>
      <ResponsiveAppShell
        activeTab={currentSection}
        onNavigate={(sec) => handleNavigateSection(sec as string)}
        hasActiveTender={!!currentTender}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        systemMode={systemMode}
        onToggleSystemMode={(mode) => {
          setSystemMode(mode);
          if (mode === 'TEAM') handleNavigateSection('team');
        }}
        sidebarContent={
          <div className="mt-auto p-4 border-t border-slate-900 hidden lg:block">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Активне підприємство</div>
             <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-white truncate">{activeCompany.shortName}</div>
                <div className="text-[10px] text-emerald-500 font-mono">{activeCompany.edrpou}</div>
             </div>
          </div>
        }
        contextPanel={
          currentTender ? (
            <div className="space-y-6">
               <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Контекст тендера</div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-2">{currentTender.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 rounded text-[10px] font-mono text-slate-400">{currentTender.tenderNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentTender.riskLevel === 'LOW' ? 'bg-emerald-500/10 text-emerald-400' :
                      currentTender.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {currentTender.riskLevel === 'LOW' ? 'НИЗЬКИЙ РИЗИК' :
                       currentTender.riskLevel === 'MEDIUM' ? 'ПОМІРНИЙ РИЗИК' :
                       currentTender.riskLevel === 'HIGH' ? 'ВИСОКИЙ РИЗИК' :
                       'КРИТИЧНИЙ РИЗИК'}
                    </span>
                  </div>
               </div>

               <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <div className="text-xs text-emerald-400/60 mb-1">Оцінка відповідності</div>
                  <div className="text-3xl font-bold text-emerald-400">{currentTender.opportunityScore?.overallScore || '—'}%</div>
               </div>
            </div>
          ) : null
        }
      >
        {!currentTender && requiresTender ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6 my-12 shadow-2xl">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                  <Search size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Тендер не обрано</h3>
                  <p className="text-sm text-slate-400">Для роботи з цим модулем необхідно спочатку обрати тендер у каталозі або на радарі.</p>
                </div>
                <button 
                  onClick={() => handleNavigateSection('catalog')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all"
                >
                  Перейти до каталогу
                </button>
            </div>
        ) : (
            <>
              {currentSection === 'dashboard' && (
                <DashboardView 
                  tenders={tenders} 
                  starredTenders={starredTenders}
                  onSelectTender={handleSelectTender} 
                  onNavigate={handleNavigateSection}
                  onToggleFavorite={toggleFavorite}
                  token={token}
                />
              )}
              {currentSection === 'team' && (
                <TeamWorkspaceModule 
                  tenders={tenders} 
                  currentTender={currentTender} 
                  onSelectTender={handleSelectTender} 
                  onNavigateToWarRoom={() => handleNavigateSection('war-room')}
                />
              )}
              {currentSection === 'analytics' && <AnalyticsDashboard tenders={tenders} />}
              {currentSection === 'radar' && <TenderRadarModule tenders={tenders} company={activeCompany} onSelectTender={handleSelectTender} onNavigateToWarRoom={(t) => { handleSelectTender(t); handleNavigateSection('war-room'); }} />}
              {currentSection === 'war-room' && currentTender && (
                <TenderWarRoomModule 
                  currentTender={currentTender} 
                  company={activeCompany} 
                  systemMode={systemMode} 
                  onNavigate={handleNavigateSection}
                  onNavigateToMatrix={() => handleNavigateSection('matrix')} 
                  onNavigateToBoQ={() => handleNavigateSection('construction')} 
                  onNavigateToAmcu={() => handleNavigateSection('complaints')} 
                  onNavigateToAudit={() => handleNavigateSection('audit')} 
                  onNavigateToCollusion={() => handleNavigateSection('competitors')} 
                  onNavigateToDocuments={() => handleNavigateSection('documents')}
                />
              )}
              {currentSection === 'post-tender' && <PostTenderModule tenders={tenders} company={activeCompany} onNavigateToAmcu={(t) => { handleSelectTender(t); handleNavigateSection('complaints'); }} />}
              {currentSection === 'services' && <ServicesModelModule />}
              {currentSection === 'matrix' && currentTender && <RequirementMatrixModule currentTender={currentTender} company={activeCompany} onUpdateTenderRequirements={handleUpdateTenderRequirements} onNavigateToAmcu={() => handleNavigateSection('complaints')} onNavigateToVault={() => handleNavigateSection('vault')} />}
              {currentSection === 'vault' && <CompanyProfileModule company={activeCompany} onUpdateCompany={handleUpdateCompany} />}
              {currentSection === 'foultender' && currentTender && <FoulTenderModule key={currentTender.id} currentTender={currentTender} allTenders={tenders} onSelectTender={handleSelectTender} onNavigate={handleNavigateSection} onPrepareComplaintForTender={handleSelectTender} />}
              {currentSection === 'construction' && currentTender && <TenderAIConstructionModule key={currentTender.id} currentTender={currentTender} allTenders={tenders} onSelectTender={handleSelectTender} onNavigate={handleNavigateSection} onUpdateTenderBoq={handleUpdateTenderBoq} onUpdateTenderAnalysis={handleUpdateTenderAnalysis} />}
              {currentSection === 'cost-analysis' && currentTender && <CostEstimateAnalysisModule key={currentTender.id} currentTender={currentTender} onUpdateTenderBoq={handleUpdateTenderBoq} />}
              {currentSection === 'gantt-chart' && currentTender && <GanttChartModule key={currentTender.id} currentTender={currentTender} />}
              {currentSection === 'competitors' && currentTender && <CompetitorCollusionModule key={currentTender.id} currentTender={currentTender} competitors={[]} onNavigateToAmcu={() => handleNavigateSection('complaints')} onUpdateTenderCollusion={handleUpdateTenderCollusion} />}
              {currentSection === 'diff' && currentTender && <VersionDiffModule key={currentTender.id} currentTender={currentTender} onNavigateToAmcu={() => handleNavigateSection('complaints')} />}
              {currentSection === 'audit' && currentTender && <PreSubmissionAuditModule key={currentTender.id} currentTender={currentTender} company={activeCompany} bidPackages={bidPackages} onNavigateToAmcu={() => handleNavigateSection('complaints')} onNavigateToVault={() => handleNavigateSection('vault')} onNavigateToBidPackages={() => handleNavigateSection('bid-packages')} />}
              {currentSection === 'complaints' && currentTender && <AmcuComplaintGenerator key={currentTender.id} currentTender={currentTender} company={activeCompany} complaints={complaints} onAddComplaint={handleAddComplaint} />}
              {currentSection === 'bid-packages' && currentTender && <BidPackageGenerator key={currentTender.id} currentTender={currentTender} company={activeCompany} bidPackages={bidPackages} onAddBidPackage={handleAddBidPackage} />}
              {currentSection === 'multiagent-chat' && currentTender && <MultiAgentChat key={currentTender.id} currentTender={currentTender} />}
              {currentSection === 'catalog' && <TenderCatalog tenders={tenders} onSelectTender={handleSelectTender} onNavigate={handleNavigateSection} onAddNewTender={handleAddNewTender} />}
              {currentSection === 'documents' && currentTender && (
                <DocumentWorkspace 
                  key={currentTender.id}
                  tender={currentTender} 
                  documents={tenderDocuments}
                  onUpload={handleUploadDocuments}
                  onProcessAI={handleProcessDocumentAI}
                  onDelete={handleDeleteDocument}
                />
              )}
            </>
        )}
      </ResponsiveAppShell>

      {/* Global Command Palette (⌘ K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tenders={tenders}
        onSelectTender={handleSelectTender}
        onNavigate={(sec) => handleNavigateSection(sec as string)}
      />
    </>
  );
}
