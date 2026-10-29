// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../../src/scripts/blogThumbnail';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function thumbnail(complete = false, naturalWidth = 0) {
  const root = document.createElement('blog-thumbnail');
  root.innerHTML =
    '<div class="blog-thumbnail__fallback" aria-hidden="true" hidden>NoImage</div><img class="blog-thumbnail__backdrop" src="/image.webp" alt="" aria-hidden="true"><img class="blog-thumbnail__image" src="/image.webp" alt="記事の画像">';
  const image = root.querySelector<HTMLImageElement>('.blog-thumbnail__image')!;
  vi.spyOn(image, 'complete', 'get').mockReturnValue(complete);
  vi.spyOn(image, 'naturalWidth', 'get').mockReturnValue(naturalWidth);
  document.body.append(root);
  return {
    root,
    image,
    fallback: root.querySelector<HTMLElement>('.blog-thumbnail__fallback')!,
  };
}

describe('blog thumbnail load lifecycle', () => {
  it('hides both failed layers and reveals a single NoImage fallback', () => {
    const { root, image, fallback } = thumbnail();
    image.dispatchEvent(new Event('error'));
    expect(
      [...root.querySelectorAll('img')].every((layer) => layer.hidden)
    ).toBe(true);
    expect(fallback.hidden).toBe(false);
    expect(fallback.textContent).toBe('NoImage');
    expect(fallback.getAttribute('aria-hidden')).toBe('true');
  });

  it('detects errors that happened before the component connected', () => {
    const { root, fallback } = thumbnail(true, 0);
    expect(fallback.hidden).toBe(false);
    expect(
      [...root.querySelectorAll('img')].every((layer) => layer.hidden)
    ).toBe(true);
  });

  it('keeps loaded images visible and ignores an error limited to the decorative layer', () => {
    const { root, fallback } = thumbnail(true, 960);
    root
      .querySelector('.blog-thumbnail__backdrop')!
      .dispatchEvent(new Event('error'));
    expect(fallback.hidden).toBe(true);
    expect(
      root.querySelector<HTMLImageElement>('.blog-thumbnail__image')!.hidden
    ).toBe(false);
  });

  it('removes listeners on disconnect and handles a later visit without duplicate handlers', () => {
    const { root, image, fallback } = thumbnail();
    const remove = vi.spyOn(image, 'removeEventListener');
    root.remove();
    image.dispatchEvent(new Event('error'));
    expect(fallback.hidden).toBe(true);
    expect(remove).toHaveBeenCalledWith('error', expect.any(Function));
    document.body.append(root);
    image.dispatchEvent(new Event('error'));
    expect(fallback.hidden).toBe(false);
    vi.spyOn(image, 'naturalWidth', 'get').mockReturnValue(960);
    image.dispatchEvent(new Event('load'));
    expect(fallback.hidden).toBe(true);
    expect(
      [...root.querySelectorAll('img')].every((layer) => !layer.hidden)
    ).toBe(true);
  });
});
