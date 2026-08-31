import { describe, expect, it } from 'vitest';
import { createEvidenceDiff } from './versionDiff.ts';

describe('evidence version diff', () => {
  it('reports exact added and removed lines with hashes', () => {
    const result = createEvidenceDiff('tender-1', 'same\nold', 'same\nnew');
    expect(result.changes).toEqual([
      expect.objectContaining({ type: 'REMOVED', oldValue: 'old', riskImpact: 'UNKNOWN' }),
      expect.objectContaining({ type: 'ADDED', newValue: 'new', riskImpact: 'UNKNOWN' }),
    ]);
    expect(result.previousHash).toHaveLength(64);
    expect(result.changesCount).toBe(2);
  });
});
