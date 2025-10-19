import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyReading {
  id: string;
  date: string;
  book: string;
  chapter: number;
  chapter_text: string;
  devotional_id: string | null;
}

export const useDailyReading = () => {
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    loadTodayReading();
  }, []);

  const loadTodayReading = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      setDailyReading(data);
      
      // Check if user has completed this reading
      if (data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progressData } = await supabase
            .from('user_daily_readings')
            .select('*')
            .eq('user_id', user.id)
            .eq('daily_reading_id', data.id)
            .maybeSingle();
          
          setHasCompleted(!!progressData);
        }
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setDailyReading(null);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (readingId: string, readingTimeSeconds?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_daily_readings')
        .upsert({
          user_id: user.id,
          daily_reading_id: readingId,
          reading_time_seconds: readingTimeSeconds || null,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,daily_reading_id'
        });

      if (error) throw error;
      
      setHasCompleted(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { dailyReading, loading, error, hasCompleted, markAsCompleted, loadTodayReading };
};