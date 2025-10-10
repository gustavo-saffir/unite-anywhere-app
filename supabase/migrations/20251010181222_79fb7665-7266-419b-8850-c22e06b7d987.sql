-- Adicionar política para admins visualizarem todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Adicionar política para pastores/líderes visualizarem perfis de seus discípulos
CREATE POLICY "Pastors can view their disciples profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  pastor_id = auth.uid()
);