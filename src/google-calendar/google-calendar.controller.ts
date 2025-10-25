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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { calendar_v3 } from 'googleapis';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('google-calendar')
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get OAuth2 authorization URL' })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
  })
  getAuthUrl(): { authUrl: string } {
    const authUrl = this.googleCalendarService.getAuthUrl();
    return { authUrl };
  }

  @Get('auth/callback')
  @ApiOperation({ summary: 'Handle OAuth2 callback' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Google' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async handleAuthCallback(
    @Query('code') code: string,
  ): Promise<{ message: string }> {
    await this.googleCalendarService.setCredentials(code);
    return { message: 'Authentication successful' };
  }

  @Get('calendars')
  @ApiOperation({ summary: 'Get list of calendars' })
  @ApiResponse({
    status: 200,
    description: 'List of calendars retrieved successfully',
  })
  async getCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    return this.googleCalendarService.getCalendars();
  }

  @Get('events')
  @ApiOperation({ summary: 'Get events from calendar' })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiQuery({
    name: 'timeMin',
    required: false,
    description: 'Start time for events (ISO 8601)',
  })
  @ApiQuery({
    name: 'timeMax',
    required: false,
    description: 'End time for events (ISO 8601)',
  })
  @ApiQuery({
    name: 'maxResults',
    required: false,
    description: 'Maximum number of events to return',
  })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
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
  @ApiOperation({ summary: 'Get a specific event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  async getEvent(
    @Param('eventId') eventId: string,
    @Query('calendarId') calendarId?: string,
  ): Promise<calendar_v3.Schema$Event> {
    return this.googleCalendarService.getEvent(calendarId, eventId);
  }

  @Post('events')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiQuery({
    name: 'sendNotifications',
    required: false,
    description: 'Send email notifications to attendees',
  })
  @ApiQuery({
    name: 'addGoogleMeet',
    required: false,
    description: 'Add Google Meet link to the event (default: true)',
  })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Query('calendarId') calendarId?: string,
    @Query('sendNotifications') sendNotifications?: boolean,
    @Query('addGoogleMeet') addGoogleMeet?: boolean,
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

    return this.googleCalendarService.createEvent(
      calendarId,
      event,
      sendNotifications || false,
      addGoogleMeet !== false, // Default to true
    );
  }

  @Post('events/:eventId/attendees')
  @ApiOperation({ summary: 'Add attendees to an existing event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of email addresses',
        },
      },
    },
  })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiQuery({
    name: 'sendNotifications',
    required: false,
    description: 'Send email notifications to new attendees',
  })
  @ApiResponse({ status: 200, description: 'Attendees added successfully' })
  async addAttendeesToEvent(
    @Param('eventId') eventId: string,
    @Body('attendees') attendees: string[],
    @Query('calendarId') calendarId?: string,
    @Query('sendNotifications') sendNotifications?: boolean,
  ): Promise<calendar_v3.Schema$Event> {
    return this.googleCalendarService.addAttendeesToEvent(
      calendarId,
      eventId,
      attendees,
      sendNotifications !== false, // Default to true
    );
  }

  @Post('events/:eventId/google-meet')
  @ApiOperation({ summary: 'Add Google Meet link to an existing event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiQuery({
    name: 'sendNotifications',
    required: false,
    description: 'Send email notifications about the Google Meet addition',
  })
  @ApiResponse({
    status: 200,
    description: 'Google Meet link added successfully',
  })
  async addGoogleMeetToEvent(
    @Param('eventId') eventId: string,
    @Query('calendarId') calendarId?: string,
    @Query('sendNotifications') sendNotifications?: boolean,
  ): Promise<calendar_v3.Schema$Event> {
    return this.googleCalendarService.addGoogleMeetToEvent(
      calendarId,
      eventId,
      sendNotifications !== false, // Default to true
    );
  }

  @Put('events/:eventId')
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiQuery({
    name: 'sendNotifications',
    required: false,
    description: 'Send email notifications about the update',
  })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() event: calendar_v3.Schema$Event,
    @Query('calendarId') calendarId?: string,
    @Query('sendNotifications') sendNotifications?: boolean,
  ): Promise<calendar_v3.Schema$Event> {
    return this.googleCalendarService.updateEvent(
      calendarId,
      eventId,
      event,
      sendNotifications || false,
    );
  }

  @Delete('events/:eventId')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiQuery({
    name: 'calendarId',
    required: false,
    description: 'Calendar ID (defaults to primary)',
  })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Query('calendarId') calendarId?: string,
  ): Promise<{ message: string }> {
    await this.googleCalendarService.deleteEvent(calendarId, eventId);
    return { message: 'Event deleted successfully' };
  }
}
