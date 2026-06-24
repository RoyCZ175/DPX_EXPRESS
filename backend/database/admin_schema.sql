-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
    id         SERIAL       PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(20)  DEFAULT 'admin',
    activo     BOOLEAN      DEFAULT true,
    created_at TIMESTAMP    DEFAULT NOW()
);
