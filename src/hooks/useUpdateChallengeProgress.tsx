import { supabase } from '@/integrations/supabase/client';

export const useUpdateChallengeProgress = () => {
  const updateChallengeProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pequeno delay para garantir que as mudanças foram propagadas
      await new Promise(resolve => setTimeout(resolve, 500));

      // Buscar desafios ativos do usuário (incluindo 'pending' que acabou de iniciar)
      const { data: activeChallenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*, challenges(*)')
        .eq('user_id', user.id)
        .in('status', ['in_progress', 'pending']);

      if (challengesError) throw challengesError;
      if (!activeChallenges || activeChallenges.length === 0) return;

      // Buscar estatísticas do usuário (dados mais recentes)
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('current_streak, total_devotionals_completed')
        .eq('user_id', user.id)
        .single();

      if (statsError || !stats) {
        console.error('Error fetching stats:', statsError);
        return;
      }

      console.log('Updating challenge progress with stats:', stats);

      // Atualizar progresso de cada desafio
      for (const userChallenge of activeChallenges) {
        const challenge = userChallenge.challenges;
        if (!challenge) continue;

        let newProgress = 0;
        let completedCount = 0;

        // Calcular progresso baseado no tipo de desafio
        if (challenge.category === 'streak') {
          // Desafios de streak baseados em dias consecutivos
          completedCount = stats.current_streak;
          newProgress = Math.min((completedCount / challenge.duration_days) * 100, 100);
          console.log(`Streak challenge "${challenge.title}": ${completedCount}/${challenge.duration_days} = ${newProgress}%`);
        } else if (challenge.category === 'devotionals') {
          // Desafios de total de devocionais desde o início do desafio
          const startDate = new Date(userChallenge.started_at);
          const { data: devotionalsSinceStart, error: devError } = await supabase
            .from('user_devotionals')
            .select('id')
            .eq('user_id', user.id)
            .gte('completed_at', startDate.toISOString());

          if (devError) {
            console.error('Error fetching devotionals:', devError);
            continue;
          }

          completedCount = devotionalsSinceStart?.length || 0;
          newProgress = Math.min((completedCount / challenge.duration_days) * 100, 100);
          console.log(`Devotional challenge "${challenge.title}": ${completedCount}/${challenge.duration_days} = ${newProgress}%`);
        }

        // Determinar novo status
        const newStatus = newProgress >= 100 ? 'completed' : 'in_progress';

        // Atualizar desafio
        const { error: updateError } = await supabase
          .from('user_challenges')
          .update({
            progress: Math.round(newProgress),
            status: newStatus,
            ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
          })
          .eq('id', userChallenge.id);

        if (updateError) {
          console.error('Error updating challenge:', updateError);
        } else {
          console.log(`Challenge "${challenge.title}" updated: ${Math.round(newProgress)}% (${newStatus})`);
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  return { updateChallengeProgress };
};
