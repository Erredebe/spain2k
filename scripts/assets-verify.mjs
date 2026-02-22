import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LICENSES_PATH = path.join(ROOT, 'src/config/licenses/assets-licenses.json');
const ASSETS_ROOT = path.join(ROOT, 'public/assets');
const PRELOAD_SCENE_PATH = path.join(ROOT, 'src/scenes/PreloadScene.ts');
const ENTITIES_ATLAS_PATH = path.join(
  ROOT,
  'public/assets/atlases/entities-anim/entities-anim.json',
);

const allowedLicenses = new Set(['CC0', 'CC-BY']);

const walkFiles = (dir) => {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(absolute));
      continue;
    }
    result.push(absolute);
  }
  return result;
};

const toRelativePosix = (absolutePath) => path.relative(ROOT, absolutePath).replace(/\\/g, '/');

const sha256 = (absolutePath) =>
  crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');

const fail = (errors) => {
  console.error('assets:verify failed');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
};

if (!fs.existsSync(LICENSES_PATH)) {
  fail([`missing file: ${toRelativePosix(LICENSES_PATH)}`]);
}
if (!fs.existsSync(ASSETS_ROOT)) {
  fail([`missing directory: ${toRelativePosix(ASSETS_ROOT)}`]);
}
if (!fs.existsSync(ENTITIES_ATLAS_PATH)) {
  fail([`missing entities animation atlas: ${toRelativePosix(ENTITIES_ATLAS_PATH)}`]);
}

const records = JSON.parse(fs.readFileSync(LICENSES_PATH, 'utf8'));
if (!Array.isArray(records)) {
  fail(['license file must be an array']);
}

const errors = [];
const recordByPath = new Map();

for (const [index, record] of records.entries()) {
  const prefix = `record[${index}]`;
  if (typeof record.localPath !== 'string' || !record.localPath.length) {
    errors.push(`${prefix}: missing localPath`);
    continue;
  }
  if (!allowedLicenses.has(record.license)) {
    errors.push(`${prefix}: unsupported license "${record.license}"`);
  }
  if (typeof record.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.sha256)) {
    errors.push(`${prefix}: invalid sha256`);
  }
  if (record.attributionRequired && (!record.attributionText || !record.attributionText.length)) {
    errors.push(`${prefix}: attributionRequired=true but attributionText is empty`);
  }
  if (recordByPath.has(record.localPath)) {
    errors.push(`${prefix}: duplicate localPath "${record.localPath}"`);
    continue;
  }
  recordByPath.set(record.localPath, record);

  const absolute = path.join(ROOT, record.localPath);
  if (!fs.existsSync(absolute)) {
    errors.push(`${prefix}: file not found ${record.localPath}`);
    continue;
  }
  const actualHash = sha256(absolute);
  if (actualHash !== record.sha256) {
    errors.push(
      `${prefix}: sha256 mismatch for ${record.localPath} (expected ${record.sha256}, got ${actualHash})`,
    );
  }
}

const assetFiles = walkFiles(ASSETS_ROOT).map(toRelativePosix);
for (const assetFile of assetFiles) {
  if (!recordByPath.has(assetFile)) {
    errors.push(`missing license record for ${assetFile}`);
  }
}

for (const licensedPath of recordByPath.keys()) {
  if (!assetFiles.includes(licensedPath)) {
    errors.push(`license record references non-versioned file ${licensedPath}`);
  }
}

const requiredStates = [
  'idle',
  'walk',
  'run',
  'jump',
  'fall',
  'light-combo-1',
  'light-combo-2',
  'light-combo-3',
  'heavy',
  'air-attack',
  'grab',
  'throw',
  'special',
  'hurt',
  'knockdown',
  'recovery',
  'victory',
];
const requiredSets = ['heavy', 'technical', 'agile'];
const atlasJson = JSON.parse(fs.readFileSync(ENTITIES_ATLAS_PATH, 'utf8'));
const atlasFrameNames = new Set(
  (atlasJson.textures ?? []).flatMap((texture) => (texture.frames ?? []).map((frame) => frame.filename)),
);
const atlasFrameNameList = Array.from(atlasFrameNames);
for (const setId of requiredSets) {
  for (const state of requiredStates) {
    const prefix = `${setId}.${state}.`;
    const hasAny = atlasFrameNameList.some((frameName) => frameName.startsWith(prefix));
    if (!hasAny) {
      errors.push(`missing animation coverage in atlas for ${prefix}*`);
    }
  }
}

const preloadScene = fs.readFileSync(PRELOAD_SCENE_PATH, 'utf8');
if (
  preloadScene.includes('createProceduralTextures') ||
  preloadScene.includes('textureFactory') ||
  preloadScene.includes('audioMixer')
) {
  errors.push('PreloadScene still references procedural runtime assets');
}

if (errors.length) {
  fail(errors);
}

console.log(
  `assets:verify ok (${assetFiles.length} files, ${records.length} license records, procedural runtime disabled)`,
);
