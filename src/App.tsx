import React, { useState, useEffect } from 'react';
import { AppSection, Tender, BoQItem, MultiAgentReport, AmcuComplaintDoc, BidPackage, CompanyProfile, RequirementItem } from './types';
import { Navbar } from './components/Navbar';
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
import { SystemMode } from './types';
import { useAuth } from './contexts/AuthContext';
import { Bot, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, token, signIn } = useAuth();
  
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
            customerEdrpou: t.detailedData?.customerEdrpou || '00000000',
            customerCity: t.detailedData?.customerCity || 'Київ',
            budgetUah: t.budgetUah || 0,
            deadline: t.detailedData?.deadline || '2024-12-31',
            region: t.detailedData?.region || 'Київ',
            status: t.status || 'ACTIVE',
            category: t.detailedData?.category || 'Будівництво',
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
          setCompanyProfile(data.profile);
        }
      })
      .catch(console.error)
      .finally(() => setDbLoading(false));
    } else {
      // Revert to empty state when logged out (No Mock Data)
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

  // If not logged in, we can either block access or show a demo mode.
  // We'll show a Hero login screen to enforce the use of the DB.
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

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
          >
            <UserIcon className="w-5 h-5" />
            <span>Увійти з Google Workspace</span>
          </button>
          
          <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-800">
            Secure connection via Google Cloud SQL & Firebase Auth
          </div>
        </div>
      </div>
    );
  }

  // Update BoQ for tender
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

  // Update Multi-Agent Analysis Report for tender
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

  // Update Requirements Matrix for tender
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

  // Add new complaint
  const handleAddComplaint = (complaint: AmcuComplaintDoc) => {
    setComplaints(prev => [complaint, ...prev]);
  };

  // Add new bid package
  const handleAddBidPackage = (pkg: BidPackage) => {
    setBidPackages(prev => [pkg, ...prev]);
  };

  // Add custom tender
  const handleAddNewTender = (newTender: Tender) => {
    setTenders(prev => [newTender, ...prev]);
    setCurrentTender(newTender);
  };

  const defaultCompany: CompanyProfile = {
    id: 'comp-default',
    name: 'ТОВ «Учасник закупівель»',
    shortName: 'Учасник закупівель',
    edrpou: '00000000',
    kved: '41.20 Будівництво житлових і нежитлових будівель',
    taxNumber: '000000000000',
    legalAddress: 'Україна, м. Київ',
    actualAddress: 'Україна, м. Київ',
    directorName: 'Уповноважена особа',
    directorPosition: 'Генеральний директор',
    directorBasis: 'Статут',
    iban: 'UA000000000000000000000000000',
    bankName: 'АТ КБ ПРИВАТБАНК',
    mfo: '300711',
    email: 'info@company.com',
    phone: '+380440000000',
    isVatPayer: true,
    licenses: ['Ліцензія ДІАМ СС2/СС3'],
    equipment: [],
    staff: [],
    contracts: [],
    vaultDocuments: []
  };

  const activeCompany = companyProfile || defaultCompany;
  const highRiskCount = tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
  const requiresTender = ['war-room', 'matrix', 'foultender', 'construction', 'competitors', 'diff', 'audit', 'complaints', 'bid-packages', 'multiagent-chat'].includes(currentSection);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setCurrentSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeTenderCount={tenders.length}
        highRiskCount={highRiskCount}
      />

      {/* Mode Selector Sub-bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-medium">Режим інтерфейсу:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800">
              <button
                onClick={() => setSystemMode('SOLO')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  systemMode === 'SOLO'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👤 SOLO (Власник / Тендерник)
              </button>
              <button
                onClick={() => setSystemMode('TEAM')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  systemMode === 'TEAM'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👥 TEAM (Команда: Директор • Юрист • Кошторисник)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>Активна компанія: <strong className="text-white">{activeCompany.shortName}</strong> (ЄДРПОУ {activeCompany.edrpou})</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-emerald-400 font-medium">Ліцензії: СС2 / СС3 (ДІАМ)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentTender && requiresTender ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 my-12 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Тендер не обрано</h3>
            <p className="text-sm text-slate-400">
              Для роботи з цим інструментом оберіть закупівлю з каталогу або скористайтеся AI Радаром для пошуку та імпорту торгів з Prozorro.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentSection('catalog')}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Відкрити Каталог
              </button>
              <button
                onClick={() => setCurrentSection('radar')}
                className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
              >
                AI Радар Пошуку
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentSection === 'dashboard' && (
              <DashboardView
                tenders={tenders}
                onSelectTender={(t) => setCurrentTender(t)}
                onNavigate={(sec) => {
                  setCurrentSection(sec);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'analytics' && (
              <AnalyticsDashboard tenders={tenders} />
            )}

            {currentSection === 'radar' && (
              <TenderRadarModule
                tenders={tenders}
                company={activeCompany}
                onSelectTender={(t) => setCurrentTender(t)}
                onNavigateToWarRoom={(t) => {
                  setCurrentTender(t);
                  setCurrentSection('war-room');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'war-room' && currentTender && (
              <TenderWarRoomModule
                currentTender={currentTender}
                company={activeCompany}
                systemMode={systemMode}
                onNavigateToMatrix={() => {
                  setCurrentSection('matrix');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToBoQ={() => {
                  setCurrentSection('construction');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToAmcu={() => {
                  setCurrentSection('complaints');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToAudit={() => {
                  setCurrentSection('audit');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToCollusion={() => {
                  setCurrentSection('competitors');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'post-tender' && (
              <PostTenderModule
                tenders={tenders}
                company={activeCompany}
                onNavigateToAmcu={(t) => {
                  setCurrentTender(t);
                  setCurrentSection('complaints');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'services' && (
              <ServicesModelModule />
            )}

            {currentSection === 'matrix' && currentTender && (
              <RequirementMatrixModule
                currentTender={currentTender}
                company={activeCompany}
                onUpdateTenderRequirements={handleUpdateTenderRequirements}
                onNavigateToAmcu={() => {
                  setCurrentSection('complaints');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToVault={() => {
                  setCurrentSection('vault');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'vault' && (
              <CompanyVaultModule
                company={activeCompany}
                onUpdateCompany={setCompanyProfile}
              />
            )}

            {currentSection === 'foultender' && currentTender && (
              <FoulTenderModule
                currentTender={currentTender}
                allTenders={tenders}
                onSelectTender={(t) => setCurrentTender(t)}
                onNavigate={(sec) => {
                  setCurrentSection(sec);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPrepareComplaintForTender={(t) => setCurrentTender(t)}
              />
            )}

            {currentSection === 'construction' && currentTender && (
              <TenderAIConstructionModule
                currentTender={currentTender}
                allTenders={tenders}
                onSelectTender={(t) => setCurrentTender(t)}
                onNavigate={(sec) => {
                  setCurrentSection(sec);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onUpdateTenderBoq={handleUpdateTenderBoq}
                onUpdateTenderAnalysis={handleUpdateTenderAnalysis}
              />
            )}

            {currentSection === 'competitors' && currentTender && (
              <CompetitorCollusionModule
                currentTender={currentTender}
                competitors={[]}
                onNavigateToAmcu={() => {
                  setCurrentSection('complaints');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'diff' && currentTender && (
              <VersionDiffModule
                currentTender={currentTender}
                onNavigateToAmcu={() => {
                  setCurrentSection('complaints');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'audit' && currentTender && (
              <PreSubmissionAuditModule
                currentTender={currentTender}
                company={activeCompany}
                bidPackages={bidPackages}
                onNavigateToAmcu={() => {
                  setCurrentSection('complaints');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToVault={() => {
                  setCurrentSection('vault');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToBidPackages={() => {
                  setCurrentSection('bid-packages');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentSection === 'complaints' && currentTender && (
              <AmcuComplaintGenerator
                currentTender={currentTender}
                company={activeCompany}
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
              />
            )}

            {currentSection === 'bid-packages' && currentTender && (
              <BidPackageGenerator
                currentTender={currentTender}
                company={activeCompany}
                bidPackages={bidPackages}
                onAddBidPackage={handleAddBidPackage}
              />
            )}

            {currentSection === 'multiagent-chat' && currentTender && (
              <MultiAgentChat
                currentTender={currentTender}
              />
            )}

            {currentSection === 'catalog' && (
              <TenderCatalog
                tenders={tenders}
                onSelectTender={(t) => setCurrentTender(t)}
                onNavigate={(sec) => {
                  setCurrentSection(sec);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onAddNewTender={handleAddNewTender}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>TenderAI & FoulTender Enterprise Platform</strong> • Повний цикл підготовки, аналітики, перевірки та антикорупційного захисту пропозицій
          </div>
          <div className="text-slate-600">
            Powered by Gemini AI Multi-Agent & Evidence-First Matrix • Prozorro / АМКУ
          </div>
        </div>
      </footer>

    </div>
  );
}
