const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate, values, VISIBLE, FIELDS } = require('../src/promociones');

const offer = { nombre: 'Especial quiteño', publicada: true, fecha_inicio: '2026-11-20', fecha_fin: '2026-12-06', dias_anticipacion: 2 };
test('requires finite publication dates and validates calendar dates', () => {
  assert.equal(validate(offer), null);
  assert.match(validate({ ...offer, fecha_fin: null }), /inicio.*fin/);
  assert.match(validate({ ...offer, fecha_fin: '2026-11-01' }), /posterior/);
  assert.match(validate({ ...offer, fecha_inicio: '2026-02-29' }), /fechas/);
  assert.equal(validate({ ...offer, fecha_inicio: '2028-02-29', fecha_fin: '2028-02-29' }), null);
  assert.equal(validate({ nombre: 'Borrador', publicada: false }), null);
});
test('validates prices, name, status and lead time without losing zero prices', () => {
  for (const price of [-1, 'NaN', '12.999', '1e5', true]) assert.ok(validate({ ...offer, precio_promocional: price }));
  for (const days of [-1, 1.5, 366, 'dos']) assert.ok(validate({ ...offer, dias_anticipacion: days }));
  assert.ok(validate({ ...offer, publicada: 'false' }));
  assert.ok(validate({ ...offer, nombre: ' ' }));
  assert.equal(validate({ ...offer, precio_promocional: 0, dias_anticipacion: 0 }), null);
  assert.equal(values({ ...offer, precio_promocional: 0 })[4], 0);
  assert.equal(values({ nombre: 'Borrador' })[6], false);
});
test('visibility is restricted to published, unpaused offers within inclusive Quito dates', () => {
  assert.match(VISIBLE, /publicada = TRUE AND activa = TRUE/);
  assert.match(VISIBLE, /fecha_inicio <=/);
  assert.match(VISIBLE, /fecha_fin >=/);
  assert.match(VISIBLE, /America\/Guayaquil/);
  for (const state of ['borrador', 'pausada', 'programada', 'finalizada', 'activa']) assert.ok(FIELDS.includes(`'${state}'`));
});

test('HTTP routes enforce authentication and validation, and persist all scheduling fields', async () => {
  const express = require('express');
  const jwt = require('jsonwebtoken');
  process.env.JWT_SECRET = 'local-test-only';
  const calls = [];
  const poolPath = require.resolve('../src/config/db');
  const previous = require.cache[poolPath];
  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: { query: async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith('UPDATE')) return { rows: [] };
    return { rows: sql.includes('INSERT') ? [{ id: 42 }] : [] };
  } } };
  const app = express();
  app.use(express.json());
  app.use('/api/admin/promociones', require('../src/routes/admin/promociones'));
  app.use('/api/promociones', require('../src/routes/promociones'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}` };
  try {
    assert.equal((await fetch(`${base}/api/admin/promociones`)).status, 401);
    let response = await fetch(`${base}/api/admin/promociones`, { method: 'POST', headers, body: JSON.stringify({ ...offer, fecha_fin: null }) });
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
    response = await fetch(`${base}/api/admin/promociones`, { method: 'POST', headers, body: JSON.stringify({ ...offer, temporada: 'Fiestas de Quito', precio_promocional: 0 }) });
    assert.equal(response.status, 201);
    assert.deepEqual(calls[0].params.slice(4), [0, true, true, 'Fiestas de Quito', '2026-11-20', '2026-12-06', 2]);
    assert.equal((await fetch(`${base}/api/admin/promociones/999`, { method: 'PUT', headers, body: JSON.stringify(offer) })).status, 404);
    assert.equal((await fetch(`${base}/api/promociones`)).status, 200);
    assert.ok(calls.at(-1).sql.includes(`WHERE ${VISIBLE}`));
    assert.ok(calls.at(-1).sql.includes("to_char(fecha_fin, 'YYYY-MM-DD')"));
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previous) require.cache[poolPath] = previous; else delete require.cache[poolPath];
  }
});
