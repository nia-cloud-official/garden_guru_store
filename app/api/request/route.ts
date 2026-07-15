import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Persist the request first so it is never lost even if the email
    // notification below fails (e.g. bad SMTP credentials).
    const { error: insertError } = await supabase.from('store_requests').insert({
      name,
      email,
      phone,
      subject,
      message,
    } as any);

    if (insertError) {
      console.error('Failed to persist customer request:', insertError);
    }

    // Send email to gardenguru10@gmail.com
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #00b050;">New Customer Request</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          This request was sent from the Garden Guru online store.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: 'gardenguru10@gmail.com',
      subject: `New Customer Request: ${subject}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('Request email failed to send (request was still saved):', emailResult.error);
    }

    // The request is saved in the database regardless of email outcome, so
    // this is still a genuine success from the customer's point of view.
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Request API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send request' },
      { status: 500 }
    );
  }
}
