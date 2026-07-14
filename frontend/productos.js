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

let todosLosProductos = [];
let vistaAnterior = 'categorias';

async function cargarProductos() {
  try {
    const res = await fetch(API);
    todosLosProductos = await res.json();
    mostrarCategorias();
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

/* ── VISTA 1: tarjetas de categoría (solo top-level) ── */
function mostrarCategorias() {
  vistaAnterior = 'categorias';
  const grid  = document.getElementById('prodGrid');
  const empty = document.getElementById('prodEmpty');
  const back  = document.getElementById('btnBack');

  back.classList.add('hidden');
  empty.classList.add('hidden');

  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));

  grid.style.opacity = '0';
  grid.style.transform = 'translateY(10px)';
  grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    grid.className = 'prod-grid cat-grid';

    // Solo mostrar categorías de primer nivel (no subcategorías)
    const topLevel = Object.entries(CATEGORIAS).filter(([key]) => !SUBCATS_KEYS.has(key));

    grid.innerHTML = topLevel.map(([key, cat], i) => {
      // Para categorías con sub, sumar productos de todas las sub-tablas
      const subKeys = SUBCATEGORIAS[key] || [key];
      const count   = todosLosProductos.filter(p => subKeys.includes(p.categoria)).length;
      const bgStyle = cat.img
        ? `style="animation-delay:${i * 0.07}s; background-image: url('${cat.img}');"`
        : `style="animation-delay:${i * 0.07}s;"`;
      return `
        <div class="cat-card cat-${key}" data-cat="${key}" ${bgStyle}>
          <div class="cat-card-overlay"></div>
          <div class="cat-card-icon">${cat.icon}</div>
          <h3>${cat.label}</h3>
          <p>${cat.desc}</p>
          <span class="cat-count">${count} producto${count !== 1 ? 's' : ''}</span>
        </div>`;
    }).join('');

    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';

    grid.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.cat;
        if (SUBCATEGORIAS[key]) {
          mostrarSubcategorias(key);
        } else {
          vistaAnterior = 'categorias';
          mostrarProductos(key);
        }
      });
    });
  }, 200);
}

/* ── VISTA 2: subcategorías — generadas dinámicamente desde la tabla padre ── */
function mostrarSubcategorias(parentCat) {
  const grid  = document.getElementById('prodGrid');
  const empty = document.getElementById('prodEmpty');
  const back  = document.getElementById('btnBack');

  back.classList.remove('hidden');
  back.querySelector('span').textContent = CATEGORIAS[parentCat]?.label || parentCat;

  empty.classList.add('hidden');
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));

  // Los registros de la tabla `pasteleria` definen las subcategorías dinámicamente
  const subs = todosLosProductos.filter(p => p.categoria === parentCat);

  grid.style.opacity = '0';
  grid.style.transform = 'translateY(10px)';
  grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    grid.className = 'prod-grid cat-grid sub-grid';

    if (!subs.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
      return;
    }

    grid.innerHTML = subs.map((sub, i) => {
      // "Eventos" → pasteleria_eventos  |  "Personalizados" → pasteleria_personalizados
      const tablaKey = `${parentCat}_${sub.nombre.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '_')}`;
      const count    = todosLosProductos.filter(p => p.categoria === tablaKey).length;
      const catInfo  = CATEGORIAS[tablaKey] || {};
      const icon     = catInfo.icon || '🎂';
      const imgStyle = sub.imagen ? `background-image: url('${sub.imagen}');` : '';
      return `
        <div class="cat-card cat-${parentCat}" data-cat="${tablaKey}"
             style="animation-delay:${i * 0.1}s; ${imgStyle}">
          <div class="cat-card-overlay"></div>
          <div class="cat-card-icon">${icon}</div>
          <h3>${sub.nombre}</h3>
          <span class="cat-count">${count} producto${count !== 1 ? 's' : ''}</span>
        </div>`;
    }).join('');

    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';

    grid.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        vistaAnterior = 'sub_' + parentCat;
        mostrarProductos(card.dataset.cat);
      });
    });
  }, 200);
}

/* ── VISTA 3: productos de una categoría/subcategoría ── */
function mostrarProductos(cat) {
  const grid  = document.getElementById('prodGrid');
  const empty = document.getElementById('prodEmpty');
  const back  = document.getElementById('btnBack');

  back.classList.remove('hidden');
  back.querySelector('span').textContent = CATEGORIAS[cat]?.label || cat;

  const lista = todosLosProductos.filter(p => p.categoria === cat);

  document.querySelectorAll('.filtro-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });

  grid.style.opacity = '0';
  grid.style.transform = 'translateY(10px)';
  grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    if (!lista.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
      return;
    }

    empty.classList.add('hidden');
    grid.className = 'prod-grid';
    grid.innerHTML = lista.map((p, i) => crearCard(p, i)).join('');
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 200);
}

/* ── CARD de producto ── */
function crearCard(p, i) {
  const cat   = CATEGORIAS[p.categoria] || { label: p.categoria, icon: '📦' };
  const delay = (i % 8) * 0.05;

  const imgHtml = p.imagen
    ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`
    : `<div class="card-placeholder ${p.categoria}">${cat.icon}</div>`;

  const descHtml = p.descripcion
    ? `<p class="card-descripcion">${p.descripcion}</p>`
    : '';

  return `
    <div class="prod-card" style="animation-delay:${delay}s">
      <div class="card-img-wrap" ${p.imagen ? `data-img="${p.imagen}" data-nombre="${p.nombre}"` : ''}>
        ${imgHtml}
        ${p.imagen ? `<div class="card-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>` : ''}
      </div>
      <div class="card-info">
        <span class="card-badge">${cat.label}</span>
        <p class="card-nombre">${p.nombre}</p>
        ${descHtml}
      </div>
    </div>`;
}

/* ── LIGHTBOX: ampliar imagen al hacer click ── */
const lightbox    = document.getElementById('imgLightbox');
const lightboxImg = document.getElementById('imgLightboxImg');

function abrirLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
  lightbox.classList.add('hidden');
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

document.getElementById('prodGrid').addEventListener('click', (e) => {
  const wrap = e.target.closest('.card-img-wrap[data-img]');
  if (wrap) abrirLightbox(wrap.dataset.img, wrap.dataset.nombre);
});

document.getElementById('imgLightboxClose').addEventListener('click', cerrarLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) cerrarLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) cerrarLightbox();
});

/* ── EVENTOS ── */

// Filtros → respetan el sistema de subcategorías
document.querySelectorAll('.filtro-btn[data-cat]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.cat;
    vistaAnterior = 'categorias';
    if (SUBCATEGORIAS[key]) {
      mostrarSubcategorias(key);
    } else {
      mostrarProductos(key);
    }
  });
});

// Botón volver: regresa al nivel anterior
document.getElementById('btnBack').addEventListener('click', () => {
  if (vistaAnterior.startsWith('sub_')) {
    const parent = vistaAnterior.replace('sub_', '');
    vistaAnterior = 'categorias';
    mostrarSubcategorias(parent);
  } else {
    mostrarCategorias();
  }
});

cargarProductos();
