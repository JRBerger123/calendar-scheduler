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

Clicking the day on Month View sends you to week mode of that day
	- Doesn't work on current month in month view
Create an offset from current time to schedule new appointments
Make days with no Available timeslots unselectable in Month View
Create animation for showing part of Modal GUI not being filled out
Create timer that greys out event and makes it unselectable after timer expires (upload event to server)
Make mobile friendly
Create Login for Faculty Settings
Fix text-wrap on title
Fix Available timeslots not using the entire day div
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

function adjustSlotHeight(calendarEl, totalSlots) { // Function to dynamically adjust slot height
  const timeGridSlots = calendarEl.querySelector('.fc-timegrid-slots');
  const headerToolbar = calendarEl.querySelector('.fc-header-toolbar');
  
  if (!timeGridSlots || !headerToolbar) return; // Ensure both elements exist

  // Get the full header height including padding and margin
  const headerStyles = window.getComputedStyle(headerToolbar);
  const headerHeight = headerToolbar.offsetHeight
    + parseInt(headerStyles.marginTop)
    + parseInt(headerStyles.marginBottom)
    + parseInt(headerStyles.paddingTop)
    + parseInt(headerStyles.paddingBottom);  // Include margins and padding

  const availableHeight = calendarEl.offsetHeight;  // Full available height of the calendar
  const dayHeaderHeight = 25;
  const totalSlotHeight = availableHeight - headerHeight - dayHeaderHeight;  // Subtract header height from available space
  const timeSlots = calendarEl.querySelectorAll('.fc-timegrid-slot')

  if (totalSlots > 0) {
    const slotHeight = totalSlotHeight / totalSlots;  // Divide remaining height by number of slots
	//console.log(`Available height: ${availableHeight}, Header height: ${headerHeight}, Slot height: ${slotHeight}`);

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
        eventElement.style.top = `${eventTop}px`;
        eventElement.style.height = `${eventHeight}px`;
		eventElement.offsetHeight; // Trigger a reflow
		
	    console.log(`Event start: ${eventStart}, Event end: ${eventEnd}, Event height: ${eventHeight}, Event top: ${eventTop}`)
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
  let lastViewType = null;  // Variable to track the last view type

  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('appointmentModal');
  const closeModal = document.getElementById('closeModal');
  const confirmButton = document.getElementById('confirmButton');
  const cancelButton = document.getElementById('cancelButton');
  const selectedTime = document.getElementById('selectedTime');

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

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
	
	dateClick: function(info) {
	  // Change view to week view of clicked day on month view
	  // *Currently not working on current month of month view
      const clickedDate = new Date(info.date); // The clicked date
      const currentViewType = calendar.view.type;
	  
	  if (currentViewType == 'dayGridMonth'){
		//console.log("Date clicked:", info.dateStr); // Verify the callback is triggered
		calendar.changeView('timeGridWeek', info.date); // Change to week view of clicked day
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
	  console.log("Date Change Detected");
	  // Get the current view from FullCalendar
	  const currentViewType = dateInfo.view.type;
	  const view = calendar.view;

	  // Get the start and end of the week
	  const firstDay = view.currentStart;
	  const lastDay = view.currentEnd;
	  
	  // Adjust for weekends
	  firstDay.setDate(firstDay.getDate() + 1);
	  lastDay.setDate(lastDay.getDate() - 2);

	  // Format the dates in the desired format (e.g., Dec 9th – 13th, 2024)
	  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

	  // Format the first and last days
	  const formattedFirstDay = firstDay.toLocaleDateString('en-US', options);
	  const formattedLastDay = lastDay.toLocaleDateString('en-US', options);

	  // Format the date range for the title
	  const startDate = firstDay.getDate();
	  const endDate = lastDay.getDate();
	  const startMonth = firstDay.toLocaleString('default', { month: 'short' });
	  const endMonth = lastDay.toLocaleString('default', { month: 'short' });
	  const year = firstDay.getFullYear();
	  const endYear = lastDay.getFullYear();
	  
	  //console.log("Start Year: ", year, " End Year: ", endYear);
	  
	  const daysVisible = (endDate.valueOf() - startDate.valueOf()) / (1000 * 60 * 60 * 24);
	  const toolbarTitle = document.querySelector('.fc-toolbar-title');
	  const titleButton = document.querySelector('.fc-today-button');
	  const weekButton = document.querySelector('.fc-timeGridWeek-button');
	  const monthButton = document.querySelector('.fc-dayGridMonth-button');
	  
	  var tempEventManager = new EventManager();
	  
	  //console.log(`${daysVisible}`);
	  //console.log(`Last View: ${lastViewType}, Current View: ${currentViewType}`);
	  
	  if (lastViewType == null) { // Initial View
		// Variables
		lastViewType = currentViewType;
		
		//console.log("Initial View Loaded");
		//console.log("Initial Events:", eventManager.getEvents());
		
		titleButton.textContent = 'Today';
		weekButton.textContent = 'Week';
		monthButton.textContent = 'Month';
		
		if (startMonth == endMonth) {
      toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>-</wbr>&nbsp;${getOrdinal(endDate)},&nbsp;${year}`;
    } else {
      if (year == endYear) {
        toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>-</wbr>&nbsp;${endMonth} ${getOrdinal(endDate)},&nbsp;${year}`;
      } else {
        toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)},&nbsp;${year}&nbsp;<wbr>-</wbr>&nbsp;${endMonth}&nbsp;${getOrdinal(endDate)},&nbsp;${endYear}`;
      }
    }
		
		adjustSlotHeight(calendarEl, totalSlots); // Adjusts slot height
		addEvents(eventManager, calendar);
		
	  } else if ((lastViewType == 'timeGridWeek' && currentViewType == 'dayGridMonth') || // Week -> Month View
				(lastViewType == 'dayGridMonth' && currentViewType == 'dayGridMonth')) { // Month -> Month View
		// Variables
		const today = new Date();
		const currentDate = calendar.getDate(); // Get the current date displayed on the calendar
		const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of the current month
		let startDate;
		
		titleButton.textContent = 'Today';
		weekButton.textContent = 'Week';
		monthButton.textContent = 'Month';
		
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
		addEvents(tempEventManager, calendar);
		
		
		//console.log(table.rows);
		//console.log("Month Events:", tempEventManager.getEvents());
		
	  } else if ((lastViewType == 'dayGridMonth' && currentViewType == 'timeGridWeek') || // Month -> Week View
				(lastViewType == 'timeGridWeek' && currentViewType == 'timeGridWeek')){ // Week -> Week View
		// Variables
		lastViewType = currentViewType;
		
		//console.log("Week View Loaded");
		
		calendar.removeAllEvents();
		
		titleButton.textContent = 'Today';
		weekButton.textContent = 'Week';
		monthButton.textContent = 'Month';
		
		if (startMonth == endMonth) {
			toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>–</wbr>&nbsp;${getOrdinal(endDate)},&nbsp;${year}`;
		} else {
			if (year == endYear) {
				toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${getOrdinal(endDate)},&nbsp;${year}`;
			} else {
				toolbarTitle.innerHTML = `${startMonth}&nbsp;${getOrdinal(startDate)}, ${year}&nbsp;<wbr>–</wbr>&nbsp;${endMonth}&nbsp;${getOrdinal(endDate)},&nbsp;${endYear}`;
			}
		}
		adjustSlotHeight(calendarEl, totalSlots);
		
		addEvents(eventManager, calendar)
	  }
	  
	  //calendar.render(); // Trigger a render update if needed
	  
	  events: tempEventManager.getEvents(); // Use formatted events
	},
	
	eventDidMount: function(info) {
		console.log("Render Detected")
		//console.log("eventDidMount triggered for", info.event);
		const currentViewType = info.view.type;
		if (currentViewType == 'dayGridMonth') {
			const table = document.querySelector('.fc-scrollgrid-sync-table');
			const rows = table.querySelectorAll('tr[role="row"]');

			for (let index = rows.length - 1; index >= 0; index--) {
			  const row = rows[index];
			  
			  //console.log("Processing Row:", row);
			  const cells = row.querySelectorAll('td');

			  if (cells.length === 0) {
				//console.log("No cells found in this row, skipping.");
				return;
			  }

			  const allDisabled = Array.from(cells).every(cell => cell.classList.contains('fc-day-disabled'));
			  //console.log("All cells disabled:", allDisabled);

			  if (allDisabled) {
				//console.log("Removing row:", row);
				//table.deleteRow(index);
				row.style.display = 'none';
				//console.log(table.rows);
			  }
			};
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
      return (
        selectInfo.start.getHours() >= startingWorkHour &&
        selectInfo.end.getHours() <= endingWorkHour &&
        (duration === 30 || duration === 60)
      );
    },

    selectOverlap: false,
	showNonCurrentDates: false,
    displayEventTime: false,

    events: [] // Start with an empty array
  }); // End of calendar
  
  calendar.render();

  window.addEventListener('resize', () => { // Dynamically sizes calendar when Window is resized
    requestAnimationFrame(() => adjustSlotHeight(calendarEl, totalSlots));
  });

  cancelButton.onclick = function() {
    modal.style.display = "none";
  };

  confirmButton.onclick = function() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const visitCategory = document.getElementById('visitCategory').value;
    const visitReason = document.getElementById('visitReason').value;

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
	  
	  //console.log("Added Event:", event);
		
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
  };
  
  // Listen for keydown events
  document.addEventListener('keydown', function(event) {
    // Check if the pressed key is the Escape key (key code 27)
    if (event.key === 'Escape') {
      // Close the modal
      modal.style.display = 'none';
    } else if (event.key === 'ArrowLeft') {
		navigateView(-1, calendar.view.type);
	} else if (event.key === 'ArrowRight') {
		navigateView(1, calendar.view.type);
	}
  });

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});

