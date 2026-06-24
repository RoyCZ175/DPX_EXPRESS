const express = require('express');
const router  = express.Router();
const pool    = require('../../config/db');
const auth    = require('../../middleware/authMiddleware');

const TABLAS          = ['panaderia','pasteleria','galleteria','bocaditos','servicio_horno','otros'];
const TABLAS_COMPLETAS = ['servicio_horno','otros'];

// GET todas las tablas con sus productos (para el dashboard)
router.get('/', auth, async (req, res) => {
  try {
    const queries  = TABLAS.map(t => pool.query(`SELECT '${t}' AS tabla, COUNT(*) FROM ${t}`));
    const results  = await Promise.all(queries);
    const resumen  = results.map(r => ({ tabla: r.rows[0].tabla, total: parseInt(r.rows[0].count) }));
    res.json(resumen);
  } catch (err) { res.status(500).json({ error: 'Error al obtener resumen' }); }
});

// GET productos de una tabla
router.get('/:tabla', auth, async (req, res) => {
  const { tabla } = req.params;
  if (!TABLAS.includes(tabla)) return res.status(400).json({ error: 'Tabla inválida' });
  try {
    const { rows } = await pool.query(`SELECT * FROM ${tabla} ORDER BY id ASC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error al obtener productos' }); }
});

// POST crear producto
router.post('/:tabla', auth, async (req, res) => {
  const { tabla } = req.params;
  if (!TABLAS.includes(tabla)) return res.status(400).json({ error: 'Tabla inválida' });
  const { nombre, imagen, descripcion } = req.body;
  try {
    let result;
    if (TABLAS_COMPLETAS.includes(tabla)) {
      result = await pool.query(
        `INSERT INTO ${tabla} (nombre, imagen, descripcion) VALUES ($1,$2,$3) RETURNING *`,
        [nombre, imagen || null, descripcion || null]
      );
    } else {
      result = await pool.query(
        `INSERT INTO ${tabla} (nombre, imagen) VALUES ($1,$2) RETURNING *`,
        [nombre, imagen || null]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al crear producto' }); }
});

// PUT editar producto
router.put('/:tabla/:id', auth, async (req, res) => {
  const { tabla, id } = req.params;
  if (!TABLAS.includes(tabla)) return res.status(400).json({ error: 'Tabla inválida' });
  const { nombre, imagen, descripcion } = req.body;
  try {
    let result;
    if (TABLAS_COMPLETAS.includes(tabla)) {
      result = await pool.query(
        `UPDATE ${tabla} SET nombre=$1, imagen=$2, descripcion=$3 WHERE id=$4 RETURNING *`,
        [nombre, imagen || null, descripcion || null, id]
      );
    } else {
      result = await pool.query(
        `UPDATE ${tabla} SET nombre=$1, imagen=$2 WHERE id=$3 RETURNING *`,
        [nombre, imagen || null, id]
      );
    }
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al actualizar' }); }
});

// DELETE eliminar producto
router.delete('/:tabla/:id', auth, async (req, res) => {
  const { tabla, id } = req.params;
  if (!TABLAS.includes(tabla)) return res.status(400).json({ error: 'Tabla inválida' });
  try {
    const { rows } = await pool.query(`DELETE FROM ${tabla} WHERE id=$1 RETURNING *`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) { res.status(500).json({ error: 'Error al eliminar' }); }
});

module.exports = router;
