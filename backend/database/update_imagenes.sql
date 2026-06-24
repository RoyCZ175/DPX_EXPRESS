-- ============================================================
--  Asignar imágenes por defecto usando las fotos existentes
-- ============================================================

UPDATE panaderia     SET imagen = 'images/panaderia.png';
UPDATE pasteleria    SET imagen = 'images/pasteleria.jpg';
UPDATE galleteria    SET imagen = 'images/panaderia.png';
UPDATE bocaditos     SET imagen = 'images/bocaditos.jpg';
UPDATE servicio_horno SET imagen = 'images/horneado.jpg';
UPDATE otros         SET imagen = 'images/horneado.jpg';

-- Verificar
SELECT 'panaderia'     AS tabla, id, nombre, imagen FROM panaderia
UNION ALL
SELECT 'pasteleria',   id, nombre, imagen FROM pasteleria
UNION ALL
SELECT 'galleteria',   id, nombre, imagen FROM galleteria
UNION ALL
SELECT 'bocaditos',    id, nombre, imagen FROM bocaditos
UNION ALL
SELECT 'servicio_horno', id, nombre, imagen FROM servicio_horno
UNION ALL
SELECT 'otros',        id, nombre, imagen FROM otros;
