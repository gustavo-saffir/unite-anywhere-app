import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { daily_reading_id } = await req.json();

    if (!daily_reading_id) {
      return new Response(
        JSON.stringify({ error: "daily_reading_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if quiz already exists for this reading
    const { data: existingQuiz } = await supabase
      .from("daily_reading_quizzes")
      .select("*")
      .eq("daily_reading_id", daily_reading_id)
      .single();

    if (existingQuiz) {
      console.log("Quiz already exists for this reading");
      return new Response(
        JSON.stringify({ quiz: existingQuiz }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the daily reading
    const { data: reading, error: readingError } = await supabase
      .from("daily_readings")
      .select("*")
      .eq("id", daily_reading_id)
      .single();

    if (readingError || !reading) {
      console.error("Error fetching reading:", readingError);
      return new Response(
        JSON.stringify({ error: "Daily reading not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating quiz for ${reading.book} chapter ${reading.chapter}`);

    // Generate quiz using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em estudos bíblicos. Sua tarefa é criar perguntas de múltipla escolha baseadas em textos bíblicos para testar a compreensão da leitura.

REGRAS IMPORTANTES:
1. Crie exatamente 3 perguntas
2. Cada pergunta deve ter exatamente 4 opções (A, B, C, D)
3. Apenas UMA opção deve ser correta
4. As perguntas devem focar em fatos específicos do texto
5. Inclua uma breve explicação para cada resposta correta
6. Use linguagem clara e acessível

Responda APENAS com um JSON válido no seguinte formato:
{
  "questions": [
    {
      "question": "Texto da pergunta?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctAnswer": 0,
      "explanation": "Explicação breve de por que esta é a resposta correta"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Crie 3 perguntas de múltipla escolha baseadas no seguinte texto bíblico:

Livro: ${reading.book}
Capítulo: ${reading.chapter}

Texto:
${reading.chapter_text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para gerar o quiz." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao gerar quiz com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Resposta da IA vazia" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response content:", content);

    // Parse the JSON from AI response
    let questions;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length !== 3) {
      console.error("Invalid questions structure:", questions);
      return new Response(
        JSON.stringify({ error: "Estrutura de perguntas inválida" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save quiz to database
    const { data: quiz, error: insertError } = await supabase
      .from("daily_reading_quizzes")
      .insert({
        daily_reading_id,
        questions,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting quiz:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar quiz" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Quiz created successfully:", quiz.id);

    return new Response(
      JSON.stringify({ quiz }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});