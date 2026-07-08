-- Multi-stop flight routes (touch-and-go, return to home airport, etc.)

ALTER TABLE flights
  ADD COLUMN route JSONB;

COMMENT ON COLUMN flights.route IS
  'Ordered stops: [{ "airport": "KLVJ", "stop_type": "departure" }, ...]';

-- Backfill simple routes from existing departure/arrival columns
UPDATE flights
SET route = jsonb_build_array(
  jsonb_build_object('airport', departure_airport, 'stop_type', 'departure'),
  jsonb_build_object('airport', arrival_airport, 'stop_type', 'landing')
)
WHERE route IS NULL
  AND departure_airport IS NOT NULL
  AND arrival_airport IS NOT NULL
  AND departure_airport IS DISTINCT FROM arrival_airport;

UPDATE flights
SET route = jsonb_build_array(
  jsonb_build_object('airport', COALESCE(departure_airport, arrival_airport), 'stop_type', 'departure'),
  jsonb_build_object('airport', COALESCE(departure_airport, arrival_airport), 'stop_type', 'landing')
)
WHERE route IS NULL
  AND (departure_airport IS NOT NULL OR arrival_airport IS NOT NULL);
