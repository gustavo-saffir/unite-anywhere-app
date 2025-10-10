-- Add memorization fields to user_devotionals table
ALTER TABLE user_devotionals 
ADD COLUMN verse_memorization TEXT,
ADD COLUMN memorization_validated BOOLEAN DEFAULT FALSE;