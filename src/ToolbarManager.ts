
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
        if (isInitialView) {
          this.setupInitialToolbar();
        }
    
        this.placeProfileImage();
        this.rearrangeTodayButton();
        this.rearrangeLeftRightButtons();
        this.removeLeftRightChunk();
        //this.replaceNavButtonText();
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
  
    private placeProfileImage(): void {
      const headerToolbar = document.querySelector(".fc-header-toolbar");
      const calendarLogo = document.getElementById("calendar-logo");
      if (headerToolbar && calendarLogo) {
        calendarLogo.style.display = "flex";
        headerToolbar.insertBefore(calendarLogo, headerToolbar.firstChild);
        calendarLogo.classList.add("fc-toolbar-chunk");
      }
    }
  
    private rearrangeTodayButton(): void {
      const todayWeekMonthButtonGroup = document.getElementById("button-group-view-mode");
      const todayButton = document.querySelector(".fc-today-button");
      if (todayWeekMonthButtonGroup && todayButton) {
        todayWeekMonthButtonGroup.insertBefore(todayButton, todayWeekMonthButtonGroup.firstChild);
      }
    }
  
    private rearrangeLeftRightButtons(): void {
      const leftRightButtons = document.getElementById("button-group-left-right");
      const toolbarChunkViewMode = document.getElementById("toolbar-chunk-view-mode");
      if (leftRightButtons && toolbarChunkViewMode && toolbarChunkViewMode.firstChild) {
      (toolbarChunkViewMode.firstChild as Element).insertAdjacentElement("afterend", leftRightButtons);
      }
    }
  
    private removeLeftRightChunk(): void {
      const toolbarChunkLeftRight = document.getElementById("toolbar-chunk-left-right");
      if (toolbarChunkLeftRight) {
        toolbarChunkLeftRight.remove();
      }
    }
  
    private replaceNavButtonText(): void {
      const prevButton = document.querySelector(".fc-prev-button");
      const nextButton = document.querySelector(".fc-next-button");
  
      if (prevButton) {
        prevButton.innerHTML = "<p>&lt;</p>";
      }
      if (nextButton) {
        nextButton.innerHTML = "<p>&gt;</p>";
      }
    }
  }
  