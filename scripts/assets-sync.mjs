import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LICENSES_PATH = path.join(ROOT, 'src/config/licenses/assets-licenses.json');
const SYNC_ROOT = path.join(ROOT, '.cache', 'asset-sync');
const SNAPSHOT_ROOT = path.join(SYNC_ROOT, 'snapshot');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const toRelativePosix = (absolutePath) => path.relative(ROOT, absolutePath).replace(/\\/g, '/');

const unique = (values) => Array.from(new Set(values));

const checkSourceReachability = async (urls) => {
  const results = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      results.push({ url, ok: response.ok, status: response.status });
      continue;
    } catch {
      // Some endpoints reject HEAD; fallback to GET.
    }
    try {
      const response = await fetch(url, { method: 'GET' });
      results.push({ url, ok: response.ok, status: response.status });
    } catch (error) {
      results.push({ url, ok: false, status: -1, error: String(error) });
    }
  }
  return results;
};

if (!fs.existsSync(LICENSES_PATH)) {
  throw new Error(`Missing licenses file: ${toRelativePosix(LICENSES_PATH)}`);
}

const records = JSON.parse(fs.readFileSync(LICENSES_PATH, 'utf8'));
if (!Array.isArray(records)) {
  throw new Error('assets-licenses.json must be an array');
}

ensureDir(SYNC_ROOT);
ensureDir(SNAPSHOT_ROOT);

for (const record of records) {
  const sourceFile = path.join(ROOT, record.localPath);
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Missing asset file for sync: ${record.localPath}`);
  }
  const snapshotFile = path.join(SNAPSHOT_ROOT, record.localPath.replace(/^public\/assets\//, ''));
  ensureDir(path.dirname(snapshotFile));
  fs.copyFileSync(sourceFile, snapshotFile);
}

const sourceUrls = unique(records.map((record) => record.url).filter(Boolean));
const sourceStatus = await checkSourceReachability(sourceUrls);

const report = {
  generatedAt: new Date().toISOString(),
  filesSnapshotted: records.length,
  sourceUrlsChecked: sourceStatus.length,
  unreachable: sourceStatus.filter((item) => !item.ok),
  sourceStatus,
};

const reportPath = path.join(SYNC_ROOT, 'report.json');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

const unreachable = report.unreachable.length;
if (unreachable > 0) {
  console.warn(`assets:sync completed with ${unreachable} unreachable source URL(s).`);
} else {
  console.log('assets:sync completed with all source URLs reachable.');
}
console.log(`Snapshot: ${toRelativePosix(SNAPSHOT_ROOT)}`);
console.log(`Report: ${toRelativePosix(reportPath)}`);
