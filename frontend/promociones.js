const gridPromociones = document.getElementById('promoGrid');

function escaparHtml(valor = '') {
  return String(valor).replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caracter]);
}

async function cargarPromociones() {
  try {
    const response = await fetch('/api/promociones');
    if (!response.ok) throw new Error('No se pudieron cargar los combos');
    const promociones = await response.json();
    if (!promociones.length) {
      gridPromociones.innerHTML = '<p class="promo-state"><i class="fa-solid fa-bread-slice"></i><br>Pronto tendremos nuevos combos para ti.</p>';
      return;
    }
    gridPromociones.innerHTML = promociones.map(promo => {
      const imagen = promo.imagen ? `<button type="button" class="product-photo-button" data-gallery="combos" data-src="${escaparHtml(promo.imagen)}" data-title="${escaparHtml(promo.nombre)}" aria-label="Ampliar imagen de ${escaparHtml(promo.nombre)}"><img src="${escaparHtml(promo.imagen)}" alt="${escaparHtml(promo.nombre)}" loading="lazy"></button>` : '';
      const precio = promo.precio_promocional != null
        ? `<div class="promo-price">$${Number(promo.precio_promocional).toFixed(2)} ${promo.precio_anterior != null ? `<del>$${Number(promo.precio_anterior).toFixed(2)}</del>` : ''}</div>`
        : '';
      return `<article class="promo-card"><div class="promo-image">${imagen}<span class="promo-ribbon"><i class="fa-solid fa-tag"></i> Combo</span></div><div class="promo-info"><h3>${escaparHtml(promo.nombre)}</h3>${promo.descripcion ? `<p>${escaparHtml(promo.descripcion)}</p>` : ''}${precio}</div></article>`;
    }).join('');
  } catch (error) {
    console.error(error);
    gridPromociones.innerHTML = '<p class="promo-state">No pudimos cargar los combos. Intenta nuevamente más tarde.</p>';
  }
}

cargarPromociones();
