const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../../config/db');
const auth    = require('../../middleware/authMiddleware');
const router  = express.Router();

const SELECT = 'SELECT id, nombre, email, rol, activo, created_at FROM admins';

// GET todos los admins
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT} ORDER BY id ASC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error al obtener usuarios' }); }
});

// POST crear admin
router.post('/', auth, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO admins (nombre, email, password, rol) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol, activo',
      [nombre, email, hash, rol || 'admin']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El email ya existe' });
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT editar admin
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol, activo } = req.body;
  try {
    let query, params;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query  = 'UPDATE admins SET nombre=$1, email=$2, password=$3, rol=$4, activo=$5 WHERE id=$6 RETURNING id, nombre, email, rol, activo';
      params = [nombre, email, hash, rol, activo, id];
    } else {
      query  = 'UPDATE admins SET nombre=$1, email=$2, rol=$3, activo=$4 WHERE id=$5 RETURNING id, nombre, email, rol, activo';
      params = [nombre, email, rol, activo, id];
    }
    const { rows } = await pool.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al actualizar usuario' }); }
});

// DELETE eliminar admin
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.admin.id)
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  try {
    const { rows } = await pool.query('DELETE FROM admins WHERE id=$1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) { res.status(500).json({ error: 'Error al eliminar usuario' }); }
});

module.exports = router;
