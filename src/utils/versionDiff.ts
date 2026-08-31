import crypto from 'node:crypto';

function normalizeLines(text: string) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function createEvidenceDiff(tenderId: string, previousText: string, currentText: string) {
  const previousLines = normalizeLines(previousText);
  const currentLines = normalizeLines(currentText);
  const previousSet = new Set(previousLines);
  const currentSet = new Set(currentLines);
  const changes = [
    ...previousLines.filter((line) => !currentSet.has(line)).map((line) => ({ type: 'REMOVED' as const, oldValue: line, newValue: null })),
    ...currentLines.filter((line) => !previousSet.has(line)).map((line) => ({ type: 'ADDED' as const, oldValue: null, newValue: line })),
  ].map((change, index) => ({
    id: `diff-${index + 1}`,
    ...change,
    riskImpact: 'UNKNOWN' as const,
    commentary: 'Risk requires a separate evidence-backed legal review.',
  }));
  return {
    tenderId,
    formulaVersion: 'line-diff-v1',
    previousHash: crypto.createHash('sha256').update(previousText).digest('hex'),
    currentHash: crypto.createHash('sha256').update(currentText).digest('hex'),
    changesCount: changes.length,
    changes,
  };
}
