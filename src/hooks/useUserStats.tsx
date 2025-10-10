import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_devotional_date: string | null;
  total_devotionals_completed: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar ou criar estatísticas do usuário
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Se não existir, criar
      if (!data) {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setStats(newStats);
      } else {
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Subscribe to changes
    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const calculateLevel = (xp: number): number => {
    // 100 XP por nível (pode ajustar a fórmula)
    return Math.floor(xp / 100) + 1;
  };

  const getXPForNextLevel = (currentLevel: number): number => {
    return currentLevel * 100;
  };

  const getLevelProgress = (xp: number, level: number): number => {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return (xpInCurrentLevel / xpNeeded) * 100;
  };

  const getXPProgressPercentage = (): number => {
    if (!stats) return 0;
    return getLevelProgress(stats.total_xp, stats.current_level);
  };

  const updateStatsAfterDevotional = async (xpGained: number = 50) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !stats) return { success: false };

      const today = new Date().toISOString().split('T')[0];
      const lastDate = stats.last_devotional_date;
      
      // Calculate streak
      let newStreak = stats.current_streak;
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = stats.current_streak + 1;
        } else if (diffDays === 0) {
          return { success: false, message: 'Já completou hoje' };
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const newXP = stats.total_xp + xpGained;
      const newLevel = calculateLevel(newXP);
      const newLongestStreak = Math.max(newStreak, stats.longest_streak);

      const { error } = await supabase
        .from('user_stats')
        .update({
          total_xp: newXP,
          current_level: newLevel,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_devotional_date: today,
          total_devotionals_completed: stats.total_devotionals_completed + 1,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await loadStats();

      return { 
        success: true, 
        newLevel, 
        newXP, 
        newStreak,
        xpGained 
      };
    } catch (err: any) {
      console.error('Error updating stats:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    stats,
    loading,
    refresh: loadStats,
    calculateLevel,
    getXPForNextLevel,
    getLevelProgress,
    getXPProgressPercentage,
    updateStatsAfterDevotional,
  };
};
