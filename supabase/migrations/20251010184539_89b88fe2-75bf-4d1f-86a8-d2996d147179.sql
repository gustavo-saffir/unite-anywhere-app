-- Dropar a política existente e recriar com WITH CHECK
DROP POLICY IF EXISTS "Pastors can update messages to them" ON public.pastor_messages;

-- Recriar política para permitir pastores atualizarem mensagens enviadas a eles
CREATE POLICY "Pastors can update messages to them"
ON public.pastor_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = pastor_id)
WITH CHECK (auth.uid() = pastor_id);