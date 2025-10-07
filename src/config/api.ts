export const API_CONFIG = {
  // Event management endpoint (your Lambda function)
  EVENT_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar',

  // Calendar webhook endpoint (existing events)
  CALENDAR_WEBHOOK_ENDPOINT: 'https://kf5mshq5yyqxzxh6r6ew7y6mia0gcqvv.lambda-url.us-east-1.on.aws/',

  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 10000,

  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API helper functions
export const API_METHODS = {
  createEvent: async (eventData: any) => {
    const response = await fetch(API_CONFIG.EVENT_ENDPOINT, {
      method: 'POST',
      headers: API_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to create event');
    }

    return responseData.event;
  },

  deleteEvent: async (eventId: string) => {
    const response = await fetch(API_CONFIG.EVENT_ENDPOINT, {
      method: 'DELETE',
      headers: API_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify({ id: eventId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to delete event');
    }

    return responseData;
  },
};