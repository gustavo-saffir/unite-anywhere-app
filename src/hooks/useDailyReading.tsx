import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBrazilDateString } from '@/lib/brazilTimezone';

interface DailyReading {
  id: string;
  date: string;
  book: string;
  chapter: number;
  chapter_text: string;
  devotional_id: string | null;
}

export const useDailyReading = () => {
  const [dailyReadings, setDailyReadings] = useState<DailyReading[]>([]);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    loadTodayReading();
  }, []);

  const loadTodayReading = async () => {
    try {
      const today = getBrazilDateString();
      
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .eq('date', today)
        .order('chapter', { ascending: true });

      if (error) throw error;
      
      setDailyReadings(data || []);
      setDailyReading(data && data.length > 0 ? data[0] : null);
      
      // Check if user has completed ALL chapters for today
      if (data && data.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const readingIds = data.map(r => r.id);
          const { data: progressData } = await supabase
            .from('user_daily_readings')
            .select('daily_reading_id')
            .eq('user_id', user.id)
            .in('daily_reading_id', readingIds);
          
          // User completed if they completed all chapters
          setHasCompleted(progressData?.length === data.length);
        }
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setDailyReadings([]);
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
      
      await loadTodayReading();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { dailyReadings, dailyReading, loading, error, hasCompleted, markAsCompleted, loadTodayReading };
};