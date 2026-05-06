import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await req.json()
  const { name, email, phone, nationality, arrivalDate, departureDate, guests, service, message } = body

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#222;background:#fafaf8;padding:40px;border:1px solid #e0d4b0;">
      <h2 style="color:#8B6914;font-size:24px;margin-bottom:4px;font-weight:400;">Lavish Morocco</h2>
      <p style="color:#999;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:32px;">New Concierge Inquiry</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.8;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;width:40%;">Full Name</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">Email</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;"><a href="mailto:${email}" style="color:#8B6914;">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">Phone / WhatsApp</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;">${phone}</td></tr>` : ''}
        ${nationality ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">Nationality</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;">${nationality}</td></tr>` : ''}
        ${arrivalDate ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">Arrival Date</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;">${arrivalDate}</td></tr>` : ''}
        ${departureDate ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">Departure Date</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;">${departureDate}</td></tr>` : ''}
        ${guests ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">No. of Guests</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;">${guests}</td></tr>` : ''}
        ${service ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;color:#888;">Service</td><td style="padding:8px 0;border-bottom:1px solid #e8e0cc;">${service}</td></tr>` : ''}
      </table>

      <div style="margin-top:28px;padding:20px;background:#fff;border-left:3px solid #C4A35A;">
        <p style="color:#888;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:10px;">Request Details</p>
        <p style="font-size:14px;line-height:1.8;color:#333;white-space:pre-wrap;">${message}</p>
      </div>

      <p style="margin-top:32px;font-size:11px;color:#aaa;text-align:center;letter-spacing:0.2em;">LAVISH MOROCCO — Luxury Concierge &amp; Lifestyle Management</p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: 'Lavish Morocco <onboarding@resend.dev>',
      to: 'a.allazim@hotmail.com',
      replyTo: email,
      subject: 'Lavish Morocco Inquiry Request',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to send email' }, { status: 500 })
  }
}
