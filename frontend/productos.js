const API = '/api/productos';

const CATEGORIAS = {
  panaderia:       { label: 'Panadería',         icon: '🍞', desc: 'Panes frescos y artesanales',        img: 'images/panaderia.png' },
  pasteleria:      { label: 'Pastelería',         icon: '🎂', desc: 'Pasteles y postres especiales',       img: 'images/pasteleria.jpg' },
  galleteria:      { label: 'Galletería',         icon: '🍪', desc: 'Galletas y bocados dulces',           img: 'images/panaderia.png' },
  bocaditos:       { label: 'Bocaditos',          icon: '🍽️', desc: 'Bocaditos para eventos',              img: 'images/bocaditos.jpg' },
  servicio_horno:  { label: 'Servicio de Horno',  icon: '🔥', desc: 'Horneamos tu pedido especial',        img: 'images/horneado.jpg' },
  otros:           { label: 'Otros',              icon: '⭐', desc: 'Servicios y productos adicionales',   img: 'images/hero.jpg' },
};

let todosLosProductos = [];
let vistaActual = 'categorias'; // 'categorias' | categoria específica

async function cargarProductos() {
  try {
    const res = await fetch(API);
    todosLosProductos = await res.json();
    mostrarCategorias();
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

/* ── VISTA 1: tarjetas de categoría ── */
function mostrarCategorias() {
  vistaActual = 'categorias';
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
    grid.innerHTML = Object.entries(CATEGORIAS).map(([key, cat], i) => {
      const count = todosLosProductos.filter(p => p.categoria === key).length;
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

    // Click en tarjeta de categoría
    grid.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => mostrarProductos(card.dataset.cat));
    });
  }, 200);
}

/* ── VISTA 2: productos de una categoría ── */
function mostrarProductos(cat) {
  vistaActual = cat;
  const grid  = document.getElementById('prodGrid');
  const empty = document.getElementById('prodEmpty');
  const back  = document.getElementById('btnBack');

  back.classList.remove('hidden');
  back.querySelector('span').textContent = CATEGORIAS[cat]?.label || cat;

  const lista = todosLosProductos.filter(p => p.categoria === cat);

  // Actualizar botón activo en filtros
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
      <div class="card-img-wrap">
        ${imgHtml}
        <div class="card-overlay">
          <a href="https://wa.me/593999006555?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.nombre)}" target="_blank">
            <i class="fa-brands fa-whatsapp"></i> Pedir ahora
          </a>
        </div>
      </div>
      <div class="card-info">
        <span class="card-badge">${cat.label}</span>
        <p class="card-nombre">${p.nombre}</p>
        ${descHtml}
      </div>
    </div>`;
}

/* ── EVENTOS ── */

// Filtros → van directo a los productos de esa categoría
document.querySelectorAll('.filtro-btn[data-cat]').forEach(btn => {
  btn.addEventListener('click', () => {
    mostrarProductos(btn.dataset.cat);
  });
});

// Botón volver
document.getElementById('btnBack').addEventListener('click', mostrarCategorias);

cargarProductos();
