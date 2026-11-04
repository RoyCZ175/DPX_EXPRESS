'use strict';
(() => {
  history.scrollRestoration = 'manual';
  document.querySelectorAll('.servicio-img, .about-historia-img, .gallery-single, .about-mv-img, .clientes-card').forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    item.dataset.gallery = 'pagina';
    item.dataset.title = img.alt;
    item.dataset.src = img.currentSrc || img.src;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Ampliar imagen: ${img.alt}`);
  });
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-label', 'Galería de imágenes');
  dialog.innerHTML = '<button type="button" class="viewer-close" aria-label="Cerrar galería">×</button><button type="button" class="viewer-prev" aria-label="Imagen anterior">❮</button><figure><img alt=""><figcaption aria-live="polite"></figcaption><p class="viewer-status" role="status"></p></figure><button type="button" class="viewer-next" aria-label="Imagen siguiente">❯</button><p class="viewer-hint">Desliza para ver más · Atrás para cerrar</p>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const status = dialog.querySelector('.viewer-status');
  let items = [], index = 0, origin, y = 0, bodyStyle;
  let closing = false;
  const saveScroll = () => {
    if (!dialog.open && !history.state?.dpxGallery && !history.state?.dpxMenu) history.replaceState({ ...history.state, dpxScroll: scrollY }, '');
  };
  let scrollTimer;
  window.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(saveScroll, 120); }, { passive: true });
  window.addEventListener('pagehide', saveScroll);
  window.addEventListener('pageshow', () => {
    const saved = history.state?.dpxScroll;
    if (Number.isFinite(saved)) requestAnimationFrame(() => scrollTo(0, saved));
  });
  document.addEventListener('click', event => { if (event.target.closest('a[href]')) saveScroll(); });
  const buttons = () => [...document.querySelectorAll('[data-gallery]')];
  function display() {
    const item = items[index];
    if (!item) return;
    status.textContent = 'Cargando imagen…';
    image.alt = item.dataset.title || item.querySelector('img')?.alt || '';
    image.src = item.dataset.src || item.querySelector('img')?.currentSrc || item.querySelector('img')?.src;
    caption.textContent = `${image.alt} · ${index + 1} de ${items.length}`;
    dialog.querySelector('.viewer-prev').hidden = items.length < 2;
    dialog.querySelector('.viewer-next').hidden = items.length < 2;
  }
  image.onload = () => { status.textContent = ''; };
  image.onerror = () => { status.textContent = 'No pudimos cargar esta foto. Puedes pasar a la siguiente.'; };
  function open(item, push = true) {
    origin = item;
    items = buttons().filter(button => button.dataset.gallery === item.dataset.gallery);
    index = items.indexOf(item);
    if (!dialog.open) {
      saveScroll();
      y = scrollY;
      bodyStyle = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
      Object.assign(document.body.style, { position: 'fixed', top: `-${y}px`, width: '100%', overflow: 'hidden' });
      dialog.showModal();
    }
    if (push) history.pushState({ ...history.state, dpxGallery: { group: item.dataset.gallery, index } }, '');
    display();
    dialog.querySelector('.viewer-close').focus();
  }
  function hide() {
    if (!dialog.open) return;
    dialog.close();
    Object.assign(document.body.style, bodyStyle);
    scrollTo(0, y);
    origin?.isConnected && origin.focus({ preventScroll: true });
    image.removeAttribute('src');
    closing = false;
  }
  function close() {
    if (closing || !dialog.open) return;
    if (history.state?.dpxGallery) { closing = true; history.back(); }
    else hide();
  }
  function step(direction) {
    index = (index + direction + items.length) % items.length;
    // Changing photos replaces this entry: one Back closes the entire gallery.
    history.replaceState({ ...history.state, dpxGallery: { group: items[index].dataset.gallery, index } }, '');
    display();
  }
  document.addEventListener('click', event => {
    const item = event.target.closest('[data-gallery]');
    if (item) { event.preventDefault(); open(item); }
  });
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-gallery]:not(button)')) {
      event.preventDefault();
      open(event.target);
    }
  });
  dialog.querySelector('.viewer-close').addEventListener('click', close);
  dialog.querySelector('.viewer-prev').addEventListener('click', () => step(-1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => step(1));
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
  });
  let touch;
  dialog.addEventListener('touchstart', event => { touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
  dialog.addEventListener('touchmove', event => { if (event.touches.length !== 1) touch = null; }, { passive: true });
  dialog.addEventListener('touchend', event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    touch = null;
  }, { passive: true });
  window.addEventListener('popstate', () => {
    const state = history.state?.dpxGallery;
    if (!state) {
      const wasOpen = dialog.open;
      hide();
      if (!wasOpen) {
        const saved = history.state?.dpxScroll ?? history.state?.dpxProducts?.scroll;
        if (Number.isFinite(saved)) requestAnimationFrame(() => scrollTo(0, saved));
      }
      return;
    }
    const item = buttons().filter(button => button.dataset.gallery === state.group)[state.index];
    if (item) open(item, false); else hide();
  });
  // A reloaded document starts with its page, never with a stale invisible overlay.
  if (history.state?.dpxGallery) {
    const state = { ...history.state };
    delete state.dpxGallery;
    history.replaceState(state, '');
  }
})();
