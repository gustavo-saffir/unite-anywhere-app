-- Add new fields to devotionals table
ALTER TABLE public.devotionals 
ADD COLUMN opening_text TEXT,
ADD COLUMN context TEXT,
ADD COLUMN central_insight TEXT,
ADD COLUMN closing_text TEXT;