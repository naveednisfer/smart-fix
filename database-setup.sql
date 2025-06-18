-- SmartFix Database Setup for Supabase
-- Run these commands in your Supabase SQL Editor

-- 1. Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create RLS policies for services (public read access)
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

-- 6. Insert sample services
INSERT INTO services (name, description) VALUES
('AC Repair', 'Air conditioning repair and maintenance services'),
('Plumbing', 'Plumbing services and repairs'),
('Electrical', 'Electrical work and repairs'),
('Cleaning', 'House and office cleaning services'),
('Painting', 'Interior and exterior painting services')
ON CONFLICT (id) DO NOTHING;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 8. Create a function to get user bookings with status
CREATE OR REPLACE FUNCTION get_user_bookings(user_uuid UUID)
RETURNS TABLE (
  id INTEGER,
  service VARCHAR(100),
  date DATE,
  time TIME,
  address TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  is_upcoming BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.service,
    b.date,
    b.time,
    b.address,
    b.status,
    b.created_at,
    b.date >= CURRENT_DATE AS is_upcoming
  FROM bookings b
  WHERE b.user_id = user_uuid
  ORDER BY b.date DESC, b.time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON services TO anon, authenticated;
GRANT ALL ON bookings TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 10. Create a view for upcoming bookings
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT 
  b.*,
  u.email as user_email
FROM bookings b
JOIN auth.users u ON b.user_id = u.id
WHERE b.date >= CURRENT_DATE
ORDER BY b.date ASC, b.time ASC;

-- 11. Create a view for past bookings
CREATE OR REPLACE VIEW past_bookings AS
SELECT 
  b.*,
  u.email as user_email
FROM bookings b
JOIN auth.users u ON b.user_id = u.id
WHERE b.date < CURRENT_DATE
ORDER BY b.date DESC, b.time DESC;

-- 12. Grant permissions on views
GRANT SELECT ON upcoming_bookings TO anon, authenticated;
GRANT SELECT ON past_bookings TO anon, authenticated;

-- Verification queries (run these to check setup)
-- SELECT * FROM services;
-- SELECT COUNT(*) FROM bookings;
-- SELECT * FROM upcoming_bookings LIMIT 5;
-- SELECT * FROM past_bookings LIMIT 5; 