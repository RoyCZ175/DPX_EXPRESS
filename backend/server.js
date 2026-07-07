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

// Rutas públicas
const productos = require('./src/routes/productos');
const upload    = require('./src/routes/upload');
app.use('/api/productos', productos);
app.use('/api/upload',    upload);

// Rutas autenticadas
const auth            = require('./src/routes/auth');
const adminProductos  = require('./src/routes/admin/productos');
const adminUsuarios   = require('./src/routes/admin/usuarios');
app.use('/api/auth',            auth);
app.use('/api/admin/productos', adminProductos);
app.use('/api/admin/usuarios',  adminUsuarios);

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
