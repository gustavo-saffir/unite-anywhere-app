-- Insert quiz-specific badges
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES
('Estudante Aplicado', 'Acertou 100% em um quiz', '🎯', 'quiz', 'quiz_perfect', 1),
('Mestre das Escrituras', 'Acertou 100% em 10 quizzes', '📖', 'quiz', 'quiz_perfect', 10),
('Sábio Bíblico', 'Acertou 100% em 50 quizzes', '🧠', 'quiz', 'quiz_perfect', 50);

-- Create view for weekly quiz ranking
CREATE OR REPLACE VIEW weekly_quiz_ranking AS
SELECT 
  uqa.user_id,
  p.full_name,
  p.avatar_url,
  COUNT(*) as total_quizzes,
  SUM(uqa.score) as total_score,
  SUM(CASE WHEN uqa.score = 3 THEN 1 ELSE 0 END) as perfect_scores,
  ROUND(AVG(uqa.score)::numeric, 2) as avg_score
FROM user_quiz_attempts uqa
JOIN profiles p ON p.id = uqa.user_id
WHERE uqa.completed_at >= date_trunc('week', now())
GROUP BY uqa.user_id, p.full_name, p.avatar_url
ORDER BY total_score DESC, perfect_scores DESC, total_quizzes DESC
LIMIT 10;

-- Grant access to the view
GRANT SELECT ON weekly_quiz_ranking TO authenticated;

-- Create function to award quiz XP and badges
CREATE OR REPLACE FUNCTION award_quiz_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  xp_earned INTEGER;
  perfect_count INTEGER;
  badge_id UUID;
BEGIN
  -- Calculate XP: 10 XP per correct answer
  xp_earned := NEW.score * 10;
  
  -- Update user stats with earned XP
  UPDATE user_stats
  SET total_xp = total_xp + xp_earned,
      current_level = FLOOR((total_xp + xp_earned) / 100) + 1,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- If perfect score (3/3), check for badges
  IF NEW.score = 3 THEN
    -- Count total perfect scores for this user
    SELECT COUNT(*) INTO perfect_count
    FROM user_quiz_attempts
    WHERE user_id = NEW.user_id AND score = 3;
    
    -- Award "Estudante Aplicado" badge (first perfect)
    IF perfect_count = 1 THEN
      SELECT id INTO badge_id FROM badges WHERE requirement_type = 'quiz_perfect' AND requirement_value = 1;
      IF badge_id IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_id) ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
    -- Award "Mestre das Escrituras" badge (10 perfects)
    IF perfect_count = 10 THEN
      SELECT id INTO badge_id FROM badges WHERE requirement_type = 'quiz_perfect' AND requirement_value = 10;
      IF badge_id IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_id) ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
    -- Award "Sábio Bíblico" badge (50 perfects)
    IF perfect_count = 50 THEN
      SELECT id INTO badge_id FROM badges WHERE requirement_type = 'quiz_perfect' AND requirement_value = 50;
      IF badge_id IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_id) ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to award rewards after quiz attempt
CREATE TRIGGER trigger_award_quiz_rewards
AFTER INSERT ON user_quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION award_quiz_rewards();