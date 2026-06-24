require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('../src/config/db');

async function main() {
  const nombre   = 'Administrador';
  const email    = 'admin@dpx.com';
  const password = 'Admin123!';
  const rol      = 'superadmin';

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admins (nombre, email, password, rol)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [nombre, email, hash, rol]
  );

  console.log('✅ Admin creado');
  console.log('   Email:    admin@dpx.com');
  console.log('   Password: Admin123!');
  console.log('   ⚠️  Cambia la contraseña después del primer login');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
