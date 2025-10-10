-- Function to safely expose limited info about the current user's pastor/líder
-- Use pastor_position to avoid conflict with reserved word
CREATE OR REPLACE FUNCTION public.get_my_pastor_info()
RETURNS TABLE (id uuid, full_name text, pastor_position text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p2.id, p2.full_name, (p2.position)::text AS pastor_position
  FROM public.profiles p1
  JOIN public.profiles p2 ON p2.id = p1.pastor_id
  WHERE p1.id = auth.uid()
$$;