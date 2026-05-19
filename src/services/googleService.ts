import { getAccessToken } from '../lib/auth';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: string };
    };
  };
}

export async function listEvents() {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + 
    new Date().toISOString(),
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to list events');
  }

  return response.json();
}

export async function createEvent(event: CalendarEvent) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create event');
  }

  return response.json();
}

export async function createMeeting(summary: string, description: string, startTime: string, durationMinutes: number = 60) {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const event: CalendarEvent = {
    summary,
    description,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  return createEvent(event);
}

export async function deleteEvent(eventId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete event');
  }

  return true;
}
