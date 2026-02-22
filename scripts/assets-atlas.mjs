import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROJECT_ROOT = path.join(ROOT, '.cache', 'atlas-projects');
const OUTPUT_ROOT = path.join(ROOT, 'src', 'assets', 'atlases');

const atlasJobs = [
  {
    name: 'entities',
    inputDir: path.join(ROOT, 'public', 'assets', 'images', 'entities'),
  },
  {
    name: 'effects',
    inputDir: path.join(ROOT, 'public', 'assets', 'images', 'effects'),
  },
  {
    name: 'ui',
    inputDir: path.join(ROOT, 'public', 'assets', 'images', 'ui'),
  },
];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

ensureDir(PROJECT_ROOT);
ensureDir(OUTPUT_ROOT);

for (const job of atlasJobs) {
  if (!fs.existsSync(job.inputDir)) {
    throw new Error(`Missing input directory for atlas: ${path.relative(ROOT, job.inputDir)}`);
  }

  const outputDir = path.join(OUTPUT_ROOT, job.name);
  ensureDir(outputDir);

  const project = {
    images: [],
    folders: [job.inputDir],
    savePath: outputDir,
    packOptions: {
      textureName: job.name,
      width: 2048,
      height: 2048,
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

console.log(`assets:atlas completed (${atlasJobs.length} atlases) -> src/assets/atlases`);
