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

// Helper to decode base64url to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper to encode ArrayBuffer/Uint8Array to base64url string
function toBase64Url(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Create VAPID authorization header
async function createVapidAuthHeader(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject
  };

  const headerB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(jwtPayload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // The private key needs to be in the correct format
  const privateKeyBytes = base64UrlToUint8Array(privateKey);
  const publicKeyBytes = base64UrlToUint8Array(publicKey);
  
  // For P-256, the public key is 65 bytes (uncompressed point format: 0x04 + x + y)
  const x = publicKeyBytes.slice(1, 33);
  const y = publicKeyBytes.slice(33, 65);
  
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: toBase64Url(x),
    y: toBase64Url(y),
    d: toBase64Url(privateKeyBytes)
  };

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = toBase64Url(signature);
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt}, k=${publicKey}`,
    cryptoKey: `p256ecdsa=${publicKey}`
  };
}

// Generate ECDH shared secret and encrypt payload using aes128gcm
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authKey: string
): Promise<Uint8Array> {
  const payloadBytes = new TextEncoder().encode(payload);
  
  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64UrlToUint8Array(p256dhKey);
  // Create a proper ArrayBuffer from Uint8Array
  const subscriberKeyBuffer = new ArrayBuffer(subscriberPublicKeyBytes.length);
  new Uint8Array(subscriberKeyBuffer).set(subscriberPublicKeyBytes);
  
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    subscriberKeyBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKeyRaw = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKeyBytes = new Uint8Array(localPublicKeyRaw);

  // Auth secret
  const authSecret = base64UrlToUint8Array(authKey);
  const authSecretBuffer = new ArrayBuffer(authSecret.length);
  new Uint8Array(authSecretBuffer).set(authSecret);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBuffer = new ArrayBuffer(salt.length);
  new Uint8Array(saltBuffer).set(salt);

  // HKDF for key derivation - Step 1: Create IKM from ECDH secret and auth
  const sharedSecretKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // PRK info
  const prkInfo = new Uint8Array([
    ...new TextEncoder().encode('WebPush: info\0'),
    ...subscriberPublicKeyBytes,
    ...localPublicKeyBytes
  ]);
  const prkInfoBuffer = new ArrayBuffer(prkInfo.length);
  new Uint8Array(prkInfoBuffer).set(prkInfo);

  const ikm = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: authSecretBuffer,
      info: prkInfoBuffer
    },
    sharedSecretKey,
    256
  );

  const ikmKey = await crypto.subtle.importKey(
    'raw',
    ikm,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // Derive content encryption key
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const cekInfoBuffer = new ArrayBuffer(cekInfo.length);
  new Uint8Array(cekInfoBuffer).set(cekInfo);
  
  const cek = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: saltBuffer,
      info: cekInfoBuffer
    },
    ikmKey,
    128
  );

  // Derive nonce
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const nonceInfoBuffer = new ArrayBuffer(nonceInfo.length);
  new Uint8Array(nonceInfoBuffer).set(nonceInfo);
  
  const nonce = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: saltBuffer,
      info: nonceInfoBuffer
    },
    ikmKey,
    96
  );

  // Import CEK for AES-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Add padding delimiter (RFC 8291)
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // Delimiter byte

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonce) },
    aesKey,
    paddedPayload
  );

  // Build aes128gcm header (RFC 8188)
  // Header: salt (16) + record size (4) + key id length (1) + key id (65 for P-256 public key)
  const recordSize = new DataView(new ArrayBuffer(4));
  recordSize.setUint32(0, 4096, false);

  const header = new Uint8Array(21 + localPublicKeyBytes.length);
  header.set(salt, 0); // 16 bytes salt
  header.set(new Uint8Array(recordSize.buffer), 16); // 4 bytes record size
  header[20] = localPublicKeyBytes.length; // 1 byte key id length
  header.set(localPublicKeyBytes, 21); // 65 bytes public key

  // Combine header and ciphertext
  const result = new Uint8Array(header.length + encrypted.byteLength);
  result.set(header);
  result.set(new Uint8Array(encrypted), header.length);

  return result;
}

// Send push notification using Web Push protocol
async function sendPushNotification(
  subscription: { endpoint: string; p256dh_key: string; auth_key: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    // Parse endpoint URL to get audience
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

    // Encrypt payload
    const ciphertext = await encryptPayload(
      payload,
      subscription.p256dh_key,
      subscription.auth_key
    );

    // Create VAPID headers
    const vapidHeaders = await createVapidAuthHeader(
      audience,
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    // Convert to proper ArrayBuffer for fetch body
    const bodyBuffer = new ArrayBuffer(ciphertext.length);
    new Uint8Array(bodyBuffer).set(ciphertext);

    // Send the request
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Authorization': vapidHeaders.authorization,
        'Crypto-Key': vapidHeaders.cryptoKey
      },
      body: bodyBuffer
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return { 
        success: false, 
        statusCode: response.status,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    return { success: true, statusCode: response.status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
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

      const notificationPayload = JSON.stringify({
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
      const errors: string[] = [];

      for (const sub of subscriptions as PushSubscription[]) {
        const result = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh_key: sub.p256dh_key,
            auth_key: sub.auth_key
          },
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject
        );

        if (result.success) {
          console.log(`[push-notifications] ✅ Notification sent to ${sub.endpoint.substring(0, 50)}...`);
          sentOk++;
        } else {
          const isApple = sub.endpoint.includes('web.push.apple.com');
          const errorPrefix = isApple ? '[iOS/Apple]' : '[Android/Other]';
          
          console.error(`[push-notifications] ❌ ${errorPrefix} Failed: ${result.error}`);
          errors.push(`${errorPrefix}: ${result.error}`);
          
          // If subscription is invalid, remove it
          if (result.statusCode === 410 || result.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
            console.log(`[push-notifications] 🗑️ Removed invalid subscription`);
            removedInvalid++;
          }
        }
      }

      console.log(`[push-notifications] Summary: targeted=${subscriptions.length}, sentOk=${sentOk}, removedInvalid=${removedInvalid}`);

      return new Response(
        JSON.stringify({ 
          success: sentOk > 0,
          targeted: subscriptions.length,
          sentOk,
          removedInvalid,
          errors: errors.length > 0 ? errors : undefined
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
