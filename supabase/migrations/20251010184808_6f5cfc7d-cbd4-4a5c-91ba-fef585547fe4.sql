-- Add updated_at to pastor_messages to satisfy update trigger
ALTER TABLE public.pastor_messages
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();