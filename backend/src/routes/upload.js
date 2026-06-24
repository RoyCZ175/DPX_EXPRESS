const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const pool    = require('../config/db');

const TABLAS_VALIDAS = ['panaderia','pasteleria','galleteria','bocaditos','servicio_horno','otros'];

// Configuración multer: guarda en frontend/images/productos/
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', '..', 'frontend', 'images', 'productos'),
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const nombre   = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const filename = `${nombre}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|webp/;
    const valido = permitidos.test(path.extname(file.originalname).toLowerCase());
    valido ? cb(null, true) : cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

// POST /api/upload/:tabla/:id  — sube imagen y actualiza el producto
router.post('/:tabla/:id', upload.single('imagen'), async (req, res) => {
  const { tabla, id } = req.params;

  if (!TABLAS_VALIDAS.includes(tabla)) {
    return res.status(400).json({ error: 'Tabla no válida' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }

  const rutaImagen = `images/productos/${req.file.filename}`;

  try {
    await pool.query(
      `UPDATE ${tabla} SET imagen = $1 WHERE id = $2`,
      [rutaImagen, id]
    );
    res.json({ mensaje: 'Imagen actualizada', imagen: rutaImagen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la imagen' });
  }
});

module.exports = router;
