-- Flight Path MVP schema

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'parent');
CREATE TYPE mission_status AS ENUM ('locked', 'available', 'in_progress', 'completed');
CREATE TYPE event_type AS ENUM ('flight', 'study', 'test', 'medical', 'checkride', 'scholarship');
CREATE TYPE expense_category AS ENUM (
  'flight_training', 'books', 'equipment', 'medical', 'tests', 'travel'
);
CREATE TYPE file_category AS ENUM (
  'certificates', 'photos', 'aircraft', 'equipment', 'documents'
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  birth_date DATE,
  target_airline TEXT,
  career_goal TEXT,
  home_airport TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parent-student relationships
CREATE TABLE student_parent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id),
  CHECK (parent_id != student_id)
);

-- Career stages
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL UNIQUE
);

-- Missions catalog
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  why_it_matters TEXT,
  requirements TEXT[],
  estimated_cost DECIMAL(10, 2),
  estimated_duration TEXT,
  order_number INTEGER NOT NULL,
  UNIQUE (stage_id, order_number)
);

-- User mission progress
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status mission_status NOT NULL DEFAULT 'locked',
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

-- Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type event_type NOT NULL DEFAULT 'study',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hangar files metadata
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category file_category NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  description TEXT,
  bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper: check if current user is parent of student
CREATE OR REPLACE FUNCTION is_parent_of(student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM student_parent_links
    WHERE parent_id = auth.uid()
      AND student_parent_links.student_id = is_parent_of.student_id
  );
$$;

-- Helper: check if user can access student data
CREATE OR REPLACE FUNCTION can_access_user_data(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = target_user_id OR is_parent_of(target_user_id);
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Initialize user missions for new students
CREATE OR REPLACE FUNCTION initialize_user_missions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  first_mission_id UUID;
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO user_missions (user_id, mission_id, status)
    SELECT NEW.id, m.id,
      CASE
        WHEN m.order_number = 1 AND s.order_number = 1 THEN 'available'::mission_status
        ELSE 'locked'::mission_status
      END
    FROM missions m
    JOIN stages s ON s.id = m.stage_id;

    SELECT m.id INTO first_mission_id
    FROM missions m
    JOIN stages s ON s.id = m.stage_id
    WHERE s.order_number = 1 AND m.order_number = 1
    LIMIT 1;

    IF first_mission_id IS NOT NULL THEN
      UPDATE user_missions
      SET status = 'available'
      WHERE user_id = NEW.id AND mission_id = first_mission_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_init_missions
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_missions();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id OR is_parent_of(id));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Student-parent links
CREATE POLICY "Parents can view their links"
  ON student_parent_links FOR SELECT
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

CREATE POLICY "Parents can create links"
  ON student_parent_links FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their links"
  ON student_parent_links FOR DELETE
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- Reference data
CREATE POLICY "Authenticated users can read stages"
  ON stages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read missions"
  ON missions FOR SELECT TO authenticated USING (true);

-- User missions
CREATE POLICY "Users can view accessible missions"
  ON user_missions FOR SELECT
  USING (can_access_user_data(user_id));

CREATE POLICY "Students can update own missions"
  ON user_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own missions"
  ON user_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Calendar events
CREATE POLICY "Users can view accessible events"
  ON calendar_events FOR SELECT
  USING (can_access_user_data(user_id));

CREATE POLICY "Users can manage own events"
  ON calendar_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can insert events for students"
  ON calendar_events FOR INSERT
  WITH CHECK (is_parent_of(user_id));

-- Expenses
CREATE POLICY "Users can view accessible expenses"
  ON expenses FOR SELECT
  USING (can_access_user_data(user_id));

CREATE POLICY "Users can manage own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Journal
CREATE POLICY "Users can view accessible journal"
  ON journal_entries FOR SELECT
  USING (can_access_user_data(user_id));

CREATE POLICY "Users can manage own journal"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Files
CREATE POLICY "Users can view accessible files"
  ON files FOR SELECT
  USING (can_access_user_data(user_id));

CREATE POLICY "Users can manage own files"
  ON files FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', false),
  ('photos', 'photos', false),
  ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view own storage files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id IN ('documents', 'photos', 'receipts')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Parents can view linked student files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id IN ('documents', 'photos', 'receipts')
    AND is_parent_of(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('documents', 'photos', 'receipts')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('documents', 'photos', 'receipts')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('documents', 'photos', 'receipts')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Seed stages
INSERT INTO stages (name, description, order_number) VALUES
  ('Explorer', 'Discover aviation and build your foundation', 1),
  ('Student Aviator', 'Begin formal flight training preparation', 2),
  ('Student Pilot', 'Earn your student pilot certificate', 3),
  ('Private Pilot', 'Earn your Private Pilot Certificate', 4),
  ('Instrument Pilot', 'Add instrument rating capabilities', 5),
  ('Commercial Pilot', 'Build hours toward commercial certification', 6),
  ('Flight Instructor', 'Become a Certified Flight Instructor', 7),
  ('Professional Pilot', 'Build professional experience', 8),
  ('Regional Airline Pilot', 'Fly for a regional carrier', 9),
  ('Major Airline Captain', 'Reach the captain''s seat at a major airline', 10);

-- Seed missions for early stages
INSERT INTO missions (stage_id, title, description, why_it_matters, requirements, estimated_cost, estimated_duration, order_number)
SELECT s.id, m.title, m.description, m.why_it_matters, m.requirements, m.estimated_cost, m.estimated_duration, m.order_number
FROM stages s
JOIN (VALUES
  -- Explorer
  (1, 'Take a Discovery Flight', 'Experience your first flight lesson and see if aviation is right for you.', 'A discovery flight confirms your passion and gives you real cockpit time.', ARRAY['Schedule with local flight school', 'Bring questions for your CFI'], 250.00, '1 day', 1),
  (1, 'Visit Local Flight Schools', 'Tour 2-3 flight schools and compare programs.', 'Choosing the right school affects cost, schedule, and training quality.', ARRAY['Tour facilities', 'Meet instructors', 'Compare pricing'], 0.00, '1-2 weeks', 2),
  (1, 'Research Career Path', 'Learn what it takes to become a professional airline pilot.', 'Understanding the full journey keeps you motivated through challenges.', ARRAY['Read FAA career guides', 'Talk to airline pilots', 'Set long-term goals'], 0.00, '1 week', 3),
  -- Student Aviator
  (2, 'Pass FAA Medical Exam', 'Complete your medical examination with an AME.', 'A valid medical certificate is required to exercise pilot privileges.', ARRAY['Schedule AME appointment', 'Bring required documents', 'Receive medical certificate'], 150.00, '1 day', 1),
  (2, 'Begin Ground School', 'Start studying aerodynamics, weather, regulations, and navigation.', 'Ground knowledge is essential for safe flying and written exams.', ARRAY['Enroll in course', 'Complete first module', 'Take practice tests'], 300.00, '4-8 weeks', 2),
  (2, 'Obtain Student Pilot Certificate', 'Apply for your student pilot certificate through IACRA.', 'Required before solo flight. FAA minimum age is 16 for airplane privileges.', ARRAY['Create IACRA account', 'Submit application', 'Receive certificate'], 0.00, '1-2 weeks', 3),
  -- Student Pilot
  (3, 'Complete Pre-Solo Requirements', 'Meet all requirements before your first solo flight.', 'Solo flight is a major milestone in every pilot''s journey.', ARRAY['Log required dual hours', 'Pass pre-solo written', 'CFI endorsement'], 3000.00, '2-3 months', 1),
  (3, 'First Solo Flight', 'Fly the aircraft alone for the first time.', 'Your first solo is one of the most memorable days in aviation.', ARRAY['CFI solo endorsement', 'Weather minimums met', 'Complete solo flight'], 200.00, '1 day', 2),
  (3, 'Solo Cross-Country', 'Complete a solo cross-country flight.', 'Build navigation confidence and meet certificate requirements.', ARRAY['CFI endorsement', 'Flight plan filed', 'Complete XC flight'], 400.00, '1 day', 3),
  -- Private Pilot (sample)
  (4, 'Pass FAA Written Exam', 'Complete the Private Pilot knowledge test.', 'Written exam is required before your checkride.', ARRAY['Study all subject areas', 'Score 70% or higher', 'Receive test report'], 175.00, '1 day', 1),
  (4, 'Complete Required Flight Hours', 'Log all dual, solo, and cross-country hours required for PPL.', 'Hour requirements ensure you have the experience to fly safely.', ARRAY['40+ total hours', 'Cross-country requirements', 'Night requirements'], 8000.00, '3-6 months', 2),
  (4, 'Pass Private Pilot Checkride', 'Complete the practical test with a DPE.', 'Your Private Pilot Certificate opens the skies.', ARRAY['Schedule DPE', 'Complete oral exam', 'Pass flight test'], 800.00, '1 day', 3)
) AS m(stage_order, title, description, why_it_matters, requirements, estimated_cost, estimated_duration, order_number)
ON s.order_number = m.stage_order;
