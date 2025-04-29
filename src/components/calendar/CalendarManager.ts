import { Calendar } from '@fullcalendar/core';
import { CalendarConfig } from './CalendarConfig';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { ToolbarManager } from '../../ToolbarManager';
import { CalendarUtils } from './CalendarUtils';
import { CalendarEventHandlers } from './CalendarEventHandlers';

/**
 * CalendarManager is responsible for managing the FullCalendar instance.
 * It initializes the calendar, handles view changes, and manages events.
 */
export class CalendarManager {
  private calendar!: Calendar;
  private elementId: string; // The ID of the HTML element where the calendar will be rendered
  private config: CalendarConfig;
  private toolbarManager: ToolbarManager;
  private lastViewType: string | null = null; // Track the last view type
  private utils: CalendarUtils; // Instance of CalendarUtils for utility functions
  private eventHandler?: CalendarEventHandlers; // Instance of CalendarEventHandler for event handling

  constructor(elementId: string, config: CalendarConfig) {
    this.elementId = elementId;
    this.config = config;
    this.toolbarManager = new ToolbarManager();
    this.utils = new CalendarUtils();
    
  }

  initialize(): void {
    const calendarEl = document.getElementById(this.elementId);
    if (!calendarEl) {
      console.error(`Element with ID ${this.elementId} not found.`);
      return;
    }

    // Get the config from CalendarConfig (which already includes plugins and toolbar)
    const configObject = {
      ...this.config.getConfig(),

      datesSet: (dateInfo: any) => {
        this.handleViewChange(dateInfo.view.type);
      },

      dateClick: (info: DateClickArg) => {
        alert(`Clicked on date: ${info.dateStr}`);
      }
    };

    this.calendar = new Calendar(calendarEl, configObject);
    this.calendar.render();

    this.eventHandler = new CalendarEventHandlers(this.calendar); // Pass the calendar instance to the event handler
  }

  private handleViewChange(currentViewType: string): void {
    const calendarEl = document.getElementById("calendar") as HTMLElement;

    if (this.lastViewType == null) { // Initial View Loaded ---------------------------------------------------

      this.toolbarManager.setupToolbar(true);
      this.calendar.render();

    } 
    
    if (currentViewType === 'dayGridMonth') { // Month View Loaded ---------------------------------------------------

      this.toolbarManager.setupToolbar(false);
      /*this.utils.removeUnselectableWeeks(
        this.config.getWorkingHours().start,
        this.config.getTimeSlotsPerHour(),
        30, // Unselectable time window in minutes
        this.calendar.view.currentStart,
        calendarEl
      );*/
      
      //this.utils.disableDaysWithNoAvailableTimeslots();

    } else if (currentViewType === 'timeGridWeek') { // Week View Loaded ----------------------------------------------

      this.toolbarManager.setupToolbar(false);
      this.utils.adjustSlotHeight(calendarEl, this.config.getTotalSlotsPerDay());

    } else {

      console.log('Unhandled view type:', currentViewType);
      return;

    }

    this.calendar.render();
    this.lastViewType = currentViewType; // Update the last view type
  }

  addEvent(title: string, date: string): void {
    if (!this.calendar) {
      console.error('Calendar is not initialized.');
      return;
    }
    this.calendar.addEvent({ title, start: date });
  }

  changeView(view: string): void {
    if (!this.calendar) {
      console.error('Calendar is not initialized.');
      return;
    }
  
    const validViews = ['dayGridMonth', 'timeGridWeek'];
    if (!validViews.includes(view)) {
      console.error(`Invalid view change: ${view}.`);
      return;
    }
  
    this.calendar.changeView(view);
  }

  public setTimeSlotsPerHour(slots: number): void {
    this.config.setTimeSlotsPerHour(slots);

    if (this.calendar) {
      this.calendar.setOption('slotDuration', this.config.getSlotDuration());
    }
  }

  public setMaxMeetingDuration(duration: number): void {
    this.config.setMaxMeetingDuration(duration);
  
    if (this.calendar) {
      this.calendar.setOption('selectAllow', (selectInfo: any) => 
        this.config['validateSelection'](selectInfo)
      );
    }
  }

  public setConfig(newConfig: CalendarConfig): void {
    this.config = newConfig;
    this.refresh();
  }

  public getConfig(): CalendarConfig {
    return this.config;
  }

  private refresh(): void {
    if (this.calendar) {
      this.calendar.destroy();
    }
    this.initialize();
  }
}
