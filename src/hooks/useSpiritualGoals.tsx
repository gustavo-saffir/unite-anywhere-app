import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBrazilDate } from '@/lib/brazilTimezone';
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

      // Get date 7 days ago in Brazil timezone
      const sevenDaysAgo = getBrazilDate();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      // Get devotionals completed in last 7 days
      const { data: devotionals } = await supabase
        .from('user_devotionals')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgoStr);

      // Get daily readings completed in last 7 days
      const { data: dailyReadings } = await supabase
        .from('user_daily_readings')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgoStr);

      console.log('Devotionals in last 7 days:', devotionals);
      console.log('Daily readings in last 7 days:', dailyReadings);

      // Get user stats for current streak
      const { data: stats } = await supabase
        .from('user_stats')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('User stats for goals:', stats);

      // Calculate reading goal (devotionals + daily readings completed / 7)
      const totalReadings = (devotionals?.length || 0) + (dailyReadings?.length || 0);
      const readingProgress = Math.min((totalReadings / 7) * 100, 100);

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

    // Subscribe to changes in user_devotionals, user_daily_readings and user_stats
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_daily_readings',
        },
        () => {
          calculateGoals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
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
