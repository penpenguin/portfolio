import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const career = readFileSync(
  resolve(currentDir, '../../../src/pages/career.astro'),
  'utf-8'
);
const careerContent = readFileSync(
  resolve(currentDir, '../../../src/content/pages/career.md'),
  'utf-8'
);

describe('Career overview profile integration', () => {
  it('About route is removed instead of being kept as a separate page', () => {
    expect(
      existsSync(resolve(currentDir, '../../../src/pages/about.astro'))
    ).toBe(false);
  });

  it('keeps the Career top copy concise and stack-centered', () => {
    expect(career).toContain('Career');
    expect(career).toContain('A rough career history.');
    expect(career).toContain('career-subtitle');
    expect(career).toContain('10+ years');
    expect(career).not.toContain('技術スタックと経験年数');
    expect(career).not.toContain(
      '10年以上の経験と技術スタックを中心に整理しています。'
    );
    expect(career).not.toContain('hero-lead');
    expect(career).not.toContain('hero-description');
    expect(career).not.toContain('heroChips');
    expect(career).not.toContain('hero-chips');
    expect(career).not.toContain('Manufacturing internal systems');
    expect(career).not.toContain('Java / TypeScript / Azure');
    expect(career).not.toContain('Production Web Systems');
    expect(career).not.toContain('Requirements → Operation');
    expect(career).not.toContain(
      '現場の要件を、運用に残るWebシステムへ落とし込む'
    );
    expect(career).not.toContain('about-bento');
    expect(career).not.toContain('about-card');
    expect(career).not.toContain('About Me');
  });

  it('focuses the top area on experience and stack summaries only', () => {
    expect(career).toContain('10+ years in production systems');
    expect(career).toContain('Core Stack');
    expect(career).toContain('Backend');
    expect(career).toContain('Frontend');
    expect(career).toContain('Platform / Data');
    expect(career).toContain("'Java'");
    expect(career).toContain("'Quarkus'");
    expect(career).toContain("'Spring'");
    expect(career).toContain("'Ruby on Rails'");
    expect(career).toContain("'Node.js'");
    expect(career).toContain("'TypeScript'");
    expect(career).toContain("'React'");
    expect(career).toContain("'Nuxt.js'");
    expect(career).toContain("'MUI'");
    expect(career).toContain("'Azure'");
    expect(career).toContain("'Azure AI Search'");
    expect(career).toContain("'Azure OpenAI'");
    expect(career).toContain("'Azure Functions'");
    expect(career).toContain("'PostgreSQL'");
    expect(career).toContain("'ArangoDB'");
    expect(career).toContain("'Docker'");
    expect(career).toContain("'GitLab'");
    expect(career).toContain("'Jenkins'");
    expect(career).toContain('stack-matrix');
    expect(career).toContain('stack-column');
    expect(career).toContain('stack-list');
    expect(career).not.toContain('summary:');
    expect(career).not.toContain('stack-column-header');
    expect(career).not.toContain('Java / Quarkus / Spring');
    expect(career).not.toContain('TypeScript / React / Astro');
    expect(career).not.toContain('Azure / OpenShift / CI/CD');
    expect(career).not.toContain(
      '長期運用、新規開発、改善、CI/CD整備を横断して、業務システムに継続して関わっています。'
    );
    expect(career).not.toContain(
      'メーカー系の社内システムを中心に、長期運用される業務Webシステムを扱っています。'
    );
    expect(career).not.toContain('Lead Programmer');
    expect(career).not.toContain('実績の圧縮表示');
    expect(career).not.toContain('要件から運用まで、分断しない');
    expect(career).not.toContain('proofItems');
    expect(career).not.toContain('deliverySteps');
    expect(career).not.toContain('career-card--role');
    expect(career).not.toContain('career-card--focus');
    expect(career).not.toContain('career-card--delivery');
  });

  it('derives the Core Stack from timeline techStack entries', () => {
    for (const tech of [
      'Azure AI Search',
      'Azure OpenAI',
      'Ruby on Rails',
      'PostgreSQL',
      'Docker',
      'GitLab',
      'ArangoDB',
    ]) {
      expect(careerContent).toContain(`'${tech}'`);
      expect(career).toContain(`'${tech}'`);
    }

    expect(career).toContain('timeline.flatMap');
    expect(career).toContain('item.techStack');
    expect(career).toContain('timelineTechSet.has');
  });

  it('uses Career-specific bento classes with responsive spans', () => {
    expect(career).toContain('career-overview-grid');
    expect(career).toContain('career-card--hero');
    expect(career).toContain('career-card--experience');
    expect(career).toContain('career-card--stack');
    expect(career).toMatch(
      /\.career-overview-grid\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s
    );
    expect(career).toMatch(
      /\.career-card\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s
    );
    expect(career).toMatch(
      /\.career-card--hero\s*\{[^}]*grid-column:\s*span\s*4/s
    );
    expect(career).toMatch(
      /\.career-card--stack\s*\{[^}]*grid-column:\s*span\s*6/s
    );
    expect(career).toMatch(/\.stack-matrix\s*\{[^}]*display:\s*grid/s);
    expect(career).toMatch(/\.stack-list\s*\{[^}]*display:\s*flex/s);
    expect(career).toMatch(
      /\.career-subtitle\s*\{[^}]*color:\s*var\(--text-muted\)/s
    );
    expect(career).not.toContain('.hero-lead');
    expect(career).not.toContain('.hero-description');
    expect(career).not.toContain('.stack-column-header');
    expect(career).not.toContain('career-card--domain');
    expect(career).not.toContain('.career-card--domain');
    expect(career).not.toContain('.career-card--role');
    expect(career).not.toContain('.career-card--focus');
    expect(career).not.toContain('.career-card--delivery');
    expect(career).not.toContain('.delivery-grid');
    expect(career).not.toContain('.proof-list');
    expect(career).not.toContain('.stack-tile');
    expect(career).not.toContain('.tile-index');
    expect(career).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.career-overview-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s
    );
  });
});
