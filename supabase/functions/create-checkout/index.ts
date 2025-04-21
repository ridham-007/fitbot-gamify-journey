
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

    // Check if this is the Basic tier (free)
    if (tier === 'Basic') {
      return new Response(JSON.stringify({ 
        url: `${Deno.env.get('APP_URL') || req.headers.get('origin')}/dashboard?success=true&tier=basic` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Determine price based on tier
    let priceId;
    switch(tier) {
      case 'Pro':
        priceId = Deno.env.get('STRIPE_PRICE_PRO') || '';
        break;
      case 'Elite':
        priceId = Deno.env.get('STRIPE_PRICE_ELITE') || '';
        break;
      default:
        throw new Error("Invalid tier");
    }

    // Find the price ID from the database if not specified in environment
    if (!priceId) {
      const { data: priceData, error: priceError } = await supabaseClient
        .from('stripe_products')
        .select('stripe_price_id')
        .eq('name', tier)
        .single();
      
      if (priceError || !priceData) {
        throw new Error(`Could not find price ID for tier ${tier}`);
      }
      
      priceId = priceData.stripe_price_id;
    }

    // Check if user is provided
    let customer;
    let email;
    
    if (userId) {
      // Fetch user details
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
      if (userError || !userData.user) {
        console.error("User error:", userError);
        // Continue without user data, will create checkout session with email only
      } else {
        email = userData.user.email;
        
        // Check if user already has a Stripe customer ID
        const { data: existingSubscriber } = await supabaseClient
          .from('subscribers')
          .select('stripe_customer_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingSubscriber?.stripe_customer_id) {
          // Use existing customer ID
          customer = existingSubscriber.stripe_customer_id;
        } else if (email) {
          // Look up customer by email
          const customers = await stripe.customers.list({ email, limit: 1 });
          if (customers.data.length > 0) {
            customer = customers.data[0].id;
          }
        }
      }
    }

    // Create a new customer if needed
    if (!customer && email) {
      const newCustomer = await stripe.customers.create({
        email,
        metadata: userId ? { userId } : undefined
      });
      customer = newCustomer.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      customer_email: !customer ? email : undefined,
      client_reference_id: userId || undefined,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${Deno.env.get('APP_URL') || req.headers.get('origin')}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL') || req.headers.get('origin')}/pricing?canceled=true`,
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
