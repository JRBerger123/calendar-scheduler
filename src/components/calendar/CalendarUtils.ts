export class CalendarUtils {

    constructor() {

    }

    // Not working properly, need to fix the logic
    removeUnselectableWeeks(
      startingWorkHour: number,
      slotsPerHour: number,
      unselectableTimeWindow: number, // in minutes
      viewStartDate: Date,
      calendarEl: HTMLElement
    ): void {
      const now = new Date();
      const unselectableWindowMs = unselectableTimeWindow * 60 * 1000;
    
      // Scope DOM queries to calendar element
      const dayColumns = calendarEl.querySelectorAll<HTMLElement>('.fc-col-header-cell');
      const timeSlots = calendarEl.querySelectorAll<HTMLElement>('.fc-timegrid-slot-lane');
    
      dayColumns.forEach((dayColumn: HTMLElement, colIndex: number) => {
        // Calculate date for this column (viewStartDate + colIndex days)
        const columnDate = new Date(viewStartDate);
        columnDate.setDate(viewStartDate.getDate() + colIndex);
        columnDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
        timeSlots.forEach((timeSlot: HTMLElement, rowIndex: number) => {
          const slotHour = startingWorkHour + Math.floor(rowIndex / slotsPerHour);
          const slotMinutes = (rowIndex % slotsPerHour) * (60 / slotsPerHour);
          const slotTime = new Date(columnDate);
          slotTime.setHours(slotHour, slotMinutes, 0, 0);
    
          // Find corresponding overlay
          const overlay = document.getElementById(`overlay-col-${colIndex}-row-${rowIndex}`) as HTMLElement | null;
    
          if (overlay) {
            const timeDiff = slotTime.getTime() - now.getTime();
            const isPast = slotTime < now;
            const inUnselectableWindow = timeDiff > 0 && timeDiff <= unselectableWindowMs;
    
            // Toggle overlay visibility using class for better performance
            overlay.classList.toggle('fc-unselectable', isPast || inUnselectableWindow);
    
            // Add data attributes for debugging or inspection
            overlay.dataset.slotTime = slotTime.toISOString();
            overlay.dataset.timeDiff = `${Math.round(timeDiff / 60000)} mins`;
          }
        });
      });
    }

    adjustSlotHeight(calendarEl: HTMLElement, totalSlots: number): void {
        const timeGridSlots = calendarEl.querySelector(".fc-timegrid-slots") as HTMLElement | null;
        const headerToolbar = calendarEl.querySelector(".fc-header-toolbar") as HTMLElement | null;
        const dayHeader = calendarEl.querySelector(".fc-col-header") as HTMLElement | null;
      
        if (!timeGridSlots || !headerToolbar || !dayHeader) return; // Ensure all elements exist
      
        // Get the full header height including padding and margin
        const headerStyles = window.getComputedStyle(headerToolbar);
        const headerHeight =
          headerToolbar.offsetHeight +
          parseInt(headerStyles.marginTop) +
          parseInt(headerStyles.marginBottom) +
          parseInt(headerStyles.paddingTop) +
          parseInt(headerStyles.paddingBottom);
      
        // Get the day header height
        const dayHeaderHeight = dayHeader.offsetHeight;
      
        // Calculate the available height for the slots
        const availableHeight = calendarEl.offsetHeight - headerHeight - dayHeaderHeight - 1;
      
        if (totalSlots > 0) {
          const slotHeight = availableHeight / totalSlots;
      
          // Adjust the height of each time slot
          const timeSlots = calendarEl.querySelectorAll<HTMLElement>(".fc-timegrid-slot");
          timeSlots.forEach((slot) => {
            slot.style.height = `${slotHeight}px`;
          });
      
          // Adjust the events' height and position based on slot time
          const events = calendarEl.querySelectorAll<HTMLElement>(".fc-event");
          events.forEach((eventElement) => {
            // FullCalendar may attach event data via a custom property (non-standard)
            const event: any = (eventElement as any)._fci;
      
            if (event && event.start && event.end) {
              const eventStartTime = new Date(event.start);
              const eventEndTime = new Date(event.end);
      
              const firstSlot = calendarEl.querySelector(".fc-timegrid-slot:first-child") as HTMLElement | null;
              if (!firstSlot) return;
      
              const calendarStartTimeAttr = firstSlot.getAttribute("data-time");
              if (!calendarStartTimeAttr) return;
      
              const [hours, minutes] = calendarStartTimeAttr.split(":").map(Number);
              const calendarStartTime = new Date();
              calendarStartTime.setHours(hours, minutes, 0, 0);
      
              const timeDiff = eventStartTime.getTime() - calendarStartTime.getTime(); // Milliseconds difference
      
              const eventTop = (timeDiff / (1000 * 60 * 60)) * slotHeight; // Convert ms to hours, then scale
              const eventDurationHours = (eventEndTime.getTime() - eventStartTime.getTime()) / (1000 * 60 * 60);
              const eventHeight = eventDurationHours * slotHeight;
      
              // Apply calculated positioning
              eventElement.style.top = `${Math.round(eventTop)}px`;
              eventElement.style.height = `${Math.round(eventHeight)}px`;
      
              // Force reflow if needed (optional)
              void eventElement.offsetHeight;
            }
          });
        }
    }
      
    /**
     * Updates day cell classes in the month view.
     * Replaces .fc-day-today and .fc-day-future with .fc-day-disabled
     * if no events are present in that day cell.
     */
    public disableDaysWithNoAvailableTimeslots(): void {
      const days = document.querySelectorAll<HTMLElement>(".fc-day-today, .fc-day-future");

      days.forEach((day: HTMLElement) => {
        const events = day.querySelectorAll(".fc-event");

        if (events.length === 0) {
          day.classList.remove("fc-day-today", "fc-day-future");
          day.classList.add("fc-day-disabled");
        }
      });
    }
}