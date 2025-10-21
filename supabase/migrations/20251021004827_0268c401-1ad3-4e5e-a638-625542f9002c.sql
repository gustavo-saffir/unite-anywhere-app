-- Create table for bible video summaries
CREATE TABLE public.bible_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_name TEXT NOT NULL,
  book_order INTEGER NOT NULL,
  testament TEXT NOT NULL CHECK (testament IN ('Antigo', 'Novo')),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_name)
);

-- Enable Row Level Security
ALTER TABLE public.bible_videos ENABLE ROW LEVEL SECURITY;

-- Everyone can view bible videos
CREATE POLICY "Everyone can view bible videos"
ON public.bible_videos
FOR SELECT
USING (true);

-- Admins can insert bible videos
CREATE POLICY "Admins can insert bible videos"
ON public.bible_videos
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update bible videos
CREATE POLICY "Admins can update bible videos"
ON public.bible_videos
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete bible videos
CREATE POLICY "Admins can delete bible videos"
ON public.bible_videos
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bible_videos_updated_at
BEFORE UPDATE ON public.bible_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();