-- Remove the unique constraint on date to allow multiple readings per day
ALTER TABLE public.daily_readings DROP CONSTRAINT IF EXISTS daily_readings_date_key;