-- Create badges table to define available badges
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table to track user achievements
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (everyone can view)
CREATE POLICY "Everyone can view badges"
ON public.badges
FOR SELECT
USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to award badges automatically
CREATE OR REPLACE FUNCTION public.award_badges_on_devotional()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats RECORD;
  v_badge_id UUID;
BEGIN
  -- Get user stats
  SELECT * INTO v_stats
  FROM user_stats
  WHERE user_id = NEW.user_id;

  -- Badge: First Step (1st devotional)
  IF v_stats.total_devotionals_completed = 1 THEN
    SELECT id INTO v_badge_id FROM badges WHERE requirement_type = 'devotionals' AND requirement_value = 1;
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, v_badge_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Badge: Week Warrior (7 days streak)
  IF v_stats.current_streak = 7 THEN
    SELECT id INTO v_badge_id FROM badges WHERE requirement_type = 'streak' AND requirement_value = 7;
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, v_badge_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Badge: Dedicated Reader (30 devotionals)
  IF v_stats.total_devotionals_completed = 30 THEN
    SELECT id INTO v_badge_id FROM badges WHERE requirement_type = 'devotionals' AND requirement_value = 30;
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, v_badge_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Badge: Persistent (30 days streak)
  IF v_stats.current_streak = 30 THEN
    SELECT id INTO v_badge_id FROM badges WHERE requirement_type = 'streak' AND requirement_value = 30;
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, v_badge_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Badge: Centurion (100 devotionals)
  IF v_stats.total_devotionals_completed = 100 THEN
    SELECT id INTO v_badge_id FROM badges WHERE requirement_type = 'devotionals' AND requirement_value = 100;
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, v_badge_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to award badges when user stats are updated
CREATE TRIGGER award_badges_trigger
AFTER UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.award_badges_on_devotional();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value) VALUES
('Primeiro Passo', 'Complete seu primeiro devocional', '🌟', 'inicio', 'devotionals', 1),
('Semana de Fogo', 'Mantenha uma sequência de 7 dias', '🔥', 'streak', 'streak', 7),
('Leitor Dedicado', 'Complete 30 devocionais', '📖', 'devocionais', 'devotionals', 30),
('Persistente', 'Mantenha uma sequência de 30 dias', '💪', 'streak', 'streak', 30),
('Centurião', 'Complete 100 devocionais', '👑', 'devocionais', 'devotionals', 100),
('Maratonista', 'Mantenha uma sequência de 100 dias', '🏆', 'streak', 'streak', 100);