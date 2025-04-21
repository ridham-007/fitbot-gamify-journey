
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
        // Free tier - no need for payment
        return new Response(JSON.stringify({ 
          url: `${Deno.env.get('APP_URL') || req.headers.get('origin')}/dashboard?success=true&tier=basic` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      case 'Pro':
        priceId = Deno.env.get('STRIPE_PRICE_PRO') || 'price_1OsAVrSGJFUlz2xtcMNSfY7V'; // Replace with env var or default value
        break;
      case 'Elite':
        priceId = Deno.env.get('STRIPE_PRICE_ELITE') || 'price_1OsAWBSGJFUlz2xtlNVMUH4L'; // Replace with env var or default value
        break;
      default:
        throw new Error("Invalid tier");
    }

    // Check if user already has a Stripe customer ID
    const { data: existingSubscriber } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customer;
    if (existingSubscriber?.stripe_customer_id) {
      // Use existing customer ID
      customer = existingSubscriber.stripe_customer_id;
    } else {
      // Look up customer by email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customer = customers.data[0].id;
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
        });
        customer = newCustomer.id;
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer,
      client_reference_id: user.id,
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
