import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function collectRuntimeFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return collectRuntimeFiles(fullPath);
    if (!/\.(ts|tsx)$/.test(entry.name) || /(?:\.test\.|TestRunner|testRunner)/.test(entry.name)) return [];
    return [fullPath];
  });
}

describe('zero mock runtime gate', () => {
  it('rejects known fabricated records and random business values', () => {
    const files = ['server.ts', ...collectRuntimeFiles('src')];
    const forbidden = [
      /Math\.random\s*\(/,
      /UA-2026-08-28-009123/,
      /tender@procurement\.gov\.ua/,
      /вул\. Хрещатик, 22/,
      /Департамент тендерних торгів/,
      /fitScore:\s*matchResult\.fitScore\s*\?\?/,
      /status:\s*overallPass\s*\?\s*["']PRODUCTION_READY["']/,
    ];
    const violations = files.flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return forbidden.filter((pattern) => pattern.test(source)).map((pattern) => `${file}: ${pattern}`);
    });
    expect(violations).toEqual([]);
  });
});
