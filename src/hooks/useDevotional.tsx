import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Devotional {
  id: string;
  date: string;
  opening_text: string;
  verse_reference: string;
  verse_text: string;
  context: string;
  central_insight: string;
  reflection_question: string;
  application_question: string;
  closing_text: string;
}

export const useDevotional = () => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodayDevotional();
  }, []);

  const loadTodayDevotional = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      setDevotional(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setDevotional(null);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (devotionalId: string, reflection: string, application: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Salvar o devocional completado
      const { error: devotionalError } = await supabase
        .from('user_devotionals')
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          reflection,
          application,
          completed_at: new Date().toISOString(),
        });

      if (devotionalError) throw devotionalError;

      // Buscar ou criar estatísticas do usuário
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const today = new Date().toISOString().split('T')[0];
      const xpReward = 50;

      let newStreak = 1;
      let longestStreak = 1;

      if (existingStats) {
        const lastDate = existingStats.last_devotional_date;
        
        if (lastDate) {
          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Continuou a sequência
            newStreak = existingStats.current_streak + 1;
          } else if (diffDays === 0) {
            // Já completou hoje
            newStreak = existingStats.current_streak;
          } else {
            // Quebrou a sequência
            newStreak = 1;
          }
        }

        longestStreak = Math.max(newStreak, existingStats.longest_streak);

        // Atualizar estatísticas
        const { error: statsError } = await supabase
          .from('user_stats')
          .update({
            total_xp: existingStats.total_xp + xpReward,
            current_level: Math.floor((existingStats.total_xp + xpReward) / 100) + 1,
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_devotional_date: today,
            total_devotionals_completed: existingStats.total_devotionals_completed + 1,
          })
          .eq('user_id', user.id);

        if (statsError) throw statsError;
      } else {
        // Criar novas estatísticas
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_xp: xpReward,
            current_level: 1,
            current_streak: 1,
            longest_streak: 1,
            last_devotional_date: today,
            total_devotionals_completed: 1,
          });

        if (statsError) throw statsError;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { devotional, loading, error, saveProgress };
};
