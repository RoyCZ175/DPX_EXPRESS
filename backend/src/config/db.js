const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(config);

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log(`✅ Conectado a PostgreSQL — ${process.env.DATABASE_URL ? 'Render' : process.env.DB_NAME}`);
    release();
  }
});

module.exports = pool;
