export type EventType = 'class' | 'open_office_hours' | 'selected_office_hours' | 'taken_office_hours' | 'meeting' | 'absent' | 'holiday' | 'other';
// TODO: Implement color scheme for event types
// Color Scheme for event types:
    // class: Blue,
    // open_office_hours: Green,
    // selected_office_hours: Yellow,
    // taken_office_hours: Red,
    // meeting: Purple,
    // absent: Orange,
    // holiday: Pink,
    // other: Gray

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  eventType: EventType;
  //TODO: Add more properties to the event
  [key: string]: any; // allows for additional dynamic props (optional)
}