import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LICENSES_PATH = path.join(ROOT, 'src/config/licenses/assets-licenses.json');
const ENTITY_SOURCES_PATH = path.join(
  ROOT,
  'src/assets/manifests/entity-animation-sources.json',
);
const SYNC_ROOT = path.join(ROOT, '.cache', 'asset-sync');
const SNAPSHOT_ROOT = path.join(SYNC_ROOT, 'snapshot');
const ENTITY_SOURCE_ROOT = path.join(SYNC_ROOT, 'sources', 'entities');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const toRelativePosix = (absolutePath) => path.relative(ROOT, absolutePath).replace(/\\/g, '/');

const unique = (values) => Array.from(new Set(values));

const downloadEntitySources = async (sources) => {
  ensureDir(ENTITY_SOURCE_ROOT);
  const downloaded = [];
  for (const source of sources) {
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Failed to download entity source "${source.id}" from ${source.url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const targetPath = path.join(ENTITY_SOURCE_ROOT, `${source.id}-sheet.png`);
    fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
    downloaded.push({
      id: source.id,
      url: source.url,
      localPath: toRelativePosix(targetPath),
      bytes: fs.statSync(targetPath).size,
    });
  }
  return downloaded;
};

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
if (!fs.existsSync(ENTITY_SOURCES_PATH)) {
  throw new Error(`Missing entity sources file: ${toRelativePosix(ENTITY_SOURCES_PATH)}`);
}

const records = JSON.parse(fs.readFileSync(LICENSES_PATH, 'utf8'));
if (!Array.isArray(records)) {
  throw new Error('assets-licenses.json must be an array');
}
const entitySourcesManifest = JSON.parse(fs.readFileSync(ENTITY_SOURCES_PATH, 'utf8'));
if (!Array.isArray(entitySourcesManifest.sources)) {
  throw new Error('entity-animation-sources.json must include a "sources" array');
}

ensureDir(SYNC_ROOT);
ensureDir(SNAPSHOT_ROOT);
ensureDir(ENTITY_SOURCE_ROOT);

for (const record of records) {
  const sourceFile = path.join(ROOT, record.localPath);
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Missing asset file for sync: ${record.localPath}`);
  }
  const snapshotFile = path.join(SNAPSHOT_ROOT, record.localPath.replace(/^public\/assets\//, ''));
  ensureDir(path.dirname(snapshotFile));
  fs.copyFileSync(sourceFile, snapshotFile);
}

const downloadedEntitySources = await downloadEntitySources(entitySourcesManifest.sources);
const sourceUrls = unique([
  ...records.map((record) => record.url).filter(Boolean),
  ...entitySourcesManifest.sources.map((source) => source.url).filter(Boolean),
]);
const sourceStatus = await checkSourceReachability(sourceUrls);

const report = {
  generatedAt: new Date().toISOString(),
  filesSnapshotted: records.length,
  entitySourcesDownloaded: downloadedEntitySources,
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
