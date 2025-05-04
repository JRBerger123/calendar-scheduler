import { CalendarConfig } from './components/calendar/CalendarConfig';
import { CalendarManager } from './components/calendar/CalendarManager';

import './styles/style.scss';

const manager = new CalendarManager('calendar', new CalendarConfig());
manager.initialize();
manager.setMaxMeetingDuration(60); // Set max meeting duration to 60 minutes

document.addEventListener("DOMContentLoaded", () => {
    manager.changeView('week'); // Change to week view
});
