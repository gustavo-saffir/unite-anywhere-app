import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para notificações em tempo real de mensagens ao pastor
 * Adicione este componente ao Dashboard ou layout principal do pastor
 */
const PastorNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Configurar subscrição para novas mensagens
    const channel = supabase
      .channel('pastor-new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pastor_messages',
          filter: `pastor_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Nova mensagem recebida:', payload);

          // Buscar informações do usuário que enviou
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single();

          toast({
            title: '💬 Nova mensagem recebida!',
            description: `${profile?.full_name || 'Um discípulo'} enviou uma mensagem`,
            action: (
              <button
                onClick={() => navigate('/pastor-panel')}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Ver Mensagem
              </button>
            ),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, navigate]);

  return null; // Este componente não renderiza nada visualmente
};

export default PastorNotifications;