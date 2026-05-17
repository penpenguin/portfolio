import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const about = readFileSync(
  new URL('../../../src/pages/about.astro', import.meta.url),
  'utf-8'
);

describe('About Bento layout', () => {
  it('generic profile copy is replaced with role-focused bento copy', () => {
    expect(about).toContain('Enterprise systems programmer');
    expect(about).toContain('業務システムの設計と実装をつなぐ');
    expect(about).toContain('System design / implementation相談');
    expect(about).not.toContain('About Me');
    expect(about).not.toContain('お気軽にご連絡ください');
  });

  it('uses grounded role wording without overstating leadership', () => {
    expect(about).toContain('Bridge');
    expect(about).toContain('設計と実装の橋渡し役として');
    expect(about).toContain('開発を支援しています');
    expect(about).not.toContain('Support');
    expect(about).not.toContain('Lead');
    expect(about).not.toContain('チームリードとして');
    expect(about).not.toContain('開発をリードしています');
  });

  it('uses varied bento tiles instead of two long profile sections', () => {
    expect(about).toContain('about-card--hero');
    expect(about).toContain('about-card--metric-primary');
    expect(about).toContain('about-card--metric-dark');
    expect(about).toContain('about-card--focus');
    expect(about).toContain('about-card--stack');
    expect(about).toContain('about-card--delivery');
    expect(about).toContain('about-card--contact');
    expect(about).not.toContain('about-card--wide');
    expect(about).not.toContain('<ul>');
  });

  it('gives bento tiles stronger visual hierarchy and responsive spans', () => {
    expect(about).toMatch(
      /\.about-bento\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s
    );
    expect(about).toMatch(
      /\.about-card\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s
    );
    expect(about).toMatch(
      /\.about-card--hero\s*\{[^}]*grid-column:\s*span\s*4/s
    );
    expect(about).toMatch(
      /\.about-card--metric-dark\s*\{[^}]*background:\s*var\(--text-primary\)/s
    );
    expect(about).toMatch(
      /\.about-card--metric-dark\s+\.metric-value\s*\{[^}]*font-size:\s*clamp\(3rem,\s*12vw,\s*5\.4rem\)/s
    );
    expect(about).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.about-bento\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s
    );
  });
});
