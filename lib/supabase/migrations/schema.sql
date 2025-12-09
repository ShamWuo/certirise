-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('salon', 'barbershop', 'spa', 'tattoo_shop')),
  state TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance items table
CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  item_type TEXT CHECK (item_type IN ('license', 'inspection', 'insurance', 'equipment')),
  name TEXT NOT NULL,
  license_number TEXT,
  expiration_date DATE NOT NULL,
  renewal_frequency TEXT,
  issuing_authority TEXT,
  status TEXT DEFAULT 'active',
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compliance_item_id UUID REFERENCES compliance_items(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT CHECK (type IN ('email', 'sms')),
  days_before_expiration INT,
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regulations database table
CREATE TABLE IF NOT EXISTS regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT NOT NULL,
  license_type TEXT NOT NULL,
  renewal_frequency TEXT,
  renewal_window TEXT,
  renewal_process_url TEXT,
  continuing_education_required BOOLEAN DEFAULT FALSE,
  continuing_education_hours INT,
  fees TEXT,
  grace_period TEXT,
  notes TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state, license_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_items_business_id ON compliance_items(business_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_expiration_date ON compliance_items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_compliance_items_status ON compliance_items(status);
CREATE INDEX IF NOT EXISTS idx_employees_business_id ON employees(business_id);
CREATE INDEX IF NOT EXISTS idx_reminders_compliance_item_id ON reminders(compliance_item_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_items_updated_at BEFORE UPDATE ON compliance_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


