const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

const TABLAS_SIMPLES   = ['panaderia', 'pasteleria', 'galleteria', 'bocaditos', 'pasteleria_eventos', 'pasteleria_personalizados', 'bocaditos_sal', 'bocaditos_dulce', 'bocaditos_carne'];
const TABLAS_COMPLETAS = ['servicio_horno', 'otros'];
const TABLAS_VALIDAS   = [...TABLAS_SIMPLES, ...TABLAS_COMPLETAS];

// GET /api/productos/:categoria  — lista productos de una categoría
router.get('/:categoria', async (req, res) => {
  const { categoria } = req.params;

  if (!TABLAS_VALIDAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }

  try {
    const result = await pool.query(`SELECT * FROM ${categoria} ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos  — todas las categorías juntas
router.get('/', async (req, res) => {
  try {
    const queries = TABLAS_VALIDAS.map(t =>
      pool.query(`SELECT id, nombre, imagen, '${t}' AS categoria FROM ${t} ORDER BY id ASC`)
    );
    const results = await Promise.all(queries);
    const todos = results.flatMap(r => r.rows);
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

module.exports = router;
