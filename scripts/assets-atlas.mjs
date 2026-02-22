import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROJECT_ROOT = path.join(ROOT, '.cache', 'atlas-projects');
const OUTPUT_ROOT = path.join(ROOT, 'public', 'assets', 'atlases');

const atlasJobs = [
  {
    name: 'entities-anim',
    inputDir: path.join(ROOT, '.cache', 'asset-sync', 'frames', 'entities-anim'),
    width: 4096,
    height: 4096,
  },
  {
    name: 'effects',
    inputDir: path.join(ROOT, 'public', 'assets', 'images', 'effects'),
    width: 1024,
    height: 1024,
  },
  {
    name: 'ui',
    inputDir: path.join(ROOT, 'public', 'assets', 'images', 'ui'),
    width: 1024,
    height: 1024,
  },
];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const clearDir = (dir) => {
  if (!fs.existsSync(dir)) {
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

ensureDir(PROJECT_ROOT);
ensureDir(OUTPUT_ROOT);

for (const job of atlasJobs) {
  if (!fs.existsSync(job.inputDir)) {
    throw new Error(`Missing input directory for atlas: ${path.relative(ROOT, job.inputDir)}`);
  }

  const outputDir = path.join(OUTPUT_ROOT, job.name);
  ensureDir(outputDir);
  clearDir(outputDir);

  const project = {
    images: [],
    folders: [job.inputDir],
    savePath: outputDir,
    packOptions: {
      textureName: job.name,
      width: job.width ?? 2048,
      height: job.height ?? 2048,
      fixedSize: false,
      padding: 2,
      extrude: 1,
      allowRotation: false,
      detectIdentical: true,
      allowTrim: false,
      removeFileExtension: true,
      prependFolderName: false,
      exporter: 'Phaser 3',
    },
  };

  const projectPath = path.join(PROJECT_ROOT, `${job.name}.ftpp`);
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));

  const command = `npx free-tex-packer-cli --project \"${projectPath}\" --output \"${outputDir}\"`;
  execSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

console.log(`assets:atlas completed (${atlasJobs.length} atlases) -> public/assets/atlases`);
