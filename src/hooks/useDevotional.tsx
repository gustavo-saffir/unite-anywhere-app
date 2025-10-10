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

      const { error } = await supabase
        .from('user_devotionals')
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          reflection,
          application,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { devotional, loading, error, saveProgress };
};
