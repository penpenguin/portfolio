import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const workflowPath = fileURLToPath(
  new URL('../../../.github/workflows/deploy.yml', import.meta.url)
);
const workflow = readFileSync(workflowPath, 'utf8');
const { packageManager, engines, devDependencies } = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')
) as {
  packageManager?: string;
  engines: { node: string; npm: string };
  devDependencies: Record<string, string>;
};
const nodeVersion = readFileSync(
  new URL('../../../.nvmrc', import.meta.url),
  'utf8'
).trim();

const getJobBlock = (jobName: string) => {
  const marker = `  ${jobName}:\n`;
  const start = workflow.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing ${jobName} job`);
  }

  const rest = workflow.slice(start + marker.length);
  const nextJob = rest.search(/\n {2}[a-zA-Z0-9_-]+:\n/);
  return nextJob === -1 ? rest : rest.slice(0, nextJob);
};

describe('Deploy workflow hardening', () => {
  it('uses the project Node.js version for both tests and builds', () => {
    expect(getJobBlock('test')).toContain('node-version-file: .nvmrc');
    expect(getJobBlock('build')).toContain('node-version-file: .nvmrc');
  });

  it('keeps the Node.js engine and types aligned with the runtime', () => {
    expect(engines.node).toBe(`^${nodeVersion}`);
    expect(devDependencies['@types/node'].split('.')[0]).toBe(
      nodeVersion.split('.')[0]
    );
  });

  it('allows bundled npm while requiring release-age support', () => {
    expect(engines.npm).toBe('>=11.10.0');
    expect(packageManager).toBeUndefined();
    expect(workflow).not.toMatch(/npm install\s+--global\s+npm@/);
    expect(workflow).not.toMatch(/package-manager:\s*npm@/);
  });

  it.each(['test', 'build'])(
    'installs the lockfile with bundled npm in %s',
    (jobName) => {
      const job = getJobBlock(jobName);
      const setupNode = job.indexOf('uses: actions/setup-node@');
      const install = job.indexOf('run: npm ci');

      expect(setupNode).toBeGreaterThanOrEqual(0);
      expect(install).toBeGreaterThan(setupNode);
    }
  );

  it('builds the site before uploading dist to GitHub Pages', () => {
    const job = getJobBlock('build');
    const install = job.indexOf('run: npm ci');
    const build = job.indexOf('run: npm run build');
    const upload = job.indexOf('uses: actions/upload-pages-artifact@');

    expect(install).toBeGreaterThanOrEqual(0);
    expect(build).toBeGreaterThan(install);
    expect(upload).toBeGreaterThan(build);
    expect(job.slice(upload)).toContain('path: dist/');
    expect(job.slice(upload)).toContain('include-hidden-files: true');
  });

  it('uses Node 24-compatible major versions for GitHub Actions', () => {
    expect(workflow).toContain('uses: actions/checkout@v7');
    expect(workflow).toContain('uses: actions/setup-node@v6');
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v5');
    expect(workflow).toContain('uses: actions/deploy-pages@v5');
  });

  it('keeps only the deploy job attached to the github-pages environment', () => {
    expect(getJobBlock('build')).not.toContain('environment: github-pages');
    expect(getJobBlock('deploy')).toContain('name: github-pages');
  });

  it('reads public build values from repository variables instead of environment secrets', () => {
    expect(workflow).not.toContain('PUBLIC_EMAIL');
    expect(workflow).toContain(
      'PUBLIC_GITHUB_URL: ${{ vars.PUBLIC_GITHUB_URL }}'
    );
    expect(workflow).not.toContain('secrets.PUBLIC_GITHUB_URL');
  });
});
