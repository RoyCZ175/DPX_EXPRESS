const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const router  = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE email = $1 AND activo = true', [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const admin = rows[0];
    const valido = await bcrypt.compare(password, admin.password);
    if (!valido) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
