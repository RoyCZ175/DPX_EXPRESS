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
