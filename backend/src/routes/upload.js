const express  = require('express');
const multer   = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router   = express.Router();
const pool     = require('../config/db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TABLAS_VALIDAS = ['panaderia','pasteleria','galleteria','bocaditos','servicio_horno','otros'];

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder:         'dpx-express/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    public_id: `${req.params.tabla}-${req.params.id}-${Date.now()}`,
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/upload/:tabla/:id
router.post('/:tabla/:id', upload.single('imagen'), async (req, res) => {
  const { tabla, id } = req.params;

  if (!TABLAS_VALIDAS.includes(tabla)) {
    return res.status(400).json({ error: 'Tabla no válida' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }

  const urlImagen = req.file.path;

  try {
    await pool.query(
      `UPDATE ${tabla} SET imagen = $1 WHERE id = $2`,
      [urlImagen, id]
    );
    res.json({ mensaje: 'Imagen actualizada', imagen: urlImagen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la imagen' });
  }
});

module.exports = router;
