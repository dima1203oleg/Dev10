import React, { useState, useEffect } from 'react';
import { AppSection, Tender, BoQItem, MultiAgentReport, AmcuComplaintDoc, BidPackage, CompanyProfile, RequirementItem, CollusionAnalysis, SystemMode } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FoulTenderModule } from './components/FoulTenderModule';
import { TenderAIConstructionModule } from './components/TenderAIConstructionModule';
import { AmcuComplaintGenerator } from './components/AmcuComplaintGenerator';
import { BidPackageGenerator } from './components/BidPackageGenerator';
import { MultiAgentChat } from './components/MultiAgentChat';
import { TenderCatalog } from './components/TenderCatalog';
import { CompanyVaultModule } from './components/CompanyVaultModule';
import { RequirementMatrixModule } from './components/RequirementMatrixModule';
import { CompetitorCollusionModule } from './components/CompetitorCollusionModule';
import { VersionDiffModule } from './components/VersionDiffModule';
import { PreSubmissionAuditModule } from './components/PreSubmissionAuditModule';
import { TenderRadarModule } from './components/TenderRadarModule';
import { TenderWarRoomModule } from './components/TenderWarRoomModule';
import { PostTenderModule } from './components/PostTenderModule';
import { ServicesModelModule } from './components/ServicesModelModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { useAuth } from './contexts/AuthContext';
import { Bot, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, token, signIn, signInAsDev } = useAuth();
  
  const [currentSection, setCurrentSection] = useState<AppSection>('dashboard');
  const [systemMode, setSystemMode] = useState<SystemMode>('TEAM');
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [currentTender, setCurrentTender] = useState<Tender | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [complaints, setComplaints] = useState<AmcuComplaintDoc[]>([]);
  const [bidPackages, setBidPackages] = useState<BidPackage[]>([]);
  
  const [dbLoading, setDbLoading] = useState(false);

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
    edrpou: 'PROFILE_NOT_CONFIGURED',
    kved: 'PROFILE_NOT_CONFIGURED',
    taxNumber: 'PROFILE_NOT_CONFIGURED',
    legalAddress: 'PROFILE_NOT_CONFIGURED',
    actualAddress: 'PROFILE_NOT_CONFIGURED',
    directorName: 'PROFILE_NOT_CONFIGURED',
    directorPosition: 'PROFILE_NOT_CONFIGURED',
    directorBasis: 'PROFILE_NOT_CONFIGURED',
    iban: 'PROFILE_NOT_CONFIGURED',
    bankName: 'PROFILE_NOT_CONFIGURED',
    mfo: 'PROFILE_NOT_CONFIGURED',
    email: 'PROFILE_NOT_CONFIGURED',
    phone: 'PROFILE_NOT_CONFIGURED',
    isVatPayer: false,
    licenses: [],
    equipment: [],
    staff: [],
    contracts: [],
    vaultDocuments: []
  };

  const activeCompany = companyProfile || defaultCompany;
  const requiresTender = ['war-room', 'matrix', 'foultender', 'construction', 'competitors', 'diff', 'audit', 'complaints', 'bid-packages', 'multiagent-chat'].includes(currentSection);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-black">
      <Sidebar 
        currentSection={currentSection} 
        onSelectSection={(sec) => {
          setCurrentSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-medium">Режим інтерфейсу:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800">
              <button
                onClick={() => setSystemMode('SOLO')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  systemMode === 'SOLO' ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                SOLO
              </button>
              <button
                onClick={() => setSystemMode('TEAM')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  systemMode === 'TEAM' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                TEAM
              </button>
            </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
                <span>Активна компанія: <strong className="text-white">{activeCompany.shortName}</strong></span>
            </div>
        </div>

        <main className="flex-1 p-8">
            {!currentTender && requiresTender ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 my-12 shadow-xl">
                    <h3 className="text-xl font-bold text-white">Тендер не обрано</h3>
                </div>
            ) : (
                <>
                  {currentSection === 'dashboard' && <DashboardView tenders={tenders} onSelectTender={(t) => setCurrentTender(t)} onNavigate={(sec) => { setCurrentSection(sec); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'analytics' && <AnalyticsDashboard tenders={tenders} />}
                  {currentSection === 'radar' && <TenderRadarModule tenders={tenders} company={activeCompany} onSelectTender={(t) => setCurrentTender(t)} onNavigateToWarRoom={(t) => { setCurrentTender(t); setCurrentSection('war-room'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'war-room' && currentTender && <TenderWarRoomModule currentTender={currentTender} company={activeCompany} systemMode={systemMode} onNavigateToMatrix={() => { setCurrentSection('matrix'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToBoQ={() => { setCurrentSection('construction'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToAmcu={() => { setCurrentSection('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToAudit={() => { setCurrentSection('audit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToCollusion={() => { setCurrentSection('competitors'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'post-tender' && <PostTenderModule tenders={tenders} company={activeCompany} onNavigateToAmcu={(t) => { setCurrentTender(t); setCurrentSection('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'services' && <ServicesModelModule />}
                  {currentSection === 'matrix' && currentTender && <RequirementMatrixModule currentTender={currentTender} company={activeCompany} onUpdateTenderRequirements={handleUpdateTenderRequirements} onNavigateToAmcu={() => { setCurrentSection('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToVault={() => { setCurrentSection('vault'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'vault' && <CompanyVaultModule company={activeCompany} onUpdateCompany={handleUpdateCompany} />}
                  {currentSection === 'foultender' && currentTender && <FoulTenderModule currentTender={currentTender} allTenders={tenders} onSelectTender={(t) => setCurrentTender(t)} onNavigate={(sec) => { setCurrentSection(sec); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onPrepareComplaintForTender={(t) => setCurrentTender(t)} />}
                  {currentSection === 'construction' && currentTender && <TenderAIConstructionModule currentTender={currentTender} allTenders={tenders} onSelectTender={(t) => setCurrentTender(t)} onNavigate={(sec) => { setCurrentSection(sec); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onUpdateTenderBoq={handleUpdateTenderBoq} onUpdateTenderAnalysis={handleUpdateTenderAnalysis} />}
                  {currentSection === 'competitors' && currentTender && <CompetitorCollusionModule currentTender={currentTender} competitors={[]} onNavigateToAmcu={() => { setCurrentSection('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onUpdateTenderCollusion={handleUpdateTenderCollusion} />}
                  {currentSection === 'diff' && currentTender && <VersionDiffModule currentTender={currentTender} onNavigateToAmcu={() => { setCurrentSection('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'audit' && currentTender && <PreSubmissionAuditModule currentTender={currentTender} company={activeCompany} bidPackages={bidPackages} onNavigateToAmcu={() => { setCurrentSection('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToVault={() => { setCurrentSection('vault'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onNavigateToBidPackages={() => { setCurrentSection('bid-packages'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                  {currentSection === 'complaints' && currentTender && <AmcuComplaintGenerator currentTender={currentTender} company={activeCompany} complaints={complaints} onAddComplaint={handleAddComplaint} />}
                  {currentSection === 'bid-packages' && currentTender && <BidPackageGenerator currentTender={currentTender} company={activeCompany} bidPackages={bidPackages} onAddBidPackage={handleAddBidPackage} />}
                  {currentSection === 'multiagent-chat' && currentTender && <MultiAgentChat currentTender={currentTender} />}
                  {currentSection === 'catalog' && <TenderCatalog tenders={tenders} onSelectTender={(t) => setCurrentTender(t)} onNavigate={(sec) => { setCurrentSection(sec); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onAddNewTender={handleAddNewTender} />}
                </>
            )}
        </main>
      </div>
    </div>
  );
}
