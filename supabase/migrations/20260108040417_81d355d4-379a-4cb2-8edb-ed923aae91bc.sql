-- Allow admins to view all user devotionals
CREATE POLICY "Admins can view all user devotionals"
ON public.user_devotionals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user daily readings
CREATE POLICY "Admins can view all user daily readings"
ON public.user_daily_readings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));