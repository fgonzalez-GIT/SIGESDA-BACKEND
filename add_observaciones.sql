-- Add observaciones column to personas table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS observaciones TEXT;
