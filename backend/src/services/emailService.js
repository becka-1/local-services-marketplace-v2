import { Resend } from 'resend';

// Initialize the Resend client with an API key from the environment
const resend = new Resend(process.env.RESEND_API_KEY);

export const initEmailService = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Warning: RESEND_API_KEY is not set in the environment variables. Emails will fail to send.");
  } else {
    console.log("Resend Email Service initialized.");
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

  try {
    const { data, error } = await resend.emails.send({
      from: 'LocalServices <onboarding@resend.dev>', // Resend's testing domain. Update with your verified domain for production.
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
    console.error("Error sending email:", error);
    return false;
  }
};
