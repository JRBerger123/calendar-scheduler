import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarConfig } from './components/calendar/CalendarConfig';
import { CalendarManager } from './components/calendar/CalendarManager';

import './styles/style.scss';

const manager = new CalendarManager('calendar', new CalendarConfig());
manager.initialize();
manager.addEvent('New Event', '2025-04-30');
manager.changeView('timeGridWeek'); // Change to week view
manager.setMaxMeetingDuration(60); // Set max meeting duration to 60 minutes
