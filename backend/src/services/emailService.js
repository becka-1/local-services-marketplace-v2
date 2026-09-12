import nodemailer from 'nodemailer';
import { Resend } from 'resend';

let transporter = null;
let resendClient = null;

const emailUser = process.env.EMAIL_USER || 'bereketmelaku887@gmail.com';
const emailPass = (process.env.EMAIL_APP_PASS || 'wejjrjqvqivoprkj').replace(/\s+/g, '');

export const initEmailService = async () => {
  if (emailUser && emailPass) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      console.log(`✅ Gmail SMTP Email Service initialized for ${emailUser}`);
    } catch (err) {
      console.error("Failed to initialize Gmail SMTP:", err);
    }
  } else if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("Resend Email Service initialized.");
  } else {
    console.warn("Warning: No email credentials configured.");
  }
};

export const sendVerificationEmail = async (toEmail, code, type) => {
  const subject = type === 'phone' 
    ? "Your Phone Verification Code" 
    : "Your Email Verification Code";
    
  const text = `Your verification code is: ${code}\n\nUse this code to verify your ${type}. It expires in 10 minutes.`;
  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #007bff; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">Here is your verification code to confirm your <strong>${type}</strong>:</p>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #6c757d;">This code will expire in 10 minutes.</p>
    </div>`;

  // 1. Prefer Gmail SMTP if transporter is initialized
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"LocalServices Marketplace" <${emailUser}>`,
        to: toEmail,
        subject: subject,
        text: text,
        html: html,
      });
      console.log(`📧 Verification email sent via Gmail SMTP to: ${toEmail} (ID: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error("Gmail SMTP Send Error:", error);
      // Fall through to Resend if available
    }
  }

  // 2. Fallback to Resend
  if (resendClient || process.env.RESEND_API_KEY) {
    const client = resendClient || new Resend(process.env.RESEND_API_KEY);
    try {
      const { data, error } = await client.emails.send({
        from: 'LocalServices <onboarding@resend.dev>',
        to: [toEmail],
        subject: subject,
        text: text,
        html: html,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return false;
      }

      console.log("Message sent via Resend:", data?.id);
      return true;
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      return false;
    }
  }

  console.error("No email service available to send email.");
  return false;
};
