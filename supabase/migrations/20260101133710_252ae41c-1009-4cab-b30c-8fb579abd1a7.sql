
-- Create study categories table
CREATE TABLE public.study_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.study_categories(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_categories
CREATE POLICY "Everyone can view study categories" 
ON public.study_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert study categories" 
ON public.study_categories 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update study categories" 
ON public.study_categories 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete study categories" 
ON public.study_categories 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create bible studies table
CREATE TABLE public.bible_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.study_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.study_categories(id) ON DELETE SET NULL,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bible_studies ENABLE ROW LEVEL SECURITY;

-- RLS policies for bible_studies
CREATE POLICY "Everyone can view bible studies" 
ON public.bible_studies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert bible studies" 
ON public.bible_studies 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bible studies" 
ON public.bible_studies 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bible studies" 
ON public.bible_studies 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on study_categories
CREATE TRIGGER update_study_categories_updated_at
BEFORE UPDATE ON public.study_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on bible_studies
CREATE TRIGGER update_bible_studies_updated_at
BEFORE UPDATE ON public.bible_studies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
