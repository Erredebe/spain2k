import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import licenses from '../config/licenses/assets-licenses.json';
import type { AssetLicenseRecord } from '../config/types';
import { describe, expect, it } from 'vitest';

const records = licenses as AssetLicenseRecord[];
const root = process.cwd();
const assetsRoot = path.join(root, 'public', 'assets');

const walkFiles = (dir: string): string[] => {
  const output: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...walkFiles(absolute));
      continue;
    }
    output.push(path.relative(root, absolute).replace(/\\/g, '/'));
  }
  return output;
};

const hashFile = (relativePath: string): string =>
  crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest('hex');

describe('asset license inventory', () => {
  it('covers all versioned runtime assets with legal metadata and checksum', () => {
    const files = walkFiles(assetsRoot).sort();
    const indexed = new Map<string, AssetLicenseRecord>();

    for (const record of records) {
      expect(record.license === 'CC0' || record.license === 'CC-BY').toBe(true);
      expect(record.localPath.startsWith('public/assets/')).toBe(true);
      expect(record.sha256).toMatch(/^[a-f0-9]{64}$/);
      indexed.set(record.localPath, record);
    }

    for (const file of files) {
      const record = indexed.get(file);
      expect(record, `missing license record for ${file}`).toBeDefined();
      if (!record) {
        continue;
      }
      expect(hashFile(file)).toBe(record.sha256);
    }
  });
});
