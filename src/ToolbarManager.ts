
/**
 * ToolbarManager class is responsible for managing the toolbar of the calendar. <p>
 * It handles the setup and rearrangement of toolbar elements based on the current view type.
 *
 * @export
 * @class ToolbarManager
 */
export class ToolbarManager {
  
    
    constructor() {}
  
    /**
     * Sets up the toolbar based on the current view type.
     * @param {boolean} isInitialView - Indicates if this is the initial view load.
     */
    public setupToolbar(isInitialView: boolean): void {
      // Setup parts of toolbar that only need setup once
      if (isInitialView) {
        this.setupInitialToolbar();
        this.placeProfileImage();
      }
    
      this.switchWeekAndMonthButtonOrder();
      this.rearrangeLeftRightButtons();
      this.rearrangeTodayButton();

      this.removeLeftRightChunk(); // Only needed once, but has to be called after rearranging buttons
      this.replaceNavButtonText();
      this.capitalizeViewModeButtons();
    }
    
    /**
     * Sets up the initial toolbar by assigning IDs to button groups and toolbar chunks.
     * This is necessary for rearranging elements later on.
     */
    private setupInitialToolbar(): void {
      const buttonGroups = document.querySelectorAll(".fc-button-group");
      const toolbarChunks = document.querySelectorAll(".fc-toolbar-chunk");
  
      if (buttonGroups.length >= 2 && toolbarChunks.length >= 3) {
        buttonGroups[0].id = "button-group-left-right";
        buttonGroups[1].id = "button-group-view-mode";

        toolbarChunks[0].id = "toolbar-chunk-left-right";
        toolbarChunks[1].id = "toolbar-chunk-title";
        toolbarChunks[2].id = "toolbar-chunk-view-mode";
      }
    }
  
    /**
     * Places the profile image in the header toolbar.
     * The profile image is expected to have an ID of "calendar-logo".
     */
    private placeProfileImage(): void {
      const headerToolbar = document.querySelector(".fc-header-toolbar");
      const calendarLogo = document.getElementById("calendar-logo");
      if (headerToolbar && calendarLogo) {
        calendarLogo.style.display = "flex";
        headerToolbar.insertBefore(calendarLogo, headerToolbar.firstChild);
        calendarLogo.classList.add("fc-toolbar-chunk");
      }
    }
  
    /**
     * Rearranges the today button to be the first button in the view mode button group.
     * This is necessary for proper alignment and functionality.
     */
    private rearrangeTodayButton(): void {
      const todayWeekMonthButtonGroup = document.getElementById("button-group-view-mode");
      const todayButton = document.querySelector(".fc-today-button");
      if (todayWeekMonthButtonGroup && todayButton) {
        todayWeekMonthButtonGroup.insertBefore(todayButton, todayWeekMonthButtonGroup.firstChild);
      }
    }
  
    /**
     * Rearranges the left and right buttons to be below the view mode button group.
     * This is necessary for proper alignment and functionality.
     */
    private rearrangeLeftRightButtons(): void {
      const leftRightButtons = document.getElementById("button-group-left-right");
      const toolbarChunkViewMode = document.getElementById("toolbar-chunk-view-mode");
      if (leftRightButtons && toolbarChunkViewMode && toolbarChunkViewMode.firstChild) {
      (toolbarChunkViewMode.firstChild as Element).insertAdjacentElement("afterend", leftRightButtons);
      }
    }

    /**
     * Removes the left and right button chunk from the toolbar.
     * This is necessary to avoid duplication and ensure proper functionality.
     */
    private removeLeftRightChunk(): void {
      const toolbarChunkLeftRight = document.getElementById("toolbar-chunk-left-right");
      if (toolbarChunkLeftRight) {
        toolbarChunkLeftRight.remove();
      }
    }
  
    /**
     * Replaces the text of the navigation buttons with custom HTML.
     * This is necessary for proper alignment and functionality.
     */
    private replaceNavButtonText(): void {
        const prevButton = document.querySelector(".fc-prev-button");
        const nextButton = document.querySelector(".fc-next-button");
    
        if (prevButton) {
            // Remove all child elements (e.g., spans) and set custom HTML
            prevButton.innerHTML = "&lt;";
        }
    
        if (nextButton) {
            // Remove all child elements (e.g., spans) and set custom HTML
            nextButton.innerHTML = "&gt;";
        }
    }

    /**
     * Capitalizes the first letter of the Today, Week, and Month buttons.
     */
    private capitalizeViewModeButtons(): void {
        const todayButton = document.querySelector(".fc-today-button");
        const weekButton = document.querySelector(".fc-timeGridWeek-button");
        const monthButton = document.querySelector(".fc-dayGridMonth-button");
    
        if (todayButton) {
            todayButton.textContent = "Today";
        }
    
        if (weekButton) {
            weekButton.textContent = "Week";
        }
    
        if (monthButton) {
            monthButton.textContent = "Month";
        }
    }

    /**
     * Switches the order of the Week and Month buttons in the view mode group.
     */
    private switchWeekAndMonthButtonOrder(): void {
      const buttonGroup = document.getElementById("button-group-view-mode");
      const weekButton = document.querySelector(".fc-timeGridWeek-button");
      const monthButton = document.querySelector(".fc-dayGridMonth-button");

      if (buttonGroup && weekButton && monthButton) {
        // Ensure both buttons are present in the container
        if (buttonGroup.contains(weekButton) && buttonGroup.contains(monthButton)) {
            buttonGroup.insertBefore(weekButton, monthButton);
        }
      }
    }
  }
  