// app/api/send-mail/route.js
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { to, subject, message, attachment } = await req.json();
    console.log("user:", process.env.EMAIL_USER);
    console.log("pass:", process.env.EMAIL_PASS);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      attachments: attachment ? [
        {
          filename: 'samples_report.pdf',
          content: attachment,
          encoding: 'base64',
        },
      ] : [],
    };

    const info = await transporter.sendMail(mailOptions);

    return Response.json({ success: true, info });
  } catch (error) {
    console.error('Email sending failed:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
