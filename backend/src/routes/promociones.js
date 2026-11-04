const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { VISIBLE } = require('../promociones');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, descripcion, imagen, precio_anterior, precio_promocional, temporada,
       to_char(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
       to_char(fecha_fin, 'YYYY-MM-DD') AS fecha_fin, dias_anticipacion
       FROM promociones WHERE ${VISIBLE} ORDER BY fecha_fin ASC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/promociones:', err.message);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

module.exports = router;
