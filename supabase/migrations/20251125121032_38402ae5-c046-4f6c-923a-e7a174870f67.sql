-- Create video_categories table for independent category/subcategory management
CREATE TABLE public.video_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.video_categories(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, parent_id)
);

-- Enable RLS
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view video categories"
ON public.video_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert video categories"
ON public.video_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update video categories"
ON public.video_categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete video categories"
ON public.video_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_video_categories_updated_at
BEFORE UPDATE ON public.video_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing category images from bible_videos
INSERT INTO public.video_categories (name, parent_id, image_url)
SELECT DISTINCT 
  category,
  CAST(NULL AS UUID),
  category_image_url
FROM public.bible_videos
WHERE category_image_url IS NOT NULL
ON CONFLICT (name, parent_id) DO NOTHING;

-- Migrate existing subcategory images from bible_videos
INSERT INTO public.video_categories (name, parent_id, image_url)
SELECT DISTINCT 
  bv.subcategory,
  vc.id,
  bv.subcategory_image_url
FROM public.bible_videos bv
JOIN public.video_categories vc ON vc.name = bv.category AND vc.parent_id IS NULL
WHERE bv.subcategory_image_url IS NOT NULL
ON CONFLICT (name, parent_id) DO NOTHING;