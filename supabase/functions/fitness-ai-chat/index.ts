
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    // Construct a prompt with fitness expertise context
    const formattedPrompt = `
You are FitCoach AI, an expert fitness trainer and nutritionist with over 10 years of experience.
Provide personalized, friendly, and expert advice about:
- Workout routines and exercise form
- Nutrition and dietary guidance for fitness goals
- Motivation and adherence strategies
- General health and wellness tips

Always use emojis 🏋️‍♀️ and friendly language while maintaining professionalism.
Keep responses clear, concise, and actionable.

User message: ${message}
    `.trim();

    // Process the message using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are FitCoach AI, an expert fitness trainer with expertise in workout planning, nutrition, and motivation. Use a friendly tone with occasional emojis.'
          },
          { role: 'user', content: formattedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const reply = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing fitness AI chat:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        reply: "I'm having trouble connecting to my fitness database right now. Can you try again in a moment? 🏋️‍♂️" 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
