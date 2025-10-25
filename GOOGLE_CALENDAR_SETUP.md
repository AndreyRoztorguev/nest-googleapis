# Google Calendar Integration Setup

This application now includes Google Calendar SDK integration. Follow these steps to set up and use the Google Calendar functionality.

## Prerequisites

1. A Google Cloud Console project
2. Google Calendar API enabled
3. OAuth 2.0 credentials configured

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/google-calendar/auth/callback` (for development)
   - Add your production URL when deploying
5. Copy the Client ID and Client Secret

### 3. Environment Configuration

1. Copy the example environment file:

   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/google-calendar/auth/callback
   PORT=3000
   NODE_ENV=development
   ```

### 4. Start the Application

```bash
npm run start:dev
```

## API Endpoints

The following endpoints are available for Google Calendar integration:

### Authentication

- `GET /google-calendar/auth-url` - Get the OAuth2 authorization URL
- `POST /google-calendar/auth/callback` - Handle OAuth2 callback with authorization code

### Calendar Operations

- `GET /google-calendar/calendars` - Get list of user's calendars
- `GET /google-calendar/events` - Get events from a calendar
- `GET /google-calendar/events/:eventId` - Get a specific event
- `POST /google-calendar/events` - Create a new event
- `PUT /google-calendar/events/:eventId` - Update an existing event
- `DELETE /google-calendar/events/:eventId` - Delete an event

## Usage Example

### 1. Get Authorization URL

```bash
curl http://localhost:3000/google-calendar/auth-url
```

### 2. Complete OAuth Flow

Visit the returned URL in your browser, authorize the application, and you'll be redirected to the callback URL with an authorization code.

### 3. Set Credentials

```bash
curl -X POST http://localhost:3000/google-calendar/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "your_authorization_code_here"}'
```

### 4. Get Calendars

```bash
curl http://localhost:3000/google-calendar/calendars
```

### 5. Create an Event

```bash
curl -X POST http://localhost:3000/google-calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test Event",
    "description": "This is a test event",
    "start": {
      "dateTime": "2024-01-01T10:00:00Z",
      "timeZone": "UTC"
    },
    "end": {
      "dateTime": "2024-01-01T11:00:00Z",
      "timeZone": "UTC"
    }
  }'
```

## Service Usage

You can also use the `GoogleCalendarService` directly in your other services:

```typescript
import { GoogleCalendarService } from './google-calendar/google-calendar.service';

@Injectable()
export class MyService {
  constructor(private googleCalendarService: GoogleCalendarService) {}

  async createMeeting() {
    const event = {
      summary: 'Team Meeting',
      start: { dateTime: '2024-01-01T14:00:00Z', timeZone: 'UTC' },
      end: { dateTime: '2024-01-01T15:00:00Z', timeZone: 'UTC' },
    };

    return this.googleCalendarService.createEvent('primary', event);
  }
}
```

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Consider implementing token refresh logic for long-running applications
- Implement proper error handling and logging in production

## Troubleshooting

1. **"Google Calendar not properly configured" error**: Check that your environment variables are set correctly
2. **OAuth errors**: Ensure your redirect URI matches exactly what's configured in Google Cloud Console
3. **API quota exceeded**: Check your Google Cloud Console for API usage and quotas
4. **Permission denied**: Ensure the Google Calendar API is enabled and you have the necessary scopes
