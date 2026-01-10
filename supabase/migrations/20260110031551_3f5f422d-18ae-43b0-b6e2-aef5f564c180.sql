-- Tabela para armazenar os quizzes gerados pela IA
CREATE TABLE public.daily_reading_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_reading_id UUID REFERENCES public.daily_readings(id) ON DELETE CASCADE NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(daily_reading_id)
);

-- Tabela para armazenar as tentativas dos usuários
CREATE TABLE public.user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID REFERENCES public.daily_reading_quizzes(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- Habilitar RLS
ALTER TABLE public.daily_reading_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_reading_quizzes
CREATE POLICY "Authenticated users can view quizzes"
ON public.daily_reading_quizzes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert quizzes"
ON public.daily_reading_quizzes
FOR INSERT
WITH CHECK (true);

-- Políticas para user_quiz_attempts
CREATE POLICY "Users can view their own attempts"
ON public.user_quiz_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
ON public.user_quiz_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
ON public.user_quiz_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));