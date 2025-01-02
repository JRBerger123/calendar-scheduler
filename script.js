import { setupEventHandlers } from './eventHandlers.js';
import * as calendarFunctions from './calendarFunctions.js';

/*
To Do:
Done: Events are not loading properly from EventManager
Done: Make Week View full screen
Done: Condense Available Time Slots
Done: Format Available Time Slots as 12 hour Format
Done: Load Events when itterating weeks and months
Done: Fix Available timeslots not being based off of current events
Done: Center Available Time Slots
Done: Adjust Title Text to be easier to read
Done: Press Esc exits modal
Done: Adjust Month View day heights based on window size
Done: Make unselectable more obvious
Done: Fix text-wrap on title
Done: Create an offset from current time to schedule new appointments
Done: Clicking the day on Month View sends you to week mode of that day
Done: Pressing Enter on Modal GUI submits form
Done: Create Profile Modal
Done: Fixed error in resizing calendar when window is resized vertically
Done: Title is not centered

Make days with no Available timeslots unselectable in Month View
Create animation for showing part of Modal GUI not being filled out
Create timer that greys out event and makes it unselectable after timer expires (upload event to server)
Make mobile friendly
Create Login for Profiles
Create Profile Settings
Create Settings
Fix Available timeslots not using the entire day div
Unselectable timeslots are not greyed out
  - Timeslots are not individual elements, but are part of a row and column div
*/

document.addEventListener('DOMContentLoaded', function() {
  // Variables
  const startingWorkHour = 9; // Starting Hour (1-24)
  const endingWorkHour = 17; // Ending Hour (1-24)
  const workingDays = [1,2,3,4,5];
  const monthsAvailable = 5; // How many months out someone can schedule an appointment
  const slotsPerHour = 2; // Limited to range (1-4)
  const defaultSlotDuration = calendarFunctions.slotDuration(slotsPerHour);
  const totalHours = endingWorkHour - startingWorkHour;
  const totalSlots = totalHours * slotsPerHour;
  const slotHeight = 100 / totalSlots + "vh";
  const unselectableTimeWindow = 60; // Time window in minutes within which timeslots are unselectable
  let lastViewType = null;  // Variable to track the last view type

  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('appointmentModal');
  const confirmButton = document.getElementById('confirmButton');

  let selectedInfo;
  
  // Instantiate EventManager
  const eventManager = new calendarFunctions.EventManager();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',

    dayCellDidMount: function(info) {
      // Change view to week view of clicked day on month view
      if (info.date.getMonth() === calendar.getDate().getMonth()) {
        info.el.addEventListener('click', function() {
          const currentViewType = calendar.view.type;
  
          if (currentViewType == 'dayGridMonth') {
            //console.log("Date clicked:", info.dateStr);
            calendar.changeView('timeGridWeek', info.date);
          }
        });
      }
    },

    validRange: {
      start: new Date(),
      end: new Date(new Date().setMonth(new Date().getMonth() + monthsAvailable))
    },

    businessHours: {
      daysOfWeek: workingDays, // Monday to Friday
      startTime: calendarFunctions.getBusinessHours(startingWorkHour, false),
      endTime: calendarFunctions.getBusinessHours(endingWorkHour, false),
    },

    slotMinTime: calendarFunctions.getBusinessHours(startingWorkHour, true),
    slotMaxTime: calendarFunctions.getBusinessHours(endingWorkHour, true),

    slotDuration: defaultSlotDuration,
    allDaySlot: false, // Remove all-day slot
    hiddenDays: [0, 6], // Hide Sunday and Saturday

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
	
	datesSet: function(dateInfo) {
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
	  const startMonth = firstDay.toLocaleString('default', { month: 'short' });
	  const endMonth = lastDay.toLocaleString('default', { month: 'short' });
	  const year = firstDay.getFullYear();
	  const endYear = lastDay.getFullYear();
	  
	  const daysVisible = (endDate.valueOf() - startDate.valueOf()) / (1000 * 60 * 60 * 24);
	  const toolbarTitle = document.querySelector('.fc-toolbar-title');
	  const todayButton = document.querySelector('.fc-today-button');
	  const weekButton = document.querySelector('.fc-timeGridWeek-button');
	  const monthButton = document.querySelector('.fc-dayGridMonth-button');
	  
	  var tempEventManager = new calendarFunctions.EventManager();
	  
	  if (lastViewType == null) { // Initial View
		// Variables
		lastViewType = currentViewType;
		
		//console.log("Initial View Loaded");
		//console.log("Initial Events:", eventManager.getEvents());
		
		if (startMonth == endMonth) {
      toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(startDate)}&nbsp;<wbr>-</wbr>&nbsp;${calendarFunctions.getOrdinal(endDate)},&nbsp;${year}`;
    } else {
      if (year == endYear) {
        toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(startDate)}&nbsp;<wbr>-</wbr>&nbsp;${endMonth} ${calendarFunctions.getOrdinal(endDate)},&nbsp;${year}`;
      } else {
        toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(startDate)},&nbsp;${year}&nbsp;<wbr>-</wbr>&nbsp;${endMonth}&nbsp;${calendarFunctions.getOrdinal(endDate)},&nbsp;${endYear}`;
      }
    }
		
    calendarFunctions.setupToolbar(true);
		calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
		calendarFunctions.addEvents(eventManager, calendar);
		
	  } else if ((lastViewType == 'timeGridWeek' && currentViewType == 'dayGridMonth') || // Week -> Month View
				(lastViewType == 'dayGridMonth' && currentViewType == 'dayGridMonth')) { // Month -> Month View
		// Variables
		const today = new Date();
		const currentDate = calendar.getDate(); // Get the current date displayed on the calendar
		const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of the current month
		let startDate;
		
		if (today > currentDate) { // Calculates first day of month by whether the month has started yet
			startDate = today;
		} else {
			startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of the current month
		}
		
		lastViewType = currentViewType;
		
		//console.log("Month View Loaded");
		//console.log("Start Day:", startDay);
		//console.log("End Day:", endDay);
	  
		calendar.removeAllEvents();
		
		toolbarTitle.innerHTML = 'Available&nbsp;Times&nbsp;<wbr>-</wbr>&nbsp;' + currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }).replace(" ", "&nbsp;");

		tempEventManager = calendarFunctions.generateAvailableTimes(startDate, endDate, startingWorkHour, endingWorkHour, slotsPerHour, workingDays, eventManager);
		tempEventManager = calendarFunctions.consolidateEvents(tempEventManager);

    calendarFunctions.setupToolbar(false); // Setup the toolbar
		calendarFunctions.addEvents(tempEventManager, calendar);
		
		
		//console.log(table.rows);
		//console.log("Month Events:", tempEventManager.getEvents());
		
	  } else if ((lastViewType == 'dayGridMonth' && currentViewType == 'timeGridWeek') || // Month -> Week View
				(lastViewType == 'timeGridWeek' && currentViewType == 'timeGridWeek')){ // Week -> Week View

		// Variables
		lastViewType = currentViewType;
		
		//console.log("Week View Loaded");
		
		calendar.removeAllEvents();
		
		if (startMonth == endMonth) {
			toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(startDate)}&nbsp;<wbr>–</wbr>&nbsp;${calendarFunctions.getOrdinal(endDate)},&nbsp;${year}`;
		} else {
			if (year == endYear) {
				toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(startDate)}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${calendarFunctions.getOrdinal(endDate)},&nbsp;${year}`;
			} else {
				toolbarTitle.innerHTML = `${startMonth}&nbsp;${calendarFunctions.getOrdinal(startDate)}, ${year}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${calendarFunctions.getOrdinal(endDate)},&nbsp;${endYear}`;
			}
		}

    calendarFunctions.setupToolbar(false);
		calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
		calendarFunctions.addEvents(eventManager, calendar)
	  }

    todayButton.textContent = 'Today';
		weekButton.textContent = 'Week';
		monthButton.textContent = 'Month';
	  
	  events: tempEventManager.getEvents(); // Use formatted events
	},
	
	eventDidMount: function(info) {
		const currentViewType = info.view.type;
    const now = new Date();
    const timeDifference = (info.event.start - now) / (1000 * 60); // Time difference in minutes

		if (currentViewType == 'dayGridMonth') { // Removes rows of unavailable days in Month View
			const table = document.querySelector('.fc-scrollgrid-sync-table');
			const rows = table.querySelectorAll('tr[role="row"]');
			for (let index = rows.length - 1; index >= 0; index--) {
			  const row = rows[index];
			  const cells = row.querySelectorAll('td');
			  if (cells.length === 0) {
				return;
			  }
			  const allDisabled = Array.from(cells).every(cell => cell.classList.contains('fc-day-disabled'));
			  if (allDisabled) {
				row.style.display = 'none';
			  }
			};
		} else {
      if (timeDifference < unselectableTimeWindow) {
        info.el.style.pointerEvents = 'none'; // Makes timeslot unselectable
      }
    }
	},

    selectable: true,

    select: function(info) {
      selectedInfo = info;
      const start = calendarFunctions.formatTimeTo12Hour(info.startStr.slice(11, 16));
      const end = calendarFunctions.formatTimeTo12Hour(info.endStr.slice(11, 16));
      const date = new Date(info.startStr);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });

      document.getElementById('selectedTime').textContent = `${start} - ${end}`;
      document.getElementById('selectedFaculty').textContent = `Faculty: Dr. Placeholder`;
      document.getElementById('selectedDayDate').textContent = `${day}, ${date.toLocaleDateString()}`;

      modal.style.display = "block";
    },

    selectAllow: function(selectInfo) {
      const duration = (selectInfo.end - selectInfo.start) / (1000 * 60);
      const now = new Date();
      const timeDifference = (selectInfo.start - now) / (1000 * 60); // Time difference in minutes

      return (
        selectInfo.start.getHours() >= startingWorkHour &&
        selectInfo.end.getHours() <= endingWorkHour &&
        (duration === 30 || duration === 60) &&
        timeDifference >= unselectableTimeWindow
      );
    },

    selectOverlap: false,
	  showNonCurrentDates: false,
    displayEventTime: false,

    events: [] // Start with an empty array
  }); // End of calendar
  
  calendar.render();

  // Setup event handlers
  setupEventHandlers(calendar);

  window.addEventListener('resize', () => { // Dynamically sizes calendar when Window is resized
    requestAnimationFrame(() => {
      calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
  
      // Reload the view to force a re-render
      // This was necessary to fix the issue where the calendar would not resize properly when the window was resized vertically
      calendar.changeView(calendar.view.type);
    });
  });

  // Add event listener for orientation change to adjust slot height
  window.addEventListener('orientationchange', () => {
    calendarFunctions.adjustSlotHeight(calendarEl, totalSlots);
  });

  confirmButton.onclick = function() {
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const visitCategory = document.getElementById('visitCategory');
    const visitReason = document.getElementById('visitReason');

    function submitForm() {
        let valid = true;

        // Disable the confirm button to prevent multiple clicks
        confirmButton.disabled = true;

        // Check if required fields are filled out
        if (!fullName.value) {
            fullName.classList.add('flash-red');
            valid = false;
        }
        if (!email.value) {
            email.classList.add('flash-red');
            valid = false;
        }
        if (!visitCategory.value) {
            visitCategory.classList.add('flash-red');
            valid = false;
        }

        console.log(visitCategory.value);
        console.log(fullName.value);

        // Remove the flash-red class after the animation completes
        setTimeout(() => {
            confirmButton.disabled = false;
            fullName.classList.remove('flash-red');
            email.classList.remove('flash-red');
            visitCategory.classList.remove('flash-red');
        }, 1100); // Match the duration of the animation

        if (valid) {
            const event = new calendarFunctions.Event(
                calendarFunctions.dateToHour(new Date(selectedInfo.startStr).getHours(), new Date(selectedInfo.startStr).getMinutes()),
                calendarFunctions.dateToHour(new Date(selectedInfo.endStr).getHours(), new Date(selectedInfo.endStr).getMinutes()),
                `${calendarFunctions.formatDate(new Date(selectedInfo.startStr))}`,
                `${visitCategory.value} Meeting for ${calendarFunctions.capitalizeWords(fullName.value)}`,
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
                    email: event.email
                }
            });

            modal.style.display = "none";
        }
    }

    submitForm();
  };
});

