const API = '/api/productos';

const CATEGORIAS = {
  panaderia:                { label: 'Panadería',         icon: '🍞', desc: 'Panes frescos y artesanales',        img: 'images/panaderia.png' },
  pasteleria:               { label: 'Pastelería',         icon: '🎂', desc: 'Pasteles y postres especiales',       img: 'images/pasteleria.jpg' },
  galleteria:               { label: 'Galletería',         icon: '🍪', desc: 'Galletas y bocados dulces',           img: 'images/panaderia.png' },
  bocaditos:                { label: 'Bocaditos',          icon: '🍽️', desc: 'Bocaditos para eventos',              img: 'images/bocaditos.jpg' },
  servicio_horno:           { label: 'Servicio de Horno',  icon: '🔥', desc: 'Horneamos tu pedido especial',        img: 'images/horneado.jpg' },
  otros:                    { label: 'Otros',              icon: '⭐', desc: 'Servicios y productos adicionales',   img: 'images/hero.jpg' },
  pasteleria_eventos:       { label: 'Eventos',            icon: '🎉', desc: 'Pasteles y postres para tu evento',   img: 'images/pasteleria.jpg' },
  pasteleria_personalizados:{ label: 'Personalizados',     icon: '🎨', desc: 'Diseños únicos hechos a tu medida',   img: 'images/pasteleria.jpg' },
};

// Mapa de categorías con subcategorías
const SUBCATEGORIAS = {
  pasteleria: ['pasteleria_eventos', 'pasteleria_personalizados'],
  bocaditos:  ['bocaditos_sal', 'bocaditos_dulce', 'bocaditos_carne'],
};

// Conjunto de claves que son subcategorías (no van en el grid principal)
const SUBCATS_KEYS = new Set(Object.values(SUBCATEGORIAS).flat());

Object.assign(CATEGORIAS, {
  bocaditos_sal: { label: 'Bocaditos de sal', icon: '🧂' },
  bocaditos_dulce: { label: 'Bocaditos de dulce', icon: '🍬' },
  bocaditos_carne: { label: 'Bocaditos de carne', icon: '🥩' }
});
let todosLosProductos = [];
let categoriaActual;
let listo = false;
const grid = document.getElementById('prodGrid');
const empty = document.getElementById('prodEmpty');
const back = document.getElementById('btnBack');
const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const padre = cat => Object.keys(SUBCATEGORIAS).find(key => SUBCATEGORIAS[key].includes(cat)) || '';
const categoriaURL = () => {
  const cat = new URLSearchParams(location.search).get('cat');
  return CATEGORIAS[cat] ? cat : '';
};
function urlCategoria(cat) {
  const url = new URL(location.href);
  if (cat) url.searchParams.set('cat', cat); else url.searchParams.delete('cat');
  return url;
}
function guardarPosicion() {
  if (!history.state?.dpxGallery && !history.state?.dpxMenu) {
    history.replaceState({ ...history.state, dpxProducts: { ...history.state?.dpxProducts, cat: categoriaURL(), scroll: scrollY } }, '');
  }
}
function navegar(cat) {
  if (cat === categoriaActual) return;
  guardarPosicion();
  const y = Math.max(0, document.querySelector('.prod-section').offsetTop - 165);
  history.pushState({ dpxProducts: { cat, scroll: y, internal: true } }, '', urlCategoria(cat));
  renderizar(cat, y);
}
function tarjetaCategoria(key, nombre, icon, imagen, count) {
  return `<button type="button" class="cat-card" data-category="${html(key)}">${imagen ? `<img class="category-photo" src="${html(imagen)}" alt="" loading="lazy">` : ''}<span class="cat-card-overlay"></span><span class="cat-card-icon">${icon}</span><h3>${html(nombre)}</h3><span class="cat-count">${count} producto${count === 1 ? '' : 's'}</span></button>`;
}
function renderizar(cat, y) {
  if (!listo) return;
  categoriaActual = cat;
  back.classList.toggle('hidden', !cat);
  back.querySelector('span').textContent = padre(cat) ? `Volver a ${CATEGORIAS[padre(cat)].label}` : 'Todas las categorías';
  document.querySelectorAll('.filtro-btn').forEach(button => {
    const active = button.dataset.cat === (padre(cat) || cat);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  empty.classList.add('hidden');
  grid.className = 'prod-grid';
  if (!cat) {
    grid.classList.add('cat-grid');
    grid.innerHTML = Object.entries(CATEGORIAS).filter(([key]) => !SUBCATS_KEYS.has(key)).map(([key, info]) => {
      const keys = SUBCATEGORIAS[key] || [key];
      return tarjetaCategoria(key, info.label, info.icon, info.img, todosLosProductos.filter(p => keys.includes(p.categoria)).length);
    }).join('');
  } else if (SUBCATEGORIAS[cat]) {
    grid.classList.add('cat-grid', 'sub-grid');
    // Keep every supported subcategory reachable, even when its cover record is missing.
    grid.innerHTML = SUBCATEGORIAS[cat].map(key => {
      const info = CATEGORIAS[key];
      const cover = todosLosProductos.find(p => p.categoria === cat && `${cat}_${p.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_')}` === key);
      return tarjetaCategoria(key, cover?.nombre || info.label, info.icon, cover?.imagen || CATEGORIAS[cat].img, todosLosProductos.filter(p => p.categoria === key).length);
    }).join('');
  } else {
    const items = todosLosProductos.filter(p => p.categoria === cat);
    empty.classList.toggle('hidden', items.length > 0);
    grid.innerHTML = items.map(p => `<article class="prod-card"><div class="card-img-wrap">${p.imagen ? `<button type="button" class="product-photo-button" data-gallery="productos" data-src="${html(p.imagen)}" data-title="${html(p.nombre)}" aria-label="Ampliar imagen de ${html(p.nombre)}"><img src="${html(p.imagen)}" alt="${html(p.nombre)}" loading="lazy"><span class="card-overlay" aria-hidden="true"><i class="fa-solid fa-magnifying-glass-plus"></i></span></button>` : `<div class="card-placeholder">${CATEGORIAS[cat].icon}</div>`}</div><div class="card-info"><span class="card-badge">${html(CATEGORIAS[cat].label)}</span><p class="card-nombre">${html(p.nombre)}</p>${p.descripcion ? `<p class="card-descripcion">${html(p.descripcion)}</p>` : ''}<a class="button whatsapp-consult" href="${html(DpxPedidos.producto(p.nombre))}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp sobre ${html(p.nombre)}">Consultar por WhatsApp</a></div></article>`).join('');
  }
  if (Number.isFinite(y)) requestAnimationFrame(() => scrollTo(0, y));
}
grid.addEventListener('click', event => {
  const card = event.target.closest('[data-category]');
  if (card) navegar(card.dataset.category);
});
document.querySelectorAll('.filtro-btn').forEach(button => button.addEventListener('click', () => navegar(button.dataset.cat)));
back.addEventListener('click', () => {
  if (history.state?.dpxProducts?.internal) history.back();
  else navegar(padre(categoriaActual));
});
window.addEventListener('popstate', () => {
  if (categoriaURL() !== categoriaActual) renderizar(categoriaURL(), history.state?.dpxProducts?.scroll ?? 0);
});
let scrollTimer;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(guardarPosicion, 120);
}, { passive: true });
window.addEventListener('pagehide', guardarPosicion);
document.addEventListener('click', event => { if (event.target.closest('a[href]')) guardarPosicion(); });

async function cargarProductos() {
  grid.textContent = 'Cargando productos…';
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error('No se pudieron cargar los productos.');
    todosLosProductos = await response.json();
    if (!Array.isArray(todosLosProductos)) throw new Error('Respuesta inválida.');
    listo = true;
    const cat = categoriaURL();
    const saved = history.state?.dpxProducts;
    if (!saved) {
      // Direct category links get a parent entry so mobile Back stays in Products first.
      history.replaceState({ ...history.state, dpxProducts: { cat: '', scroll: 0 } }, '', urlCategoria(''));
      if (padre(cat)) history.pushState({ dpxProducts: { cat: padre(cat), scroll: 0, internal: true } }, '', urlCategoria(padre(cat)));
      if (cat) history.pushState({ dpxProducts: { cat, scroll: 0, internal: true } }, '', urlCategoria(cat));
    }
    renderizar(cat, saved?.scroll ?? 0);
  } catch (error) {
    grid.innerHTML = '<p>No pudimos cargar los productos. <button type="button" id="retryProducts">Volver a intentar</button></p>';
    document.getElementById('retryProducts').addEventListener('click', cargarProductos);
    console.error(error);
  }
}
cargarProductos();
