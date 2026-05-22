import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const about = readFileSync(
  new URL('../../../src/pages/about.astro', import.meta.url),
  'utf-8'
);

describe('About Bento layout', () => {
  it('generic profile copy is replaced with role-focused bento copy', () => {
    expect(about).toContain('About');
    expect(about).toContain('現場の要件を、運用に残るWebシステムへ落とし込む');
    expect(about).toContain(
      'メーカー系の社内システムを中心に、要件整理、Webアプリケーション実装、クラウド基盤、CI/CD、運用改善まで担当してきました。'
    );
    expect(about).toContain(
      '業務知識が複雑な領域でも、画面・API・データモデル・運用プロセスへ分解し、チームで長く保守できる形に整えます。'
    );
    expect(about).toContain('10+ years');
    expect(about).toContain('Manufacturing internal systems');
    expect(about).toContain('Java / TypeScript / Azure');
    expect(about).toContain('Requirements → Operation');
    expect(about).not.toContain('できること、やってきたこと');
    expect(about).not.toContain('Business Systems / Web Applications');
    expect(about).not.toContain('業務の複雑さを、保守できるWebシステムにする');
    expect(about).not.toContain('Enterprise systems programmer');
    expect(about).not.toContain('業務システムの設計と実装をつなぐ');
    expect(about).not.toContain('About Me');
    expect(about).not.toContain('お気軽にご連絡ください');
  });

  it('uses grounded role wording without overstating leadership', () => {
    expect(about).toContain('Lead Programmer');
    expect(about).toContain(
      '業務要件を画面・API・データモデルへ分解し、実装判断とチーム開発を前に進めます。'
    );
    expect(about).not.toContain('Bridge');
    expect(about).not.toContain('設計と実装の橋渡し役として');
    expect(about).not.toContain('Support');
    expect(about).not.toContain('チームリードとして');
    expect(about).not.toContain('開発をリードしています');
  });

  it('shows concrete proof and focused contact copy', () => {
    expect(about).toContain('Proof');
    expect(about).toContain('実績の圧縮表示');
    expect(about).toContain('通信設計情報を統合管理するWebシステム新規開発');
    expect(about).toContain(
      'Azure AI Search / Azure OpenAI を使った全文検索導入支援'
    );
    expect(about).toContain(
      'シミュレーション管理システムのCI/CD・テスト自動化'
    );
    expect(about).toContain('業務システムの設計・実装・改善相談');
    expect(about).toContain(
      '新規開発、既存システム改善、CI/CD整備、設計レビューなど、要件整理から実装・運用まで一緒に整理できます。'
    );
    expect(about).not.toContain('System design / implementation相談');
    expect(about).not.toContain(
      '業務システムの設計、実装、運用改善について話せます。'
    );
  });

  it('uses varied bento tiles instead of two long profile sections', () => {
    expect(about).toContain('about-card--hero');
    expect(about).toContain('about-card--experience');
    expect(about).toContain('about-card--role');
    expect(about).toContain('about-card--focus');
    expect(about).toContain('about-card--stack');
    expect(about).toContain('about-card--delivery');
    expect(about).toContain('about-card--contact');
    expect(about).not.toContain('about-card--metric-primary');
    expect(about).not.toContain('about-card--metric-dark');
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
      /\.about-card--role\s*\{[^}]*background:\s*var\(--text-primary\)/s
    );
    expect(about).toMatch(
      /\.about-card--role\s+\.metric-value\s*\{[^}]*font-size:\s*clamp\(2rem,\s*6vw,\s*3\.6rem\)/s
    );
    expect(about).toMatch(/\.about-card--hero\s*\{[^}]*min-height:\s*320px/s);
    expect(about).toContain('hero-chips');
    expect(about).toContain('proof-list');
    expect(about).toMatch(/\.hero-chips\s*\{[^}]*display:\s*flex/s);
    expect(about).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.about-bento\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s
    );
    expect(about).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.about-card\s*\{[^}]*grid-column:\s*span\s*2/s
    );
    expect(about).not.toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.about-card--experience/s
    );
  });
});
