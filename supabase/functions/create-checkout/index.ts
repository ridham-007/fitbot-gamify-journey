
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Create a Supabase client using the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse the incoming request body
    const { tier, userId } = await req.json();

    // Fetch user details
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(userId);
    if (userError || !userData.user) throw new Error("User not found");

    const user = userData.user;

    // Determine price based on tier
    let priceId;
    switch(tier) {
      case 'Basic':
        priceId = 'price_basic'; // Replace with actual Stripe price ID
        break;
      case 'Pro':
        priceId = 'price_pro'; // Replace with actual Stripe price ID
        break;
      case 'Elite':
        priceId = 'price_elite'; // Replace with actual Stripe price ID
        break;
      default:
        throw new Error("Invalid tier");
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${Deno.env.get('APP_URL')}/dashboard?success=true`,
      cancel_url: `${Deno.env.get('APP_URL')}/pricing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
