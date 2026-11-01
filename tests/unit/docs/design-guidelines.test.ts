import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const design = readFileSync(
  new URL('../../../DESIGN.md', import.meta.url),
  'utf-8'
);

describe('DESIGN.md portfolio design guidance', () => {
  it('documents the light editorial direction and distinct font roles', () => {
    expect(design).toContain('edited collection');
    expect(design).toContain('Cormorant Garamond');
    expect(design).toContain('Noto Serif JP');
    expect(design).toContain('Home About only');
    expect(design).toContain('#EDEDED');
    expect(design).toContain('#090909');
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

  it('documents the approved wireframe motion and thumbnail exceptions', () => {
    expect(design).toContain('16-second');
    expect(design).toContain('NO IMAGE');
    expect(design).toContain('blur(22px)');
    expect(design).not.toContain('the aquarium iframe');
    expect(design).not.toContain('without a blurred duplicate backdrop');
  });

  it('describes the sharp control staff and world vertical rotation without obsolete core requirements', () => {
    expect(design).toContain('industrial control staff');
    expect(design).not.toContain('industrial computing core');
    expect(design).toContain('three-layer mechanical lotus');
    expect(design).toContain('six outer, eight middle and five inner petals');
    expect(design).not.toContain('S-shaped main shell');
    expect(design).not.toContain('shorter C-shaped arm');
    expect(design).toContain('straight internal rails');
    expect(design).not.toContain('four unequal pointed shells');
    expect(design).toContain('upper curved cable');
    expect(design).toContain('lower auxiliary bar');
    expect(design).toContain('two long recurved');
    expect(design).toContain('nine slender pins');
    expect(design).not.toContain('plain shaft interval of about 40%');
    expect(design).toContain('84%');
    expect(design).not.toContain('segmented cylindrical shell');
    expect(design).toContain('initial 35-degree screen-space left tilt');
    expect(design).toContain('world vertical Y axis');
    expect(design).toContain('spin phase starts at zero');
    expect(design).not.toContain('the axis never wobbles');
    expect(design).toContain('upper-left');
    expect(design).not.toContain('-12-degree Z tilt');
    expect(design).not.toContain('+12-degree Z tilt');
    expect(design).not.toContain('1.15:1.8:0.8');
  });
});
