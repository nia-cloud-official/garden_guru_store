/**
 * Simple email utility using nodemailer with Gmail
 */
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const GMAIL_USER = process.env.GMAIL_USER || 'tggsalesadministration@gmail.com';
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_APP_PASSWORD) {
    console.error('GMAIL_APP_PASSWORD is not configured');
    // Don't throw error - just log it so order can still be created
    return { success: false, error: 'Email not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"The Garden Guru" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: String(error) };
  }
}

export function generateSimpleBankTransferEmail(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  proofOfPaymentUrl: string
): string {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Bank Transfer Order</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00b050 0%, #008a3d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏦 New Bank Transfer Order</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Order #${orderNumber}</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Alert Box -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ New Bank Transfer Order</p>
              <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">Customer has uploaded proof of payment. Please verify and call them to confirm.</p>
            </div>

            <!-- Customer Details -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; border-bottom: 2px solid #00b050; padding-bottom: 8px;">Customer Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerPhone}</td>
                </tr>
              </table>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; border-bottom: 2px solid #00b050; padding-bottom: 8px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr style="background-color: #f9fafb;">
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: 700; color: #1f2937; font-size: 18px;">Total Amount:</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: #00b050; font-size: 18px;">$${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Proof of Payment -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; border-bottom: 2px solid #00b050; padding-bottom: 8px;">Proof of Payment</h2>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 12px 0; color: #6b7280;">The customer has uploaded proof of payment. Click the button below to view:</p>
                <a href="${proofOfPaymentUrl}" style="display: inline-block; background: #00b050; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 8px;">📄 View Proof of Payment</a>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">📋 Next Steps:</p>
              <ol style="margin: 8px 0 0 0; padding-left: 20px; color: #1e3a8a;">
                <li style="margin-bottom: 4px;">View the proof of payment using the link above</li>
                <li style="margin-bottom: 4px;">Verify the bank transfer in your account</li>
                <li style="margin-bottom: 4px;">Call the customer at <strong>${customerPhone}</strong> to confirm</li>
                <li>Process the order once payment is verified</li>
              </ol>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">The Garden Guru Store</p>
            <p style="margin: 8px 0 0 0;">69 Airport Road, Bulawayo, Zimbabwe</p>
            <p style="margin: 8px 0 0 0;">+263 77 277 5505 | inquiries@gardenguru.co.zw</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateCustomerConfirmationEmail(
  orderNumber: string,
  customerName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
): string {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00b050 0%, #008a3d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Received!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for your order</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi <strong>${customerName}</strong>,
            </p>
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We've received your order and proof of payment. We'll verify your payment and process your order within 24 hours.
            </p>

            <!-- Order Number -->
            <div style="background: #f0fdf4; border: 2px solid #00b050; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0; color: #166534; font-size: 14px;">Order Number</p>
              <p style="margin: 8px 0 0 0; color: #00b050; font-size: 24px; font-weight: 700;">${orderNumber}</p>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; border-bottom: 2px solid #00b050; padding-bottom: 8px;">Order Summary</h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr style="background-color: #f9fafb;">
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: 700; color: #1f2937; font-size: 18px;">Total Amount:</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: #00b050; font-size: 18px;">$${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- What's Next -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">📋 What happens next?</p>
              <ol style="margin: 8px 0 0 0; padding-left: 20px; color: #1e3a8a;">
                <li style="margin-bottom: 4px;">We'll verify your bank transfer</li>
                <li style="margin-bottom: 4px;">Once confirmed, we'll prepare your order</li>
                <li style="margin-bottom: 4px;">You'll receive a notification when it's ready</li>
                <li>We'll contact you for delivery or pickup arrangements</li>
              </ol>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0; font-weight: 600;">The Garden Guru</p>
            <p style="margin: 8px 0 0 0;">69 Airport Road, Bulawayo, Zimbabwe</p>
            <p style="margin: 8px 0 0 0;">+263 77 277 5505 | inquiries@gardenguru.co.zw</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
