import { describe, expect, it } from 'vitest';
import { calculatePreSubmissionReadiness } from './readiness.ts';

describe('pre-submission readiness', () => {
  it('never treats missing evidence as zero-risk readiness', () => {
    const result = calculatePreSubmissionReadiness({ tender: {}, companyProfile: {}, bidPackage: {} });
    expect(result.readyToSubmit).toBe(false);
    expect(result.totalScore).toBe(0);
    expect(result.criticalChecklist.every((check) => check.severity === 'BLOCKING')).toBe(true);
  });

  it('derives a reproducible score only from supplied evidence', () => {
    const input = {
      tender: { id: 'real-source-id', technicalSpecificationHash: 'a'.repeat(64) },
      companyProfile: { edrpou: '12345678' },
      bidPackage: {
        documents: [{ contentHash: 'b'.repeat(64), status: 'EXTRACTED' }],
        requirements: [{ status: 'PASS' }, { status: 'NOT_APPLICABLE' }],
        boqItems: [{ quantity: 2, unitPriceUah: 10 }],
        contractDocumentHash: 'c'.repeat(64),
      },
    };
    expect(calculatePreSubmissionReadiness(input)).toMatchObject({ totalScore: 100, readyToSubmit: true, formulaVersion: 'pre-submission-v1' });
    expect(calculatePreSubmissionReadiness(input)).toEqual(calculatePreSubmissionReadiness(input));
  });
});
