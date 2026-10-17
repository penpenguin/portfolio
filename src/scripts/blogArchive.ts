class BlogArchive extends HTMLElement {
  private select: HTMLSelectElement | null = null;

  connectedCallback() {
    this.select = this.querySelector('select');
    const control = this.querySelector<HTMLElement>('[data-year-control]');
    if (!this.select || !control) return;

    this.updateYear();
    this.setAttribute('data-enhanced', '');
    control.hidden = false;
    this.select.addEventListener('change', this.updateYear);
  }

  disconnectedCallback() {
    this.select?.removeEventListener('change', this.updateYear);
  }

  private updateYear = () => {
    for (const group of this.querySelectorAll<HTMLDetailsElement>(
      '[data-year]'
    )) {
      const selected = group.dataset.year === this.select?.value;
      group.hidden = !selected;
      group.open = selected;
    }
  };
}

if (!customElements.get('blog-archive')) {
  customElements.define('blog-archive', BlogArchive);
}
