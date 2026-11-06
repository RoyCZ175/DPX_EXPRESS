'use strict';
(() => {
  const section = document.getElementById('promo-spotlight');
  const track = document.getElementById('spotlight-track');
  const hint = document.getElementById('spotlight-hint');
  const money = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });
  let loading = false;
  let previous = '';
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };
  async function load() {
    if (loading || document.querySelector('.photo-viewer[open]')) return;
    loading = true;
    try {
      const response = await fetch('/api/promociones', { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('Promociones no disponibles');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Respuesta inválida');
      const promotions = data.filter(p => typeof p.nombre === 'string' && p.nombre.trim());
      const signature = JSON.stringify(promotions);
      if (signature === previous) return;
      previous = signature;
      const cards = promotions.map(p => {
        const card = node('article', 'spotlight-card');
        const photo = node('button', 'spotlight-photo');
        photo.type = 'button';
        let src = 'images/pasteleria.jpg';
        try {
          const url = new URL(p.imagen, location.href);
          if (p.imagen && ['http:', 'https:'].includes(url.protocol)) src = url.href;
        } catch {}
        Object.assign(photo.dataset, { gallery: 'anuncios', src, title: p.nombre });
        photo.setAttribute('aria-label', `Ampliar anuncio de ${p.nombre}`);
        const image = node('img', '');
        Object.assign(image, { src, alt: p.nombre, loading: 'eager', decoding: 'async' });
        image.addEventListener('error', () => { photo.hidden = true; }, { once: true });
        photo.append(image);
        const info = node('div', 'spotlight-info');
        info.append(node('span', 'spotlight-badge', p.temporada || 'Promoción especial'), node('h3', '', p.nombre));
        if (p.descripcion) info.append(node('p', 'spotlight-description', p.descripcion));
        if (p.precio_promocional != null && Number.isFinite(Number(p.precio_promocional))) {
          const price = node('p', 'spotlight-price', money.format(Number(p.precio_promocional)));
          if (p.precio_anterior != null && Number(p.precio_anterior) > Number(p.precio_promocional)) price.append(node('del', '', money.format(Number(p.precio_anterior))));
          info.append(price);
        }
        if (p.fecha_fin) {
          const date = new Date(`${p.fecha_fin}T12:00:00Z`);
          if (!Number.isNaN(date.getTime())) info.append(node('p', 'spotlight-validity', `Válida hasta el ${date.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`));
        }
        if (Number(p.dias_anticipacion) > 0) info.append(node('p', 'spotlight-advance', `Pide con ${Number(p.dias_anticipacion)} o más días de anticipación.`));
        const link = node('a', 'button whatsapp-consult', '¡Quiero esta promoción!');
        Object.assign(link, { href: DpxPedidos.url(`Hola, vi la promoción «${p.nombre}»${p.temporada ? ` de ${p.temporada}` : ''} en su página. Quisiera consultar disponibilidad y cómo pedirla.`), target: '_blank', rel: 'noopener noreferrer' });
        link.setAttribute('aria-label', `Consultar por WhatsApp la promoción ${p.nombre}`);
        info.append(link);
        card.append(photo, info);
        return card;
      });
      track.replaceChildren(...cards);
      track.classList.toggle('spotlight-single', cards.length === 1);
      hint.hidden = cards.length < 2;
      section.hidden = cards.length === 0;
    } catch {
      // Hide stale offers when their current availability cannot be verified.
      section.hidden = true;
      previous = '';
    } finally { loading = false; }
  }
  load();
  window.addEventListener('focus', load);
  setInterval(() => { if (!document.hidden) load(); }, 60000);
})();
