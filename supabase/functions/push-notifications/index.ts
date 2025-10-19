import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body early to determine action
    const { action, subscription, endpoint, userId, title, body, url } = await req.json().catch(() => ({} as any));

    // Only require user auth for client-initiated actions
    let user: any = null;
    if (action !== 'send-notification') {
      const authHeader = req.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !authUser) {
        throw new Error('Unauthorized');
      }
      user = authUser;
    }

    // Get VAPID public key
    if (action === 'get-vapid-key') {
      const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      
      if (!publicKey) {
        throw new Error('VAPID_PUBLIC_KEY not configured');
      }

      return new Response(
        JSON.stringify({ publicKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save subscription to database
    if (action === 'save-subscription') {
      // First check if user already has a subscription
      const { data: existing } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('push_subscriptions')
          .update({
            p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth
          });

        if (insertError) throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove subscription
    if (action === 'remove-subscription') {
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send push notification
    if (action === 'send-notification') {
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
      const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@caminhodiario.app';

      if (!vapidPublicKey || !vapidPrivateKey) {
        throw new Error('VAPID keys not configured');
      }

      // Get user's subscriptions
      console.log('[push-notifications] send-notification for userId:', userId);
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (subError) {
        console.error('[push-notifications] DB error fetching subscriptions:', subError);
        throw subError;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`[push-notifications] No subscriptions found for user ${userId}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            targeted: 0,
            sentOk: 0,
            removedInvalid: 0,
            message: 'No subscriptions found for this user'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[push-notifications] Found ${subscriptions.length} subscription(s) for user ${userId}`);

      // Send notification to all user's devices
      const webpush = await import('https://esm.sh/web-push@3.6.7');
      
      webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
      );

      const payload = JSON.stringify({
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: url || '/' },
        tag: 'message-notification',
        requireInteraction: true
      });

      let sentOk = 0;
      let removedInvalid = 0;

      const sendPromises = subscriptions.map(async (sub: PushSubscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh_key,
                auth: sub.auth_key
              }
            },
            payload
          );
          console.log(`[push-notifications] ✅ Notification sent to ${sub.endpoint.substring(0, 50)}...`);
          sentOk++;
        } catch (error: any) {
          console.error(`[push-notifications] ❌ Failed to send to ${sub.endpoint.substring(0, 50)}...:`, error.message, error.statusCode);
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
            console.log(`[push-notifications] 🗑️ Removed invalid subscription ${sub.endpoint.substring(0, 50)}...`);
            removedInvalid++;
          }
        }
      });

      await Promise.all(sendPromises);

      console.log(`[push-notifications] Summary: targeted=${subscriptions.length}, sentOk=${sentOk}, removedInvalid=${removedInvalid}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          targeted: subscriptions.length,
          sentOk,
          removedInvalid
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Error in push-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
