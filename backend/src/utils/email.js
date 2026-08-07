const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const BRAND_COLOR = '#B8960C';
const DARK_BG = '#0a0a0a';

const wrapInLayout = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; font-family: 'Arial', sans-serif; }
    .container { max-width:600px; margin:0 auto; }
    .header { background:${DARK_BG}; padding:32px 40px; text-align:center; }
    .logo { color:${BRAND_COLOR}; font-size:28px; font-weight:bold; letter-spacing:3px; }
    .logo span { color:#fff; }
    .body { background:#ffffff; padding:40px; }
    .footer { background:${DARK_BG}; padding:24px; text-align:center; color:#888; font-size:12px; }
    .btn { display:inline-block; background:${BRAND_COLOR}; color:#000 !important; padding:14px 32px; border-radius:4px; text-decoration:none; font-weight:bold; margin:16px 0; }
    h1 { color:#111; margin-top:0; }
    p { color:#444; line-height:1.6; }
    .highlight { color:${BRAND_COLOR}; font-weight:bold; }
    .divider { border:none; border-top:1px solid #eee; margin:24px 0; }
    .info-box { background:#f9f9f9; border-left:4px solid ${BRAND_COLOR}; padding:16px 20px; margin:16px 0; border-radius:0 4px 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">LUXE <span>EVENTS</span></div>
      <div style="color:#888;font-size:12px;margin-top:4px;letter-spacing:2px;">LUXURY EVENT MANAGEMENT</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Luxe Events. All rights reserved.</p>
      <p>You received this email because you have an account with Luxe Events.</p>
    </div>
  </div>
</body>
</html>`;

const templates = {
  emailVerification: ({ name, verifyURL }) => wrapInLayout(`
    <h1>Welcome to Luxe Events, ${name}! 🥂</h1>
    <p>Thank you for creating your account. You're one step away from accessing our exclusive luxury event management platform.</p>
    <p>Please verify your email address to activate your account:</p>
    <div style="text-align:center">
      <a href="${verifyURL}" class="btn">Verify My Email</a>
    </div>
    <p style="font-size:13px;color:#888">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>`, 'Verify Your Email'),

  passwordReset: ({ name, resetURL, expiresIn }) => wrapInLayout(`
    <h1>Password Reset Request</h1>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align:center">
      <a href="${resetURL}" class="btn">Reset My Password</a>
    </div>
    <div class="info-box">⏱ This link expires in <strong>${expiresIn}</strong>.</div>
    <p style="font-size:13px;color:#888">If you didn't request this, you can safely ignore this email.</p>`, 'Reset Password'),

  bookingConfirmation: ({ name, bookingId, eventName, eventDate, totalAmount, status }) => wrapInLayout(`
    <h1>Booking ${status === 'pending' ? 'Received' : 'Confirmed'}! 🎉</h1>
    <p>Dear ${name},</p>
    <p>Your booking request has been received. Our team will review it shortly.</p>
    <div class="info-box">
      <p><strong>Booking ID:</strong> <span class="highlight">${bookingId}</span></p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Total Amount:</strong> ₹${totalAmount?.toLocaleString('en-IN')}</p>
      <p><strong>Status:</strong> ${status?.toUpperCase()}</p>
    </div>
    <p>Our event coordinator will contact you within 24 hours to confirm details.</p>`, 'Booking Confirmation'),

  paymentSuccess: ({ name, bookingId, invoiceNumber, amount, eventName, paymentDate }) => wrapInLayout(`
    <h1>Payment Successful! ✅</h1>
    <p>Dear ${name},</p>
    <p>Your payment has been received and confirmed.</p>
    <div class="info-box">
      <p><strong>Invoice #:</strong> <span class="highlight">${invoiceNumber}</span></p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Amount Paid:</strong> ₹${amount?.toLocaleString('en-IN')}</p>
      <p><strong>Payment Date:</strong> ${paymentDate}</p>
    </div>
    <p>Your booking is now confirmed. We look forward to making your event extraordinary!</p>`, 'Payment Confirmation'),

  bookingStatusUpdate: ({ name, bookingId, status, eventName, adminNotes }) => wrapInLayout(`
    <h1>Booking Update</h1>
    <p>Dear ${name}, your booking status has been updated.</p>
    <div class="info-box">
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>New Status:</strong> <span class="highlight">${status?.toUpperCase()}</span></p>
      ${adminNotes ? `<p><strong>Note:</strong> ${adminNotes}</p>` : ''}
    </div>`, 'Booking Status Update'),

  contactAck: ({ name }) => wrapInLayout(`
    <h1>Thank You, ${name}! 💌</h1>
    <p>We've received your message and our team will get back to you within <strong>24 hours</strong>.</p>
    <p>In the meantime, feel free to explore our event packages and venues on our website.</p>`, 'We Received Your Message'),

  contactNotification: ({ name, email, phone, subject, message }) => wrapInLayout(`
    <h1>New Contact Inquiry</h1>
    <div class="info-box">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
    </div>
    <hr class="divider">
    <p><strong>Message:</strong></p>
    <p>${message}</p>`, 'New Contact Inquiry'),
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Luxe Events" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendEmail };
