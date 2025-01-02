export class Event {
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
  
export class EventManager {
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

export function adjustSlotHeight(calendarEl, totalSlots) {
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

export function consolidateEvents(events) {
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

export function addEvents(tempEventManager, calendar) {
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

export function dateTime(date, time) {
  return `${date}T${time}`;
}

export function slotDuration(slotsPerHour) {
  if (slotsPerHour <= 1.0) {
    return "00:60:00";
  } else if (slotsPerHour >= 4.0) {
    return "00:15:00";
  }
  return "00:" + String(Math.floor(60 / slotsPerHour)).padStart(2, '0') + ":00";
}

export function getBusinessHours(workHour, extendedFormat) {
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

export function formatTimeTo12Hour(timeStr) {
  const [hour, minute] = timeStr.split(':');
  const hourInt = parseInt(hour, 10);
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  const formattedHour = hourInt % 12 || 12; // Convert 0 to 12 for AM
  return `${formattedHour}:${minute} ${ampm}`;
}

export function capitalizeWords(str) {
  return str.replace(/\b\w+\b/g, word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function getOrdinal(n) { // Function to get the ordinal suffix (e.g., 1st, 2nd, 3rd)
  const suffix = ["th", "st", "nd", "rd"];
  const value = n % 100;
  return n + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
}

export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed

  return `${year}-${month}-${day}`;
}

export function dateToHour(hour, minutes="00") {
  hour = hour >= 10 ? hour : `0${hour}`;
  minutes = minutes >= 10 ? minutes : `0${minutes}`;
  return `${hour}:${minutes}`;
}

export function sleep(ms) { // Not currently used
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateAvailableTimes(startDate, endDate, startHour, endHour, slotsPerHour, daysPerWeek, currentEvents) {
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

export function setupToolbar(isInitialView) {
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
    const todayButton = document.querySelector('.fc-today-button');
    if (todayWeekMonthButtonGroup && todayButton) {
      todayWeekMonthButtonGroup.insertBefore(todayButton, todayWeekMonthButtonGroup.firstChild);
    }
    
    // Move the left-right buttons to the left of the today, week, and month buttons
    const leftRightButtons = document.getElementById('button-group-left-right');
    const toolbarChunkViewMode = document.getElementById('toolbar-chunk-view-mode');
    if (leftRightButtons && toolbarChunkViewMode) {
      toolbarChunkViewMode.firstChild.insertAdjacentElement('afterend', leftRightButtons);
    }

    const toolbarChunkLeftRight = document.getElementById('toolbar-chunk-left-right');
    if (toolbarChunkLeftRight) {
      toolbarChunkLeftRight.remove();
    }

    // Replace span elements with p tags for prev and next buttons
    const prevButton = document.querySelector('.fc-prev-button');
    const nextButton = document.querySelector('.fc-next-button');

    if (prevButton) {
      prevButton.innerHTML = '<p>&lt;</p>'; // Replace with left chevron character
    }

    if (nextButton) {
      nextButton.innerHTML = '<p>&gt;</p>'; // Replace with right chevron character
    }
}