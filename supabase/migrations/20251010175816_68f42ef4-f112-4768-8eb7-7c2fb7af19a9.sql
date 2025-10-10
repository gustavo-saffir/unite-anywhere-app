-- Adicionar campo pastor_id ao perfil
ALTER TABLE public.profiles
ADD COLUMN pastor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX idx_profiles_pastor_id ON public.profiles(pastor_id);

-- Habilitar realtime para pastor_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.pastor_messages;

-- Configurar REPLICA IDENTITY para capturar todas as mudanças
ALTER TABLE public.pastor_messages REPLICA IDENTITY FULL;

-- Função para buscar pastor do usuário
CREATE OR REPLACE FUNCTION public.get_user_pastor(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pastor_id 
  FROM public.profiles 
  WHERE id = _user_id
$$;

-- Atualizar política de insert para usar o pastor do perfil
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.pastor_messages;

CREATE POLICY "Users can insert messages to their pastor"
ON public.pastor_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND pastor_id = public.get_user_pastor(auth.uid())
);