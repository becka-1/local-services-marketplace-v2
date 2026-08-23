import nodemailer from 'nodemailer';

let transporter = null;

// Initialize the test account and transporter asynchronously
export const initEmailService = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();
    
    // Create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log("Ethereal Email Service initialized.");
    console.log("Ethereal User: %s", testAccount.user);
  } catch (error) {
    console.error("Failed to initialize Ethereal Email Service:", error);
  }
};

export const sendVerificationEmail = async (toEmail, code, type) => {
  if (!transporter) {
    console.error("Email transporter is not initialized yet.");
    return false;
  }
  
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
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Local Services Marketplace" <noreply@localservices.com>',
      to: toEmail,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
