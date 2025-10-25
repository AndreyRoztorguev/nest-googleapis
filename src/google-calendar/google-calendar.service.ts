import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(private configService: ConfigService) {
    this.initializeGoogleClient();
  }

  private initializeGoogleClient() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.warn('Google Calendar credentials not configured');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Get the authorization URL for OAuth2 flow
   */
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('Google Calendar not properly configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  /**
   * Set credentials after OAuth2 callback
   */
  async setCredentials(code: string): Promise<void> {
    if (!this.oauth2Client) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.logger.log('Tokens', tokens);
      this.oauth2Client.setCredentials(tokens);
      this.logger.log('Google Calendar credentials set successfully');
    } catch (error) {
      this.logger.error('Failed to set Google Calendar credentials', error);
      throw error;
    }
  }

  /**
   * Set credentials from stored tokens
   */
  setCredentialsFromTokens(tokens: any): void {
    if (!this.oauth2Client) {
      throw new Error('Google Calendar not properly configured');
    }

    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get list of calendars
   */
  async getCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    if (!this.calendar) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      this.logger.error('Failed to get calendars', error);
      throw error;
    }
  }

  /**
   * Get events from a calendar
   */
  async getEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 10,
  ): Promise<calendar_v3.Schema$Event[]> {
    if (!this.calendar) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.logger.error('Failed to get events', error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(
    calendarId: string = 'primary',
    event: calendar_v3.Schema$Event,
  ): Promise<calendar_v3.Schema$Event> {
    if (!this.calendar) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      this.logger.log(`Event created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create event', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    calendarId: string = 'primary',
    eventId: string,
    event: calendar_v3.Schema$Event,
  ): Promise<calendar_v3.Schema$Event> {
    if (!this.calendar) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });

      this.logger.log(`Event updated: ${eventId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update event', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(
    calendarId: string = 'primary',
    eventId: string,
  ): Promise<void> {
    if (!this.calendar) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });

      this.logger.log(`Event deleted: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete event', error);
      throw error;
    }
  }

  /**
   * Get a specific event
   */
  async getEvent(
    calendarId: string = 'primary',
    eventId: string,
  ): Promise<calendar_v3.Schema$Event> {
    if (!this.calendar) {
      throw new Error('Google Calendar not properly configured');
    }

    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get event', error);
      throw error;
    }
  }
}
