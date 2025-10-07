'use client';

import { useState, useEffect } from 'react';
import { WebhookEvent } from '@/types/event';
import { API_METHODS } from '@/config/api';

const WEBHOOK_URL = 'https://kf5mshq5yyqxzxh6r6ew7y6mia0gcqvv.lambda-url.us-east-1.on.aws/';

interface CalendarDay {
  date: Date;
  events: WebhookEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(WEBHOOK_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data: WebhookEvent[] = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) {
      alert('Cannot delete event: No event ID available');
      return;
    }

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingEventId(eventId);
      await API_METHODS.deleteEvent(eventId);

      // Remove event from local state
      setEvents(prev => prev.filter(event => event.id !== eventId));

      // Show success message
      setDeleteSuccess('Event deleted successfully!');
      setSelectedEvent(null);

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(null), 3000);

      console.log('Event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());

    const lastDayOfCalendar = new Date(lastDayOfMonth);
    lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + (6 - lastDayOfCalendar.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let date = new Date(firstDayOfCalendar); date <= lastDayOfCalendar; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateStr);

      days.push({
        date: new Date(date),
        events: dayEvents,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime()
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium text-gray-600">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error loading events</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={fetchEvents}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Events Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
          >
            ←
          </button>
          <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {formatDate(currentDate)}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 border border-gray-200 ${
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className={`text-sm font-medium mb-1 ${
              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            } ${day.isToday ? 'text-blue-600 font-bold' : ''}`}>
              {day.date.getDate()}
            </div>

            <div className="space-y-1">
              {day.events.slice(0, 2).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  onClick={() => setSelectedEvent(event)}
                  className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                  title={event.title}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-blue-600">{event.time}</div>
                </div>
              ))}
              {day.events.length > 2 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{day.events.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg" style={{
          background: 'rgba(34, 197, 94, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div className="text-white font-medium">{deleteSuccess}</div>
        </div>
      )}

      {/* Event Details Modal - Liquid Glass Overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <div className="max-w-md w-full p-6 rounded-2xl border border-white/20 shadow-2xl" style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold leading-none p-1 rounded-full hover:bg-white/20 transition-all duration-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-gray-800">
              <div>
                <span className="font-semibold text-gray-900">Date:</span> {formatEventDate(selectedEvent.date)}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Time:</span> {selectedEvent.time}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Location:</span> {selectedEvent.location}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Description:</span>
                <p className="mt-1 text-gray-700 leading-relaxed">{selectedEvent.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedEvent.link && (
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 text-gray-800 font-semibold rounded-lg transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    View Details
                  </a>
                )}

                {selectedEvent.id && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    disabled={deletingEventId === selectedEvent.id}
                    className="inline-block px-4 py-2 font-semibold rounded-lg transition-all duration-200"
                    style={{
                      background: deletingEventId === selectedEvent.id
                        ? 'rgba(156, 163, 175, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: deletingEventId === selectedEvent.id ? '#6B7280' : '#DC2626'
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingEventId) {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingEventId) {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      }
                    }}
                  >
                    {deletingEventId === selectedEvent.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete Event'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}