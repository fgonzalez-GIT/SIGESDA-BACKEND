-- Agregar campo observaciones a tabla personas
ALTER TABLE personas ADD COLUMN IF NOT EXISTS observaciones TEXT;
