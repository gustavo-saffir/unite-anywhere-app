import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DevotionalHistoryItem {
  id: string;
  completed_at: string;
  reflection: string | null;
  application: string | null;
  verse_memorization: string | null;
  memorization_validated: boolean;
  devotional: {
    id: string;
    date: string;
    verse_reference: string;
    verse_text: string;
    opening_text: string | null;
    context: string | null;
    central_insight: string | null;
    closing_text: string | null;
    reflection_question: string;
    application_question: string;
  };
}

export const useDevotionalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<DevotionalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_devotionals')
          .select(`
            id,
            completed_at,
            reflection,
            application,
            verse_memorization,
            memorization_validated,
            devotional:devotionals (
              id,
              date,
              verse_reference,
              verse_text,
              opening_text,
              context,
              central_insight,
              closing_text,
              reflection_question,
              application_question
            )
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;

        setHistory(data as any || []);
      } catch (error) {
        console.error('Error fetching devotional history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return { history, loading };
};
