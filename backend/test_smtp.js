const nodemailer = require('nodemailer');

async function main() {
  console.log("Starting SMTP test...");
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'mritunjaykumar77639140@gmail.com',
      pass: 'ucvhstcuicgjbbex',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection verified successfully!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: '"XYZ.AI Test" <mritunjaykumar77639140@gmail.com>',
      to: 'mritunjaykumar77639140@gmail.com',
      subject: 'SMTP Connection Test',
      text: 'If you are reading this, your Gmail SMTP connection is working perfectly!',
      html: '<b>If you are reading this, your Gmail SMTP connection is working perfectly!</b>',
    });

    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("SMTP Test Failed:", error);
  }
}

main();
