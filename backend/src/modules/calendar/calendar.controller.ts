import { Controller, Post, Body } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('book')
  async bookMeeting(
    @Body('prospectEmail') prospectEmail: string,
    @Body('time') time: string,
    @Body('title') title: string,
  ) {
    return this.calendarService.bookMeeting(prospectEmail, time, title);
  }
}
