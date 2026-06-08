import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // On supprime la version d'API pour éviter les conflits de version
  // Stripe utilisera automatiquement la version compatible
});

export async function POST(request: Request) {
  console.log("🔄 [API] Création session Stripe");

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Clé Stripe manquante" }, { status: 500 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TRTV8CeoYA0qyocT9V5HBFh",
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Stripe error :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}