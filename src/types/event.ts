export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  link: string;
}

export type CreateEventData = Omit<Event, 'id'>;

export interface WebhookEvent {
  id?: string;
  date: string;
  title: string;
  time: string;
  location: string;
  description: string;
  link: string;
}