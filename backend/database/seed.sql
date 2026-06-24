-- ============================================================
--  DPX_Express — Datos iniciales
--  Ejecutar después de schema.sql
-- ============================================================

-- Panadería
INSERT INTO panaderia (nombre) VALUES
    ('Pan de sal'),
    ('Pan de dulce'),
    ('Pan integral'),
    ('Rosquillas');

-- Pastelería
INSERT INTO pasteleria (nombre) VALUES
    ('Postres'),
    ('Eventos'),
    ('Personalizados');

-- Galletería
INSERT INTO galleteria (nombre) VALUES
    ('Bizcochos'),
    ('Quesadillas'),
    ('Moncaibas'),
    ('Galletas'),
    ('Hojaldres');

-- Bocaditos
INSERT INTO bocaditos (nombre) VALUES
    ('Bocaditos de sal'),
    ('Bocaditos de dulce'),
    ('Bocaditos de carne');

-- Servicio de Horno
INSERT INTO servicio_horno (nombre, descripcion) VALUES
    ('Pavos',    'Horneado completo de pavo para eventos y celebraciones'),
    ('Pollos',   'Pollos al horno con sazón artesanal'),
    ('Chuletas', 'Chuletas de cerdo horneadas a la perfección'),
    ('Chanchos', 'Chancho horneado entero para eventos grandes'),
    ('Cuyes',    'Cuyes horneados al estilo tradicional serrano');

-- Otros
INSERT INTO otros (nombre, descripcion) VALUES
    ('Eventos', 'Servicio completo de panadería y pastelería para eventos sociales y corporativos');
