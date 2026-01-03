import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[daily-reminder] Starting daily reminder job...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in Brazil timezone (UTC-3)
    const now = new Date();
    const brazilDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const year = brazilDate.getFullYear();
    const month = String(brazilDate.getMonth() + 1).padStart(2, '0');
    const day = String(brazilDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    console.log(`[daily-reminder] Today's date (Brazil): ${todayStr}`);

    // Check if there's a devotional for today
    const { data: devotional, error: devError } = await supabase
      .from('devotionals')
      .select('id, verse_reference')
      .eq('date', todayStr)
      .maybeSingle();

    if (devError) {
      console.error('[daily-reminder] Error fetching devotional:', devError);
      throw devError;
    }

    if (!devotional) {
      console.log('[daily-reminder] No devotional found for today, skipping notifications');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No devotional for today',
          notificationsSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[daily-reminder] Found devotional: ${devotional.verse_reference}`);

    // Get all users who have push subscriptions and haven't completed today's devotional
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh_key, auth_key');

    if (subError) {
      console.error('[daily-reminder] Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[daily-reminder] No push subscriptions found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No subscriptions found',
          notificationsSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[daily-reminder] Found ${subscriptions.length} total subscriptions`);

    // Get users who already completed today's devotional
    const { data: completedToday, error: compError } = await supabase
      .from('user_devotionals')
      .select('user_id')
      .eq('devotional_id', devotional.id);

    if (compError) {
      console.error('[daily-reminder] Error fetching completions:', compError);
    }

    const completedUserIds = new Set((completedToday || []).map(c => c.user_id));
    console.log(`[daily-reminder] ${completedUserIds.size} users already completed today's devotional`);

    // Filter out users who already completed
    const eligibleSubscriptions = subscriptions.filter(
      sub => !completedUserIds.has(sub.user_id)
    );

    // Group subscriptions by user (a user might have multiple devices)
    const userSubscriptions = new Map<string, typeof subscriptions>();
    eligibleSubscriptions.forEach(sub => {
      if (!userSubscriptions.has(sub.user_id)) {
        userSubscriptions.set(sub.user_id, []);
      }
      userSubscriptions.get(sub.user_id)!.push(sub);
    });

    console.log(`[daily-reminder] Sending notifications to ${userSubscriptions.size} users`);

    // VAPID setup
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@caminhodiario.app';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const webpush = await import('https://esm.sh/web-push@3.6.7');
    
    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title: '📖 Hora do Devocional!',
      body: `Seu devocional de hoje está disponível: ${devotional.verse_reference}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: '/devotional' },
      tag: 'daily-reminder',
      requireInteraction: true
    });

    let sentOk = 0;
    let failed = 0;
    let removedInvalid = 0;

    // Send to all eligible subscriptions
    const sendPromises = eligibleSubscriptions.map(async (sub) => {
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
        sentOk++;
      } catch (error: any) {
        console.error(`[daily-reminder] Failed to send to ${sub.endpoint.substring(0, 50)}...:`, error.message);
        failed++;
        
        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
          removedInvalid++;
        }
      }
    });

    await Promise.all(sendPromises);

    console.log(`[daily-reminder] Summary: sentOk=${sentOk}, failed=${failed}, removedInvalid=${removedInvalid}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        devotional: devotional.verse_reference,
        totalSubscriptions: subscriptions.length,
        eligibleUsers: userSubscriptions.size,
        sentOk,
        failed,
        removedInvalid
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[daily-reminder] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
