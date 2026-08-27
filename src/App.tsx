import React, { useState, useEffect } from 'react';
import { AppSection, Tender, BoQItem, MultiAgentReport, AmcuComplaintDoc, BidPackage, CompanyProfile, RequirementItem } from './types';
import { INITIAL_TENDERS, INITIAL_COMPLAINTS, INITIAL_BID_PACKAGES, INITIAL_COMPANY_PROFILE, INITIAL_COMPETITORS } from './data/mockTenders';
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
import { SystemMode } from './types';

export default function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>('dashboard');
  const [systemMode, setSystemMode] = useState<SystemMode>('TEAM');
  
  const [tenders, setTenders] = useState<Tender[]>(() => {
    const saved = localStorage.getItem('tenderai_foultender_tenders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TENDERS;
  });

  const [currentTender, setCurrentTender] = useState<Tender>(tenders[0]);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('tenderai_foultender_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMPANY_PROFILE;
  });
  
  const [complaints, setComplaints] = useState<AmcuComplaintDoc[]>(() => {
    const saved = localStorage.getItem('tenderai_foultender_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [bidPackages, setBidPackages] = useState<BidPackage[]>(() => {
    const saved = localStorage.getItem('tenderai_foultender_bids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BID_PACKAGES;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('tenderai_foultender_tenders', JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem('tenderai_foultender_company', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('tenderai_foultender_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('tenderai_foultender_bids', JSON.stringify(bidPackages));
  }, [bidPackages]);

  // Update BoQ for tender
  const handleUpdateTenderBoq = (tenderId: string, boqItems: BoQItem[]) => {
    setTenders(prev => prev.map(t => {
      if (t.id === tenderId) {
        return { ...t, boqItems };
      }
      return t;
    }));
    if (currentTender.id === tenderId) {
      setCurrentTender(prev => ({ ...prev, boqItems }));
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
    if (currentTender.id === tenderId) {
      setCurrentTender(prev => ({ ...prev, multiAgentAnalysis: report }));
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
    if (currentTender.id === tenderId) {
      setCurrentTender(prev => ({ ...prev, requirements }));
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

  const highRiskCount = tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;

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
            <span>Активна компанія: <strong className="text-white">{companyProfile.shortName}</strong> (ЄДРПОУ {companyProfile.edrpou})</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-emerald-400 font-medium">Ліцензії: СС2 / СС3 (ДІАМ)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {currentSection === 'radar' && (
          <TenderRadarModule
            tenders={tenders}
            company={companyProfile}
            onSelectTender={(t) => setCurrentTender(t)}
            onNavigateToWarRoom={(t) => {
              setCurrentTender(t);
              setCurrentSection('war-room');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentSection === 'war-room' && (
          <TenderWarRoomModule
            currentTender={currentTender}
            company={companyProfile}
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
            company={companyProfile}
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

        {currentSection === 'matrix' && (
          <RequirementMatrixModule
            currentTender={currentTender}
            company={companyProfile}
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
            company={companyProfile}
            onUpdateCompany={setCompanyProfile}
          />
        )}

        {currentSection === 'foultender' && (
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

        {currentSection === 'construction' && (
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

        {currentSection === 'competitors' && (
          <CompetitorCollusionModule
            currentTender={currentTender}
            competitors={INITIAL_COMPETITORS}
            onNavigateToAmcu={() => {
              setCurrentSection('complaints');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentSection === 'diff' && (
          <VersionDiffModule
            currentTender={currentTender}
            onNavigateToAmcu={() => {
              setCurrentSection('complaints');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentSection === 'audit' && (
          <PreSubmissionAuditModule
            currentTender={currentTender}
            company={companyProfile}
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

        {currentSection === 'complaints' && (
          <AmcuComplaintGenerator
            currentTender={currentTender}
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
          />
        )}

        {currentSection === 'bid-packages' && (
          <BidPackageGenerator
            currentTender={currentTender}
            bidPackages={bidPackages}
            onAddBidPackage={handleAddBidPackage}
          />
        )}

        {currentSection === 'multiagent-chat' && (
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
