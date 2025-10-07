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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Event Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, manage, and view events with our modern calendar application.
            Powered by AWS Lambda and featuring beautiful glassmorphism design.
          </p>
        </div>

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

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-600">
                <p className="text-sm">
                  Built with ❤️ using <span className="font-semibold">Next.js</span> and <span className="font-semibold">AWS Lambda</span>
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <a
                  href="https://github.com/NurseWellnessDev/event-manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>⭐</span>
                  <span>Star on GitHub</span>
                </a>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
