/* ── SIDEBAR MÓVIL ── */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

/* ── AUTH ── */
const token = localStorage.getItem('dpx_token');
const admin = JSON.parse(localStorage.getItem('dpx_admin') || 'null');
if (!token || !admin) window.location.href = 'login.html';

const TABLAS_COMPLETAS = ['servicio_horno', 'otros'];

const CAT_INFO = {
  panaderia:      { label: 'Panadería',         icon: '🍞' },
  pasteleria:     { label: 'Pastelería',         icon: '🎂' },
  galleteria:     { label: 'Galletería',         icon: '🍪' },
  bocaditos:      { label: 'Bocaditos',          icon: '🍽️' },
  servicio_horno: { label: 'Servicio de Horno',  icon: '🔥' },
  otros:          { label: 'Otros',              icon: '⭐' },
};

/* ── INIT ── */
document.getElementById('adminNombre').textContent  = admin.nombre;
document.getElementById('adminRol').textContent     = admin.rol;
document.getElementById('adminAvatar').textContent  = admin.nombre[0].toUpperCase();
document.getElementById('topbarDate').textContent   = new Date().toLocaleDateString('es-EC', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

/* ── API HELPER ── */
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); return; }
  return res.json();
}

function logout() {
  localStorage.removeItem('dpx_token');
  localStorage.removeItem('dpx_admin');
  window.location.href = 'login.html';
}

/* ── NAVEGACIÓN ── */
let currentView = '';

document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    loadView(item.dataset.view);
    closeSidebar();
  });
});

function loadView(view) {
  currentView = view;
  if (view === 'dashboard') return renderDashboard();
  if (view === 'usuarios')  return renderUsuarios();
  if (view.startsWith('prod-')) return renderProductos(view.replace('prod-', ''));
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */
async function renderDashboard() {
  document.getElementById('topbarTitle').textContent = 'Dashboard';
  const data = await api('GET', '/api/admin/productos');

  const statsHtml = data.map(d => `
    <div class="stat-card">
      <div class="stat-icon">${CAT_INFO[d.tabla]?.icon || '📦'}</div>
      <div class="stat-num">${d.total}</div>
      <div class="stat-label">${CAT_INFO[d.tabla]?.label || d.tabla}</div>
    </div>`).join('');

  const usuariosData = await api('GET', '/api/admin/usuarios');

  document.getElementById('content').innerHTML = `
    <div class="stats-grid">
      ${statsHtml}
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-num">${usuariosData.length}</div>
        <div class="stat-label">Administradores</div>
      </div>
    </div>
    <div class="table-header" style="margin-top:1rem">
      <h3>Bienvenido, ${admin.nombre} 👋</h3>
    </div>
    <p style="color:var(--text-muted);font-size:0.875rem">Selecciona una sección del menú para gestionar productos o usuarios.</p>`;
}

/* ══════════════════════════════════════
   PRODUCTOS
══════════════════════════════════════ */
async function renderProductos(tabla) {
  const cat   = CAT_INFO[tabla];
  document.getElementById('topbarTitle').textContent = cat.label;
  const items = await api('GET', `/api/admin/productos/${tabla}`);
  const esCompleta = TABLAS_COMPLETAS.includes(tabla);

  const rows = items.map(p => `
    <tr>
      <td>${p.id}</td>
      <td class="td-img">
        ${p.imagen
          ? `<img src="${p.imagen.startsWith('http') ? p.imagen : '../' + p.imagen}" alt="${p.nombre}">`
          : `<div class="no-img"><i class="fa-regular fa-image"></i></div>`}
      </td>
      <td>${p.nombre}</td>
      ${esCompleta ? `<td>${p.descripcion || '<em style="opacity:.4">—</em>'}</td>` : ''}
      <td>
        <div class="td-actions">
          <button class="btn btn-upload btn-sm" onclick="uploadImagen('${tabla}',${p.id})" title="Subir imagen">
            <i class="fa-solid fa-camera"></i>
          </button>
          <button class="btn btn-edit btn-sm" onclick="editarProducto('${tabla}',${p.id},'${escHtml(p.nombre)}','${escHtml(p.imagen||'')}','${escHtml(p.descripcion||'')}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-delete btn-sm" onclick="eliminarProducto('${tabla}',${p.id},'${escHtml(p.nombre)}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');

  document.getElementById('content').innerHTML = `
    <div class="table-header">
      <h3>${cat.icon} ${cat.label}</h3>
      <button class="btn btn-primary" onclick="nuevoProducto('${tabla}')">
        <i class="fa-solid fa-plus"></i> Agregar
      </button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Imagen</th><th>Nombre</th>
            ${esCompleta ? '<th>Descripción</th>' : ''}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="${esCompleta?5:4}" style="text-align:center;padding:2rem;opacity:.4">Sin productos aún</td></tr>`}</tbody>
      </table>
    </div>`;
}

/* ── Modal nuevo producto ── */
function nuevoProducto(tabla) {
  const esCompleta = TABLAS_COMPLETAS.includes(tabla);
  openModal(`Agregar — ${CAT_INFO[tabla].label}`, `
    <div class="form-field"><label>Nombre *</label><input id="f_nombre" placeholder="Nombre del producto" required></div>
    ${esCompleta ? `<div class="form-field"><label>Descripción</label><textarea id="f_desc" placeholder="Descripción breve"></textarea></div>` : ''}
  `, async () => {
    const nombre = document.getElementById('f_nombre').value.trim();
    if (!nombre) return showModalAlert('El nombre es obligatorio', 'error');
    const body = { nombre, descripcion: esCompleta ? document.getElementById('f_desc').value : undefined };
    const res = await api('POST', `/api/admin/productos/${tabla}`, body);
    if (res.error) return showModalAlert(res.error, 'error');
    closeModal();
    renderProductos(tabla);
  });
}

/* ── Modal editar producto ── */
function editarProducto(tabla, id, nombre, imagen, descripcion) {
  const esCompleta = TABLAS_COMPLETAS.includes(tabla);
  openModal(`Editar — ${CAT_INFO[tabla].label}`, `
    <div class="form-field"><label>Nombre *</label><input id="f_nombre" value="${nombre}" required></div>
    <div class="form-field"><label>Imagen (ruta)</label><input id="f_imagen" value="${imagen}" placeholder="images/productos/foto.jpg"></div>
    ${esCompleta ? `<div class="form-field"><label>Descripción</label><textarea id="f_desc">${descripcion}</textarea></div>` : ''}
  `, async () => {
    const body = {
      nombre:      document.getElementById('f_nombre').value.trim(),
      imagen:      document.getElementById('f_imagen').value.trim() || null,
      descripcion: esCompleta ? document.getElementById('f_desc').value : undefined,
    };
    if (!body.nombre) return showModalAlert('El nombre es obligatorio', 'error');
    const res = await api('PUT', `/api/admin/productos/${tabla}/${id}`, body);
    if (res.error) return showModalAlert(res.error, 'error');
    closeModal();
    renderProductos(tabla);
  });
}

/* ── Modal eliminar producto ── */
function eliminarProducto(tabla, id, nombre) {
  openModal('Confirmar eliminación', `
    <p style="color:var(--text-muted)">¿Eliminar <strong style="color:var(--danger)">${nombre}</strong>? Esta acción no se puede deshacer.</p>
  `, async () => {
    const res = await api('DELETE', `/api/admin/productos/${tabla}/${id}`);
    if (res.error) return showModalAlert(res.error, 'error');
    closeModal();
    renderProductos(tabla);
  }, 'Eliminar', 'btn-delete');
}

/* ── Upload imagen ── */
function uploadImagen(tabla, id) {
  openModal('Subir imagen', `
    <div class="form-field">
      <label>Selecciona una imagen (JPG, PNG, WEBP — máx 5MB)</label>
      <input type="file" id="f_file" accept="image/jpeg,image/png,image/webp">
    </div>
  `, async () => {
    const file = document.getElementById('f_file').files[0];
    if (!file) return showModalAlert('Selecciona un archivo', 'error');
    const form = new FormData();
    form.append('imagen', file);
    const res = await fetch(`/api/upload/${tabla}/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (data.error) return showModalAlert(data.error, 'error');
    showModalAlert('Imagen actualizada correctamente', 'success');
    setTimeout(() => { closeModal(); renderProductos(tabla); }, 1000);
  }, 'Subir');
}

/* ══════════════════════════════════════
   USUARIOS
══════════════════════════════════════ */
async function renderUsuarios() {
  document.getElementById('topbarTitle').textContent = 'Usuarios Admin';
  const items = await api('GET', '/api/admin/usuarios');

  const rows = items.map(u => `
    <tr>
      <td>${u.id}</td>
      <td><strong>${u.nombre}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge badge-gold">${u.rol}</span></td>
      <td><span class="badge ${u.activo ? 'badge-green' : 'badge-red'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString('es-EC')}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-edit btn-sm" onclick="editarUsuario(${u.id},'${escHtml(u.nombre)}','${escHtml(u.email)}','${u.rol}',${u.activo})">
            <i class="fa-solid fa-pen"></i>
          </button>
          ${u.id !== admin.id ? `
          <button class="btn btn-delete btn-sm" onclick="eliminarUsuario(${u.id},'${escHtml(u.nombre)}')">
            <i class="fa-solid fa-trash"></i>
          </button>` : ''}
        </div>
      </td>
    </tr>`).join('');

  document.getElementById('content').innerHTML = `
    <div class="table-header">
      <h3>👥 Usuarios Administradores</h3>
      <button class="btn btn-primary" onclick="nuevoUsuario()">
        <i class="fa-solid fa-user-plus"></i> Nuevo usuario
      </button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function nuevoUsuario() {
  openModal('Nuevo usuario admin', `
    <div class="form-field"><label>Nombre *</label><input id="u_nombre" placeholder="Nombre completo"></div>
    <div class="form-field"><label>Email *</label><input id="u_email" type="email" placeholder="correo@ejemplo.com"></div>
    <div class="form-field"><label>Contraseña *</label><input id="u_pass" type="password" placeholder="Mínimo 6 caracteres"></div>
    <div class="form-field"><label>Rol</label>
      <select id="u_rol">
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
      </select>
    </div>
  `, async () => {
    const body = {
      nombre:   document.getElementById('u_nombre').value.trim(),
      email:    document.getElementById('u_email').value.trim(),
      password: document.getElementById('u_pass').value,
      rol:      document.getElementById('u_rol').value,
    };
    if (!body.nombre || !body.email || !body.password) return showModalAlert('Todos los campos son obligatorios', 'error');
    if (body.password.length < 6) return showModalAlert('La contraseña debe tener al menos 6 caracteres', 'error');
    const res = await api('POST', '/api/admin/usuarios', body);
    if (res.error) return showModalAlert(res.error, 'error');
    closeModal();
    renderUsuarios();
  });
}

function editarUsuario(id, nombre, email, rol, activo) {
  openModal('Editar usuario', `
    <div class="form-field"><label>Nombre *</label><input id="u_nombre" value="${nombre}"></div>
    <div class="form-field"><label>Email *</label><input id="u_email" type="email" value="${email}"></div>
    <div class="form-field"><label>Nueva contraseña <small style="text-transform:none;letter-spacing:0">(dejar vacío para no cambiar)</small></label><input id="u_pass" type="password" placeholder="••••••••"></div>
    <div class="form-field"><label>Rol</label>
      <select id="u_rol">
        <option value="admin" ${rol==='admin'?'selected':''}>Admin</option>
        <option value="superadmin" ${rol==='superadmin'?'selected':''}>Superadmin</option>
      </select>
    </div>
    <div class="form-field"><label>Estado</label>
      <select id="u_activo">
        <option value="true"  ${activo?'selected':''}>Activo</option>
        <option value="false" ${!activo?'selected':''}>Inactivo</option>
      </select>
    </div>
  `, async () => {
    const body = {
      nombre:   document.getElementById('u_nombre').value.trim(),
      email:    document.getElementById('u_email').value.trim(),
      password: document.getElementById('u_pass').value || undefined,
      rol:      document.getElementById('u_rol').value,
      activo:   document.getElementById('u_activo').value === 'true',
    };
    const res = await api('PUT', `/api/admin/usuarios/${id}`, body);
    if (res.error) return showModalAlert(res.error, 'error');
    closeModal();
    renderUsuarios();
  });
}

function eliminarUsuario(id, nombre) {
  openModal('Eliminar usuario', `
    <p style="color:var(--text-muted)">¿Eliminar al usuario <strong style="color:var(--danger)">${nombre}</strong>? No podrá acceder al panel.</p>
  `, async () => {
    const res = await api('DELETE', `/api/admin/usuarios/${id}`);
    if (res.error) return showModalAlert(res.error, 'error');
    closeModal();
    renderUsuarios();
  }, 'Eliminar', 'btn-delete');
}

/* ══════════════════════════════════════
   MODAL HELPER
══════════════════════════════════════ */
let _modalCallback = null;

function openModal(title, bodyHtml, callback, btnText = 'Guardar', btnClass = 'btn-primary') {
  _modalCallback = callback;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalForm').innerHTML    = bodyHtml;
  document.getElementById('modalAlert').className  = 'modal-alert hidden';
  document.getElementById('btnSubmit').textContent = btnText;
  document.getElementById('btnSubmit').className   = `btn ${btnClass}`;
  document.getElementById('modalBackdrop').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.add('hidden');
  _modalCallback = null;
}

async function submitModal() {
  if (_modalCallback) await _modalCallback();
}

function showModalAlert(msg, type) {
  const el = document.getElementById('modalAlert');
  el.textContent = msg;
  el.className   = `modal-alert ${type}`;
}

// Cerrar modal al hacer clic fuera
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
});

function escHtml(str) { return (str||'').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

/* ── INIT ── */
renderDashboard();
