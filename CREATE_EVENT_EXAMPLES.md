# Create Event Endpoint Examples

The Google Calendar integration includes a robust endpoint for creating new events with validation and proper error handling.

## Endpoint

```
POST /google-calendar/events
```

## Request Body (CreateEventDto)

```typescript
{
  "summary": string,           // Required: Event title
  "description"?: string,      // Optional: Event description
  "location"?: string,         // Optional: Event location
  "start": {                   // Required: Start time
    "dateTime": string,        // ISO 8601 format
    "timeZone"?: string        // Optional: Timezone (defaults to UTC)
  },
  "end": {                     // Required: End time
    "dateTime": string,        // ISO 8601 format
    "timeZone"?: string        // Optional: Timezone (defaults to UTC)
  },
  "attendees"?: string[]       // Optional: Array of email addresses
}
```

## Query Parameters

- `calendarId` (optional): Calendar ID to create event in (defaults to 'primary')

## Examples

### 1. Basic Event

```bash
curl -X POST http://localhost:3000/google-calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Team Meeting",
    "description": "Weekly team sync meeting",
    "start": {
      "dateTime": "2024-01-15T14:00:00Z"
    },
    "end": {
      "dateTime": "2024-01-15T15:00:00Z"
    }
  }'
```

### 2. Event with Location and Attendees

```bash
curl -X POST http://localhost:3000/google-calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Project Review",
    "description": "Quarterly project review meeting",
    "location": "Conference Room A",
    "start": {
      "dateTime": "2024-01-20T10:00:00Z",
      "timeZone": "America/New_York"
    },
    "end": {
      "dateTime": "2024-01-20T11:30:00Z",
      "timeZone": "America/New_York"
    },
    "attendees": [
      "john.doe@company.com",
      "jane.smith@company.com"
    ]
  }'
```

### 3. All-Day Event

```bash
curl -X POST http://localhost:3000/google-calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Company Holiday",
    "description": "New Year Day - Office Closed",
    "start": {
      "dateTime": "2024-01-01T00:00:00Z"
    },
    "end": {
      "dateTime": "2024-01-01T23:59:59Z"
    }
  }'
```

### 4. Event in Specific Calendar

```bash
curl -X POST "http://localhost:3000/google-calendar/events?calendarId=your-calendar-id@gmail.com" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Personal Appointment",
    "start": {
      "dateTime": "2024-01-25T09:00:00Z"
    },
    "end": {
      "dateTime": "2024-01-25T10:00:00Z"
    }
  }'
```

## Response

The endpoint returns the created event with all Google Calendar metadata:

```json
{
  "id": "event_id_123",
  "summary": "Team Meeting",
  "description": "Weekly team sync meeting",
  "start": {
    "dateTime": "2024-01-15T14:00:00Z",
    "timeZone": "UTC"
  },
  "end": {
    "dateTime": "2024-01-15T15:00:00Z",
    "timeZone": "UTC"
  },
  "attendees": [
    {
      "email": "john.doe@company.com",
      "responseStatus": "needsAction"
    }
  ],
  "created": "2024-01-10T10:00:00.000Z",
  "updated": "2024-01-10T10:00:00.000Z",
  "htmlLink": "https://calendar.google.com/calendar/event?eid=...",
  "iCalUID": "event@google.com"
}
```

## Validation Rules

- `summary`: Required, must be a string
- `description`: Optional, must be a string
- `location`: Optional, must be a string
- `start`: Required, must have `dateTime` in ISO 8601 format
- `end`: Required, must have `dateTime` in ISO 8601 format
- `attendees`: Optional, array of valid email addresses
- `timeZone`: Optional, valid timezone identifier

## Error Responses

### Validation Error (400)

```json
{
  "statusCode": 400,
  "message": [
    "summary should not be empty",
    "start.dateTime must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

### Authentication Error (401)

```json
{
  "statusCode": 401,
  "message": "Google Calendar not properly configured",
  "error": "Unauthorized"
}
```

### Google API Error (500)

```json
{
  "statusCode": 500,
  "message": "Failed to create event",
  "error": "Internal Server Error"
}
```

## Prerequisites

1. **Authentication**: Complete OAuth2 flow first

   ```bash
   # Get auth URL
   curl http://localhost:3000/google-calendar/auth-url

   # Complete OAuth flow in browser, then set credentials
   curl -X GET "http://localhost:3000/google-calendar/auth/callback?code=your_auth_code"
   ```

2. **Environment Setup**: Ensure Google credentials are configured in `.env`

## Timezone Handling

- Use ISO 8601 format for `dateTime` (e.g., `2024-01-15T14:00:00Z`)
- Include `timeZone` field for specific timezone handling
- Google Calendar will handle timezone conversions automatically

## Best Practices

1. **Always validate dates**: Ensure start time is before end time
2. **Handle timezones**: Be explicit about timezone when needed
3. **Error handling**: Implement proper error handling in your client
4. **Rate limiting**: Be aware of Google Calendar API rate limits
5. **Authentication**: Store and refresh tokens appropriately for production use
