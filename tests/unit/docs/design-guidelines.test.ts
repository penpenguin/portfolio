import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const design = readFileSync(
  new URL('../../../DESIGN.md', import.meta.url),
  'utf-8'
);

describe('DESIGN.md portfolio design guidance', () => {
  it('documents a Linear-based direction for this portfolio', () => {
    expect(design).toContain('Linear');
    expect(design).toContain('precision');
    expect(design).toContain('product-minded');
  });

  it('locks the existing BentoUI structure while allowing visual polish', () => {
    expect(design).toContain('Keep the existing BentoUI composition');
    expect(design).toContain('Preserve the Bento grid concept');
    expect(design).toContain('Preserve the current high-level page structure');
  });

  it('limits polish to the approved visual surfaces', () => {
    expect(design).toContain('surface treatment');
    expect(design).toContain('spacing');
    expect(design).toContain('typography');
    expect(design).toContain('media framing');
    expect(design).toContain('hover/focus states');
    expect(design).toContain('CTA polish');
  });

  it('forbids loud gradients and large layout changes', () => {
    expect(design).toContain('Do not introduce a loud visual theme');
    expect(design).toContain('Do not add decorative gradients');
    expect(design).toContain('Do not redesign the entire site');
  });

  it('forbids eyebrow and overline labels as visual hierarchy', () => {
    expect(design).toContain('No Eyebrow / Overline Policy');
    expect(design).toContain('Eyebrow text is forbidden');
    expect(design).toContain('Card titles must stand on their own');
  });
});
