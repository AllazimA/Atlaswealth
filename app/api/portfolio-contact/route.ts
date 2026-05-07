import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await req.json()
  const { name, email, subject, message } = body

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;background:#f9f9f9;padding:40px;border:1px solid #ddd;border-radius:8px;">
      <h2 style="color:#C4A35A;font-size:22px;margin-bottom:4px;">Portfolio Contact</h2>
      <p style="color:#999;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:32px;">New Message from ahmedallazim.com</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.8;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;width:30%;">Name</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#C4A35A;">${email}</a></td></tr>
        ${subject ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;">Subject</td><td style="padding:8px 0;border-bottom:1px solid #eee;">${subject}</td></tr>` : ''}
      </table>

      <div style="margin-top:28px;padding:20px;background:#fff;border-left:3px solid #C4A35A;border-radius:0 4px 4px 0;">
        <p style="color:#888;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:10px;">Message</p>
        <p style="font-size:14px;line-height:1.8;color:#333;white-space:pre-wrap;">${message}</p>
      </div>

      <p style="margin-top:32px;font-size:11px;color:#aaa;text-align:center;">Reply directly to this email to respond to ${name}.</p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: 'a.allazim@hotmail.com',
      replyTo: email,
      subject: subject ? `Portfolio: ${subject}` : `New message from ${name}`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Portfolio contact route error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to send email' }, { status: 500 })
  }
}
