require('dotenv').config();
const bcrypt   = require('bcryptjs');
const { Client } = require('pg');

async function main() {
  const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT,
        database: process.env.DB_NAME,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };

  const client = new Client(config);

  console.log('⏳ Conectando a la base de datos...');
  await client.connect();
  console.log('🔌 Conexión exitosa');

  const nombre   = 'Administrador';
  const email    = 'admin@dpx.com';
  const password = 'Admin123!';
  const rol      = 'superadmin';

  const hash = await bcrypt.hash(password, 10);

  await client.query(
    `INSERT INTO admins (nombre, email, password, rol)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [nombre, email, hash, rol]
  );

  console.log('✅ Admin creado correctamente');
  console.log('   Email:    admin@dpx.com');
  console.log('   Password: Admin123!');
  console.log('   ⚠️  Cambia la contraseña desde el panel admin');

  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
