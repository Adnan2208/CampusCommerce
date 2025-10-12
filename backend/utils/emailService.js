import nodemailer from 'nodemailer';

// Create a transporter for sending emails
// Note: For production, use environment variables for email credentials
const createTransporter = () => {
  // Check if email credentials are provided
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('⚠️  EMAIL_USER and EMAIL_PASS not set. Email verification will use test account.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: emailUser,
      pass: emailPass // For Gmail, use an App Password, not your regular password
    }
  });
};

// Generate a random 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = createTransporter();

    // If no credentials, create a test account
    if (!transporter) {
      console.log('📧 TEST MODE: Verification code for', email, ':', code);
      console.log('   Add EMAIL_USER and EMAIL_PASS to .env for real emails');
      return { success: true, testMode: true };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Campus Commerce - Email Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .code-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px;
              border-radius: 15px;
              margin: 30px 0;
              display: inline-block;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            .message {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .footer {
              background: #f7f7f7;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
              text-align: left;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Campus Commerce</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Student Marketplace</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 10px;">Verify Your Email</h2>
              <p class="message">
                Welcome to Campus Commerce! To complete your registration, please use the verification code below:
              </p>
              <div class="code-box">
                ${code}
              </div>
              <p class="message">
                Enter this code in the signup page to activate your account.
              </p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This code expires in 10 minutes<br>
                • Never share this code with anyone<br>
                • Campus Commerce staff will never ask for this code
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request this code, please ignore this email.</p>
              <p style="margin-top: 10px;">
                <strong>Campus Commerce</strong> - Buy and sell with fellow students
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
