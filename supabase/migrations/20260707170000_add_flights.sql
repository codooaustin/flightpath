-- Flight logbook entries

CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  aircraft TEXT,
  tail_number TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  instructor TEXT,
  flight_time DECIMAL(5, 2) NOT NULL CHECK (flight_time >= 0),
  pic_time DECIMAL(5, 2) CHECK (pic_time IS NULL OR pic_time >= 0),
  dual_time DECIMAL(5, 2) CHECK (dual_time IS NULL OR dual_time >= 0),
  cross_country_time DECIMAL(5, 2) CHECK (cross_country_time IS NULL OR cross_country_time >= 0),
  night_time DECIMAL(5, 2) CHECK (night_time IS NULL OR night_time >= 0),
  instrument_time DECIMAL(5, 2) CHECK (instrument_time IS NULL OR instrument_time >= 0),
  landings INTEGER CHECK (landings IS NULL OR landings >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX flights_user_id_date_idx ON flights (user_id, date DESC);

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible flights"
  ON flights FOR SELECT
  USING (can_access_user_data(user_id));

CREATE POLICY "Users can manage own flights"
  ON flights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
