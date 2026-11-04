const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const auth = require('../../middleware/authMiddleware');
const { FIELDS, validate, values } = require('../../promociones');

router.use(auth);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${FIELDS} FROM promociones ORDER BY created_at DESC, id DESC`);
    res.json(rows);
  } catch (err) {
    console.error('GET admin promociones:', err.message);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

router.post('/', async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { rows } = await pool.query(
      `INSERT INTO promociones (nombre, descripcion, imagen, precio_anterior, precio_promocional, activa,
        publicada, temporada, fecha_inicio, fecha_fin, dias_anticipacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, values(req.body)
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST admin promociones:', err.message);
    res.status(500).json({ error: 'Error al crear promoción' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { rows } = await pool.query(
      `UPDATE promociones SET nombre=$1, descripcion=$2, imagen=$3, precio_anterior=$4,
       precio_promocional=$5, activa=$6, publicada=$7, temporada=$8, fecha_inicio=$9,
       fecha_fin=$10, dias_anticipacion=$11 WHERE id=$12 RETURNING *`, [...values(req.body), id]
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
