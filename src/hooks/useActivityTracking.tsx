import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type ActivityType = 
  | 'page_view'
  | 'login'
  | 'devotional_completed'
  | 'daily_reading_completed'
  | 'challenge_started'
  | 'challenge_completed'
  | 'bible_study_viewed'
  | 'bible_video_viewed';

export const useActivityTracking = () => {
  const location = useLocation();

  const trackActivity = useCallback(async (
    activityType: ActivityType,
    metadata?: Json
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_activity').insert([{
        user_id: user.id,
        activity_type: activityType,
        page_path: location.pathname,
        metadata: metadata || null,
      }]);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [location.pathname]);

  // Track page views automatically
  useEffect(() => {
    const trackPageView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get page name from path
      const pageName = getPageName(location.pathname);
      
      await supabase.from('user_activity').insert([{
        user_id: user.id,
        activity_type: 'page_view',
        page_path: location.pathname,
        metadata: { page_name: pageName } as Json,
      }]);
    };

    trackPageView();
  }, [location.pathname]);

  return { trackActivity };
};

const getPageName = (path: string): string => {
  const routes: Record<string, string> = {
    '/': 'Página Inicial',
    '/dashboard': 'Dashboard',
    '/devotional': 'Devocional',
    '/daily-reading': 'Leitura Diária',
    '/bible-studies': 'Estudos Bíblicos',
    '/bible-videos': 'Vídeos Bíblicos',
    '/settings': 'Configurações',
    '/my-messages': 'Minhas Mensagens',
    '/pastor-panel': 'Painel do Pastor',
    '/admin': 'Painel Admin',
    '/auth': 'Autenticação',
    '/install': 'Instalação',
    '/devotional-history': 'Histórico Devocionais',
  };

  return routes[path] || path;
};

export default useActivityTracking;
