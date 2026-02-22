import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const SOURCES_MANIFEST_PATH = path.join(
  ROOT,
  'src',
  'assets',
  'manifests',
  'entity-animation-sources.json',
);
const SOURCE_ROOT = path.join(ROOT, '.cache', 'asset-sync', 'sources', 'entities');
const OUTPUT_ROOT = path.join(ROOT, '.cache', 'asset-sync', 'frames', 'entities-anim');
const REPORT_PATH = path.join(ROOT, '.cache', 'asset-sync', 'reports', 'entities-extract-report.json');

const ALPHA_THRESHOLD = 16;
const MIN_COMPONENT_AREA = 40;
const CANVAS_PADDING = 14;
const BASELINE_PADDING = 8;

const CLIP_LAYOUT = [
  { state: 'idle', count: 5, anchor: 0.01 },
  { state: 'walk', count: 6, anchor: 0.06 },
  { state: 'run', count: 6, anchor: 0.11 },
  { state: 'jump', count: 4, anchor: 0.17 },
  { state: 'fall', count: 4, anchor: 0.22 },
  { state: 'light-combo-1', count: 5, anchor: 0.28 },
  { state: 'light-combo-2', count: 5, anchor: 0.35 },
  { state: 'light-combo-3', count: 5, anchor: 0.42 },
  { state: 'heavy', count: 6, anchor: 0.49 },
  { state: 'air-attack', count: 5, anchor: 0.56 },
  { state: 'grab', count: 4, anchor: 0.62 },
  { state: 'throw', count: 5, anchor: 0.68 },
  { state: 'special', count: 7, anchor: 0.75 },
  { state: 'hurt', count: 4, anchor: 0.84 },
  { state: 'knockdown', count: 5, anchor: 0.89 },
  { state: 'recovery', count: 4, anchor: 0.93 },
  { state: 'victory', count: 6, anchor: 0.965 },
];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const clearDir = (dir) => {
  if (!fs.existsSync(dir)) {
    ensureDir(dir);
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(absolute, { recursive: true, force: true });
      continue;
    }
    fs.unlinkSync(absolute);
  }
};

const toRelativePosix = (absolutePath) => path.relative(ROOT, absolutePath).replace(/\\/g, '/');

const loadSourcesManifest = () => {
  if (!fs.existsSync(SOURCES_MANIFEST_PATH)) {
    throw new Error(`Missing sources manifest: ${toRelativePosix(SOURCES_MANIFEST_PATH)}`);
  }
  const parsed = JSON.parse(fs.readFileSync(SOURCES_MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(parsed.sources) || parsed.sources.length === 0) {
    throw new Error('entity-animation-sources.json must define a non-empty "sources" array');
  }
  return parsed.sources;
};

const readPng = (absolutePath) => PNG.sync.read(fs.readFileSync(absolutePath));

const detectComponents = (png) => {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const index = (x, y) => y * width + x;
  const alphaAt = (x, y) => data[index(x, y) * 4 + 3];
  const stack = [];
  const components = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rootIndex = index(x, y);
      if (visited[rootIndex]) {
        continue;
      }
      visited[rootIndex] = 1;
      if (alphaAt(x, y) < ALPHA_THRESHOLD) {
        continue;
      }

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let area = 0;
      stack.push(rootIndex);

      while (stack.length) {
        const current = stack.pop();
        const cx = current % width;
        const cy = (current - cx) / width;
        if (alphaAt(cx, cy) < ALPHA_THRESHOLD) {
          continue;
        }

        area += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue;
          }
          const neighborIndex = index(nx, ny);
          if (visited[neighborIndex]) {
            continue;
          }
          visited[neighborIndex] = 1;
          if (alphaAt(nx, ny) >= ALPHA_THRESHOLD) {
            stack.push(neighborIndex);
          }
        }
      }

      if (area >= MIN_COMPONENT_AREA) {
        components.push({
          minX,
          minY,
          maxX,
          maxY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
          area,
        });
      }
    }
  }

  components.sort((left, right) => left.minY - right.minY || left.minX - right.minX);
  return components;
};

const pickClipComponents = (components) => {
  const picked = [];
  for (const layout of CLIP_LAYOUT) {
    const maxStart = Math.max(0, components.length - layout.count);
    const start = Math.min(maxStart, Math.floor(maxStart * layout.anchor));
    const selected = components.slice(start, start + layout.count);
    if (selected.length !== layout.count) {
      throw new Error(
        `Unable to extract ${layout.count} frames for state "${layout.state}" (have ${selected.length})`,
      );
    }
    selected.forEach((component, frameIndex) => {
      picked.push({
        state: layout.state,
        frameIndex,
        component,
      });
    });
  }
  return picked;
};

const copyRect = (source, destination, sourceX, sourceY, width, height, targetX, targetY) => {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const sx = sourceX + column;
      const sy = sourceY + row;
      const tx = targetX + column;
      const ty = targetY + row;
      const sourceIndex = (sy * source.width + sx) * 4;
      const targetIndex = (ty * destination.width + tx) * 4;
      destination.data[targetIndex + 0] = source.data[sourceIndex + 0];
      destination.data[targetIndex + 1] = source.data[sourceIndex + 1];
      destination.data[targetIndex + 2] = source.data[sourceIndex + 2];
      destination.data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }
};

const renderFrame = (sourcePng, component, canvasWidth, canvasHeight) => {
  const frame = new PNG({ width: canvasWidth, height: canvasHeight });
  const targetX = Math.max(0, Math.floor((canvasWidth - component.width) / 2));
  const targetY = Math.max(0, canvasHeight - component.height - BASELINE_PADDING);
  copyRect(
    sourcePng,
    frame,
    component.minX,
    component.minY,
    component.width,
    component.height,
    targetX,
    targetY,
  );
  return frame;
};

ensureDir(path.dirname(REPORT_PATH));
clearDir(OUTPUT_ROOT);

const sources = loadSourcesManifest();
const report = {
  generatedAt: new Date().toISOString(),
  outputRoot: toRelativePosix(OUTPUT_ROOT),
  sets: [],
};

for (const source of sources) {
  const sourcePath = path.join(SOURCE_ROOT, `${source.id}-sheet.png`);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Missing source sheet for "${source.id}". Run npm run assets:sync first (${toRelativePosix(sourcePath)})`,
    );
  }

  const sheet = readPng(sourcePath);
  const components = detectComponents(sheet);
  const picked = pickClipComponents(components);
  const maxComponentWidth = Math.max(...picked.map((frame) => frame.component.width));
  const maxComponentHeight = Math.max(...picked.map((frame) => frame.component.height));
  const canvasWidth = maxComponentWidth + CANVAS_PADDING * 2;
  const canvasHeight = maxComponentHeight + CANVAS_PADDING * 2;

  for (const frame of picked) {
    const frameName = `${source.id}.${frame.state}.${String(frame.frameIndex).padStart(2, '0')}`;
    const framePath = path.join(OUTPUT_ROOT, `${frameName}.png`);
    const rendered = renderFrame(sheet, frame.component, canvasWidth, canvasHeight);
    fs.writeFileSync(framePath, PNG.sync.write(rendered));
  }

  report.sets.push({
    setId: source.id,
    sourceSheet: toRelativePosix(sourcePath),
    detectedComponents: components.length,
    exportedFrames: picked.length,
    canvas: `${canvasWidth}x${canvasHeight}`,
  });
}

fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `assets:extract-entities complete (${report.sets.map((set) => `${set.setId}:${set.exportedFrames}`).join(', ')})`,
);
console.log(`Report: ${toRelativePosix(REPORT_PATH)}`);
