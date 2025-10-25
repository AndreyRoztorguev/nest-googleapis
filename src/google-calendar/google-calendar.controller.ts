import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { calendar_v3 } from 'googleapis';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-url')
  getAuthUrl(): { authUrl: string } {
    const authUrl = this.googleCalendarService.getAuthUrl();
    return { authUrl };
  }

  @Get('auth/callback')
  async handleAuthCallback(
    @Query('code') code: string,
  ): Promise<{ message: string }> {
    await this.googleCalendarService.setCredentials(code);
    return { message: 'Authentication successful' };
  }

  @Get('calendars')
  async getCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    return this.googleCalendarService.getCalendars();
  }

  @Get('events')
  async getEvents(
    @Query('calendarId') calendarId?: string,
    @Query('timeMin') timeMin?: string,
    @Query('timeMax') timeMax?: string,
    @Query('maxResults') maxResults?: number,
  ): Promise<calendar_v3.Schema$Event[]> {
    return this.googleCalendarService.getEvents(
      calendarId,
      timeMin,
      timeMax,
      maxResults,
    );
  }

  @Get('events/:eventId')
  async getEvent(
    @Param('eventId') eventId: string,
    @Query('calendarId') calendarId?: string,
  ): Promise<calendar_v3.Schema$Event> {
    return this.googleCalendarService.getEvent(calendarId, eventId);
  }

  @Post('events')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Query('calendarId') calendarId?: string,
  ): Promise<calendar_v3.Schema$Event> {
    // Convert DTO to Google Calendar event format
    const event: calendar_v3.Schema$Event = {
      summary: createEventDto.summary,
      description: createEventDto.description,
      location: createEventDto.location,
      start: createEventDto.start,
      end: createEventDto.end,
      attendees: createEventDto.attendees?.map((email) => ({ email })),
    };

    return this.googleCalendarService.createEvent(calendarId, event);
  }

  @Put('events/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() event: calendar_v3.Schema$Event,
    @Query('calendarId') calendarId?: string,
  ): Promise<calendar_v3.Schema$Event> {
    return this.googleCalendarService.updateEvent(calendarId, eventId, event);
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Query('calendarId') calendarId?: string,
  ): Promise<{ message: string }> {
    await this.googleCalendarService.deleteEvent(calendarId, eventId);
    return { message: 'Event deleted successfully' };
  }
}
