import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick

/**
 * CalendarConfig class for managing FullCalendar configuration and settings.
 */
export class CalendarConfig {
  private config: any;
  private timeSlotsPerHour: number = 2; // Default to 2 slots per hour
  private maxMeetingDuration: number = 30;    // In minutes (e.g., 60 = 1 hour)
  private workingHours: { start: number; end: number }; // 24-hour format
  private startDate: Date;
  private endDate: Date;

  /**
   * Constructor for CalendarConfig.
   * @param customConfig Custom configuration for FullCalendar. If not provided, defaults to a standard configuration.
   * @param timeSlotsPerHour The number of time slots per hour (1-4). Defaults to 2.
   * @param workingHours the working hours for the calendar in 24-hour format, defaults to { start: 9, end: 17 }
   * @param endDate the date to limit the calendar to. If not provided, defaults to 18 weeks from today.
   */
  constructor(customConfig?: any, timeSlotsPerHour: number = 2, workingHours: { start: number; end: number } = { start: 9, end: 17 }, endDate?: Date) {
    // Ensure timeSlotsPerHour is between 1 and 4
    this.setTimeSlotsPerHour(timeSlotsPerHour);
    this.config = { ...this.getDefaultConfig(), ...customConfig };
    this.workingHours = workingHours;
    this.startDate = new Date();
    this.startDate.setHours(0, 0, 0, 0);

    // Set endDate to provided value OR default to 18 weeks (126 days) from today
    this.endDate = endDate || this.calculateDateByWeeks(18);
  }

  /**
   * Gets the configuration object for FullCalendar.
   * @returns {object} The configuration object.
   */
  getConfig(): any {
    return {
      ...this.config,
      slotDuration: this.getSlotDuration(), // Set the slot duration based on timeSlotsPerHour
      selectAllow: (selectInfo: any) => this.validateSelection(selectInfo),
      validRange: this.getValidRange()
    }
  }

  /**
   * Validates the selected time range for a meeting.
   * @param selectInfo The selection information from FullCalendar.
   * @returns {boolean} True if the selection is valid, false otherwise.
   */
  private validateSelection(selectInfo: any): boolean {
    const start = selectInfo.start;
    const end = selectInfo.end;
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    const minutesPerSlot = 60 / this.timeSlotsPerHour;
    const minDuration = minutesPerSlot;                       // Minimum: 1 slot
    const maxDuration = this.maxMeetingDuration;              // Maximum: from config

    return durationMinutes >= minDuration && durationMinutes <= maxDuration;
  }

  /**
   * Retrieves the valid range for the calendar.
   * @returns {object} The valid range for the calendar.
   */
  private getValidRange(): { start: Date; end: Date } {
    return { start: this.startDate, end: this.endDate };
  }

  /**
   * Calculates the last date of the calendar based on the number of weeks from a given start date.
   * @param weeks Number of weeks to limit the calendar to.
   * @param startDate Optional start date. Defaults to today if not provided.
   * @returns {Date} The calculated end date.
   */
  private calculateDateByWeeks(weeks: number, startDate?: Date): Date {
    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setHours(0, 0, 0, 0); // Normalize time

    const end = new Date(baseDate);
    end.setDate(end.getDate() + weeks * 7);
    return end;
  }

  /**
   * Sets a configuration option for the calendar.
   * @param key The configuration key to set.
   * @param value The value to set for the configuration key.
   */
  setOption(key: string, value: any): void {
    this.config[key] = value;
  }

  /**
   * Gets a configuration option for the calendar.
   * @param key The configuration key to retrieve.
   * @returns {any} The value of the configuration key.
   */
  getOption(key: string): any {
    return this.config[key];
  }

  /**
   * Sets the number of time slots per hour for the calendar.
   * @param value Number of time slots per hour (1-4)
   */
  setTimeSlotsPerHour(value: number): void {
    if (value < 1) {
      this.timeSlotsPerHour = 1;
    } else if (value > 4) {
      this.timeSlotsPerHour = 4;
    } else {
      this.timeSlotsPerHour = value;
    }
  }

  /**
   * Gets the number of time slots per hour for the calendar.
   * @returns {number} The number of time slots per hour.
   */
  getTimeSlotsPerHour(): number {
    return this.timeSlotsPerHour;
  }

  /**
   * Gets the duration of each time slot in ISO format (HH:MM:SS).
   * @returns {string} The duration of each time slot.
   */
  public getSlotDuration(): string {
    // FullCalendar expects ISO duration strings like '00:30:00' for 30 minutes
    const minutesPerSlot = 60 / this.timeSlotsPerHour;
    return `00:${minutesPerSlot.toString().padStart(2, '0')}:00`;
  }

  /**
   * Sets the maximum meeting duration in minutes.
   * @param duration The maximum meeting duration in minutes.
   */
  public setMaxMeetingDuration(duration: number): void {
    this.maxMeetingDuration = duration;
  }

  /**
   * Gets the total timeslots per day based on working hours and time slots per hour.
   * @returns {number} The maximum timeslots per day.
   */
  public getTotalSlotsPerDay(): number {
    const slotsPerHour = this.getTimeSlotsPerHour();
    const totalHours = this.workingHours.end - this.workingHours.start;
    return totalHours * slotsPerHour;
  }

  /**
   * Creates a default configuration for FullCalendar.
   * @returns {any} The default configuration for FullCalendar.
   */
  getDefaultConfig(): any {
    return {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      editable: true,
      selectable: true,
      allDaySlot: false,
      hiddenDays: [0, 6], // Hide weekends
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00'
      },
      slotMinTime: '09:00:00',
      slotMaxTime: '17:00:00',
      locale: 'en',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      }
    };
  }
}
