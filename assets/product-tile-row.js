if (!customElements.get('product-tile-row')) {
  customElements.define(
    'product-tile-row',
    class ProductTileRow extends HTMLElement {
      connectedCallback() {
        this.list = this.querySelector('.product-tile-row__list');
        this.prevButton = this.querySelector('.product-tile-row__nav--prev');
        this.nextButton = this.querySelector('.product-tile-row__nav--next');
        if (!this.list || !this.prevButton || !this.nextButton) return;

        this.update = this.update.bind(this);
        this.prevButton.addEventListener('click', () => this.scrollByPage(-1));
        this.nextButton.addEventListener('click', () => this.scrollByPage(1));
        this.list.addEventListener('scroll', this.update, { passive: true });
        this.resizeObserver = new ResizeObserver(this.update);
        this.resizeObserver.observe(this.list);
        this.update();
      }

      disconnectedCallback() {
        this.resizeObserver?.disconnect();
      }

      scrollByPage(direction) {
        this.list.scrollBy({ left: direction * this.list.clientWidth, behavior: 'smooth' });
      }

      update() {
        const maxScroll = this.list.scrollWidth - this.list.clientWidth;
        this.classList.toggle('product-tile-row--scrollable', maxScroll > 1);
        this.prevButton.disabled = this.list.scrollLeft <= 1;
        this.nextButton.disabled = this.list.scrollLeft >= maxScroll - 1;

        const media = this.list.querySelector('.card__inner');
        if (media) this.style.setProperty('--tile-nav-top', `${media.offsetTop + media.offsetHeight / 2 - 22}px`);
      }
    }
  );
}

if (!customElements.get('recently-viewed-products')) {
  customElements.define(
    'recently-viewed-products',
    class RecentlyViewedProducts extends HTMLElement {
      static storageKey = 'recentlyViewedProducts';
      static maxStored = 12;

      connectedCallback() {
        if (this.loaded) return;
        this.loaded = true;

        const currentHandle = this.dataset.productHandle;
        const limit = parseInt(this.dataset.limit) || 6;
        const handles = this.readHandles().filter((handle) => handle !== currentHandle);

        if (currentHandle && !this.hasAttribute('data-design-mode')) {
          this.writeHandles([currentHandle, ...handles]);
        }

        this.render(handles.slice(0, limit));
      }

      readHandles() {
        try {
          const handles = JSON.parse(localStorage.getItem(RecentlyViewedProducts.storageKey));
          return Array.isArray(handles) ? handles.filter((handle) => typeof handle === 'string') : [];
        } catch (e) {
          return [];
        }
      }

      writeHandles(handles) {
        try {
          localStorage.setItem(
            RecentlyViewedProducts.storageKey,
            JSON.stringify(handles.slice(0, RecentlyViewedProducts.maxStored))
          );
        } catch (e) {
          // Storage unavailable (private mode, blocked cookies): the section just stays hidden.
        }
      }

      async render(handles) {
        if (!handles.length) return;

        const root = window.Shopify?.routes?.root || '/';
        const results = await Promise.all(handles.map((handle) => this.fetchTile(`${root}products/${handle}`)));

        // Forget products that no longer exist so they are not requested again.
        const missing = handles.filter((handle, index) => results[index].missing);
        if (missing.length) this.writeHandles(this.readHandles().filter((handle) => !missing.includes(handle)));

        const found = results.map((result) => result.tile).filter(Boolean);
        if (!found.length) return;

        const list = this.querySelector('.product-tile-row__list');
        list.replaceChildren(
          ...found.map((tile) => {
            const item = document.createElement('li');
            item.className = 'product-tile-row__item';
            item.append(tile);
            return item;
          })
        );
        this.closest('.recently-viewed-products')?.removeAttribute('hidden');
      }

      async fetchTile(url) {
        try {
          const response = await fetch(`${url}?section_id=product-tile`);
          if (!response.ok) return { missing: response.status === 404 };
          const html = new DOMParser().parseFromString(await response.text(), 'text/html');
          const tile = html.querySelector('product-component');
          return { tile };
        } catch (e) {
          return {};
        }
      }
    }
  );
}
