import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalVerse, userVerse, verseReference } = await req.json();
    
    console.log('Validating memorization for:', verseReference);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI to validate semantic similarity
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente que valida se um versículo bíblico escrito de memória captura a essência e o significado do versículo original. 

Não exija palavra por palavra, mas avalie se:
1. O sentido principal foi preservado
2. As ideias-chave estão presentes
3. O contexto espiritual é mantido

Retorne APENAS um objeto JSON com:
{
  "score": número de 0 a 100 (similaridade semântica),
  "isValid": booleano (true se score >= 70),
  "feedback": string curta de encorajamento em português
}`
          },
          {
            role: 'user',
            content: `Versículo Original (${verseReference}):\n"${originalVerse}"\n\nVersículo Escrito de Memória:\n"${userVerse}"\n\nValide a memorização.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);
    
    // Parse JSON response from AI
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const validation = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(validation),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in validate-memorization:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        score: 0,
        isValid: false,
        feedback: 'Erro ao validar. Tente novamente.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
