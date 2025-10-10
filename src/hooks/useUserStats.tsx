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

  return {
    stats,
    loading,
    refresh: loadStats,
    calculateLevel,
    getXPForNextLevel,
    getLevelProgress,
  };
};
