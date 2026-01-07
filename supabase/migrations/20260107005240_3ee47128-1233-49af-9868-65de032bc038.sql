-- Create user_activity table to track user actions
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity
CREATE POLICY "Users can insert their own activity"
ON public.user_activity
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own activity
CREATE POLICY "Users can view their own activity"
ON public.user_activity
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
ON public.user_activity
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));