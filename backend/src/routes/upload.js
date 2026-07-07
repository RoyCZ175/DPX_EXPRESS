const express    = require('express');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const router     = express.Router();
const pool       = require('../config/db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TABLAS_VALIDAS = ['panaderia','pasteleria','galleteria','bocaditos','servicio_horno','otros','pasteleria_eventos','pasteleria_personalizados'];

// Guardar en memoria (no en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const valido = /jpeg|jpg|png|webp/.test(file.mimetype);
    valido ? cb(null, true) : cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

// Sube buffer a Cloudinary y devuelve la URL
function subirACloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dpx-express/productos', public_id: publicId },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/upload/:tabla/:id
router.post('/:tabla/:id', upload.single('imagen'), async (req, res) => {
  const { tabla, id } = req.params;

  if (!TABLAS_VALIDAS.includes(tabla)) {
    return res.status(400).json({ error: 'Tabla no válida' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }

  try {
    const publicId  = `${tabla}-${id}-${Date.now()}`;
    const urlImagen = await subirACloudinary(req.file.buffer, publicId);

    await pool.query(
      `UPDATE ${tabla} SET imagen = $1 WHERE id = $2`,
      [urlImagen, id]
    );

    res.json({ mensaje: 'Imagen actualizada', imagen: urlImagen });
  } catch (err) {
    console.error('Upload error:', err.message || JSON.stringify(err));
    res.status(500).json({ error: err.message || 'Error al subir imagen' });
  }
});

module.exports = router;
