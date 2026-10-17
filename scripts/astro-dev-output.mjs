/** @param {string} output */
export function normalizeAstroOutput(output) {
  return output
    .split('\n')
    .map((line) => {
      try {
        const entry = JSON.parse(line);
        return typeof entry?.message === 'string' ? entry.message : line;
      } catch {
        return line;
      }
    })
    .join('\n');
}
