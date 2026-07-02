import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const workflowPath = fileURLToPath(
  new URL('../../../.github/workflows/deploy.yml', import.meta.url)
);
const workflow = readFileSync(workflowPath, 'utf8');

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
  it('uses Node 24-compatible major versions for GitHub Actions', () => {
    expect(workflow).toContain('uses: actions/checkout@v7');
    expect(workflow).toContain('uses: actions/setup-node@v6');
    expect(workflow).toContain('uses: withastro/action@v6');
    expect(workflow).toContain('uses: actions/deploy-pages@v5');
  });

  it('keeps only the deploy job attached to the github-pages environment', () => {
    expect(getJobBlock('build')).not.toContain('environment: github-pages');
    expect(getJobBlock('deploy')).toContain('name: github-pages');
  });

  it('reads public build values from repository variables instead of environment secrets', () => {
    expect(workflow).toContain('PUBLIC_EMAIL: ${{ vars.PUBLIC_EMAIL }}');
    expect(workflow).toContain(
      'PUBLIC_GITHUB_URL: ${{ vars.PUBLIC_GITHUB_URL }}'
    );
    expect(workflow).not.toContain('secrets.PUBLIC_EMAIL');
    expect(workflow).not.toContain('secrets.PUBLIC_GITHUB_URL');
  });
});
