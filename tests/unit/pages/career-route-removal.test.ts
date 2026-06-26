import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');

const readSource = (path: string) =>
  readFileSync(resolve(rootDir, path), 'utf-8');

describe('Career route removal', () => {
  it('does not ship a Career page route', () => {
    expect(existsSync(resolve(rootDir, 'src/pages/career.astro'))).toBe(false);
  });

  it('does not keep a Career content entry or collection', () => {
    const contentConfig = readSource('src/content.config.ts');

    expect(existsSync(resolve(rootDir, 'src/content/pages/career.md'))).toBe(
      false
    );
    expect(contentConfig).not.toMatch(/const\s+career\s*=\s*defineCollection/);
    expect(contentConfig).not.toMatch(/collections\s*=\s*\{[^}]*career[^}]*\}/);
  });

  it('does not expose links to the removed Career page', () => {
    const layout = readSource('src/layouts/Layout.astro');
    const home = readSource('src/pages/index.astro');

    expect(layout).not.toMatch(/href:\s*['"]\/career['"]/);
    expect(home).not.toMatch(/href:\s*['"]\/career['"]|href=['"]\/career['"]/);
  });

  it('does not expose Career data through agent-facing indexes or tools', () => {
    const agentIndex = readSource('src/pages/agent-index.json.ts');
    const agentTypes = readSource('src/utils/agentTypes.ts');
    const webmcp = readSource('src/scripts/portfolio-webmcp.ts');
    const llmsGuide = readSource('public/llms.txt');

    expect(agentIndex).not.toMatch(/getEntry\(['"]career['"]/);
    expect(agentIndex).not.toMatch(/\bcareer\s*:/);
    expect(agentTypes).not.toMatch(/AgentCareerItem|career:/);
    expect(webmcp).not.toContain('portfolio.get_career_summary');
    expect(webmcp).not.toMatch(/CareerSummary|buildCareerSummary/);
    expect(llmsGuide).not.toContain('portfolio.get_career_summary');
  });
});
