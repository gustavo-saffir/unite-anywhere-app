import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function PushDebug() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState({
    permission: 'unknown',
    swRegistered: false,
    hasSubscription: false,
    endpoint: '',
  });
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    checkStatus();

    // Listen for push messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'PUSH_RECEIVED') {
          addLog(`🔔 Push recebido no SW: ${event.data.data.title}`);
        }
      });
    }
  }, []);

  const checkStatus = async () => {
    try {
      const permission = Notification.permission;
      setStatus(prev => ({ ...prev, permission }));
      addLog(`Permissão de notificação: ${permission}`);

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setStatus(prev => ({ ...prev, swRegistered: true }));
        addLog('Service Worker registrado ✅');

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setStatus(prev => ({
            ...prev,
            hasSubscription: true,
            endpoint: subscription.endpoint.substring(0, 50) + '...',
          }));
          addLog(`Subscription ativa: ${subscription.endpoint.substring(0, 30)}...`);
        } else {
          addLog('Nenhuma subscription ativa ❌');
        }
      }
    } catch (error: any) {
      addLog(`❌ Erro ao verificar status: ${error.message}`);
    }
  };

  const showLocalNotification = async () => {
    setLoading(true);
    addLog('Tentando mostrar notificação local...');
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Teste Local', {
        body: 'Esta é uma notificação local de teste',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-local',
      });
      addLog('✅ Notificação local exibida com sucesso!');
      toast({
        title: 'Notificação local enviada',
        description: 'Verifique se apareceu no dispositivo',
      });
    } catch (error: any) {
      addLog(`❌ Erro ao mostrar notificação local: ${error.message}`);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRemotePushToMe = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    addLog('Enviando push remoto para mim...');
    try {
      const { data, error } = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'send-notification',
          userId: user.id,
          title: 'Teste Remoto',
          body: 'Esta é uma notificação push remota de teste',
          url: '/push-debug',
        },
      });

      if (error) throw error;

      addLog(`✅ Resposta da função: ${JSON.stringify(data)}`);
      addLog(`Dispositivos alvo: ${data.targeted}, Enviados: ${data.sentOk}, Removidos: ${data.removedInvalid}`);
      
      toast({
        title: 'Push remoto enviado',
        description: `${data.sentOk} de ${data.targeted} notificações enviadas`,
      });
    } catch (error: any) {
      addLog(`❌ Erro ao enviar push remoto: ${error.message}`);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    setLogs([]);
    checkStatus();
  };

  const getPermissionBadge = () => {
    switch (status.permission) {
      case 'granted':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Concedida</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Negada</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Desconhecida</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Debug Push Notifications</h1>
            <p className="text-muted-foreground text-sm">Diagnóstico e testes de notificações push</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>Estado atual das notificações push neste dispositivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Permissão de notificação:</span>
              {getPermissionBadge()}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Service Worker:</span>
              {status.swRegistered ? (
                <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Ativo</Badge>
              ) : (
                <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Inativo</Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Subscription ativa:</span>
              {status.hasSubscription ? (
                <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Sim</Badge>
              ) : (
                <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Não</Badge>
              )}
            </div>
            {status.endpoint && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                <strong>Endpoint:</strong> {status.endpoint}
              </div>
            )}
            <Button onClick={refreshStatus} variant="outline" className="w-full mt-2">
              Atualizar Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testes de Notificação</CardTitle>
            <CardDescription>Execute testes para validar o funcionamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={showLocalNotification}
              disabled={loading || !status.swRegistered}
              className="w-full"
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Mostrar Notificação Local
            </Button>
            <p className="text-xs text-muted-foreground">
              Testa se o Service Worker pode exibir notificações (não usa push server)
            </p>

            <Button
              onClick={sendRemotePushToMe}
              disabled={loading || !status.hasSubscription}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar Push Remoto Para Mim
            </Button>
            <p className="text-xs text-muted-foreground">
              Chama a função backend que enviará um push real para este dispositivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs em Tempo Real</CardTitle>
            <CardDescription>Histórico de eventos e ações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-muted-foreground">Nenhum log ainda...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>1.</strong> Verifique se o "Status do Sistema" mostra tudo ativo (verde).</p>
            <p><strong>2.</strong> Clique em "Mostrar Notificação Local" - deve aparecer imediatamente.</p>
            <p><strong>3.</strong> Clique em "Enviar Push Remoto Para Mim" e coloque o app em segundo plano ou bloqueie a tela.</p>
            <p><strong>4.</strong> Se não receber notificação, verifique:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>iOS: Ajustes → Notificações → [Nome do App] → Permitir Notificações</li>
              <li>Android: Configurações → Notificações → Permissões do App</li>
              <li>Se subscription está ativa (Status do Sistema)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-500 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Limitações do iOS para Push Web
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="bg-red-100 dark:bg-red-950 p-3 rounded">
              <p className="font-semibold mb-2">⚠️ Push Notifications Web no iOS têm limitações severas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Requer iOS 16.4 ou superior</strong></li>
                <li><strong>Só funciona em Safari</strong> (não no Chrome iOS)</li>
                <li><strong>O PWA DEVE estar instalado na tela inicial</strong> (não funciona no browser)</li>
                <li><strong>Erros 403 da Apple são comuns</strong> e podem indicar problemas com VAPID keys ou configuração</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">Para fazer funcionar no iOS:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Abra o app no <strong>Safari</strong> (não Chrome)</li>
                <li>Toque no botão de compartilhar</li>
                <li>Selecione "Adicionar à Tela de Início"</li>
                <li>Abra o app pela <strong>tela inicial</strong> (não pelo Safari)</li>
                <li>Ative as notificações quando solicitado</li>
                <li>Vá em Ajustes → Notificações → [Nome do App] e verifique que está tudo habilitado</li>
              </ol>
            </div>

            <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded text-xs">
              <strong>Nota:</strong> Mesmo seguindo todos os passos, o iOS pode ainda retornar erro 403. Isso é uma limitação conhecida da plataforma Apple para PWAs.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
