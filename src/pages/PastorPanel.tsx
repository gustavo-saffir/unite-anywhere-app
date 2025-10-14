import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Clock, CheckCheck, User, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';

interface PastorMessage {
  id: string;
  user_id: string;
  devotional_id: string | null;
  message: string;
  response: string | null;
  status: 'pending' | 'read' | 'responded';
  created_at: string;
  responded_at: string | null;
  profiles?: {
    full_name: string;
  };
  devotionals?: {
    verse_reference: string;
    date: string;
  };
}

const PastorPanel = () => {
  const [messages, setMessages] = useState<PastorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<PastorMessage | null>(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: msgs, error } = await supabase
        .from('pastor_messages')
        .select('*')
        .eq('pastor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = Array.from(new Set((msgs || []).map((m: any) => m.user_id).filter(Boolean)));
      const devoIds = Array.from(new Set((msgs || []).map((m: any) => m.devotional_id).filter(Boolean)));

      // Fetch disciple names (RLS permite ao pastor ver seus discípulos)
      let profilesMap: Record<string, { full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds as string[]);
        profilesMap = Object.fromEntries((profilesData || []).map((p: any) => [p.id, { full_name: p.full_name }]));
      }

      // Fetch devotionals meta (público)
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
        profiles: profilesMap[m.user_id] || { full_name: 'Discípulo' },
        devotionals: m.devotional_id ? devotionalsMap[m.devotional_id] : undefined,
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
      .channel('pastor-messages-changes')
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

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('pastor_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking as read:', error);
        throw error;
      }
      
      // Recarregar mensagens para atualizar a interface
      await loadMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSelectMessage = async (message: PastorMessage) => {
    setSelectedMessage(message);
    setResponse(message.response || '');
    
    if (message.status === 'pending') {
      await markAsRead(message.id);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !response.trim() || sending) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('pastor_messages')
        .update({
          response: response.trim(),
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id)
        .eq('pastor_id', user.id); // Adicionar verificação do pastor_id

      if (error) {
        console.error('Update error details:', error);
        throw error;
      }

      toast({
        title: 'Resposta enviada!',
        description: 'O discípulo será notificado.',
      });

      setSelectedMessage(null);
      setResponse('');
      loadMessages();
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a resposta.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const pendingMessages = messages.filter(m => m.status === 'pending');
  const readMessages = messages.filter(m => m.status === 'read');
  const respondedMessages = messages.filter(m => m.status === 'responded');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Painel do Pastor</h1>
                {pendingMessages.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {pendingMessages.length} {pendingMessages.length === 1 ? 'mensagem nova' : 'mensagens novas'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Push Notifications Toggle */}
        <div className="mb-6">
          <PushNotificationToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lista de Mensagens */}
          <div className="space-y-4">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="relative">
                  Pendentes
                  {pendingMessages.length > 0 && (
                    <Badge className="ml-2 bg-red-500">{pendingMessages.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Lidas</TabsTrigger>
                <TabsTrigger value="responded">Respondidas</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3 mt-4">
                {pendingMessages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma mensagem pendente</p>
                  </Card>
                ) : (
                  pendingMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onSelect={handleSelectMessage}
                      isSelected={selectedMessage?.id === msg.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="read" className="space-y-3 mt-4">
                {readMessages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma mensagem lida</p>
                  </Card>
                ) : (
                  readMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onSelect={handleSelectMessage}
                      isSelected={selectedMessage?.id === msg.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="responded" className="space-y-3 mt-4">
                {respondedMessages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma mensagem respondida</p>
                  </Card>
                ) : (
                  respondedMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onSelect={handleSelectMessage}
                      isSelected={selectedMessage?.id === msg.id}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Painel de Resposta */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedMessage ? (
              <Card className="p-6 shadow-celestial">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {selectedMessage.profiles?.full_name || 'Discípulo'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedMessage.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      selectedMessage.status === 'pending' ? 'destructive' :
                      selectedMessage.status === 'read' ? 'secondary' : 'default'
                    }>
                      {selectedMessage.status === 'pending' ? 'Pendente' :
                       selectedMessage.status === 'read' ? 'Lida' : 'Respondida'}
                    </Badge>
                  </div>

                  {selectedMessage.devotionals && (
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {selectedMessage.devotionals.verse_reference}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {new Date(selectedMessage.devotionals.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Mensagem:</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-foreground">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {selectedMessage.status !== 'responded' && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">Sua Resposta:</h4>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Escreva sua resposta..."
                        className="min-h-[150px]"
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendResponse}
                        disabled={sending || !response.trim()}
                        className="w-full bg-gradient-celestial hover:opacity-90"
                      >
                        {sending ? (
                          <>Enviando...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Resposta
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {selectedMessage.status === 'responded' && selectedMessage.response && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">Sua Resposta:</h4>
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                        <p className="text-foreground">{selectedMessage.response}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Respondido em: {new Date(selectedMessage.responded_at!).toLocaleString('pt-BR')}
                        </p>
                      </div>
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
                  Clique em uma mensagem à esquerda para visualizar e responder
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
  message: PastorMessage;
  onSelect: (message: PastorMessage) => void;
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
            {message.profiles?.full_name || 'Discípulo'}
          </span>
        </div>
        {message.status === 'pending' && (
          <Badge variant="destructive" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Nova
          </Badge>
        )}
        {message.status === 'responded' && (
          <Badge variant="default" className="text-xs">
            <CheckCheck className="w-3 h-3 mr-1" />
            Respondida
          </Badge>
        )}
      </div>

      {message.devotionals && (
        <div className="text-xs text-primary mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {message.devotionals.verse_reference}
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

export default PastorPanel;