-- SQL para agregar la columna image_public_id manualmente
-- Ejecutar este SQL si la migración no funciona

ALTER TABLE `meal_records` 
ADD COLUMN `image_public_id` VARCHAR(255) NULL AFTER `image_path`;

