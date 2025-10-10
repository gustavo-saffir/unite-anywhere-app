import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned_at: string;
}

export const useUserBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          badge_id,
          badges (
            id,
            name,
            description,
            icon,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedBadges = data?.map((item: any) => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon,
        category: item.badges.category,
        earned_at: item.earned_at,
      })) || [];

      setBadges(formattedBadges);
    } catch (err) {
      console.error('Error loading badges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();

    // Subscribe to changes
    const channel = supabase
      .channel('user_badges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
        },
        () => {
          loadBadges();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    badges,
    loading,
    refresh: loadBadges,
  };
};
