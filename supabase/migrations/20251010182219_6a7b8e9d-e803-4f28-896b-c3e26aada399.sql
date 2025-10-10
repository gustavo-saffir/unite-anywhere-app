-- Permitir que administradores ATUALIZEM qualquer perfil
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Opcional: permitir que pastores atualizem apenas o pastor_id de seus discípulos (não requerido agora)
-- CREATE POLICY "Pastors can set pastor_id for disciples"
-- ON public.profiles
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = pastor_id)
-- WITH CHECK (auth.uid() = pastor_id);
