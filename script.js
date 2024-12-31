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

Make days with no Available timeslots unselectable in Month View
Create animation for showing part of Modal GUI not being filled out
Create timer that greys out event and makes it unselectable after timer expires (upload event to server)
Make mobile friendly
Create Login for Faculty Settings
Fix Available timeslots not using the entire day div
Unselectable timeslots are not greyed out
  - Timeslots are not individual elements, but are part of a row and column div
Title is not centered
*/


class Event {
  constructor(startTime, endTime, date, title, fullName, email, meetingCategory, reasonForVisit, professor) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.date = date;
    this.title = title;
    this.fullName = fullName;
    this.email = email;
    this.meetingCategory = meetingCategory;
    this.reasonForVisit = reasonForVisit;
    this.professor = professor;
  }
}

class EventManager {
  constructor() {
    this.events = [];
  }

  addEvent(event) {
    this.events.push(event);
  }

  getEvents() {
    return this.events;
  }

  deleteEvent() {
	this.events.pop();  
  }
  
  clearEvents() {
    this.events = [];
  }

  loadEvents(events) {
    this.events = [...events];
  }
}

function adjustSlotHeight(calendarEl, totalSlots) {
  const timeGridSlots = calendarEl.querySelector('.fc-timegrid-slots');
  const headerToolbar = calendarEl.querySelector('.fc-header-toolbar');
  const dayHeader = calendarEl.querySelector('.fc-col-header');

  if (!timeGridSlots || !headerToolbar || !dayHeader) return; // Ensure all elements exist

  // Get the full header height including padding and margin
  const headerStyles = window.getComputedStyle(headerToolbar);
  const headerHeight = headerToolbar.offsetHeight
    + parseInt(headerStyles.marginTop)
    + parseInt(headerStyles.marginBottom)
    + parseInt(headerStyles.paddingTop)
    + parseInt(headerStyles.paddingBottom);  // Include margins and padding

  // Get the day header height
  const dayHeaderHeight = dayHeader.offsetHeight;

  // Calculate the available height for the slots
  const availableHeight = calendarEl.offsetHeight - headerHeight - dayHeaderHeight - 1;

  if (totalSlots > 0) {
    const slotHeight = availableHeight / totalSlots;  // Divide remaining height by number of slots

    // Adjust the height of each time slot
    const timeSlots = calendarEl.querySelectorAll('.fc-timegrid-slot');
    timeSlots.forEach(slot => {
      slot.style.height = `${slotHeight}px`;
    });

    // Adjust the events' height and position based on slot time
    const events = calendarEl.querySelectorAll('.fc-event'); // Grab all the events
    events.forEach(eventElement => {
      // Use FullCalendar's method to get the event object
      const event = eventElement._fci; // FullCalendar internally attaches event object via _fci

      // If the event object is found, get start and end times
      if (event) {
        const eventStartTime = new Date(event.start);  // FullCalendar event object start time
        const eventEndTime = new Date(event.end);      // FullCalendar event object end time

        // Calculate the time difference between the start of the calendar and event start time
        const calendarStartTime = new Date(calendarEl.querySelector('.fc-timegrid-slot:first-child').getAttribute('data-time'));
        const timeDiff = eventStartTime - calendarStartTime;  // Difference in milliseconds

        // Calculate the position based on the time difference
        const eventTop = (timeDiff / (1000 * 60 * 60)) * slotHeight;  // Convert timeDiff to slot height scale

        // Calculate the event height based on its duration
        const eventDuration = (eventEndTime - eventStartTime) / (1000 * 60 * 60);  // Duration in hours
        const eventHeight = eventDuration * slotHeight;

        // Set the event's position and height
        eventElement.style.top = `${Math.round(eventTop)}px`;
        eventElement.style.height = `${Math.round(eventHeight)}px`;
        eventElement.offsetHeight; // Trigger a reflow

        //console.log(`Event start: ${eventStartTime}, Event end: ${eventEndTime}, Event height: ${eventHeight}, Event top: ${eventTop}`);
      }
    });
  }
}

function consolidateEvents(events) {
    let consolidatedEvents = new EventManager(); // Initialize EventManager
	//console.log(events.getEvents()[0]);

    for (let i = 0; i < events.getEvents().length; i++) {
        let currentEvent = events.getEvents()[i];
        //console.log("Current Event:", currentEvent);

        if (consolidatedEvents.getEvents().length > 0) {
            let lastEvent = consolidatedEvents.getEvents()[consolidatedEvents.getEvents().length - 1];

            // Parse both the last event's end time and the current event's start time as Date objects
            let lastEventEndDateTime = new Date(`${lastEvent.date}T${lastEvent.endTime}`);
            let currentEventStartDateTime = new Date(`${currentEvent.date}T${currentEvent.startTime}`);

            // Check for "back-to-back" events
            if (currentEventStartDateTime.getTime() === lastEventEndDateTime.getTime()) {
                // Extend the endTime of the last event to merge
                lastEvent.endTime = currentEvent.endTime;
                lastEvent.title = `${formatTimeTo12Hour(lastEvent.startTime)} - ${formatTimeTo12Hour(lastEvent.endTime)}`;
                //console.log("Merging Events:", lastEvent);
            } else {
                //console.log("Adding Event:", currentEvent);
                consolidatedEvents.addEvent(currentEvent);
            }
        } else {
            //console.log("Adding First Event:", currentEvent);
            consolidatedEvents.addEvent(currentEvent);
        }
    }

    //console.log("Consolidated Events:", consolidatedEvents.getEvents());
    return consolidatedEvents;
}

function addEvents(tempEventManager, calendar) {
  tempEventManager.getEvents().forEach(event => {
	//console.log(`${event.title}`);
	const start = dateTime(event.date, event.startTime);
	const end = dateTime(event.date, event.endTime);
	
	calendar.addEvent({
	  title: event.title || "No Title",
	  start: start, // ISO string for start datetime
	  end: end,     // ISO string for end datetime
	  description: event.reasonForVisit, // Optional additional fields
	  extendedProps: {
		professor: event.professor,
		category: event.meetingCategory,
		fullName: event.fullName,
		email: event.email
	  }
	});
  });
}

function dateTime(date, time) {
  return `${date}T${time}`;
}

function slotDuration(slotsPerHour) {
  if (slotsPerHour <= 1.0) {
	return "00:60:00";
  }	else if (slotsPerHour >= 4.0) {
    return "00:15:00";
  }
  return "00:" + String(Math.floor(60 / slotsPerHour)).padStart(2, '0') + ":00";
}

function getBusinessHours(workHour, extendedFormat) {
  let startTimeStr;

  if (workHour < 10) {
	startTimeStr = "0" + workHour + ":00";
  } else {
	startTimeStr = workHour + ":00";
  }
  
  if (extendedFormat == true) {
	startTimeStr += ":00";
  }

  return startTimeStr;
}

function formatTimeTo12Hour(timeStr) {
  const [hour, minute] = timeStr.split(':');
  const hourInt = parseInt(hour, 10);
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  const formattedHour = hourInt % 12 || 12; // Convert 0 to 12 for AM
  return `${formattedHour}:${minute} ${ampm}`;
}

function capitalizeWords(str) {
  return str.replace(/\b\w+\b/g, word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function getOrdinal(n) { // Function to get the ordinal suffix (e.g., 1st, 2nd, 3rd)
    const suffix = ["th", "st", "nd", "rd"];
    const value = n % 100;
    return n + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed

  return `${year}-${month}-${day}`;
}

function dateToHour(hour, minutes="00") {
  hour = hour >= 10 ? hour : `0${hour}`;
  minutes = minutes >= 10 ? minutes : `0${minutes}`;
  return `${hour}:${minutes}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


document.addEventListener('DOMContentLoaded', function() {
  // Variables
  const startingWorkHour = 9; // Starting Hour (1-24)
  const endingWorkHour = 17; // Ending Hour (1-24)
  const workingDays = [1,2,3,4,5];
  const monthsAvailable = 5; // How many months out someone can schedule an appointment
  const slotsPerHour = 2; // Limited to range (1-4)
  const defaultSlotDuration = slotDuration(slotsPerHour);
  const totalHours = endingWorkHour - startingWorkHour;
  const totalSlots = totalHours * slotsPerHour;
  const slotHeight = 100 / totalSlots + "vh";
  const unselectableTimeWindow = 60; // Time window in minutes within which timeslots are unselectable
  let lastViewType = null;  // Variable to track the last view type

  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('appointmentModal');
  const confirmButton = document.getElementById('confirmButton');
  const cancelButton = document.getElementById('cancelButton');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const calendarLogo = document.getElementById('calendar-logo');

  let selectedInfo;
  
  // Instantiate EventManager
  const eventManager = new EventManager();
  
  // Existing Events
  eventManager.addEvent(new Event('11:00', '12:00', '2024-12-13', 'Appointment'));
  eventManager.addEvent(new Event('09:00', '09:30', '2024-12-12', 'Appointment 1'));
  eventManager.addEvent(new Event('10:00', '10:30', '2024-12-11', 'Appointment 2'));
  
  
  // Calendar Specific Functions
  function generateAvailableTimes(startDate, endDate, startHour, endHour, slotsPerHour, daysPerWeek, currentEvents) {
    const currentYear = startDate.getFullYear();
    const currentMonth = startDate.getMonth();

    const oppositeEventManager = new EventManager();
    let timeIncrement = Math.floor(60 / slotsPerHour);

    let start = new Date(currentYear, currentMonth, startDate.getDate());
    let end = new Date(currentYear, currentMonth, endDate.getDate());

    // Iterate through each day in the range
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
        // Skip days not worked
        if (!daysPerWeek.includes(currentDate.getDay())) continue;

        // Generate slots for each day
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minutes = 0; minutes < 60; minutes += timeIncrement) {
                let slotStart = new Date(currentDate);
                slotStart.setHours(hour, minutes, 0, 0);
                let slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + timeIncrement);

                let isOccupied = false;

                // Check if this slot overlaps with any current events
                for (let event of currentEvents.getEvents()) {
                    // Parse event date
					const eventDateParts = event.date.split("-");
					const eventYear = Number(eventDateParts[0]);
					const eventMonth = Number(eventDateParts[1]) - 1; // Months are zero-based in JavaScript
					const eventDay = Number(eventDateParts[2]);

					// Parse event start and end times
					const [eventStartHour, eventStartMinute] = event.startTime.split(":").map(Number);
					const [eventEndHour, eventEndMinute] = event.endTime.split(":").map(Number);

					// Create full Date objects for event start and end times
					let eventStart = new Date(eventYear, eventMonth, eventDay, eventStartHour, eventStartMinute, 0, 0);
					let eventEnd = new Date(eventYear, eventMonth, eventDay, eventEndHour, eventEndMinute, 0, 0);

					//console.log("Slot Start: ", slotStart, " Slot End: ", slotEnd, " Event Start: ", eventStart, " Event End: ", eventEnd);

					// Check if the slot overlaps with the event
					if (slotStart < eventEnd && slotEnd > eventStart) {
						isOccupied = true;
						break;
					}
                }

                // If the slot is not occupied, add it to the oppositeEventManager
                if (!isOccupied) {
                    const start = dateToHour(slotStart.getHours(), slotStart.getMinutes());
                    const end = dateToHour(slotEnd.getHours(), slotEnd.getMinutes());
                    const event = new Event(
                        `${start}`,
                        `${end}`,
                        `${formatDate(currentDate)}`,
                        `${formatTimeTo12Hour(slotStart.toTimeString().slice(0, 5))} - ${formatTimeTo12Hour(slotEnd.toTimeString().slice(0, 5))}`
                    );

                    oppositeEventManager.addEvent(event);
                }
            }
        }
    }
	//console.log("Opposite Events:", oppositeEventManager.getEvents());
    return oppositeEventManager;
  }
  
  function navigateView(direction, viewType) { // Iterates the week or month view
    const currentDate = calendar.getDate();
    let newDate = new Date(currentDate);

    if (viewType === 'dayGridMonth') {
        // Navigate by a month in the direction (-1 for previous, 1 for next)
        newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewType === 'timeGridWeek' || viewType === 'dayGridWeek') {
        // Navigate by a week in the direction
        newDate.setDate(newDate.getDate() + direction * 7);
    } else if (viewType === 'timeGridDay') {
        // Navigate by a single day in the direction
        newDate.setDate(newDate.getDate() + direction);
    } else {
        console.warn('Unsupported view type:', viewType);
        return;
    }

    // Navigate the calendar to the calculated date
    calendar.gotoDate(newDate);
  }

  function setupToolbar(isInitialView) {

    if (isInitialView) { // initial view
      const buttonGroups = document.querySelectorAll('.fc-button-group');
      const toolbarChunks = document.querySelectorAll('.fc-toolbar-chunk');

      buttonGroups[0].id = ('button-group-left-right');
      buttonGroups[1].id = ('button-group-view-mode');
      toolbarChunks[0].id = ('toolbar-chunk-left-right');
      toolbarChunks[1].id = ('toolbar-chunk-title');
      toolbarChunks[2].id = ('toolbar-chunk-view-mode');
    }

    // Place the profile image in the header toolbar
    const headerToolbar = document.querySelector('.fc-header-toolbar');
    const calendarLogo = document.getElementById('calendar-logo');
    if (headerToolbar && calendarLogo) {
      calendarLogo.style.display = 'flex'; // Ensure the image is displayed
      headerToolbar.insertBefore(calendarLogo, headerToolbar.firstChild);
      calendarLogo.classList.add('fc-toolbar-chunk');
    }

    // Move the today button to the left of the week and month buttons
    const todayWeekMonthButtonGroup = document.getElementById('button-group-view-mode');
    const titleButton = document.querySelector('.fc-today-button');
    if (todayWeekMonthButtonGroup && titleButton) {
      todayWeekMonthButtonGroup.insertBefore(titleButton, todayWeekMonthButtonGroup.firstChild);
    }
    
    // Move the left-right buttons to the left of the today, week, and month buttons
    const leftRightButtons = document.getElementById('button-group-left-right');
    const toolbarChunkViewMode = document.getElementById('toolbar-chunk-view-mode');
    if (leftRightButtons && toolbarChunkViewMode) {
      toolbarChunkViewMode.insertBefore(leftRightButtons, todayWeekMonthButtonGroup);
    }

    if (isInitialView) { // initial view
      const toolbarChunkLeftRight = document.getElementById('toolbar-chunk-left-right');
      toolbarChunkLeftRight.remove();
    }
  }

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
      startTime: getBusinessHours(startingWorkHour, false),
      endTime: getBusinessHours(endingWorkHour, false),
    },

    slotMinTime: getBusinessHours(startingWorkHour, true),
    slotMaxTime: getBusinessHours(endingWorkHour, true),

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
	  
	  var tempEventManager = new EventManager();
	  
	  if (lastViewType == null) { // Initial View
		// Variables
		lastViewType = currentViewType;
		
		//console.log("Initial View Loaded");
		//console.log("Initial Events:", eventManager.getEvents());
		
		if (startMonth == endMonth) {
      toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>-</wbr>&nbsp;${getOrdinal(endDate)},&nbsp;${year}`;
    } else {
      if (year == endYear) {
        toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>-</wbr>&nbsp;${endMonth} ${getOrdinal(endDate)},&nbsp;${year}`;
      } else {
        toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)},&nbsp;${year}&nbsp;<wbr>-</wbr>&nbsp;${endMonth}&nbsp;${getOrdinal(endDate)},&nbsp;${endYear}`;
      }
    }
		
    setupToolbar(true);
		adjustSlotHeight(calendarEl, totalSlots);
		addEvents(eventManager, calendar);
		
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

		tempEventManager = generateAvailableTimes(startDate, endDate, startingWorkHour, endingWorkHour, slotsPerHour, workingDays, eventManager);
		tempEventManager = consolidateEvents(tempEventManager);

    setupToolbar(false); // Setup the toolbar
		addEvents(tempEventManager, calendar);
		
		
		//console.log(table.rows);
		//console.log("Month Events:", tempEventManager.getEvents());
		
	  } else if ((lastViewType == 'dayGridMonth' && currentViewType == 'timeGridWeek') || // Month -> Week View
				(lastViewType == 'timeGridWeek' && currentViewType == 'timeGridWeek')){ // Week -> Week View

		// Variables
		lastViewType = currentViewType;
		
		//console.log("Week View Loaded");
		
		calendar.removeAllEvents();
		
		if (startMonth == endMonth) {
			toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>–</wbr>&nbsp;${getOrdinal(endDate)},&nbsp;${year}`;
		} else {
			if (year == endYear) {
				toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${getOrdinal(endDate)},&nbsp;${year}`;
			} else {
				toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}, ${year}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${getOrdinal(endDate)},&nbsp;${endYear}`;
			}
		}

    setupToolbar(false);
		adjustSlotHeight(calendarEl, totalSlots);
		addEvents(eventManager, calendar)
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
      const start = formatTimeTo12Hour(info.startStr.slice(11, 16));
      const end = formatTimeTo12Hour(info.endStr.slice(11, 16));
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

  window.addEventListener('resize', () => { // Dynamically sizes calendar when Window is resized
    requestAnimationFrame(() => {
      adjustSlotHeight(calendarEl, totalSlots);
  
      // Reload the view to force a re-render
      // This was necessary to fix the issue where the calendar would not resize properly when the window was resized vertically
      calendar.changeView(calendar.view.type);
    });
  });

  // Add event listener for orientation change to adjust slot height
  window.addEventListener('orientationchange', () => {
    adjustSlotHeight(calendarEl, totalSlots);
  });

  cancelButton.onclick = function() {
    modal.style.display = "none";
  };

  confirmButton.onclick = function() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const visitCategory = document.getElementById('visitCategory').value;
    const visitReason = document.getElementById('visitReason').value;

    function submitForm() {
        if (fullName && email && visitCategory) {
            const event = new Event(
                dateToHour(new Date(selectedInfo.startStr).getHours(), new Date(selectedInfo.startStr).getMinutes()),
                dateToHour(new Date(selectedInfo.endStr).getHours(), new Date(selectedInfo.endStr).getMinutes()),
                `${formatDate(new Date(selectedInfo.startStr))}`,
                `${visitCategory} Meeting for ${capitalizeWords(fullName)}`,
                fullName,
                email,
                visitCategory,
                visitReason
            );

            eventManager.addEvent(event);

            calendar.addEvent({
                title: event.title || "No Title",
                start: dateTime(event.date, event.startTime),
                end: dateTime(event.date, event.endTime),
                description: event.reasonForVisit, // Optional additional fields
                extendedProps: {
                    professor: event.professor,
                    category: event.meetingCategory,
                    fullName: event.fullName,
                    email: event.email
                }
            });

            modal.style.display = "none";
        } else {
            alert("Please fill in all fields.");
        }
    }

    submitForm();
};

// Add event listener for Enter key on modal
modal.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && modal.style.display !== 'none') {
        confirmButton.onclick();
    }
});

// Add event listener for Enter key on document
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && modal.style.display !== 'none') {
        confirmButton.onclick();
    }
});

// Show profile modal when calendar logo is clicked
calendarLogo.onclick = function() {
  profileModal.style.display = "block";
};

// Close profile modal when the close button is clicked
closeProfileModal.onclick = function() {
  profileModal.style.display = "none";
};
  
  // Listen for keydown events
  document.addEventListener('keydown', function(event) {
    // Close modal with Escape key
    if (event.key === 'Escape') {
      modal.style.display = 'none';
    } else if (event.key === 'ArrowLeft') {
      // Navigate to the next or previous view based on arrow keys
		navigateView(-1, calendar.view.type);
	} else if (event.key === 'ArrowRight') {
		navigateView(1, calendar.view.type);
	}
  });

  window.onclick = function(event) {
    // Close the modal if the user clicks outside of it
    if (event.target == modal) {
      modal.style.display = "none";
    } else if (event.target == profileModal) {
      profileModal.style.display = "none";
    }
  };

  // Handle Profile Settings button click
  profileSettingsButton.onclick = function() {
    alert("Profile Settings clicked");
    // Add your logic here
  };

  // Handle Settings button click
  settingsButton.onclick = function() {
    alert("Settings clicked");
    // Add your logic here
  };
});

