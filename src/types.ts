export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DecisionType = 'GO' | 'GO_WITH_CONDITIONS' | 'NO_GO';
export type SystemMode = 'SOLO' | 'TEAM';
export type EvidenceStatus = 'VERIFIED' | 'INFERRED' | 'CALCULATED' | 'UNKNOWN' | 'CONTRADICTED';
export type BidDecision = 'BID' | 'BID_WITH_CONDITIONS' | 'NO_BID';

export type AppSection = 
  | 'dashboard' 
  | 'radar'
  | 'war-room'
  | 'foultender' 
  | 'construction' 
  | 'matrix'
  | 'vault'
  | 'competitors'
  | 'diff'
  | 'audit'
  | 'post-tender'
  | 'catalog' 
  | 'multiagent-chat' 
  | 'complaints' 
  | 'bid-packages'
  | 'services'
  | 'analytics';

export interface BoQItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  standardPriceUah: number;
  marketPriceUah: number;
  laborHours: number;
  anomaly?: 'OVERPRICED' | 'UNDERESTIMATED' | 'NORMAL' | 'SUSPICIOUS_SPEC';
  notes?: string;
}

export interface Violation {
  id: string;
  type: 'DISCRIMINATORY_REQUIREMENT' | 'UNREALISTIC_TIMELINE' | 'PRICING_ANOMALY' | 'COLLUSION_RISK' | 'TECHNICAL_LOCKIN';
  severity: RiskLevel;
  title: string;
  description: string;
  legalBasis: string;
  amcuPrecedent?: string;
  affectedClause?: string;
}

export interface AmcuAppealRecommendation {
  recommended: boolean;
  winProbabilityPercent?: number;
  prospectsText?: string;
  appealGrounds: string;
  estimatedAmcuFeeUah: number;
}

export interface AgentReport {
  agentName: string;
  avatar: string;
  status: 'APPROVED' | 'PASSED_WITH_WARNINGS' | 'REJECTED' | 'RECOMMENDED' | 'NOT_RECOMMENDED';
  summary: string;
  recommendations?: string[];
  costBreakdown?: {
    materialsCost: number;
    laborCost: number;
    machineryCost: number;
    overheadsAndTaxes: number;
  };
  timelineWeeks?: number;
  keyRisks?: string[];
  complianceScore?: number;
  requiredCertificates?: string[];
  corruptionRiskScore?: number;
  recommendedBidPrice?: number;
  winProbability?: number;
}

export interface MultiAgentReport {
  overallDecision: DecisionType;
  totalCalculatedCost: number;
  expectedMarginPercent: number;
  agents: {
    estimator: AgentReport;
    techLead: AgentReport;
    legalCounsel: AgentReport;
    antiFraud: AgentReport;
    bidManager: AgentReport;
  };
}

export interface RequirementItem {
  id: string;
  category: 'QUALIFICATION_ART16' | 'TECHNICAL_SPEC' | 'LEGAL_CONTRACT' | 'FINANCIAL_GUARANTEE' | 'ANTI_CORRUPTION_ART17';
  title: string;
  clauseInTenderDoc: string;
  exactQuote: string;
  status: 'COVERED' | 'WARNING' | 'GAP_MISSING' | 'UNKNOWN';
  matchingDocName?: string;
  matchingDocId?: string;
  explanation: string;
  actionRequired?: string;
  evidenceStatus?: EvidenceStatus;
}

// 3-State Resource Model: De Jure vs De Facto vs Acquirable
export interface ResourceAuditItem {
  id: string;
  resourceName: string;
  category: 'STAFF' | 'EQUIPMENT' | 'FINANCIAL' | 'EXPERIENCE' | 'CERTIFICATES';
  tenderRequirement: string;
  deJureStatus: 'COMPLIANT' | 'ACQUIRABLE_DOC' | 'NON_COMPLIANT';
  deJureNote: string;
  deFactoStatus: 'IN_HOUSE' | 'PARTIAL' | 'NOT_PRESENT';
  deFactoNote: string;
  acquirablePlan: string;
  costToAcquireUah: number;
  timeToAcquireDays: number;
  evidenceStatus: EvidenceStatus;
}

// Multi-Factor Opportunity Score
export interface OpportunityScoreBreakdown {
  overallScore: number; // 0 - 100
  bidDecision: BidDecision;
  bidDecisionReason: string;
  factors: {
    companyFit: number;          // 0 - 100
    legalFit: number;            // 0 - 100
    docReadiness: number;        // 0 - 100
    financialFeasibility: number;// 0 - 100
    competitionScore: number;    // 0 - 100
    historicalWinProb: number;   // 0 - 100
    executionFeasibility: number;// 0 - 100
    riskPenalty: number;         // 0 - 100
  };
  whyThisTender: {
    icon: string;
    title: string;
    description: string;
    type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
  }[];
}

// Price Strategy Scenarios
export interface PriceStrategyScenario {
  id: 'CONSERVATIVE' | 'COMPETITIVE' | 'AGGRESSIVE';
  name: string;
  tagline: string;
  priceUah: number;
  discountPercent: number;
  estimatedMarginUah: number;
  estimatedMarginPercent: number;
  winProbabilityPercent: number;
  riskDescription: string;
  historicalDiscountContext: string;
}

// Gantt / Execution Feasibility Task
export interface GanttFeasibilityTask {
  id: string;
  title: string;
  category: string;
  startWeek: number;
  durationWeeks: number;
  crewNeeded: number;
  machineryNeeded: string[];
  criticalPath: boolean;
  feasibleWithCurrentResources: boolean;
  gapSolution?: string;
}

// Action Plan & Deadline Intelligence
export interface ActionTask {
  id: string;
  title: string;
  description: string;
  category: 'DOCUMENT' | 'LEGAL' | 'ESTIMATE' | 'SIGNATURE' | 'MANAGEMENT';
  assigneeRole: 'SOLO_USER' | 'LAWYER' | 'ESTIMATOR' | 'ACCOUNTANT' | 'DIRECTOR' | 'ENGINEER';
  priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
  deadlineHoursRemaining: number;
  requiredDocumentName?: string;
  riskIfSkipped: string;
  isCompleted: boolean;
}

// Post-Tender Intelligence & Disqualification Database
export interface PostTenderAnalysis {
  tenderId: string;
  outcome: 'WON' | 'LOST' | 'DISQUALIFIED' | 'IN_REVIEW';
  winnerName?: string;
  winningPriceUah?: number;
  userBidPriceUah?: number;
  priceDifferenceUah?: number;
  disqualificationReason?: string;
  rootCauseCategory: 'PRICE' | 'DOC_DEFECT' | 'ESTIMATE_ERROR' | 'QUALIFICATION_DISPUTE' | 'COMPETITOR_DUMPING' | 'NONE';
  repeatedMistakeWarning?: string;
  bidDefenseScore: number; // 0 - 100
  appealViability: {
    recommended: boolean;
    winChancePercent: number;
    strongPoints: string[];
    weakPoints: string[];
    neededEvidence: string[];
    amcuProjectDraftAvailable: boolean;
  };
}

export interface VersionChangeItem {
  id: string;
  type: 'ADDED' | 'REMOVED' | 'MODIFIED';
  category: string;
  clause: string;
  oldValue?: string;
  newValue?: string;
  riskImpact: 'INCREASED_RISK' | 'DECREASED_RISK' | 'NEUTRAL' | 'CRITICAL_TRAP';
  aiCommentary: string;
}

export interface TenderVersionDiff {
  tenderId: string;
  previousVersion: string;
  currentVersion: string;
  changesCount: number;
  summary: string;
  changes: VersionChangeItem[];
}

export interface CompetitorProfile {
  id: string;
  name: string;
  edrpou: string;
  winRatePercent: number;
  totalTenders: number;
  avgPriceDropPercent: number;
  disqualificationRatePercent: number;
  suspiciousPairingsCount: number;
  frequentPartners: string[];
  riskIndicators: string[];
}

export interface CollusionAnalysis {
  tenderId: string;
  collusionRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  primarySuspects: string[];
  anomaliesDetected: {
    title: string;
    description: string;
    evidence: string;
    status?: EvidenceStatus;
  }[];
  coBiddingGraph: {
    source: string;
    target: string;
    sharedTenders: number;
    winDistribution: string;
  }[];
}

export interface PreSubmissionReadinessScore {
  totalScore: number; // 0 - 100
  readyToSubmit: boolean;
  categories: {
    documentsVault: number;
    qualificationArt16: number;
    costAndBoQ: number;
    legalDraftContract: number;
    technicalSpecs: number;
  };
  criticalChecklist: {
    id: string;
    title: string;
    passed: boolean;
    severity: 'BLOCKING' | 'WARNING' | 'INFO';
    detail: string;
  }[];
}

export interface Tender {
  id: string;
  tenderNumber: string; // e.g. UA-2024-09-14-002194-a
  title: string;
  customer: string;
  customerEdrpou: string;
  customerCity: string;
  budgetUah: number;
  deadline: string;
  region: string;
  status: 'ACTIVE' | 'AUDIT_FLAGGED' | 'BID_IN_PREPARATION' | 'COMPLETED' | 'AMCU_FILED';
  category: string;
  dk021Code?: string;
  foulScore: number; // 0 - 100
  riskLevel: RiskLevel;
  summary: string;
  tenderText?: string;
  specifications?: string;
  boqItems: BoQItem[];
  violations: Violation[];
  requirements?: RequirementItem[];
  resourceAudit?: ResourceAuditItem[];
  opportunityScore?: OpportunityScoreBreakdown;
  priceScenarios?: PriceStrategyScenario[];
  ganttTasks?: GanttFeasibilityTask[];
  actionPlan?: ActionTask[];
  postTenderAnalysis?: PostTenderAnalysis;
  versionDiff?: TenderVersionDiff;
  collusionAnalysis?: CollusionAnalysis;
  readinessScore?: PreSubmissionReadinessScore;
  amcuAppealRecommendation?: AmcuAppealRecommendation;
  multiAgentAnalysis?: MultiAgentReport;
  createdDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentRole?: 'ESTIMATOR' | 'TECH_LEAD' | 'LEGAL' | 'FOULTENDER' | 'BID_MANAGER' | 'CONSILIUM' | 'ORCHESTRATOR' | 'QA';
  agentName?: string;
  agentAvatar?: string;
  text: string;
  timestamp: string;
}

export interface AmcuComplaintDoc {
  id: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  customer: string;
  complainantName: string;
  complainantEdrpou: string;
  content: string;
  legalReferences: string[];
  estimatedFee: number;
  status: 'DRAFT' | 'READY_FOR_SUBMISSION' | 'SUBMITTED';
  createdAt: string;
}

export interface BidPackage {
  id: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  companyName: string;
  calculatedPrice: number;
  marginPercent: number;
  timelineDays: number;
  documents: {
    name: string;
    type: string;
    ready: boolean;
    contentPreview: string;
  }[];
  status: 'IN_PROGRESS' | 'READY_TO_SUBMIT';
  updatedAt: string;
}

// Company Profile & Smart Vault (Digital Twin)
export interface EquipmentItem {
  id: string;
  name: string;
  model: string;
  ownership: 'OWNED' | 'RENTED' | 'LEASED';
  docNumber: string; // свідоцтво про реєстрацію / договір оренди
  expiryDate?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface StaffMember {
  id: string;
  fullName: string;
  position: string;
  education: string;
  experienceYears: number;
  certificates: string[];
  employmentType: 'PRIMARY' | 'PART_TIME' | 'GPC_CONTRACT';
  safetyCertExpiry?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface ExperienceContract {
  id: string;
  customerName: string;
  subjectOfProcurement: string;
  contractNumber: string;
  contractDate: string;
  amountUah: number;
  actsKb2vUploaded: boolean;
  feedbackLetterUploaded: boolean;
  contactPerson: string;
  phone: string;
}

export interface VaultDocument {
  id: string;
  title: string;
  category: 'EQUIPMENT' | 'STAFF' | 'ANALOGOUS_CONTRACTS' | 'LICENSES_PERMITS' | 'FINANCIAL_LEGAL' | 'ISO_CERTIFICATES';
  fileNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuer: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  tags: string[];
  fileSize: string;
  downloadUrl?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  shortName: string;
  edrpou: string;
  kved: string;
  taxNumber: string;
  legalAddress: string;
  actualAddress: string;
  directorName: string;
  directorPosition: string;
  directorBasis: string; // Статут / Довіреність
  iban: string;
  bankName: string;
  mfo: string;
  email: string;
  phone: string;
  isVatPayer: boolean;
  licenses: string[];
  equipment: EquipmentItem[];
  staff: StaffMember[];
  contracts: ExperienceContract[];
  vaultDocuments: VaultDocument[];
  historicalStats?: {
    totalParticipated: number;
    wonCount: number;
    lostCount: number;
    disqualifiedCount: number;
    totalWonAmountUah: number;
  };
}

