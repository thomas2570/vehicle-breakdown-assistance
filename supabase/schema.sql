-- Create custom types
CREATE TYPE public.user_role AS ENUM ('customer', 'mechanic', 'admin');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'en_route', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- USERS TABLE
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MECHANICS TABLE
CREATE TABLE public.mechanics (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  shop_name TEXT,
  verification_status TEXT DEFAULT 'pending',
  is_available BOOLEAN DEFAULT false,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  documents_url TEXT
);

-- VEHICLES TABLE
CREATE TABLE public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  license_plate TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMERGENCY CONTACTS
CREATE TABLE public.emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BREAKDOWN REQUESTS
CREATE TABLE public.breakdown_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  problem_type TEXT NOT NULL,
  description TEXT,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  status public.request_status DEFAULT 'pending',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REQUEST STATUS HISTORY
CREATE TABLE public.request_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  status public.request_status NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RATINGS
CREATE TABLE public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status public.payment_status DEFAULT 'pending',
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Setup (Basic)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakdown_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Creating generic policy for users (everyone can read, users can update themselves)
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own user record" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Other generic policies
CREATE POLICY "Mechanics can view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Users can view their own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view mechanics" ON public.mechanics FOR SELECT USING (true);
CREATE POLICY "Mechanics can update themselves" ON public.mechanics FOR UPDATE USING (auth.uid() = id);

-- Breakdown requests policies
CREATE POLICY "Mechanics can view pending requests" ON public.breakdown_requests 
  FOR SELECT USING (status = 'pending' AND auth.uid() IN (SELECT id FROM public.mechanics));
CREATE POLICY "Users can view breakdown requests they are part of" ON public.breakdown_requests 
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Customers can create breakdown requests" ON public.breakdown_requests 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Mechanics can accept pending requests" ON public.breakdown_requests 
  FOR UPDATE USING (status = 'pending');
CREATE POLICY "Participants can update breakdown requests" ON public.breakdown_requests 
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

-- Add auth trigger to automatically create user in public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role));
  
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  
  IF (new.raw_user_meta_data->>'role') = 'mechanic' THEN
    INSERT INTO public.mechanics (id, shop_name)
    VALUES (new.id, new.raw_user_meta_data->>'shop_name');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enabling realtime for relevant tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.breakdown_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mechanics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
