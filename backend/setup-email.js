import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEmail() {
  console.log('\n🎓 Campus Commerce - Email Setup Wizard\n');
  console.log('='.repeat(50));
  console.log('\nThis wizard will help you configure email verification.\n');

  // Step 1: Choose email provider
  console.log('📧 Choose your email provider:\n');
  console.log('1. Gmail (Recommended for testing)');
  console.log('2. Outlook/Hotmail');
  console.log('3. Yahoo');
  console.log('4. Custom SMTP\n');

  const providerChoice = await question('Enter your choice (1-4): ');
  
  let service, host, port;
  switch(providerChoice.trim()) {
    case '1':
      service = 'gmail';
      host = 'smtp.gmail.com';
      port = 587;
      console.log('\n✅ Gmail selected');
      console.log('\n⚠️  IMPORTANT: Gmail requires App Password (not regular password)');
      console.log('   Follow these steps:');
      console.log('   1. Enable 2-Factor Authentication: https://myaccount.google.com/security');
      console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('   3. Copy the 16-character password\n');
      break;
    case '2':
      service = 'outlook';
      host = 'smtp-mail.outlook.com';
      port = 587;
      console.log('\n✅ Outlook selected');
      console.log('   You can use your regular Outlook password.\n');
      break;
    case '3':
      service = 'yahoo';
      host = 'smtp.mail.yahoo.com';
      port = 587;
      console.log('\n✅ Yahoo selected');
      console.log('   You may need to enable "Less secure app access"\n');
      break;
    case '4':
      service = 'custom';
      host = await question('Enter SMTP host (e.g., smtp.example.com): ');
      port = await question('Enter SMTP port (usually 587): ');
      console.log('\n✅ Custom SMTP selected\n');
      break;
    default:
      console.log('❌ Invalid choice. Defaulting to Gmail.');
      service = 'gmail';
      host = 'smtp.gmail.com';
      port = 587;
  }

  // Step 2: Get credentials
  console.log('='.repeat(50));
  const emailUser = await question('\nEnter your email address: ');
  const emailPass = await question('Enter your password (App Password for Gmail): ');

  // Step 3: Test connection
  console.log('\n🔄 Testing email connection...\n');

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: false,
      auth: {
        user: emailUser.trim(),
        pass: emailPass.trim()
      }
    });

    await transporter.verify();
    console.log('✅ Email connection successful!\n');

    // Step 4: Send test email
    const sendTest = await question('Would you like to send a test email? (y/n): ');
    
    if (sendTest.toLowerCase() === 'y') {
      const testEmail = await question('Enter email address to send test to: ');
      
      console.log('\n📤 Sending test email...\n');
      
      await transporter.sendMail({
        from: emailUser.trim(),
        to: testEmail.trim(),
        subject: '✅ Campus Commerce - Email Setup Successful',
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
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              h1 {
                color: #667eea;
                text-align: center;
              }
              .success {
                background: #d4edda;
                border-left: 4px solid #28a745;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎉 Email Setup Successful!</h1>
              <div class="success">
                <strong>✅ Congratulations!</strong><br>
                Your Campus Commerce email system is now configured and working properly.
              </div>
              <div class="info">
                <strong>Configuration Details:</strong><br>
                • Email Provider: ${service}<br>
                • SMTP Host: ${host}<br>
                • SMTP Port: ${port}<br>
                • From Address: ${emailUser.trim()}<br>
              </div>
              <p>
                Your students will now receive beautiful verification emails when they sign up!
              </p>
              <p style="text-align: center; color: #666; margin-top: 30px;">
                <strong>Campus Commerce</strong><br>
                Student Marketplace Platform
              </p>
            </div>
          </body>
          </html>
        `
      });

      console.log('✅ Test email sent successfully!\n');
    }

    // Step 5: Update .env file
    console.log('='.repeat(50));
    const updateEnv = await question('\nWould you like to update your .env file automatically? (y/n): ');
    
    if (updateEnv.toLowerCase() === 'y') {
      const envPath = path.join(__dirname, '.env');
      let envContent = '';

      // Read existing .env if it exists
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update or add EMAIL_USER and EMAIL_PASS
        if (envContent.includes('EMAIL_USER=')) {
          envContent = envContent.replace(/EMAIL_USER=.*/, `EMAIL_USER=${emailUser.trim()}`);
        } else {
          envContent += `\nEMAIL_USER=${emailUser.trim()}`;
        }

        if (envContent.includes('EMAIL_PASS=')) {
          envContent = envContent.replace(/EMAIL_PASS=.*/, `EMAIL_PASS=${emailPass.trim()}`);
        } else {
          envContent += `\nEMAIL_PASS=${emailPass.trim()}`;
        }
      } else {
        // Create new .env file
        envContent = `# MongoDB
MONGODB_URI=mongodb://localhost:27017/campuscommerce

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Email Configuration
EMAIL_USER=${emailUser.trim()}
EMAIL_PASS=${emailPass.trim()}

# Server Port
PORT=5000
`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ .env file updated successfully!\n');
      
      // Create .env.example without sensitive data
      const envExampleContent = `# MongoDB
MONGODB_URI=mongodb://localhost:27017/campuscommerce

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Server Port
PORT=5000
`;
      fs.writeFileSync(path.join(__dirname, '.env.example'), envExampleContent);
      console.log('✅ .env.example created for reference\n');
    }

    // Final instructions
    console.log('='.repeat(50));
    console.log('\n🎉 Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Restart your backend server: node server.js');
    console.log('2. Try signing up with a real email address');
    console.log('3. Check your inbox for the verification email\n');
    console.log('📧 Email Configuration:');
    console.log(`   Provider: ${service}`);
    console.log(`   From: ${emailUser.trim()}\n`);
    console.log('⚠️  Remember: Keep your .env file secure and never commit it to git!\n');

  } catch (error) {
    console.error('\n❌ Email connection failed!\n');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    
    if (service === 'gmail') {
      console.log('• Gmail: Make sure you\'re using App Password, not regular password');
      console.log('• Gmail: Ensure 2-Factor Authentication is enabled');
      console.log('• App Password: https://myaccount.google.com/apppasswords');
    } else if (service === 'outlook') {
      console.log('• Outlook: Check your email and password are correct');
      console.log('• Outlook: Ensure account is not locked');
    }
    
    console.log('• Check your internet connection');
    console.log('• Verify email address and password are correct');
    console.log('• Check if firewall is blocking SMTP port');
    console.log('\nTry running the setup again: node setup-email.js\n');
  }

  rl.close();
}

// Run the setup
setupEmail().catch(console.error);
