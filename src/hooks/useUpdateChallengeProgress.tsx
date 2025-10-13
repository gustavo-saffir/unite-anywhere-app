import { supabase } from '@/integrations/supabase/client';

export const useUpdateChallengeProgress = () => {
  const updateChallengeProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar desafios ativos do usuário
      const { data: activeChallenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*, challenges(*)')
        .eq('user_id', user.id)
        .eq('status', 'in_progress');

      if (challengesError) throw challengesError;
      if (!activeChallenges || activeChallenges.length === 0) return;

      // Buscar estatísticas do usuário
      const { data: stats } = await supabase
        .from('user_stats')
        .select('current_streak, total_devotionals_completed')
        .eq('user_id', user.id)
        .single();

      if (!stats) return;

      // Atualizar progresso de cada desafio
      for (const userChallenge of activeChallenges) {
        const challenge = userChallenge.challenges;
        if (!challenge) continue;

        let newProgress = 0;

        // Calcular progresso baseado no tipo de desafio
        if (challenge.category === 'streak') {
          // Desafios de streak baseados em dias consecutivos
          newProgress = Math.min((stats.current_streak / challenge.duration_days) * 100, 100);
        } else if (challenge.category === 'devotionals') {
          // Desafios de total de devocionais
          const startDate = new Date(userChallenge.started_at);
          const { data: devotionalsSinceStart } = await supabase
            .from('user_devotionals')
            .select('id')
            .eq('user_id', user.id)
            .gte('completed_at', startDate.toISOString());

          const completedCount = devotionalsSinceStart?.length || 0;
          newProgress = Math.min((completedCount / challenge.duration_days) * 100, 100);
        }

        // Determinar novo status
        const newStatus = newProgress >= 100 ? 'completed' : 'in_progress';

        // Atualizar desafio
        await supabase
          .from('user_challenges')
          .update({
            progress: Math.round(newProgress),
            status: newStatus,
            ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
          })
          .eq('id', userChallenge.id);
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  return { updateChallengeProgress };
};
