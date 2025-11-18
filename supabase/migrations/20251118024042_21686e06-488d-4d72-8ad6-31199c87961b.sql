-- Drop old testament column and add new category fields
ALTER TABLE bible_videos 
DROP COLUMN IF EXISTS testament,
DROP COLUMN IF EXISTS book_name,
DROP COLUMN IF EXISTS book_order;

-- Add new category and subcategory fields
ALTER TABLE bible_videos
ADD COLUMN category text NOT NULL DEFAULT 'Panoramas',
ADD COLUMN subcategory text NOT NULL DEFAULT 'Antigo Testamento',
ADD COLUMN category_image_url text,
ADD COLUMN subcategory_image_url text,
ADD COLUMN title text NOT NULL DEFAULT 'Título do Vídeo';

-- Add check constraints for valid categories and subcategories
ALTER TABLE bible_videos
ADD CONSTRAINT valid_category CHECK (category IN ('Comentários Visuais', 'Série', 'Panoramas'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bible_videos_category_subcategory ON bible_videos(category, subcategory);