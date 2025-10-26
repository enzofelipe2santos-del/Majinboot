const { existsSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const rootDir = join(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const steps = [
  {
    label: 'root workspace',
    cwd: rootDir,
    packages: ['electron', 'concurrently', 'cross-env', 'wait-on'],
  },
  {
    label: 'backend',
    cwd: join(rootDir, 'backend'),
    packages: [
      'express',
      'whatsapp-web.js',
      'puppeteer',
      'chalk',
      'cron',
      'socket.io',
      'qrcode-terminal',
    ],
  },
  {
    label: 'frontend',
    cwd: join(rootDir, 'frontend'),
    packages: ['vite', 'react', 'tailwindcss'],
  },
];

const force = process.argv.includes('--force');
const skipRoot = process.argv.includes('--skip-root');

const selectedSteps = skipRoot ? steps.filter((step) => step.cwd !== rootDir) : steps;

function packageInstalled(step) {
  if (!existsSync(join(step.cwd, 'node_modules'))) {
    return false;
  }

  return step.packages.every((pkg) =>
    existsSync(join(step.cwd, 'node_modules', pkg))
  );
}

function install(step) {
  const installArgs = ['install'];
  const result = spawnSync(npmCmd, installArgs, {
    cwd: step.cwd,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`npm install failed for ${step.label} (exit code ${result.status})`);
  }
}

for (const step of selectedSteps) {
  const needsInstall = force || !packageInstalled(step);

  if (!needsInstall) {
    console.log(`✔ ${step.label} dependencies ok`);
    continue;
  }

  console.log(`⏳ Installing ${step.label} dependencies...`);
  install(step);
  console.log(`✔ Finished installing ${step.label}`);
}
