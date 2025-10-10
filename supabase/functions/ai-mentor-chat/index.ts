import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { conversationId, message, devotionalContext } = await req.json();
    
    console.log('Received request:', { conversationId, hasMessage: !!message, hasContext: !!devotionalContext });

    // Buscar histórico da conversa
    const { data: messages, error: messagesError } = await supabase
      .from('ai_mentor_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    console.log('Found messages:', messages?.length || 0);

    // Construir o prompt do sistema
    const systemPrompt = `Você é um Mentor Espiritual Evangélico, uma IA criada para apoiar discípulos em sua jornada de fé. Você combina dois papéis:

1. **Conselheiro Bíblico**: Responda sempre com base nas Escrituras, citando versículos relevantes e oferecendo aplicações práticas curtas e claras.

2. **Treinador Espiritual**: Use um tom motivacional e encorajador, desafiando o usuário a agir e crescer em sua fé.

**IMPORTANTE**: Sempre lembre o usuário que você NÃO substitui o papel do pastor, líder espiritual ou comunhão presencial na igreja. Encoraje-os a buscar orientação pastoral quando necessário.

${devotionalContext ? `\n**Contexto do Devocional de Hoje:**\n${devotionalContext}\n\nResponda considerando este contexto bíblico.` : ''}

**Diretrizes:**
- Seja empático, acolhedor e sempre fundamentado na Bíblia
- Mantenha respostas práticas e aplicáveis ao dia a dia
- Cite versículos quando relevante
- Encoraje ação e crescimento espiritual
- Seja breve e direto (máximo 3-4 parágrafos)`;

    // Preparar mensagens para a IA
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    console.log('Calling AI with', aiMessages.length, 'messages');

    // Chamar a IA
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Got AI response, length:', aiResponse.length);

    // Salvar mensagem do usuário
    const { error: userMsgError } = await supabase
      .from('ai_mentor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    // Salvar resposta da IA
    const { error: aiMsgError } = await supabase
      .from('ai_mentor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
      });

    if (aiMsgError) {
      console.error('Error saving AI message:', aiMsgError);
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-mentor-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});