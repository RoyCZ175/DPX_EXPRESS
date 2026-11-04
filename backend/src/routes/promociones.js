const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, descripcion, imagen, precio_anterior, precio_promocional FROM promociones WHERE activa = TRUE ORDER BY created_at DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/promociones:', err.message);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

module.exports = router;
