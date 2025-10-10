import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SpiritualGoals {
  reading: number;
  prayer: number;
  memorization: number;
}

export const useSpiritualGoals = () => {
  const [goals, setGoals] = useState<SpiritualGoals>({
    reading: 0,
    prayer: 0,
    memorization: 0,
  });
  const [loading, setLoading] = useState(true);

  const calculateGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('Calculating spiritual goals for user:', user.id);

      // Get date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      // Get devotionals completed in last 7 days
      const { data: devotionals } = await supabase
        .from('user_devotionals')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgoStr);

      console.log('Devotionals in last 7 days:', devotionals);

      // Get user stats for current streak
      const { data: stats } = await supabase
        .from('user_stats')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('User stats for goals:', stats);

      // Calculate reading goal (devotionals completed / 7)
      const readingProgress = devotionals ? Math.min((devotionals.length / 7) * 100, 100) : 0;

      // Calculate prayer goal (current streak / 7, max 100%)
      const prayerProgress = stats?.current_streak ? Math.min((stats.current_streak / 7) * 100, 100) : 0;

      // Calculate memorization goal (validated memorizations / 7)
      const validatedMemorizations = devotionals?.filter(d => d.memorization_validated).length || 0;
      const memorizationProgress = Math.min((validatedMemorizations / 7) * 100, 100);

      console.log('Goals calculated:', {
        reading: Math.round(readingProgress),
        prayer: Math.round(prayerProgress),
        memorization: Math.round(memorizationProgress)
      });

      setGoals({
        reading: Math.round(readingProgress),
        prayer: Math.round(prayerProgress),
        memorization: Math.round(memorizationProgress),
      });
    } catch (error) {
      console.error('Error calculating spiritual goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateGoals();

    // Subscribe to changes in user_devotionals
    const channel = supabase
      .channel('spiritual_goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_devotionals',
        },
        () => {
          calculateGoals();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { goals, loading };
};
