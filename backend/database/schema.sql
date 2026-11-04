-- ============================================================
--  DPX_Express — Esquema de tablas
--  Ejecutar conectado a la base de datos DPX_Express
-- ============================================================

-- Panadería
CREATE TABLE IF NOT EXISTS panaderia (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

-- Pastelería
CREATE TABLE IF NOT EXISTS pasteleria (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

-- Galletería
CREATE TABLE IF NOT EXISTS galleteria (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

-- Bocaditos
CREATE TABLE IF NOT EXISTS bocaditos (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

-- Subcategorías administradas por separado desde el panel
CREATE TABLE IF NOT EXISTS pasteleria_eventos (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pasteleria_personalizados (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bocaditos_sal (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bocaditos_dulce (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bocaditos_carne (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255)
);

-- Servicio de Horno
CREATE TABLE IF NOT EXISTS servicio_horno (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    imagen      VARCHAR(255),
    descripcion TEXT
);

-- Otros
CREATE TABLE IF NOT EXISTS otros (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    imagen      VARCHAR(255),
    descripcion TEXT
);

-- Promociones visibles y administrables desde el panel
CREATE TABLE IF NOT EXISTS promociones (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(120) NOT NULL,
    descripcion         TEXT,
    imagen              VARCHAR(500),
    precio_anterior     NUMERIC(10,2),
    precio_promocional  NUMERIC(10,2),
    activa              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
