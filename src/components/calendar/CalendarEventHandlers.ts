import DayCellMountArg from '@fullcalendar/daygrid';
import { CalendarUtils } from './CalendarUtils';

/**
 * CalendarEventHandlers class for managing event handlers in FullCalendar.
 */
export class CalendarEventHandlers {
    private calendar: any;
    private calendarLogo: HTMLElement | null;
    private profileModal: HTMLElement | null;
    private appointmentModal: HTMLElement | null;
    private totalSlots: number;
    private utils: CalendarUtils;

    /**
     * Constructor for CalendarEventHandlers.
     * @param calendarInstance The FullCalendar instance to attach event handlers to.
     */
    constructor(calendarInstance: any, totalSlots: number) {
        this.calendar = calendarInstance;
        this.calendarLogo = document.getElementById("calendar-logo");
        this.profileModal = document.getElementById("profileModal");
        this.appointmentModal = document.getElementById("appointmentModal");
        this.totalSlots = totalSlots;

        this.utils = new CalendarUtils();        

        this.initializeEventHandlers();
    }

    /**
     * Initializes all event handlers.
     */
    private initializeEventHandlers(): void {
        this.setupClickHandlers();
        this.setupKeydownHandlers();
        this.setupWindowHandlers(this.calendar.el);
    }

    /**
     * Sets up all click event handlers.
     */
    private setupClickHandlers(): void {
        this.addNavigationClickHandlers();
        this.addProfileModalClickHandlers();
        this.addGlobalClickHandlers();
    }

    /**
     * Sets up all keydown event handlers.
     */
    private setupKeydownHandlers(): void {
        this.addKeyHandlers();
    }

    //#region -------------------- CLICK HANDLERS --------------------

    /**
     * Adds click event listeners for navigation buttons.
     */
    private addNavigationClickHandlers(): void {
        const prevButton = document.getElementById("prevButton");
        const nextButton = document.getElementById("nextButton");

        if (prevButton) {
            prevButton.addEventListener("click", () => {
                this.navigateView(-1, this.calendar.view.type);
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                this.navigateView(1, this.calendar.view.type);
            });
        }
    }

    /**
     * Adds click event listeners for the profile modal.
     */
    private addProfileModalClickHandlers(): void {
        if (this.calendarLogo) {
            this.calendarLogo.addEventListener("click", () => {
            this.openModal(this.profileModal);
            });
        } else {
            console.warn("Calendar logo element not found.");
        }
        
        const settingsBtn = document.getElementById("profileSettingsButton");
        if (settingsBtn) {
            settingsBtn.addEventListener("click", () => {
            window.location.href = "/faculty-settings.html";
            });
        } else {
            console.warn("Profile settings button not found.");
        }
    }
      

    /**
     * Adds global click event listeners for closing modals when clicking outside.
     */
    private addGlobalClickHandlers(): void {
        window.addEventListener("click", (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (this.profileModal && target === this.profileModal) {
                this.closeModal(this.profileModal);
            }

            if (this.appointmentModal && target === this.appointmentModal) {
                this.closeModal(this.appointmentModal);
            }
        });
    }

    //#endregion

    //#region -------------------- WINDOW HANDLERS --------------------

    private setupWindowHandlers(calendarEl: HTMLElement): void {
        window.addEventListener("resize", () => {
            // Dynamically sizes calendar when Window is resized
            requestAnimationFrame(() => {
            this.utils.adjustSlotHeight(calendarEl, this.totalSlots);
        
            // Reload the view to force a re-render
            // This was necessary to fix the issue where the calendar would not resize properly when the window was resized vertically
            this.calendar.changeView(this.calendar.view.type);
            });
        });
        
        // Add event listener for orientation change to adjust slot height
        window.addEventListener("orientationchange", () => {
            this.utils.adjustSlotHeight(calendarEl, this.totalSlots);
        });
    }

    //#endregion

    //#region -------------------- KEYDOWN HANDLERS --------------------

    /**
     * Adds keydown event listeners.
     */
    private addKeyHandlers(): void {
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            switch (event.key) {
                case "Escape":
                    if (this.isModalOpen(this.profileModal)) {
                        this.closeModal(this.profileModal);
                    } else if (this.isModalOpen(this.appointmentModal)) {
                        this.closeModal(this.appointmentModal);
                    }
                    break;
                case "Enter":
                    if (this.appointmentModal && this.isModalOpen(this.appointmentModal)) {
                        // TODO: Handle appointment creation logic here
                    } else if (this.profileModal && this.isModalOpen(this.profileModal)) {
                        // TODO: Handle profile update logic here
                    }
                    break;
                case "ArrowLeft":
                    if (this.calendarLogo && this.isModalOpen(this.profileModal)) {
                        //TODO: Handle profile modal navigation logic here
                    } else if (this.calendarLogo && !this.isModalOpen(this.appointmentModal)) {
                        this.navigateView(-1, this.calendar.view.type);
                    }
                    break;
                case "ArrowRight":
                    if (this.calendarLogo && this.isModalOpen(this.profileModal)) {
                        //TODO: Handle profile modal navigation logic here
                    } else if (this.calendarLogo && !this.isModalOpen(this.appointmentModal)) {
                        this.navigateView(1, this.calendar.view.type);
                    }
                    break;
            }
        });
    }

    //#endregion

    //#region -------------------- UTILITY METHODS --------------------

    /**
     * Navigates the calendar view based on direction and view type.
     * @param direction -1 for previous, 1 for next
     * @param viewType Calendar view type (default 'dayGridMonth')
     */
    public navigateView(direction: number, viewType: string = "dayGridMonth"): void {
        const currentDate: Date = this.calendar.getDate();
        const newDate: Date = new Date(currentDate);

        switch (viewType) {
            case "dayGridMonth":
                newDate.setMonth(newDate.getMonth() + direction);
                break;
            case "timeGridWeek":
            case "dayGridWeek":
                newDate.setDate(newDate.getDate() + direction * 7);
                break;
            case "timeGridDay":
                newDate.setDate(newDate.getDate() + direction);
                break;
            default:
                console.warn("Unsupported view type:", viewType);
                return;
        }

        this.calendar.gotoDate(newDate);
    }

    /**
     * Opens a modal by setting its display style to 'block'.
     * @param modal The modal element to open.
     */
    private openModal(modal: HTMLElement | null): void {
        if (modal) {
            modal.style.display = "block";
        }
    }

    /**
     * Closes a modal by setting its display style to 'none'.
     * @param modal The modal element to close.
     */
    private closeModal(modal: HTMLElement | null): void {
        if (modal && this.isModalOpen(modal)) {
            modal.style.display = "none";
        }
    }

    /**
     * Checks if a modal is currently open.
     * @param modal The modal element to check.
     * @returns True if the modal is open, false otherwise.
     */
    private isModalOpen(modal: HTMLElement | null): boolean {
        if (!modal) {
            return false;
        }
        return window.getComputedStyle(modal).display !== "none";
    }

    //#endregion
}