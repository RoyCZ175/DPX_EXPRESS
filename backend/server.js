require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => { res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); },
}));

// Prueba de conexión al iniciar
require('./src/config/db');
const pool = require('./src/config/db');
pool.query(`CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(500),
  precio_anterior NUMERIC(10,2),
  precio_promocional NUMERIC(10,2),
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`).then(() => {
  app.listen(PORT, () => {
    console.log('Servidor iniciado en el puerto', PORT);
  });
}).catch(err => {
  console.error('Error preparando tabla promociones:', err.message);
  process.exit(1);
});

// Rutas públicas
const productos = require('./src/routes/productos');
const promociones = require('./src/routes/promociones');
const upload    = require('./src/routes/upload');
app.use('/api/productos', productos);
app.use('/api/promociones', promociones);
app.use('/api/upload',    upload);

// Rutas autenticadas
const auth            = require('./src/routes/auth');
const adminProductos  = require('./src/routes/admin/productos');
const adminPromociones = require('./src/routes/admin/promociones');
const adminUsuarios   = require('./src/routes/admin/usuarios');
app.use('/api/auth',            auth);
app.use('/api/admin/productos', adminProductos);
app.use('/api/admin/promociones', adminPromociones);
app.use('/api/admin/usuarios',  adminUsuarios);

