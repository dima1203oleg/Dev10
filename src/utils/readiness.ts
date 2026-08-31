export interface ReadinessInput {
  tender: Record<string, any>;
  companyProfile: Record<string, any>;
  bidPackage: Record<string, any>;
}

export function calculatePreSubmissionReadiness({ tender, companyProfile, bidPackage }: ReadinessInput) {
  const documents = Array.isArray(bidPackage.documents) ? bidPackage.documents : [];
  const requirements = Array.isArray(bidPackage.requirements) ? bidPackage.requirements : [];
  const boq = Array.isArray(bidPackage.boqItems) ? bidPackage.boqItems : [];
  const checks = [
    { id: 'documentsVault', title: 'Документи пакета', weight: 30, passed: documents.length > 0 && documents.every((doc: any) => doc?.contentHash && doc?.status !== 'ERROR'), detail: `${documents.length} документів із перевірюваними hash/status` },
    { id: 'qualificationArt16', title: 'Кваліфікаційні вимоги', weight: 20, passed: requirements.length > 0 && requirements.every((item: any) => ['PASS', 'NOT_APPLICABLE'].includes(item?.status)), detail: `${requirements.length} вимог перевірено` },
    { id: 'costAndBoQ', title: 'Кошторис і BoQ', weight: 20, passed: boq.length > 0 && boq.every((item: any) => Number.isFinite(Number(item?.quantity)) && Number.isFinite(Number(item?.unitPriceUah))), detail: `${boq.length} кошторисних позицій` },
    { id: 'legalDraftContract', title: 'Проєкт договору', weight: 15, passed: Boolean(bidPackage.contractDocumentHash), detail: bidPackage.contractDocumentHash ? 'Hash договору присутній' : 'Hash договору відсутній' },
    { id: 'technicalSpecs', title: 'Технічна специфікація', weight: 15, passed: Boolean(tender.technicalSpecificationHash), detail: tender.technicalSpecificationHash ? 'Hash технічної специфікації присутній' : 'Hash технічної специфікації відсутній' },
  ];
  const totalScore = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  return {
    formulaVersion: 'pre-submission-v1',
    totalScore,
    readyToSubmit: checks.every((check) => check.passed),
    categories: Object.fromEntries(checks.map((check) => [check.id, check.passed ? 100 : 0])),
    criticalChecklist: checks.map((check) => ({ ...check, severity: check.passed ? 'INFO' : 'BLOCKING' })),
    provenance: { tenderId: tender.id || tender.tenderNumber || null, companyEdrpou: companyProfile.edrpou || null },
  };
}
