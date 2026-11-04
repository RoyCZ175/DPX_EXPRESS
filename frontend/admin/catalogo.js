'use strict';

(() => {
  const token = localStorage.getItem('dpx_token');
  if (!token || !localStorage.getItem('dpx_admin')) {
    location.replace('login.html');
    return;
  }
  const categories = [
    ['panaderia', 'Panadería'], ['pasteleria', 'Pastelería'],
    ['pasteleria_eventos', 'Pasteles para eventos'], ['pasteleria_personalizados', 'Pasteles personalizados'],
    ['galleteria', 'Galletería'], ['bocaditos', 'Bocaditos'],
    ['bocaditos_sal', 'Bocaditos de sal'], ['bocaditos_dulce', 'Bocaditos de dulce'],
    ['bocaditos_carne', 'Bocaditos de carne'], ['servicio_horno', 'Servicio de horno'], ['otros', 'Otros productos']
  ];
  const catalog = document.getElementById('catalog');
  const status = document.getElementById('status');
  const printButton = document.getElementById('printCatalog');
  const includeCombos = document.getElementById('includeCombos');
  const retry = document.getElementById('retry');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const imageURL = value => {
    if (!value) return '';
    try {
      const url = new URL(value, new URL('../', location.href));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const image = (src, alt, className = '') => `<img src="${escape(src)}" alt="${escape(alt)}" class="${className}" loading="eager">`;
  const logo = imageURL('images/logodpx.png');
  let groups = [];
  let version = 0;

  async function request(url) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
    if (response.status === 401 || response.status === 403) {
      location.replace('login.html');
      throw new Error('Tu sesión expiró. Vuelve a ingresar al panel.');
    }
    if (!response.ok) throw new Error('No pudimos cargar todos los productos. Vuelve a intentar.');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('La respuesta del catálogo no es válida.');
    return data;
  }

  function card(product, combo) {
    const src = imageURL(product.imagen);
    const price = combo && product.precio_promocional != null && Number.isFinite(Number(product.precio_promocional))
      ? `<p class="price">${escape(new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(product.precio_promocional)))}</p>` : '';
    const validity = combo && product.fecha_fin ? `<p>Válida hasta: ${escape(product.fecha_fin)}</p>` : '';
    const advance = combo && Number(product.dias_anticipacion) > 0 ? `<p><strong>Pedir con ${Number(product.dias_anticipacion)} o más días de anticipación.</strong></p>` : '';
    return `<article class="card"><div class="photo">${src ? image(src, product.nombre) : '<span>D’Panes Express</span>'}</div><h3>${escape(product.nombre)}</h3>${product.descripcion ? `<p>${escape(product.descripcion)}</p>` : ''}${price}${validity}${advance}</article>`;
  }

  async function render() {
    const current = ++version;
    printButton.disabled = true;
    status.textContent = 'Preparando catálogo e imágenes…';
    const selected = groups.filter(group => group.items.length && (!group.combo || includeCombos.checked));
    const count = selected.reduce((total, group) => total + group.items.length, 0);
    if (!count) {
      catalog.replaceChildren();
      status.textContent = 'No hay productos para incluir en el catálogo.';
      return;
    }
    const date = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long' });
    const pages = [];
    for (const group of selected) {
      // Four products per page keeps photographs large and leaves space for descriptions.
      for (let i = 0; i < group.items.length; i += 4) pages.push({ ...group, items: group.items.slice(i, i + 4) });
    }
    catalog.innerHTML = `<section class="sheet cover"><div>${image(logo, "D'Panes Express", 'cover-logo')}<p class="eyebrow">Hecho para compartir</p><h1>Catálogo<span>D’Panes Express</span></h1><p>Panadería, pastelería y bocaditos artesanales<br>Tradición y sabor en cada ocasión.</p></div>${image(imageURL('images/hornoser.jpg'), 'Nuestra panadería', 'cover-photo')}<div><p class="eyebrow">${escape(date)} · ${count} productos y opciones</p><div class="contact"><strong>Hablemos de tu próximo pedido</strong><br><a href="https://wa.me/593999006555">WhatsApp: +593 99 900 6555</a><br>Quito, Ecuador · <a href="https://dpx-express.onrender.com/">dpx-express.onrender.com</a></div></div></section>` + pages.map((page, index) => `<section class="sheet"><header class="page-header"><span>D’Panes Express</span>${image(logo, "D'Panes Express")}</header><p class="eyebrow">Nuestro catálogo · ${escape(date)}</p><h2 class="section-title">${escape(page.label)}</h2><p class="section-intro">Artesanales, preparados con dedicación para ti.</p><div class="cards">${page.items.map(item => card(item, page.combo)).join('')}</div><footer class="page-footer"><span>Pedidos: +593 99 900 6555 · Quito<br>Consulta disponibilidad y cotiza tu pedido por WhatsApp.</span><span>${index + 2} / ${pages.length + 1}</span></footer></section>`).join('');
    let failed = 0;
    await Promise.all([...catalog.querySelectorAll('img')].map(img => new Promise(resolve => {
      let done = false;
      const finish = success => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (!success) {
          failed++;
          const fallback = document.createElement('span');
          fallback.textContent = img.alt || 'D’Panes Express';
          img.replaceWith(fallback);
        }
        resolve();
      };
      const timer = setTimeout(() => finish(false), 20000);
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      if (img.complete) finish(img.naturalWidth > 0);
    })));
    if (current !== version) return;
    printButton.disabled = false;
    status.textContent = `Catálogo listo: ${count} productos y opciones. ${failed ? `${failed} imágenes no cargaron; se muestra su nombre. Puedes volver a intentar antes de imprimir.` : 'Las imágenes están listas para imprimir.'}`;
    retry.hidden = !failed;
  }

  async function load() {
    printButton.disabled = true;
    retry.hidden = true;
    includeCombos.disabled = true;
    status.textContent = 'Cargando tus productos actuales…';
    try {
      groups = await Promise.all(categories.map(async ([key, label]) => ({ label, items: await request(`/api/admin/productos/${key}`) })));
      groups.push({ label: 'Promociones de temporada', combo: true, items: await request('/api/promociones') });
      await render();
    } catch (error) {
      catalog.replaceChildren();
      status.textContent = error.message || 'No pudimos preparar el catálogo.';
      retry.hidden = false;
    } finally {
      includeCombos.disabled = false;
    }
  }
  includeCombos.addEventListener('change', render);
  retry.addEventListener('click', load);
  printButton.addEventListener('click', () => window.print());
  load();
})();
