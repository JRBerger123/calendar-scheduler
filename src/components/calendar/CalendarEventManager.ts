import { Calendar } from '@fullcalendar/core';
import { CalendarEvent } from '../../types/types';

/**
 * CalendarEventManager is responsible for handling all logic related to calendar events —
 * such as adding, editing, deleting, and syncing events.
 */
export class CalendarEventManager {
    private events: CalendarEvent[] = [];
  
    constructor(private calendar: Calendar) {}
  
    /**
     * Adds a new event to the calendar and internal store.
     * @param event - The calendar event to be added.
     */
    public addEvent(event: CalendarEvent): void {
      this.calendar.addEvent(event);
      this.events.push(event);
    }
  
    /**
     * Updates an event's properties.
     * @param id - The ID of the event to update.
     * @param updatedFields - An object of fields to update.
     */
    public updateEvent(id: string, updatedFields: Partial<CalendarEvent>): void {
      const fcEvent = this.calendar.getEventById(id);
      if (fcEvent) {
        fcEvent.setProp("title", updatedFields.title || fcEvent.title);
        fcEvent.setStart(updatedFields.start ?? fcEvent.start ?? new Date());
        fcEvent.setEnd(updatedFields.end || fcEvent.end);
      }
    }
  
    /**
     * Removes an event from the calendar by ID.
     */
    public removeEvent(id: string): void {
      const fcEvent = this.calendar.getEventById(id);
      if (fcEvent) {
        fcEvent.remove();
      }
      this.events = this.events.filter(e => e.id !== id);
    }
  
    /**
     * Loads a list of events into the calendar.
     */
    public loadEvents(events: CalendarEvent[]): void {
      this.calendar.removeAllEvents();
      this.calendar.addEventSource(events);
      this.events = [...events];
    }
  
    /**
     * Returns all stored events.
     */
    public getAllEvents(): CalendarEvent[] {
      return [...this.events];
    }
  }
  