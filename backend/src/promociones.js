// Business dates follow Quito, independently of the server/database timezone.
const TODAY = "(CURRENT_TIMESTAMP AT TIME ZONE 'America/Guayaquil')::date";
const VISIBLE = `publicada = TRUE AND activa = TRUE AND fecha_inicio <= ${TODAY} AND fecha_fin >= ${TODAY}`;
const FIELDS = `*, to_char(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
  to_char(fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
  CASE WHEN NOT publicada THEN 'borrador'
       WHEN fecha_fin < ${TODAY} THEN 'finalizada'
       WHEN NOT activa THEN 'pausada'
       WHEN fecha_inicio > ${TODAY} THEN 'programada'
       WHEN fecha_inicio IS NULL OR fecha_fin IS NULL THEN 'borrador'
       ELSE 'activa' END AS estado`;

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function validate(body) {
  if (typeof body.nombre !== 'string' || !body.nombre.trim() || body.nombre.trim().length > 120) return 'Escribe un nombre de hasta 120 caracteres.';
  if (body.temporada != null && (typeof body.temporada !== 'string' || body.temporada.length > 120)) return 'La temporada debe tener hasta 120 caracteres.';
  for (const field of ['activa', 'publicada']) if (body[field] != null && typeof body[field] !== 'boolean') return 'El estado de publicación no es válido.';
  for (const field of ['fecha_inicio', 'fecha_fin']) if (body[field] && !validDate(body[field])) return 'Las fechas no son válidas.';
  if (body.publicada && (!body.fecha_inicio || !body.fecha_fin)) return 'Para publicar, indica la fecha de inicio y la fecha de fin.';
  if (body.fecha_inicio && body.fecha_fin && body.fecha_fin < body.fecha_inicio) return 'La fecha de fin debe ser igual o posterior al inicio.';
  for (const field of ['precio_anterior', 'precio_promocional']) {
    const value = body[field];
    if (value != null && value !== '' && (!['string', 'number'].includes(typeof value) || !/^\d+(\.\d{1,2})?$/.test(String(value)) || Number(value) > 99999999.99)) return 'Los precios deben ser positivos y tener hasta dos decimales.';
  }
  const days = body.dias_anticipacion ?? 0;
  if (!['number', 'string'].includes(typeof days) || String(days).trim() === '' || !Number.isInteger(Number(days)) || Number(days) < 0 || Number(days) > 365) return 'La anticipación debe ser de 0 a 365 días enteros.';
  return null;
}
function values(body) {
  const price = value => value === '' || value == null ? null : Number(value);
  return [body.nombre.trim(), body.descripcion || null, body.imagen || null,
    price(body.precio_anterior), price(body.precio_promocional), body.activa !== false,
    body.publicada === true, body.temporada?.trim() || null, body.fecha_inicio || null,
    body.fecha_fin || null, Number(body.dias_anticipacion ?? 0)];
}
module.exports = { VISIBLE, FIELDS, validate, values };
