-- Tabela para mensagens ao pastor
CREATE TABLE public.pastor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pastor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_id UUID REFERENCES public.devotionals(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para conversas com o Mentor IA
CREATE TABLE public.ai_mentor_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_id UUID REFERENCES public.devotionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_mentor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_mentor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pastor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mentor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies para pastor_messages
CREATE POLICY "Users can view their own messages"
ON public.pastor_messages
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = pastor_id);

CREATE POLICY "Users can insert their own messages"
ON public.pastor_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pastors can update messages to them"
ON public.pastor_messages
FOR UPDATE
USING (auth.uid() = pastor_id);

-- RLS Policies para ai_mentor_conversations
CREATE POLICY "Users can view their own conversations"
ON public.ai_mentor_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.ai_mentor_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para ai_mentor_messages
CREATE POLICY "Users can view messages from their conversations"
ON public.ai_mentor_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ai_mentor_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their conversations"
ON public.ai_mentor_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_mentor_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pastor_messages_updated_at
BEFORE UPDATE ON public.pastor_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_pastor_messages_user_id ON public.pastor_messages(user_id);
CREATE INDEX idx_pastor_messages_pastor_id ON public.pastor_messages(pastor_id);
CREATE INDEX idx_pastor_messages_status ON public.pastor_messages(status);
CREATE INDEX idx_ai_mentor_conversations_user_id ON public.ai_mentor_conversations(user_id);
CREATE INDEX idx_ai_mentor_messages_conversation_id ON public.ai_mentor_messages(conversation_id);