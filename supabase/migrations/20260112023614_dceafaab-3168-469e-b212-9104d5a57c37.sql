-- Fix the security definer view by recreating it with SECURITY INVOKER
DROP VIEW IF EXISTS weekly_quiz_ranking;

CREATE VIEW weekly_quiz_ranking 
WITH (security_invoker = true)
AS
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