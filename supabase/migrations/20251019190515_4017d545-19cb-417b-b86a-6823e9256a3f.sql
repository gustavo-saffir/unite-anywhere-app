-- Create daily_readings table for storing daily Bible chapter readings
CREATE TABLE public.daily_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  chapter_text TEXT NOT NULL,
  devotional_id UUID REFERENCES public.devotionals(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

-- Everyone can view daily readings
CREATE POLICY "Everyone can view daily readings"
ON public.daily_readings
FOR SELECT
USING (true);

-- Admins can insert daily readings
CREATE POLICY "Admins can insert daily readings"
ON public.daily_readings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update daily readings
CREATE POLICY "Admins can update daily readings"
ON public.daily_readings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete daily readings
CREATE POLICY "Admins can delete daily readings"
ON public.daily_readings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_daily_readings table to track user progress
CREATE TABLE public.user_daily_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  daily_reading_id UUID NOT NULL REFERENCES public.daily_readings(id),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reading_time_seconds INTEGER,
  UNIQUE(user_id, daily_reading_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_daily_readings ENABLE ROW LEVEL SECURITY;

-- Users can view their own reading progress
CREATE POLICY "Users can view their own reading progress"
ON public.user_daily_readings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own reading progress
CREATE POLICY "Users can insert their own reading progress"
ON public.user_daily_readings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reading progress
CREATE POLICY "Users can update their own reading progress"
ON public.user_daily_readings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on daily_readings
CREATE TRIGGER update_daily_readings_updated_at
BEFORE UPDATE ON public.daily_readings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_daily_readings_date ON public.daily_readings(date);
CREATE INDEX idx_user_daily_readings_user_id ON public.user_daily_readings(user_id);
CREATE INDEX idx_user_daily_readings_daily_reading_id ON public.user_daily_readings(daily_reading_id);