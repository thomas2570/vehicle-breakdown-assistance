-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USERS (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('customer','mechanic','admin')) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT CHECK (vehicle_type IN ('car','bike','truck','other')) NOT NULL,
  make TEXT,
  model TEXT,
  registration_number TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vehicles."
  ON vehicles FOR SELECT
  USING ( auth.uid() = owner_id );
CREATE POLICY "Users can insert their own vehicles."
  ON vehicles FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );
CREATE POLICY "Users can update their own vehicles."
  ON vehicles FOR UPDATE
  USING ( auth.uid() = owner_id );
CREATE POLICY "Users can delete their own vehicles."
  ON vehicles FOR DELETE
  USING ( auth.uid() = owner_id );

-- 3. EMERGENCY CONTACTS
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own emergency contacts."
  ON emergency_contacts FOR SELECT
  USING ( auth.uid() = user_id );
CREATE POLICY "Users can manage their own emergency contacts."
  ON emergency_contacts FOR ALL
  USING ( auth.uid() = user_id );

-- 4. MECHANICS
CREATE TABLE mechanics (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_address TEXT,
  documents_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  rating_avg NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update geography point when lat/lng changes
CREATE OR REPLACE FUNCTION update_mechanic_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_lat IS NOT NULL AND NEW.current_lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.current_lng, NEW.current_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mechanic_location_trigger
BEFORE INSERT OR UPDATE OF current_lat, current_lng ON mechanics
FOR EACH ROW EXECUTE FUNCTION update_mechanic_location();

ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mechanic profiles are public."
  ON mechanics FOR SELECT
  USING ( true );
CREATE POLICY "Mechanics can manage their own data."
  ON mechanics FOR ALL
  USING ( auth.uid() = id );

-- 5. BREAKDOWN REQUESTS
CREATE TABLE breakdown_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  mechanic_id UUID REFERENCES mechanics(id),
  vehicle_id UUID REFERENCES vehicles(id),
  problem_type TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  status TEXT CHECK (status IN 
    ('pending','accepted','rejected','moving','arrived','in_progress','completed','cancelled')
  ) DEFAULT 'pending',
  is_offline_created BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_request_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_request_location_trigger
BEFORE INSERT OR UPDATE ON breakdown_requests
FOR EACH ROW EXECUTE FUNCTION update_request_location();

ALTER TABLE breakdown_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their requests."
  ON breakdown_requests FOR SELECT
  USING ( auth.uid() = customer_id );
CREATE POLICY "Mechanics can view requests."
  ON breakdown_requests FOR SELECT
  USING ( auth.uid() IN (mechanic_id, customer_id) OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'mechanic') );
CREATE POLICY "Customers can insert requests."
  ON breakdown_requests FOR INSERT
  WITH CHECK ( auth.uid() = customer_id );
CREATE POLICY "Participants can update requests."
  ON breakdown_requests FOR UPDATE
  USING ( auth.uid() IN (customer_id, mechanic_id) OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'mechanic') );

-- 6. REQUEST STATUS LOG
CREATE TABLE request_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES breakdown_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to log status changes automatically
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO request_status (request_id, status) VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_request_status_change
AFTER UPDATE ON breakdown_requests
FOR EACH ROW EXECUTE FUNCTION log_status_change();

ALTER TABLE request_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view request status."
  ON request_status FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM breakdown_requests 
      WHERE id = request_status.request_id AND (customer_id = auth.uid() OR mechanic_id = auth.uid())
    )
  );

-- 7. MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES breakdown_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages."
  ON messages FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM breakdown_requests 
      WHERE id = messages.request_id AND (customer_id = auth.uid() OR mechanic_id = auth.uid())
    )
  );
CREATE POLICY "Participants can send messages."
  ON messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );

-- 8. RATINGS
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES breakdown_requests(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES mechanics(id),
  customer_id UUID REFERENCES profiles(id),
  score INT CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ratings."
  ON ratings FOR SELECT USING (true);
CREATE POLICY "Customers can insert ratings."
  ON ratings FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 9. PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES breakdown_requests(id) ON DELETE CASCADE,
  amount NUMERIC(10,2),
  status TEXT CHECK (status IN ('pending','paid','failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 10. SERVICE HISTORY
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES breakdown_requests(id) ON DELETE CASCADE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications."
  ON notifications FOR SELECT USING (auth.uid() = user_id);

-- 12. OFFLINE SMS LOGS
CREATE TABLE offline_sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES breakdown_requests(id) ON DELETE CASCADE,
  mechanic_phone TEXT NOT NULL,
  sms_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'sent'
);

ALTER TABLE offline_sms_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their sms logs."
  ON offline_sms_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM breakdown_requests 
      WHERE id = offline_sms_logs.request_id AND customer_id = auth.uid()
    )
  );

-- Function to find nearby mechanics within radius
CREATE OR REPLACE FUNCTION get_nearby_mechanics(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    shop_name TEXT,
    phone TEXT,
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.shop_name,
        p.phone,
        (ST_Distance(
            m.location,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ) / 1000.0) AS distance_km
    FROM mechanics m
    JOIN profiles p ON p.id = m.id
    WHERE 
        m.is_available = true 
        AND m.is_verified = true
        AND ST_DWithin(
            m.location,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            p_radius_km * 1000
        )
    ORDER BY distance_km ASC;
END;
$$;
