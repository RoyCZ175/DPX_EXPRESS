const promoEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
let promocionesAdmin = [];
const estadosPromo = { borrador: 'Borrador', programada: 'Programada', activa: 'Activa', pausada: 'Pausada', finalizada: 'Finalizada' };
async function promoRequest(method, url, body) {
  const result = await api(method, url, body);
  if (!result || result.error) throw new Error(result?.error || 'No se pudo completar la operación.');
  return result;
}
async function renderPromociones() {
  document.getElementById('topbarTitle').textContent = 'Promociones';
  const content = document.getElementById('content');
  content.textContent = 'Cargando promociones…';
  try {
    promocionesAdmin = await promoRequest('GET', '/api/admin/promociones');
    const rows = promocionesAdmin.map(p => `<tr><td>${p.imagen ? `<img src="${promoEscape(p.imagen)}" alt="" style="width:65px;height:55px;object-fit:cover;border-radius:8px">` : '—'}</td><td><strong>${promoEscape(p.nombre)}</strong><br><small>${promoEscape(p.temporada || 'Sin temporada')}</small></td><td>${promoEscape(p.fecha_inicio || 'Sin inicio')}<br>${promoEscape(p.fecha_fin || 'Sin fin')}</td><td>${p.precio_promocional == null ? 'Por cotizar' : '$' + Number(p.precio_promocional).toFixed(2)}</td><td><span class="badge ${p.estado === 'activa' ? 'badge-green' : 'badge-red'}">${estadosPromo[p.estado] || 'Borrador'}</span></td><td><div class="td-actions"><button class="btn btn-edit btn-sm" data-promo-action="edit" data-id="${Number(p.id)}">Editar</button><button class="btn btn-edit btn-sm" data-promo-action="duplicate" data-id="${Number(p.id)}">Duplicar</button>${p.publicada ? `<button class="btn btn-edit btn-sm" data-promo-action="pause" data-id="${Number(p.id)}">${p.activa ? 'Pausar' : 'Reanudar'}</button>` : ''}<button class="btn btn-delete btn-sm" data-promo-action="delete" data-id="${Number(p.id)}">Eliminar</button></div></td></tr>`).join('');
    content.innerHTML = `<div class="table-header"><h3>Promociones de temporada</h3><button class="btn btn-primary" id="newPromo">Crear promoción</button></div><p style="line-height:1.6;margin-bottom:1.25rem;color:var(--text-muted)">Las promociones publicadas aparecen solo entre sus fechas de inicio y fin, según la hora de Quito. Puedes pausarlas cuando quieras. Las anteriores se conservan como borradores para revisar sus fechas.</p><p id="promoFeedback" role="status"></p><div class="table-wrap"><table><thead><tr><th>Foto</th><th>Promoción / temporada</th><th>Inicio / fin</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Todavía no hay promociones. Crea tu primera oferta de temporada.</td></tr>'}</tbody></table></div>`;
    document.getElementById('newPromo').addEventListener('click', () => editarOferta());
    content.querySelectorAll('[data-promo-action]').forEach(button => button.addEventListener('click', async () => {
      const p = promocionesAdmin.find(item => item.id === Number(button.dataset.id));
      const action = button.dataset.promoAction;
      if (action === 'edit') return editarOferta(p);
      if (action === 'duplicate') return editarOferta({ ...p, id: undefined, nombre: `${p.nombre.slice(0, 110)} (copia)`, publicada: false, activa: true, fecha_inicio: '', fecha_fin: '' });
      if (action === 'delete') return openModal('Eliminar promoción', `<p>¿Eliminar <strong>${promoEscape(p.nombre)}</strong>? Esta acción no se puede deshacer.</p>`, async () => {
        try { await promoRequest('DELETE', `/api/admin/promociones/${p.id}`); closeModal(); await renderPromociones(); }
        catch (error) { showModalAlert(error.message, 'error'); }
      }, 'Eliminar', 'btn-delete');
      button.disabled = true;
      try { await promoRequest('PUT', `/api/admin/promociones/${p.id}`, { ...p, activa: !p.activa }); await renderPromociones(); }
      catch (error) { document.getElementById('promoFeedback').textContent = error.message; button.disabled = false; }
    }));
  } catch (error) { content.textContent = error.message; }
}
function editarOferta(p = {}) {
  const esc = promoEscape;
  const mode = !p.publicada ? 'borrador' : p.activa ? 'publicada' : 'pausada';
  const field = (label, id, type, value, extra = '') => `<div class="form-field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${extra}></div>`;
  const form = field('Nombre de la promoción *', 'p_nombre', 'text', p.nombre || '', 'maxlength="120" required')
    + field('Temporada (ej.: Fiestas de Quito)', 'p_temporada', 'text', p.temporada || '', 'maxlength="120"')
    + `<div class="form-field"><label for="p_desc">Qué incluye / descripción</label><textarea id="p_desc">${esc(p.descripcion || '')}</textarea></div>`
    + field('Precio anterior (opcional)', 'p_anterior', 'number', p.precio_anterior ?? '', 'min="0" step="0.01"')
    + field('Precio de la promoción (opcional)', 'p_precio', 'number', p.precio_promocional ?? '', 'min="0" step="0.01"')
    + field('Fecha de inicio', 'p_inicio', 'date', p.fecha_inicio || '')
    + field('Fecha de fin (incluye todo ese día)', 'p_fin', 'date', p.fecha_fin || '')
    + field('Días de anticipación (0 = sin aviso)', 'p_dias', 'number', p.dias_anticipacion ?? 2, 'min="0" max="365" step="1" required')
    + `<div class="form-field"><label for="p_modo">Publicación</label><select id="p_modo">${[['borrador','Guardar como borrador'],['publicada','Publicar según fechas'],['pausada','Pausar / ocultar']].map(([value,label]) => `<option value="${value}" ${mode === value ? 'selected' : ''}>${label}</option>`).join('')}</select><small>Inicio y fin son obligatorios para publicar. Las fechas se calculan en hora de Quito.</small></div>`
    + (p.imagen ? `<img src="${esc(p.imagen)}" alt="Imagen actual" style="width:100%;height:140px;object-fit:contain">` : '')
    + '<div class="form-field"><label for="p_file">Imagen (JPG, PNG, WEBP · máx. 5 MB)</label><input type="file" id="p_file" accept="image/jpeg,image/png,image/webp"></div>';
  let savedId = p.id;
  let savedImage = p.imagen;
  openModal(p.id ? 'Editar promoción' : 'Crear promoción', form, async () => {
    const modalForm = document.getElementById('modalForm');
    if (!modalForm.reportValidity()) return;
    const value = id => document.getElementById(id).value;
    const body = { nombre: value('p_nombre').trim(), temporada: value('p_temporada').trim(), descripcion: value('p_desc').trim(), precio_anterior: value('p_anterior') || null, precio_promocional: value('p_precio') || null, fecha_inicio: value('p_inicio') || null, fecha_fin: value('p_fin') || null, dias_anticipacion: Number(value('p_dias')), publicada: value('p_modo') !== 'borrador', activa: value('p_modo') !== 'pausada', imagen: savedImage };
    if (body.publicada && (!body.fecha_inicio || !body.fecha_fin)) return showModalAlert('Indica las fechas de inicio y fin para publicar.', 'error');
    if (body.fecha_inicio && body.fecha_fin && body.fecha_fin < body.fecha_inicio) return showModalAlert('La fecha de fin debe ser igual o posterior al inicio.', 'error');
    const file = document.getElementById('p_file').files[0];
    if (file && file.size > 5 * 1024 * 1024) return showModalAlert('La imagen debe pesar como máximo 5 MB.', 'error');
    const button = document.getElementById('btnSubmit');
    button.disabled = true;
    try {
      // Create a draft first; an interrupted image upload must never publish a partial offer.
      if (!savedId) savedId = (await promoRequest('POST', '/api/admin/promociones', { ...body, publicada: false })).id;
      if (file) {
        const data = new FormData(); data.append('imagen', file);
        const response = await fetch(`/api/upload/promociones/${savedId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
        const result = await response.json();
        if (!response.ok || result.error) throw new Error(result.error || 'No se pudo subir la imagen. Puedes volver a intentar.');
        savedImage = result.imagen;
      }
      await promoRequest('PUT', `/api/admin/promociones/${savedId}`, { ...body, imagen: savedImage });
      closeModal(); await renderPromociones();
    } catch (error) { showModalAlert(error.message, 'error'); }
    finally { button.disabled = false; }
  });
}
