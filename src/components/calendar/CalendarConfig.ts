import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick

export class CalendarConfig {
  private config: any;
  private timeSlotsPerHour: number = 2; // Default to 2 slots per hour
  private maxMeetingDuration: number = 30;    // In minutes (e.g., 60 = 1 hour)
  private workingHours: { start: number; end: number }; // 24-hour format
  private startDate: Date;
  private endDate: Date;

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

  getConfig(): any {
    return {
      ...this.config,
      slotDuration: this.getSlotDuration(), // Set the slot duration based on timeSlotsPerHour
      selectAllow: (selectInfo: any) => this.validateSelection(selectInfo),
      validRange: this.getValidRange()
    }
  }

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

  private getValidRange(): { start: Date; end: Date } {
    return { start: this.startDate, end: this.endDate };
  }

  private calculateDateByWeeks(weeks: number): Date {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + weeks * 7);
    return end;
  }

  setOption(key: string, value: any): void {
    this.config[key] = value;
  }

  getOption(key: string): any {
    return this.config[key];
  }

  public getWorkingHours(): { start: number; end: number } {
    return this.workingHours;
  }

  setTimeSlotsPerHour(value: number): void {
    if (value < 1) {
      this.timeSlotsPerHour = 1;
    } else if (value > 4) {
      this.timeSlotsPerHour = 4;
    } else {
      this.timeSlotsPerHour = value;
    }
  }

  getTimeSlotsPerHour(): number {
    return this.timeSlotsPerHour;
  }

  public getSlotDuration(): string {
    // FullCalendar expects ISO duration strings like '00:30:00' for 30 minutes
    const minutesPerSlot = 60 / this.timeSlotsPerHour;
    return `00:${minutesPerSlot.toString().padStart(2, '0')}:00`;
  }

  public setMaxMeetingDuration(duration: number): void {
    this.maxMeetingDuration = duration;
  }

  public getTotalSlotsPerDay(): number {
    const slotsPerHour = this.getTimeSlotsPerHour();
    const totalHours = this.workingHours.end - this.workingHours.start;
    return totalHours * slotsPerHour;
  }

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
