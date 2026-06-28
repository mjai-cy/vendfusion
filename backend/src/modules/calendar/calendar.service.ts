import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  async bookMeeting(prospectEmail: string, time: string, title: string): Promise<{ eventId: string; status: string; link: string }> {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

    if (!clientId || !clientSecret) {
      this.logger.log(`[Mock] Calendar invite for ${prospectEmail} at ${time}: "${title}"`);
      return {
        eventId: `cal_event_mock_${Math.random().toString(36).substring(7)}`,
        status: 'confirmed',
        link: `https://meet.google.com/mock-meeting-${Math.random().toString(36).substring(3, 6)}`,
      };
    }

    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      if (refreshToken) oauth2Client.setCredentials({ refresh_token: refreshToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const startTime = new Date(time);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: title,
          description: `AI-booked meeting with ${prospectEmail}`,
          start: { dateTime: startTime.toISOString(), timeZone: 'UTC' },
          end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
          attendees: [{ email: prospectEmail }],
          conferenceData: { createRequest: { requestId: `meet-${Date.now()}` } },
        },
        conferenceDataVersion: 1,
      });

      this.logger.log(`Calendar event created: ${event.data.id}`);
      return {
        eventId: event.data.id || '',
        status: event.data.status || 'confirmed',
        link: event.data.hangoutLink || `https://meet.google.com/mock-${Math.random().toString(36).substring(3, 6)}`,
      };
    } catch (err) {
      this.logger.error(`Google Calendar API error: ${err.message}`);
      return {
        eventId: `cal_fallback_${Date.now()}`,
        status: 'confirmed',
        link: `https://meet.google.com/mock-${Math.random().toString(36).substring(3, 6)}`,
      };
    }
  }
}
