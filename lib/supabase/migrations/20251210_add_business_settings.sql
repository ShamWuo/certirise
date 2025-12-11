ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

