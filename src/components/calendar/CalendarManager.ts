import { Calendar } from '@fullcalendar/core';
import { CalendarConfig } from './CalendarConfig';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { ToolbarManager } from '../../ToolbarManager';
import { CalendarUtils } from './CalendarUtils';
import { CalendarEventHandlers } from './CalendarEventHandlers';
import { CalendarEventManager } from './CalendarEventManager';
import { CalendarEvent, EventType } from '../../types/types';

//TODO: Create an unselectable time window and implement it
//TODO: Create a function to disable days with no available time slots
//TODO: Create a function for creating overlay timeslot divs
//TODO: Create a function for automatically updating overlay timeslot divs based on the current date and time
//TODO: Create a function for removing rows of days in month view that are not selectable
//TODO: Create a function for updating the title of the calendar based on the current view type
//TODO: Create a mobile version based on the width of the calendar
//TODO: Implement a database connection to store and retrieve events

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
  private eventManager!: CalendarEventManager; // Implemented after calendar is initialized

  /**
   * Constructs a CalendarManager instance.
   * @param elementId - The ID of the HTML element where the calendar will be rendered.
   * @param config - The configuration object for the calendar.
   */
  constructor(elementId: string, config: CalendarConfig) {
    this.elementId = elementId;
    this.config = config;
    this.toolbarManager = new ToolbarManager();
    this.utils = new CalendarUtils();
    this.eventManager = new CalendarEventManager(this.calendar);
  }

  /**
   * Initializes the FullCalendar instance.
   */
  initialize(): void {
    /**
     * Parent element of the calendar.
     * This element must exist in the HTML for the calendar to be rendered.
     */
    const calendarEl = document.getElementById(this.elementId);

    // Check if the calendar element exists
    if (!calendarEl) {
      console.error(`Element with ID ${this.elementId} not found.`);
      return;
    }

    // Wait for the DOM to be fully loaded before initializing the calendar
    document.addEventListener("DOMContentLoaded", () => {
      // Create the config object for the calendar
      // This object contains all the configuration options for the calendar
      const configObject = {
        ...this.config.getConfig(),

        // Called when the dates are changed (e.g. when the user navigates to a different month/week)
        datesSet: (dateInfo: any) => {
          this.handleViewChange(dateInfo.view.type);
        },

        // Called when the calendar is rendered
        viewDidMount: (info: any) => {
          //this.handleViewChange(info.view.type);
        },

        // Goes to day in week view when a date is clicked in month view
        dateClick: (info: DateClickArg) => {
          if (this.calendar.view.type === 'dayGridMonth') {
            this.calendar.changeView('timeGridWeek', info.date);
          }
        },

      };

      // Initialize the calendar with the parent element and config object
      this.calendar = new Calendar(calendarEl, configObject);

      // Configure what happens when timeslots are selected in week view
      this.configureSelectionHandler();

      this.calendar.render();

      // Initialize the custom event handlers for the calendar
      this.eventHandler = new CalendarEventHandlers(this.calendar);
    });
  }

  /**
   * Handles what happens when a view is loaded in the calendar.
   * @param currentViewType - The current view type of the calendar (e.g., 'dayGridMonth', 'timeGridWeek', etc.).
   * @returns 
   */
  private handleViewChange(currentViewType: string): void {
    const calendarEl = document.getElementById("calendar") as HTMLElement;

    //#region Initial View Loaded
    if (this.lastViewType == null) {
      this.toolbarManager.setupToolbar(true);
      this.utils.adjustSlotHeight(calendarEl, this.config.getTotalSlotsPerDay());
    } 
    //#endregion Initial View Loaded
    
    //#region Month View Loaded
    else if (currentViewType === 'dayGridMonth') {

      this.toolbarManager.setupToolbar(false);
      /*this.utils.removeUnselectableWeeks(
        this.config.getWorkingHours().start,
        this.config.getTimeSlotsPerHour(),
        30, // Unselectable time window in minutes
        this.calendar.view.currentStart,
        calendarEl
      );*/
      
      //this.utils.disableDaysWithNoAvailableTimeslots();

    }
    //#endregion Month View Loaded

    //#region Week View Loaded
    else if (currentViewType === 'timeGridWeek') {

      this.toolbarManager.setupToolbar(false);
      this.utils.adjustSlotHeight(calendarEl, this.config.getTotalSlotsPerDay());

    }
    //#endregion Week View Loaded

    //#region Day View Loaded
    else if (currentViewType === 'timeGridDay') {

      console.log('Day view not supported yet.');
      //this.toolbarManager.setupToolbar(false);

    }
    //#endregion Day View Loaded

    //#region Unhandled View Type
    else {

      console.log('Unhandled view type:', currentViewType);
      return;

    }
    //#endregion Unhandled View Type

    // Refreshes the calendar element to apply the changes
    this.calendar.render();
  
    // Update the last view type to the current one
    this.lastViewType = currentViewType;
  }

  /**
   * Adds an event to the calendar.
   * @param title - The title of the event.
   * @param startDate - The start date of the event in ISO format (e.g., '2025-04-30T10:00:00').
   * @param endDate  - The end date of the event in ISO format (e.g., '2025-04-30T11:00:00').
   * @param eventType - The type of the event (e.g., 'meeting', 'appointment').
   */
  addEvent(title: string, startDate: string, endDate: string, eventType: EventType): void {
    if (!this.eventManager) {
      console.error('EventManager is not initialized.');
      return;
    }
  
    this.eventManager.addEvent({
      id: crypto.randomUUID(),
      title,
      start: startDate,
      end: endDate,
      eventType,
    });
  }

  /**
   * Changes the calendar view to the specified type.
   * @param view - The view to change to. Can be 'day', 'week', 'month', 'timeGridWeek', 'dayGridMonth', or 'timeGridDay'.
   */
  changeView(view: string): void {
    // Check if the calendar is initialized before changing the view
    // This is important to avoid errors when the calendar is not yet rendered
    if (!this.calendar) {
      console.error('Cannot change view: Calendar is not initialized.');
      return;
    }

    // Map shorthand to actual FullCalendar views
    const viewMap: { [key: string]: string } = {
      day: 'timeGridDay',
      week: 'timeGridWeek',
      month: 'dayGridMonth',
      timeGridWeek: 'timeGridWeek',
      dayGridMonth: 'dayGridMonth',
      timeGridDay: 'timeGridDay'
    };

    // Resolve the view type to a valid FullCalendar view
    // If the view is not in the map, it will be undefined
    const resolvedView = viewMap[view];

    // If the resolved view is 'timeGridDay', log a message and return
    // This means that the day view is not supported yet
    if (resolvedView === "timeGridDay") {
      // TODO: Implement support for day view. Will be needed for mobile version.
      console.log("Day view is not supported yet.");
      return;
    }

    // If the resolved view is undefined, log an error and return
    // This means the view is not valid or not supported
    if (!resolvedView) {
      console.error(`Invalid view change: ${view}.`);
      return;
    }

    // Change the calendar view to the resolved view
    this.calendar.changeView(resolvedView);
  }

  /**
   * Set how many time slots are in one hour.
   * The default value is 2 (30 minute increments).
   * The range is confined from 1 to 4 for practical reasons.
   * @param slots - The number of time slots per hour.
   */
  public setTimeSlotsPerHour(slots: number): void {
    this.config.setTimeSlotsPerHour(slots);

    if (this.calendar) {
      this.calendar.setOption('slotDuration', this.config.getSlotDuration());
    }
  }

  /**
   * The maximum duration of a meeting in minutes.
   * The default value is 30 minutes.
   * @param duration - The maximum duration of a meeting in minutes.
   */
  public setMaxMeetingDuration(duration: number): void {
    this.config.setMaxMeetingDuration(duration);
  
    if (this.calendar) {
      this.calendar.setOption('selectAllow', (selectInfo: any) => 
        this.config['validateSelection'](selectInfo)
      );
    }
  }

  /**
   * Configures the selection handler for the calendar.
   * This function sets up the behavior when timeslots are selected in the calendar.
   */
  public configureSelectionHandler(): void {
    // Check if the calendar is initialized before configuring the selection handler
    // This is important to avoid errors when the calendar is not yet rendered
    if (!this.calendar) {
      console.error('Calendar is not initialized: cannot configure selection handler.');
      return;
    }

    // When a selection is made appointment modal is opened
    this.calendar.setOption('select', (selectionInfo: any) => {
      const appointmentModal = document.getElementById('appointmentModal');
      if (appointmentModal) {
        appointmentModal.style.display = 'block';
        appointmentModal.dataset.start = selectionInfo.startStr;
        appointmentModal.dataset.end = selectionInfo.endStr;
      }
    });
  }

  /**
   * This function sets the configuration of the calendar.
   * @param newConfig - The new configuration object for the calendar.
   */
  public setConfig(newConfig: CalendarConfig): void {
    this.config = newConfig;
    this.refresh();
  }

  /**
   * Gets the current configuration of the calendar.
   * @returns The current configuration object of the calendar.
   */
  public getConfig(): CalendarConfig {
    return this.config;
  }

  /**
   * Refreshes the calendar by destroying the current instance and re-initializing it.
   */
  private refresh(): void {
    if (this.calendar) {
      this.calendar.destroy();
    }
    this.initialize();
  }
}
