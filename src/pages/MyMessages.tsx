import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, BookOpen, Clock, CheckCheck, ArrowLeft, User } from 'lucide-react';

interface Message {
  id: string;
  devotional_id: string | null;
  message: string;
  response: string | null;
  status: 'pending' | 'read' | 'responded';
  created_at: string;
  responded_at: string | null;
  pastor_name?: string;
  pastor_position?: string;
  devotional?: {
    verse_reference: string;
    date: string;
  };
}

const MyMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar mensagens do usuário
      const { data: msgs, error } = await supabase
        .from('pastor_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar informações do pastor
      const { data: pastorData } = await supabase.rpc('get_my_pastor_info');
      
      let pastor_name = 'Seu líder';
      let pastor_position = 'Líder';
      
      if (pastorData && pastorData.length > 0) {
        pastor_name = pastorData[0].full_name;
        pastor_position = pastorData[0].pastor_position === 'pastor' ? 'Pastor' : 'Líder';
      }

      // Buscar devotionals relacionados
      const devoIds = Array.from(new Set((msgs || []).map((m: any) => m.devotional_id).filter(Boolean)));
      let devotionalsMap: Record<string, { verse_reference: string; date: string }> = {};
      
      if (devoIds.length > 0) {
        const { data: devos } = await supabase
          .from('devotionals')
          .select('id, verse_reference, date')
          .in('id', devoIds as string[]);
        devotionalsMap = Object.fromEntries((devos || []).map((d: any) => [d.id, { verse_reference: d.verse_reference, date: d.date }]));
      }

      const enriched = (msgs || []).map((m: any) => ({
        ...m,
        pastor_name,
        pastor_position,
        devotional: m.devotional_id ? devotionalsMap[m.devotional_id] : undefined,
      }));

      setMessages(enriched as any);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('my-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pastor_messages',
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const pendingMessages = messages.filter(m => m.status === 'pending' || m.status === 'read');
  const respondedMessages = messages.filter(m => m.status === 'responded');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Minhas Mensagens</h1>
                {respondedMessages.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {respondedMessages.length} {respondedMessages.length === 1 ? 'resposta nova' : 'respostas novas'}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lista de Mensagens */}
          <div className="space-y-4">
            <Tabs defaultValue="responded" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="responded" className="relative">
                  Respondidas
                  {respondedMessages.length > 0 && (
                    <Badge className="ml-2 bg-primary">{respondedMessages.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending">Aguardando</TabsTrigger>
              </TabsList>

              <TabsContent value="responded" className="space-y-3 mt-4">
                {respondedMessages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma resposta ainda</p>
                  </Card>
                ) : (
                  respondedMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onSelect={setSelectedMessage}
                      isSelected={selectedMessage?.id === msg.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3 mt-4">
                {pendingMessages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma mensagem pendente</p>
                  </Card>
                ) : (
                  pendingMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onSelect={setSelectedMessage}
                      isSelected={selectedMessage?.id === msg.id}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Painel de Detalhes */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedMessage ? (
              <Card className="p-6 shadow-celestial">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {selectedMessage.pastor_position} {selectedMessage.pastor_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Enviada em: {new Date(selectedMessage.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      selectedMessage.status === 'pending' || selectedMessage.status === 'read' 
                        ? 'secondary' 
                        : 'default'
                    }>
                      {selectedMessage.status === 'pending' || selectedMessage.status === 'read' 
                        ? 'Aguardando' 
                        : 'Respondida'}
                    </Badge>
                  </div>

                  {selectedMessage.devotional && (
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {selectedMessage.devotional.verse_reference}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {new Date(selectedMessage.devotional.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Sua Mensagem:</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-foreground">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {selectedMessage.status === 'responded' && selectedMessage.response && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        Resposta do {selectedMessage.pastor_position}:
                      </h4>
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                        <p className="text-foreground">{selectedMessage.response}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Respondido em: {new Date(selectedMessage.responded_at!).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {(selectedMessage.status === 'pending' || selectedMessage.status === 'read') && (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aguardando resposta do {selectedMessage.pastor_position}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center shadow-celestial">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Selecione uma mensagem
                </h3>
                <p className="text-muted-foreground">
                  Clique em uma mensagem à esquerda para visualizar os detalhes
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface MessageCardProps {
  message: Message;
  onSelect: (message: Message) => void;
  isSelected: boolean;
}

const MessageCard = ({ message, onSelect, isSelected }: MessageCardProps) => {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-celestial ${
        isSelected ? 'ring-2 ring-primary shadow-celestial' : ''
      }`}
      onClick={() => onSelect(message)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">
            {message.pastor_position} {message.pastor_name}
          </span>
        </div>
        {message.status === 'responded' && (
          <Badge variant="default" className="text-xs">
            <CheckCheck className="w-3 h-3 mr-1" />
            Respondida
          </Badge>
        )}
        {(message.status === 'pending' || message.status === 'read') && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando
          </Badge>
        )}
      </div>

      {message.devotional && (
        <div className="text-xs text-primary mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {message.devotional.verse_reference}
        </div>
      )}

      <p className="text-sm text-muted-foreground line-clamp-2">
        {message.message}
      </p>

      <p className="text-xs text-muted-foreground mt-2">
        {new Date(message.created_at).toLocaleString('pt-BR')}
      </p>
    </Card>
  );
};

export default MyMessages;
