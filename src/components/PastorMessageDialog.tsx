import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, X, Send } from 'lucide-react';

interface PastorMessageDialogProps {
  devotionalId: string;
  onClose: () => void;
}

const PastorMessageDialog = ({ devotionalId, onClose }: PastorMessageDialogProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastorInfo, setPastorInfo] = useState<{ name: string; position: string } | null>(null);
  const { toast } = useToast();

  // Buscar informações do pastor/líder ao montar o componente
  useState(() => {
    const loadPastorInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar o pastor_id e informações do pastor
        const { data: profile } = await supabase
          .from('profiles')
          .select('pastor_id')
          .eq('id', user.id)
          .single();

        if (profile?.pastor_id) {
          // Buscar informações do pastor/líder
          const { data: pastorData } = await supabase
            .from('profiles')
            .select('full_name, position')
            .eq('id', profile.pastor_id)
            .single();

          if (pastorData) {
            setPastorInfo({
              name: pastorData.full_name,
              position: pastorData.position === 'pastor' ? 'Pastor' : 'Líder'
            });
          }
        }
      } catch (error) {
        console.error('Error loading pastor info:', error);
      }
    };

    loadPastorInfo();
  });

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar o pastor_id do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('pastor_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      if (!profile?.pastor_id) {
        toast({
          title: 'Pastor não configurado',
          description: 'Você ainda não tem um pastor vinculado ao seu perfil. Entre em contato com o administrador.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('pastor_messages')
        .insert({
          user_id: user.id,
          pastor_id: profile.pastor_id,
          devotional_id: devotionalId,
          message: message.trim(),
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Mensagem enviada!',
        description: 'Seu pastor será notificado e responderá em breve.',
      });

      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-auto z-50 shadow-celestial">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-celestial">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
          <h3 className="font-semibold text-primary-foreground">
            Mensagem ao {pastorInfo?.position || 'Líder'}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white/20 text-primary-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Envie uma mensagem {pastorInfo ? (
              <>ao <strong>{pastorInfo.position} {pastorInfo.name}</strong></>
            ) : (
              'ao seu líder'
            )} sobre este devocional.
          </p>
          <p className="text-xs">
            {pastorInfo?.position === 'Pastor' ? 'Ele' : 'Ela'} receberá uma notificação e poderá responder diretamente no app.
          </p>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem ou dúvida..."
          className="min-h-[150px]"
          disabled={loading}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="flex-1 bg-gradient-celestial hover:opacity-90"
          >
            {loading ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PastorMessageDialog;