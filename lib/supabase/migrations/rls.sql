-- Enable RLS on all relevant tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

-- Businesses: owner-only
DROP POLICY IF EXISTS "select_own_business" ON businesses;
CREATE POLICY "select_own_business" ON businesses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_business" ON businesses;
CREATE POLICY "insert_own_business" ON businesses
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_business" ON businesses;
CREATE POLICY "update_own_business" ON businesses
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_business" ON businesses;
CREATE POLICY "delete_own_business" ON businesses
  FOR DELETE USING (user_id = auth.uid());

-- Locations: must belong to a business owned by user
DROP POLICY IF EXISTS "select_own_locations" ON locations;
CREATE POLICY "select_own_locations" ON locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = locations.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_locations" ON locations;
CREATE POLICY "insert_own_locations" ON locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = locations.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_locations" ON locations;
CREATE POLICY "update_own_locations" ON locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = locations.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_locations" ON locations;
CREATE POLICY "delete_own_locations" ON locations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = locations.business_id AND b.user_id = auth.uid()
    )
  );

-- Employees: must belong to user's business
DROP POLICY IF EXISTS "select_own_employees" ON employees;
CREATE POLICY "select_own_employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = employees.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_employees" ON employees;
CREATE POLICY "insert_own_employees" ON employees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = employees.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_employees" ON employees;
CREATE POLICY "update_own_employees" ON employees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = employees.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_employees" ON employees;
CREATE POLICY "delete_own_employees" ON employees
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = employees.business_id AND b.user_id = auth.uid()
    )
  );

-- Compliance items: must belong to user's business
DROP POLICY IF EXISTS "select_own_items" ON compliance_items;
CREATE POLICY "select_own_items" ON compliance_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = compliance_items.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_items" ON compliance_items;
CREATE POLICY "insert_own_items" ON compliance_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = compliance_items.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_items" ON compliance_items;
CREATE POLICY "update_own_items" ON compliance_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = compliance_items.business_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_items" ON compliance_items;
CREATE POLICY "delete_own_items" ON compliance_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = compliance_items.business_id AND b.user_id = auth.uid()
    )
  );

-- Reminders: must be tied to an item owned by user
DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM compliance_items ci
      JOIN businesses b ON b.id = ci.business_id
      WHERE ci.id = reminders.compliance_item_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM compliance_items ci
      JOIN businesses b ON b.id = ci.business_id
      WHERE ci.id = reminders.compliance_item_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM compliance_items ci
      JOIN businesses b ON b.id = ci.business_id
      WHERE ci.id = reminders.compliance_item_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM compliance_items ci
      JOIN businesses b ON b.id = ci.business_id
      WHERE ci.id = reminders.compliance_item_id
        AND b.user_id = auth.uid()
    )
  );

-- Regulations: readable by all, updates restricted
DROP POLICY IF EXISTS "select_regulations" ON regulations;
CREATE POLICY "select_regulations" ON regulations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "modify_regulations" ON regulations;
CREATE POLICY "modify_regulations" ON regulations
  FOR ALL USING (false) WITH CHECK (false);
