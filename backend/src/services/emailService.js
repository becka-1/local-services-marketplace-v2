import 'dotenv/config';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const getBrevoKey = () => process.env.BREVO_API_KEY;
const getSenderEmail = () => process.env.EMAIL_USER || 'bereketmelaku887@gmail.com';
const getEmailPass = () => process.env.EMAIL_APP_PASS ? process.env.EMAIL_APP_PASS.replace(/\s+/g, '') : '';

let transporter = null;
let resendClient = null;

export const initEmailService = async () => {
  const brevoKey = getBrevoKey();
  const sender = getSenderEmail();
  const pass = getEmailPass();

  if (brevoKey) {
    console.log(`✅ Brevo HTTPS Email Service initialized for ${sender}`);
  } else if (sender && pass) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: sender,
          pass: pass,
        },
      });
      console.log(`✅ Gmail SMTP Email Service initialized for ${sender}`);
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
  const brevoKey = getBrevoKey();
  const sender = getSenderEmail();

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

  // 1. Primary: Brevo HTTPS REST API (Port 443 - never blocked by cloud hosts like Render)
  if (brevoKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: "LocalServices Marketplace",
            email: sender
          },
          to: [
            { email: toEmail }
          ],
          subject: subject,
          htmlContent: html,
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`📧 Verification email sent via Brevo HTTPS API to: ${toEmail} (ID: ${data.messageId})`);
        return true;
      } else {
        console.error("Brevo API Error:", data);
      }
    } catch (error) {
      console.error("Brevo Fetch Error:", error);
    }
  }

  // 2. Secondary: Gmail SMTP
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"LocalServices Marketplace" <${senderEmail}>`,
        to: toEmail,
        subject: subject,
        text: text,
        html: html,
      });
      console.log(`📧 Verification email sent via Gmail SMTP to: ${toEmail} (ID: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error("Gmail SMTP Send Error:", error);
    }
  }

  // 3. Fallback: Resend
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

      if (!error) {
        console.log("Message sent via Resend:", data?.id);
        return true;
      }
      console.error("Resend API Error:", error);
    } catch (error) {
      console.error("Error sending email via Resend:", error);
    }
  }

  console.error("No email service succeeded in sending email.");
  return false;
};
