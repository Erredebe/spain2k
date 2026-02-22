import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

const resolveBuildSha = (): string => {
  if (process.env.VITE_BUILD_SHA) {
    return process.env.VITE_BUILD_SHA;
  }
  if (process.env.COMMIT_REF) {
    return process.env.COMMIT_REF;
  }
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA;
  }
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'local-dev';
  }
};

const buildSha = resolveBuildSha();
const buildTime = process.env.VITE_BUILD_TIME ?? new Date().toISOString();

export default defineConfig({
  define: {
    'import.meta.env.VITE_BUILD_SHA': JSON.stringify(buildSha),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
  },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/tests/**', 'src/**/index.ts'],
    },
  },
});
