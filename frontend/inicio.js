'use strict';
(() => {
  const grid = document.getElementById('home-favorites');
  const status = document.getElementById('favorites-status');
  const labels = { panaderia: 'Panadería', pasteleria_eventos: 'Tortas para eventos', pasteleria_personalizados: 'Tortas personalizadas', galleteria: 'Galletería', bocaditos_sal: 'Bocaditos de sal', bocaditos_dulce: 'Bocaditos de dulce', bocaditos_carne: 'Bocaditos de carne' };
  const fallback = { panaderia: 'images/panaderia.png', galleteria: 'images/panaderia.png' };
  const photo = p => {
    try {
      const url = new URL(p.imagen, location.href);
      if (p.imagen && ['http:', 'https:'].includes(url.protocol)) return url.href;
    } catch {}
    return fallback[p.categoria] || (p.categoria.startsWith('bocaditos') ? 'images/bocaditos.jpg' : 'images/pasteleria.jpg');
  };
  async function load() {
    try {
      const response = await fetch('/api/productos', { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('Catálogo no disponible');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Catálogo inválido');
      // Rotate categories to keep the selection varied; parent records are category covers.
      const groups = Object.keys(labels).map(cat => data.filter(p => p.categoria === cat && typeof p.nombre === 'string' && p.nombre.trim()));
      const selected = [];
      while (selected.length < 6 && groups.some(group => group.length)) {
        for (const group of groups) { if (group.length && selected.length < 6) selected.push(group.shift()); }
      }
      grid.replaceChildren();
      selected.forEach(p => {
        const card = document.createElement('article');
        card.className = 'home-product-card';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'home-product-photo';
        Object.assign(button.dataset, { gallery: 'favoritos', src: photo(p), title: p.nombre });
        button.setAttribute('aria-label', `Ampliar imagen de ${p.nombre}`);
        const img = document.createElement('img');
        Object.assign(img, { src: photo(p), alt: p.nombre, loading: 'lazy' });
        img.addEventListener('error', () => { button.hidden = true; }, { once: true });
        button.append(img);
        const content = document.createElement('div');
        content.className = 'home-product-info';
        const category = document.createElement('span');
        category.className = 'section-eyebrow';
        category.textContent = labels[p.categoria];
        const title = document.createElement('h3');
        title.textContent = p.nombre;
        const link = document.createElement('a');
        Object.assign(link, { href: DpxPedidos.producto(p.nombre), target: '_blank', rel: 'noopener noreferrer', className: 'button whatsapp-consult', textContent: 'Consultar por WhatsApp' });
        link.setAttribute('aria-label', `Consultar por WhatsApp sobre ${p.nombre}`);
        content.append(category, title, link);
        card.append(button, content);
        grid.append(card);
      });
      status.textContent = selected.length ? '' : 'Pronto encontrarás aquí una selección de productos. Mientras tanto, consulta nuestro catálogo.';
      if (!selected.length) addCatalogLink();
    } catch {
      status.textContent = 'No pudimos cargar la selección. Puedes explorar el catálogo o consultarnos por WhatsApp.';
      addCatalogLink();
    }
  }
  function addCatalogLink() {
    const link = document.createElement('a');
    Object.assign(link, { href: 'productos.html', textContent: 'Ver catálogo', className: 'button button-primary' });
    grid.replaceChildren(link);
  }
  load();
  let service = 'torta';
  const form = document.getElementById('celebration-form');
  const now = new Date();
  form.elements.fecha.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
    service = button.dataset.service;
    document.querySelectorAll('[data-service]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('quantity-label').textContent = service === 'horno' ? 'Cantidad de preparaciones o bandejas' : 'Número de personas';
    document.getElementById('details-label').textContent = service === 'horno' ? 'Qué deseas hornear y tamaño aproximado' : service === 'bocaditos' ? '¿Dulces, salados o combinados? Cuéntanos tu idea' : 'Sabores, diseño o idea para tu torta';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fecha = data.get('fecha').split('-').reverse().join('/');
    const message = `Hola, soy ${data.get('nombre').trim()}. Quiero consultar por ${service === 'torta' ? 'una torta' : service === 'bocaditos' ? 'bocaditos' : 'el servicio de horno'} en D'Panes Express.\nFecha solicitada: ${fecha}\n${service === 'horno' ? 'Preparaciones o bandejas' : 'Personas'}: ${data.get('cantidad')}\nModalidad: ${data.get('entrega')}\nDetalles: ${data.get('detalles').trim() || 'Por definir'}\nQuedo pendiente de confirmar precio, disponibilidad y entrega.`;
    window.open(DpxPedidos.url(message), '_blank', 'noopener,noreferrer');
  });
})();
