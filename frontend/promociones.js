const gridPromociones = document.getElementById('promoGrid');
function escaparHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function fechaPromo(value) {
  return value ? new Date(`${value}T12:00:00Z`).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
}
let cargandoPromos = false;
async function cargarPromociones() {
  if (cargandoPromos || document.querySelector('.photo-viewer[open]')) return;
  cargandoPromos = true;
  try {
    const response = await fetch('/api/promociones');
    if (!response.ok) throw new Error('No se pudieron cargar las promociones.');
    const promociones = await response.json();
    if (!Array.isArray(promociones)) throw new Error('Respuesta inválida.');
    if (!promociones.length) {
      gridPromociones.innerHTML = '<div class="promo-state promo-empty"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i><h2>Pronto, nuevos motivos para celebrar</h2><p>Estamos preparando nuevas promociones. Mientras tanto, descubre nuestros productos artesanales.</p><a class="button button-primary" href="productos.html">Descubrir productos <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>';
      return;
    }
    const groups = new Map();
    promociones.forEach(p => {
      const key = p.temporada || 'Especiales de temporada';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    });
    gridPromociones.innerHTML = [...groups].map(([season, items]) => `<section class="promo-season"><div class="promo-season-heading"><span class="hero-brand">Por tiempo limitado</span><h2>${escaparHtml(season)}</h2></div><div class="promo-grid">${items.map(p => {
      const nombre = escaparHtml(p.nombre);
      const image = p.imagen ? `<button type="button" class="product-photo-button" data-gallery="promociones" data-src="${escaparHtml(p.imagen)}" data-title="${nombre}" aria-label="Ampliar imagen de ${nombre}"><img src="${escaparHtml(p.imagen)}" alt="${nombre}" loading="lazy"></button>` : '<span class="promo-no-image">D’Panes Express</span>';
      const price = p.precio_promocional != null ? `<div class="promo-price">$${Number(p.precio_promocional).toFixed(2)} ${p.precio_anterior != null && Number(p.precio_anterior) > Number(p.precio_promocional) ? `<del>$${Number(p.precio_anterior).toFixed(2)}</del>` : ''}</div>` : '';
      const days = Number(p.dias_anticipacion || 0);
      const notice = days > 0 ? `<p class="promo-advance"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> <strong>¡Planifica tu pedido!</strong><br>Pide con ${days} o más ${days === 1 ? 'día' : 'días'} de anticipación.</p>` : '';
      const message = `Hola, me interesa la promoción «${p.nombre}»${p.temporada ? ` de ${p.temporada}` : ''}. ¿Me ayudan con mi pedido?`;
      return `<article class="promo-card"><div class="promo-image">${image}<span class="promo-ribbon">Especial de temporada</span></div><div class="promo-info"><p class="promo-validity"><i class="fa-regular fa-clock" aria-hidden="true"></i> Hasta el ${escaparHtml(fechaPromo(p.fecha_fin))}</p><h3>${nombre}</h3>${p.descripcion ? `<p class="promo-description">${escaparHtml(p.descripcion)}</p>` : ''}${price}${notice}<a class="promo-order" href="https://wa.me/593999006555?text=${encodeURIComponent(message)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Pedir por WhatsApp</a></div></article>`;
    }).join('')}</div></section>`).join('');
  } catch (error) {
    console.error(error);
    if (!gridPromociones.querySelector('.promo-card')) {
      gridPromociones.innerHTML = '<div class="promo-state"><p>No pudimos cargar las promociones.</p><button class="button button-primary" type="button" id="retryPromos">Volver a intentar</button></div>';
      document.getElementById('retryPromos').addEventListener('click', cargarPromociones);
    }
  } finally { cargandoPromos = false; }
}
cargarPromociones();
// Keep availability current when returning from WhatsApp or leaving the page open.
window.addEventListener('focus', cargarPromociones);
setInterval(() => { if (!document.hidden) cargarPromociones(); }, 60000);
