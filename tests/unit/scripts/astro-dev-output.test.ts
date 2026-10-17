import { describe, expect, it } from 'vitest';

import { normalizeAstroOutput } from '../../../scripts/astro-dev-output.mjs';

describe('Astro dev server output', () => {
  const readyMessage = 'Local    http://127.0.0.1:4324/portfolio/\n';

  it('preserves human-readable startup output', () => {
    expect(normalizeAstroOutput(readyMessage)).toBe(readyMessage);
  });

  it('decodes JSON messages so the readiness check sees real newlines', () => {
    const output = [
      'Starting Astro',
      JSON.stringify({ level: 'info', message: readyMessage }),
      JSON.stringify({ level: 'info', message: 'Watching for changes' }),
    ].join('\n');

    expect(normalizeAstroOutput(output)).toBe(
      `Starting Astro\n${readyMessage}\nWatching for changes`
    );
  });

  it('keeps incomplete JSON until the remaining output arrives', () => {
    const output = JSON.stringify({ message: readyMessage });
    const partialOutput = output.slice(0, -2);

    expect(normalizeAstroOutput(partialOutput)).toBe(partialOutput);
    expect(normalizeAstroOutput(partialOutput + output.slice(-2))).toBe(
      readyMessage
    );
  });

  it('preserves JSON output that does not contain a text message', () => {
    const output = 'null\n{"message":123}';

    expect(normalizeAstroOutput(output)).toBe(output);
  });
});
