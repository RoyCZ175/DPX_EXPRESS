const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const auth = require('../../middleware/authMiddleware');

router.use(auth);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM promociones ORDER BY created_at DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET admin promociones:', err.message);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion, imagen, precio_anterior, precio_promocional, activa = true } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO promociones (nombre, descripcion, imagen, precio_anterior, precio_promocional, activa)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre.trim(), descripcion || null, imagen || null, precio_anterior || null, precio_promocional || null, activa]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST admin promociones:', err.message);
    res.status(500).json({ error: 'Error al crear promoción' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, imagen, precio_anterior, precio_promocional, activa } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const { rows } = await pool.query(
      `UPDATE promociones SET nombre=$1, descripcion=$2, imagen=$3, precio_anterior=$4,
       precio_promocional=$5, activa=$6 WHERE id=$7 RETURNING *`,
      [nombre.trim(), descripcion || null, imagen || null, precio_anterior || null, precio_promocional || null, activa !== false, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT admin promociones:', err.message);
    res.status(500).json({ error: 'Error al actualizar promoción' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM promociones WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json({ mensaje: 'Promoción eliminada' });
  } catch (err) {
    console.error('DELETE admin promociones:', err.message);
    res.status(500).json({ error: 'Error al eliminar promoción' });
  }
});

module.exports = router;
