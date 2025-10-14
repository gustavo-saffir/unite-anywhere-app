import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PushNotificationToggle = () => {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push. Tente usar Chrome, Firefox ou Edge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          {isSubscribed 
            ? 'Você está recebendo notificações de novas mensagens'
            : 'Ative para receber notificações quando tiver novas mensagens'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          variant={isSubscribed ? 'outline' : 'default'}
          className="w-full"
        >
          {loading ? (
            'Processando...'
          ) : isSubscribed ? (
            <>
              <BellOff className="w-4 h-4 mr-2" />
              Desativar Notificações
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Ativar Notificações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
