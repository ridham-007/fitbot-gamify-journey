
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
    
    // Construct a prompt with fitness expertise context and video/chart suggestions
    const formattedPrompt = `
You are FitCoach AI, an expert fitness trainer and nutritionist with over 10 years of experience.
Provide personalized, engaging, and expert advice about fitness and nutrition.

When responding:
1. Give friendly, specific advice using emojis 🏋️‍♀️ and clear formatting
2. If appropriate, suggest relevant workout videos from these categories:
   - Cardio
   - Strength Training
   - HIIT
   - Yoga
   - Stretching
3. When discussing progress, recommend tracking metrics like:
   - Workout duration
   - Calories burned
   - Weekly consistency
4. Use markdown formatting for better readability
5. If discussing specific exercises, include form tips and common mistakes to avoid

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
            content: 'You are FitCoach AI, an expert fitness trainer. Format responses using markdown for headers, lists, and emphasis. Use emojis strategically. Keep responses clear and actionable.'
          },
          { role: 'user', content: formattedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    // Store the chat message in the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get random exercise video suggestions based on keywords in the response
    const { data: videos } = await supabaseClient
      .from('exercise_videos')
      .select('*')
      .limit(2);

    // Get user's recent workout progress
    const { data: workoutProgress } = await supabaseClient
      .from('user_workout_progress')
      .select('*')
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
      .limit(7);

    const reply = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ 
        reply,
        suggestedVideos: videos || [],
        workoutProgress: workoutProgress || [],
      }),
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
        reply: "I'm having trouble connecting right now. Can you try again in a moment? 🏋️‍♂️",
        suggestedVideos: [],
        workoutProgress: []
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
