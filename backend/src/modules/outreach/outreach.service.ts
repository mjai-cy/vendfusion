import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OutreachService {
  private readonly logger = new Logger(OutreachService.name);
  private readonly transporter: nodemailer.Transporter | null = null;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
      this.logger.log(`SMTP transporter initialized: ${smtpUser} @ ${smtpHost}:${smtpPort}`);
    } else {
      this.logger.warn('SMTP not configured. Email sending will use mock fallback.');
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[Mock] Email would be sent to: ${to}. Subject: "${subject}"`);
      return true;
    }

    try {
      const from = process.env.SMTP_USER || 'outbound@xyz.ai';
      const info = await this.transporter.sendMail({
        from: `XYZ.AI <${from}>`,
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br/>'),
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
      return false;
    }
  }

  async sendWhatsAppMessage(toPhone: string, text: string): Promise<boolean> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const numberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !numberId) {
      this.logger.log(`[Mock] WhatsApp message sent to: ${toPhone}. Body: "${text.substring(0, 50)}..."`);
      return true;
    }

    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${numberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: toPhone,
            type: 'text',
            text: { body: text },
          }),
        },
      );

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`WhatsApp API error: ${res.status} — ${err}`);
        return false;
      }

      this.logger.log(`WhatsApp message sent to ${toPhone}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp to ${toPhone}: ${err.message}`);
      return false;
    }
  }
}
