import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { serviceId, serviceName, price, currency, customerName, customerEmail, bookingNote } = await req.json()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        serviceId,
        serviceName,
        customerName,
        bookingNote: bookingNote || '',
      },
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: serviceName,
              description: `Consultation booking with Ahmed Allazim — ${serviceName}`,
              images: [],
            },
            unit_amount: price, // in cents (e.g. 15000 = $150.00)
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&serviceId=${encodeURIComponent(serviceId)}&service=${encodeURIComponent(serviceName)}&name=${encodeURIComponent(customerName)}`,
      cancel_url: `${siteUrl}/booking/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
