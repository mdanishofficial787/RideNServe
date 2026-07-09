const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function sendOTPEmail(toEmail, name, otp) {
  const mailOptions = {
    from: `"Ride and Serve" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Ride and Serve verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #1a1a1a;">Verify your email</h2>
        <p>Hi ${name || ''},</p>
        <p>Use the code below to verify your Ride and Serve account. This code expires in 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background: #f4f6f8; padding: 16px; text-align: center; border-radius: 6px; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOTPEmail;
