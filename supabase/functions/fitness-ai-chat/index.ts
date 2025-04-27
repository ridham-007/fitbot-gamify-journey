
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryQuestions = {
  'weightloss': [
    "What's your current weight and target weight?",
    "How many days per week can you commit to exercise?",
    "Do you have any dietary restrictions?",
    "What's your preferred type of exercise (cardio, strength training, etc.)?",
    "Do you have any health conditions I should know about?"
  ],
  'muscle-gain': [
    "What's your current fitness level?",
    "Do you have access to a gym?",
    "Any specific muscle groups you want to focus on?",
    "How much time can you dedicate to workouts?",
    "What supplements, if any, are you currently taking?"
  ],
  'general-fitness': [
    "What are your main fitness goals?",
    "Do you have any health conditions to consider?",
    "What's your current activity level?",
    "What type of exercises do you enjoy?",
    "How much time can you commit to fitness weekly?"
  ],
  'flexibility': [
    "Have you done yoga or stretching before?",
    "Any areas of tightness or limited mobility?",
    "How much time can you dedicate to flexibility training?",
    "Do you have any injuries to consider?",
    "What's your current stretching routine, if any?"
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, category, isNewSession, sessionId } = await req.json();
    
    // Generate appropriate questions if it's a new session
    let initialContext = '';
    if (isNewSession && category && categoryQuestions[category]) {
      initialContext = `Please ask the user these questions one at a time to provide better guidance:
      ${categoryQuestions[category].join('\n')}
      
      Start by asking the first question in a friendly way. Wait for the user's response before moving to the next question.`;
    }
    
    // Construct the prompt
    const formattedPrompt = `
You are FitCoach AI, an expert fitness trainer and nutritionist with over 10 years of experience.
Category focus: ${category || 'general fitness'}

${initialContext}

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

    // Get relevant exercise video suggestions based on keywords in the response
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const reply = data.choices[0].message.content;
    
    // Extract keywords from the reply for video suggestions
    const keywords = ['cardio', 'strength', 'hiit', 'yoga', 'stretching']
      .filter(keyword => reply.toLowerCase().includes(keyword));

    // Get video suggestions based on extracted keywords
    const { data: videos } = await supabaseClient
      .from('exercise_videos')
      .select('*')
      .in('category', keywords.length ? keywords : ['HIIT', 'Strength', 'Yoga'])
      .limit(3);

    // Store the chat message
    await supabaseClient
      .from('ai_trainer_chats')
      .insert([
        { user_id: userId, message, is_user: true, category, session_id: sessionId },
        { user_id: userId, message: reply, is_user: false, category, session_id: sessionId }
      ]);
    
    // Get previous sessions for this user
    const { data: previousSessions } = await supabaseClient
      .from('ai_trainer_chats')
      .select('session_id, created_at')
      .eq('user_id', userId)
      .eq('is_user', true)
      .order('created_at', { ascending: false })
      .limit(10);
      
    // Create a unique list of sessions
    const uniqueSessions = previousSessions ? 
      [...new Map(previousSessions.map(item => [item.session_id, item])).values()]
      : [];
    
    return new Response(
      JSON.stringify({ 
        reply,
        suggestedVideos: videos || [],
        previousSessions: uniqueSessions || []
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
        previousSessions: []
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
