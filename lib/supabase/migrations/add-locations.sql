-- Add locations table for multi-location support
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add location_id to compliance_items
ALTER TABLE compliance_items 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Add compliance_score to businesses (for gamification)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS compliance_score DECIMAL(5,2) DEFAULT 100.00;

-- Add last_renewal_date to compliance_items (for smart reminders)
ALTER TABLE compliance_items 
ADD COLUMN IF NOT EXISTS last_renewal_date DATE;

-- Add employee_portal_access_token for employee self-service
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS portal_access_token TEXT,
ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_business_id ON locations(business_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_location_id ON compliance_items(location_id);

-- Trigger for locations updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

