class BlogThumbnail extends HTMLElement {
  private image: HTMLImageElement | null = null;

  connectedCallback() {
    this.image = this.querySelector('.blog-thumbnail__image');
    if (!this.image) return;
    this.image.addEventListener('error', this.failed);
    this.image.addEventListener('load', this.loaded);
    // Cached requests may have completed before the custom element was upgraded.
    if (this.image.complete) this.loaded();
  }

  disconnectedCallback() {
    this.image?.removeEventListener('error', this.failed);
    this.image?.removeEventListener('load', this.loaded);
  }

  private failed = () => this.setFallback(true);
  private loaded = () => this.setFallback(!this.image?.naturalWidth);

  private setFallback(failed: boolean) {
    const fallback = this.querySelector<HTMLElement>(
      '.blog-thumbnail__fallback'
    );
    if (!fallback) return;
    fallback.hidden = !failed;
    for (const image of this.querySelectorAll('img')) image.hidden = failed;
    this.classList.toggle('post-visual--fallback', failed);
  }
}

if (!customElements.get('blog-thumbnail')) {
  customElements.define('blog-thumbnail', BlogThumbnail);
}
