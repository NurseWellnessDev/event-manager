'use client';

import { useState } from 'react';
import EventForm from '@/components/EventForm';
import EventsCalendar from '@/components/EventsCalendar';
import { Event } from '@/types/event';
import { API_METHODS } from '@/config/api';

type TabType = 'create' | 'calendar';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleEventSubmit = (event: Event) => {
    setEvents(prev => [...prev, event]);
    console.log('Event created:', event);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return;

    try {
      setDeletingEventId(eventId);
      await API_METHODS.deleteEvent(eventId);

      // Remove event from local state
      setEvents(prev => prev.filter(event => event.id !== eventId));

      console.log('Event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const tabs = [
    { id: 'calendar' as TabType, label: 'Events Calendar', icon: '📅' },
    { id: 'create' as TabType, label: 'Create Event', icon: '➕' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Event Manager
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'calendar' && (
            <div className="max-w-6xl mx-auto">
              <EventsCalendar />
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-md mx-auto">
              <EventForm onSubmit={handleEventSubmit} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
