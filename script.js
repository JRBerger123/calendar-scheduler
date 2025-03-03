import { setupEventHandlers } from "./eventHandlers.js";
import * as calendarFunctions from "./calendarFunctions.js";

/*
To Do:
Make days with no Available timeslots unselectable in Month View
  - Timeslots are not individual elements, but are part of a row and column div
Make days with no Available timeslots unselectable in Week View
Create timer that greys out event and makes it unselectable after timer expires (upload event to server)
Make mobile friendly
Create Login for Profiles
Create Profile Settings
Create Settings
Fix Available timeslots not using the entire day div
Change color of view control buttons
Make unselectable elements have a pattern
*/

document.addEventListener("DOMContentLoaded", function () {
  // Configuration Constants
  const CALENDAR_CONFIG = {
    WORK_HOURS: {
      START: 9,
      END: 17
    },
    WORKING_DAYS: [1, 2, 3, 4, 5], // Monday-Friday
    MONTHS_AVAILABLE: 5, // Number of months available in the future based on today's date.
    SLOTS_PER_HOUR: 2, // Limited to 1-4 slots per hour. 2 is the default.
    UNSELECTABLE_WINDOW_MINUTES: 60
  };

  const businessHours = {
    daysOfWeek: CALENDAR_CONFIG.WORKING_DAYS,
    startTime: calendarFunctions.getBusinessHours(CALENDAR_CONFIG.WORK_HOURS.START, false),
    endTime: calendarFunctions.getBusinessHours(CALENDAR_CONFIG.WORK_HOURS.END, false)
  };

  // Calculate derived layout values
  const totalHours = CALENDAR_CONFIG.WORK_HOURS.END - CALENDAR_CONFIG.WORK_HOURS.START;
  const totalSlots = totalHours * CALENDAR_CONFIG.SLOTS_PER_HOUR;
  const slotHeight = `${100 / totalSlots}vh`; // For CSS integration

  // Other variables
  const defaultSlotDuration = calendarFunctions.slotDuration(CALENDAR_CONFIG.SLOTS_PER_HOUR);
  let lastViewType = null; // Variable to track the last view type
  const calendarEl = document.getElementById("calendar");
  const modal = document.getElementById("appointmentModal");
  const confirmButton = document.getElementById("confirmButton");
  let selectedInfo;

  // Instantiate EventManager
  const eventManager = new calendarFunctions.EventManager();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",

    dayCellDidMount: function (info) {
      // Change view to week view of clicked day on month view
      if (info.date.getMonth() === calendar.getDate().getMonth()) {
        info.el.addEventListener("click", function () {
          const currentViewType = calendar.view.type;

          if (currentViewType == "dayGridMonth") {
            //console.log("Date clicked:", info.dateStr);
            calendar.changeView("timeGridWeek", info.date);
          }
        });
      }
    },

    validRange: {
      start: new Date(),
      end: new Date(
        new Date().setMonth(new Date().getMonth() + CALENDAR_CONFIG.MONTHS_AVAILABLE)
      ),
    },

    businessHours: {
      daysOfWeek: CALENDAR_CONFIG.WORKING_DAYS, // Monday to Friday
      startTime: calendarFunctions.getBusinessHours(CALENDAR_CONFIG.WORK_HOURS.START, false),
      endTime: calendarFunctions.getBusinessHours(CALENDAR_CONFIG.WORK_HOURS.END, false),
    },

    slotMinTime: calendarFunctions.getBusinessHours(CALENDAR_CONFIG.WORK_HOURS.START, true),
    slotMaxTime: calendarFunctions.getBusinessHours(CALENDAR_CONFIG.WORK_HOURS.END, true),

    slotDuration: defaultSlotDuration,
    allDaySlot: false, // Remove all-day slot
    hiddenDays: [0, 6], // Hide Sunday and Saturday

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "timeGridWeek,dayGridMonth",
    },

    datesSet: function (dateInfo) {
      //console.log("Date Change Detected");
      // Get the current view from FullCalendar
      const currentViewType = dateInfo.view.type;
      const view = calendar.view;

      // Get the start and end of the week
      const firstDay = view.currentStart;
      const lastDay = view.currentEnd;

      // Adjust for weekends
      firstDay.setDate(firstDay.getDate() + 1);
      lastDay.setDate(lastDay.getDate() - 2);

      // Format the date range for the title
      const startDate = firstDay.getDate();
      const endDate = lastDay.getDate();
      const startMonth = firstDay.toLocaleString("default", { month: "short" });
      const endMonth = lastDay.toLocaleString("default", { month: "short" });
      const year = firstDay.getFullYear();
      const endYear = lastDay.getFullYear();

      const daysVisible =
        (endDate.valueOf() - startDate.valueOf()) / (1000 * 60 * 60 * 24);
      const toolbarTitle = document.querySelector(".fc-toolbar-title");
      const todayButton = document.querySelector(".fc-today-button");
      const weekButton = document.querySelector(".fc-timeGridWeek-button");
      const monthButton = document.querySelector(".fc-dayGridMonth-button");

      var tempEventManager = new calendarFunctions.EventManager();

      if (lastViewType == null) { // Initial View Loaded ---------------------------------------------------
        lastViewType = currentViewType;

        // Title Generation
        if (startMonth == endMonth) {
          toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(
            startDate
          )}&nbsp;<wbr>-</wbr>&nbsp;${calendarFunctions.getOrdinal(
            endDate
          )},&nbsp;${year}`;
        } else {
          if (year == endYear) {
            toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(
              startDate
            )}&nbsp;<wbr>-</wbr>&nbsp;${endMonth} ${calendarFunctions.getOrdinal(
              endDate
            )},&nbsp;${year}`;
          } else {
            toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(
              startDate
            )},&nbsp;${year}&nbsp;<wbr>-</wbr>&nbsp;${endMonth}&nbsp;${calendarFunctions.getOrdinal(
              endDate
            )},&nbsp;${endYear}`;
          }
        }
        // End of Title Generation

        calendarFunctions.setupToolbar(true);
        calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
        calendarFunctions.addEvents(eventManager, calendar);

        calendar.render();
        
        calendarFunctions.overlayAllTimeslots(calendarEl, totalSlots);
        calendarFunctions.hideSelectableTimeslots(CALENDAR_CONFIG.WORK_HOURS.START, CALENDAR_CONFIG.SLOTS_PER_HOUR, CALENDAR_CONFIG.UNSELECTABLE_WINDOW_MINUTES, firstDay, calendarEl);

      } else if (currentViewType == "dayGridMonth") { // Month View Loaded ---------------------------------------------------
        const today = new Date();
        const currentDate = calendar.getDate(); // Get the current date displayed on the calendar
        const endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ); // Last day of the current month
        let startDate;

        if (today > currentDate) {
          // Calculates first day of month by whether the month has started yet
          startDate = today;
        } else {
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          ); // First day of the current month
        }

        lastViewType = currentViewType;

        // Remove all previous events
        calendar.removeAllEvents();

        // Title Generation
        toolbarTitle.innerHTML =
          "Available&nbsp;Times&nbsp;<wbr>-</wbr>&nbsp;" +
          currentDate
            .toLocaleString("default", { month: "short", year: "numeric" })
            .replace(" ", "&nbsp;");

        tempEventManager = calendarFunctions.generateAvailableTimes(
          startDate,
          endDate,
          CALENDAR_CONFIG.WORK_HOURS.START,
          CALENDAR_CONFIG.WORK_HOURS.END,
          CALENDAR_CONFIG.SLOTS_PER_HOUR,
          CALENDAR_CONFIG.WORKING_DAYS,
          eventManager
        );
        tempEventManager = calendarFunctions.consolidateEvents(tempEventManager);

        calendarFunctions.setupToolbar(false); // Setup the toolbar
        calendarFunctions.addEvents(tempEventManager, calendar);

      } else if (currentViewType == "timeGridWeek") { // Week View Loaded ----------------------------------------------

        lastViewType = currentViewType;

        calendar.removeAllEvents();

        if (startMonth == endMonth) {
          toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(
            startDate
          )}&nbsp;<wbr>–</wbr>&nbsp;${calendarFunctions.getOrdinal(
            endDate
          )},&nbsp;${year}`;
        } else {
          if (year == endYear) {
            toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(
              startDate
            )}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${calendarFunctions.getOrdinal(
              endDate
            )},&nbsp;${year}`;
          } else {
            toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(
              startDate
            )}, ${year}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${calendarFunctions.getOrdinal(
              endDate
            )},&nbsp;${endYear}`;
          }
        }

        calendarFunctions.setupToolbar(false);
        calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
        calendarFunctions.addEvents(eventManager, calendar);

        calendar.render();

        calendarFunctions.overlayAllTimeslots(calendarEl, totalSlots);
        calendarFunctions.hideSelectableTimeslots(CALENDAR_CONFIG.WORK_HOURS.START, CALENDAR_CONFIG.SLOTS_PER_HOUR, CALENDAR_CONFIG.UNSELECTABLE_WINDOW_MINUTES, firstDay, calendarEl);
      } // End of View Change

      todayButton.textContent = "Today";
      weekButton.textContent = "Week";
      monthButton.textContent = "Month";

      events: tempEventManager.getEvents(); // Use formatted events
    },

    eventDidMount: function (info) {
      const currentViewType = info.view.type;
      const now = new Date();
      const timeDifference = (info.event.start - now) / (1000 * 60); // Time difference in minutes

      if (currentViewType == "dayGridMonth") {
        // Removes rows of unavailable days in Month View
        const table = document.querySelector(".fc-scrollgrid-sync-table");
        var rows = table.querySelectorAll('tr[role="row"]');
        for (let index = rows.length - 1; index >= 0; index--) {
          const row = rows[index];
          const cells = row.querySelectorAll("td");
          if (cells.length === 0) {
            return;
          }
          const allDisabled = Array.from(cells).every((cell) =>
            cell.classList.contains("fc-day-disabled")
          );
          if (allDisabled) {
            row.style.display = "none";
          }
        }

        // Sets Row Height in month view
        rows = Array.from(calendarEl.querySelectorAll('.fc-daygrid-body tr'))
          .filter(row => window.getComputedStyle(row).display !== 'none');

        rows.forEach(row => {
          row.style.height = `${100 / rows.length}%`; // Set each row's height as a percentage
        });

      } else {
        if (timeDifference < CALENDAR_CONFIG.UNSELECTABLE_WINDOW_MINUTES) {
          info.el.style.pointerEvents = "none"; // Makes timeslot unselectable
        }
      }
    },

    selectable: true,

    select: function (info) {
      selectedInfo = info;
      const start = calendarFunctions.formatTimeTo12Hour(
        info.startStr.slice(11, 16)
      );
      const end = calendarFunctions.formatTimeTo12Hour(
        info.endStr.slice(11, 16)
      );
      const date = new Date(info.startStr);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      document.getElementById("selectedTime").textContent = `${start} - ${end}`;
      document.getElementById(
        "selectedFaculty"
      ).textContent = `Faculty: Dr. Placeholder`;
      document.getElementById(
        "selectedDayDate"
      ).textContent = `${day}, ${date.toLocaleDateString()}`;

      modal.style.display = "block";
      // Focus on the first input element
      const firstInput = modal.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    },

    selectAllow: function (selectInfo) {
      const duration = (selectInfo.end - selectInfo.start) / (1000 * 60);
      const now = new Date();
      const timeDifference = (selectInfo.start - now) / (1000 * 60); // Time difference in minutes

      return (
        selectInfo.start.getHours() >= CALENDAR_CONFIG.WORK_HOURS.START &&
        selectInfo.end.getHours() <= CALENDAR_CONFIG.WORK_HOURS.END &&
        (duration === 30 || duration === 60) &&
        timeDifference >= CALENDAR_CONFIG.UNSELECTABLE_WINDOW_MINUTES
      );
    },

    selectOverlap: false,
    showNonCurrentDates: false,
    displayEventTime: false,

    events: [], // Start with an empty array
  }); // End of calendar

  calendar.render();

  // Setup event handlers
  setupEventHandlers(calendar);

  window.addEventListener("resize", () => {
    // Dynamically sizes calendar when Window is resized
    requestAnimationFrame(() => {
      calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);

      // Reload the view to force a re-render
      // This was necessary to fix the issue where the calendar would not resize properly when the window was resized vertically
      calendar.changeView(calendar.view.type);
    });
  });

  // Add event listener for orientation change to adjust slot height
  window.addEventListener("orientationchange", () => {
    calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
  });

  confirmButton.onclick = function () {
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const visitCategory = document.querySelector(".select-trigger");
    const visitReason = document.getElementById("visitReason");

    function submitForm() {
      let valid = true;

      // Disable the confirm button to prevent multiple clicks
      confirmButton.disabled = true;

      // Check if required fields are filled out
      if (!fullName.value) {
        fullName.classList.add("flash-red");
        valid = false;
      }
      if (!email.value) {
        email.classList.add("flash-red");
        valid = false;
      }
      if (
        visitCategory.textContent === "" ||
        visitCategory.textContent === "\u200B"
      ) {
        visitCategory.classList.add("flash-red");
        valid = false;
      }

      // Remove the flash-red class after the animation completes
      setTimeout(() => {
        confirmButton.disabled = false;
        fullName.classList.remove("flash-red");
        email.classList.remove("flash-red");
        visitCategory.classList.remove("flash-red");
      }, 1100); // Match the duration of the animation

      if (valid) {
        const event = new calendarFunctions.Event(
          calendarFunctions.dateToHour(
            new Date(selectedInfo.startStr).getHours(),
            new Date(selectedInfo.startStr).getMinutes()
          ),
          calendarFunctions.dateToHour(
            new Date(selectedInfo.endStr).getHours(),
            new Date(selectedInfo.endStr).getMinutes()
          ),
          `${calendarFunctions.formatDate(new Date(selectedInfo.startStr))}`,
          `${
            visitCategory.textContent
          } Meeting for ${calendarFunctions.capitalizeWords(fullName.value)}`,
          fullName.value,
          email.value,
          visitCategory.value,
          visitReason.value
        );

        eventManager.addEvent(event);

        calendar.addEvent({
          title: event.title || "No Title",
          start: calendarFunctions.dateTime(event.date, event.startTime),
          end: calendarFunctions.dateTime(event.date, event.endTime),
          description: event.reasonForVisit, // Optional additional fields
          extendedProps: {
            professor: event.professor,
            category: event.meetingCategory,
            fullName: event.fullName,
            email: event.email,
          },
        });

        modal.style.display = "none";
      }
    }

    submitForm();
  };
});
