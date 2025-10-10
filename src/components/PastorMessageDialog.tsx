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
  const { toast } = useToast();

  // Por enquanto, vamos usar um ID fixo de pastor (você mencionou que será Gustavo Saffir inicialmente)
  // No futuro, isso virá do perfil do usuário linkado ao pastor/líder
  const PASTOR_ID = 'pastor-default-id'; // Temporário - será substituído pela lógica real

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Por enquanto, usando o próprio user.id como pastor_id para teste
      // No futuro, buscar o pastor_id do perfil do usuário
      const { error } = await supabase
        .from('pastor_messages')
        .insert({
          user_id: user.id,
          pastor_id: user.id, // Temporário - será substituído
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
          <h3 className="font-semibold text-primary-foreground">Mensagem ao Pastor</h3>
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
            Envie uma mensagem para <strong>Pastor Gustavo Saffir</strong> sobre este devocional.
          </p>
          <p className="text-xs">
            Ele receberá uma notificação e poderá responder diretamente no app.
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