import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported || !user) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'Você precisa permitir notificações para receber alertas.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Get VAPID public key from edge function
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke(
        'push-notifications',
        {
          body: { action: 'get-vapid-key' }
        }
      );

      if (vapidError || !vapidData?.publicKey) {
        throw new Error('Failed to get VAPID key');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
      });

      // Save subscription to database
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      const { error: saveError } = await supabase.functions.invoke(
        'push-notifications',
        {
          body: {
            action: 'save-subscription',
            subscription: subscriptionData
          }
        }
      );

      if (saveError) {
        throw saveError;
      }

      setIsSubscribed(true);
      toast({
        title: '✅ Notificações ativadas!',
        description: 'Você receberá notificações de novas mensagens.',
      });
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Erro ao ativar notificações',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported || !user) return;

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from database
        await supabase.functions.invoke('push-notifications', {
          body: {
            action: 'remove-subscription',
            endpoint: subscription.endpoint
          }
        });
      }

      setIsSubscribed(false);
      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais notificações push.',
      });
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Erro ao desativar notificações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe
  };
};
