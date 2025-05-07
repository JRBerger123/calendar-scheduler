export class FacultySettingsManager {
    private classesContainer: HTMLElement;
    private officeHoursContainer: HTMLElement;
  
    constructor() {
      this.classesContainer = document.getElementById("classesContainer")!;
      this.officeHoursContainer = document.getElementById("officeHoursContainer")!;
      this.setupImageUploadPreview();
    }
  
    // ------------------------- PUBLIC METHODS -------------------------
  
    public handleDelegatedEvents(): void {
      document.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
  
        // Add class
        if (target.id === "addClassBtn") {
          e.preventDefault();
          this.addClassBlock();
        }
  
        // Add office hour
        if (target.id === "addOfficeHourBtn") {
          e.preventDefault();
          this.addOfficeHourBlock();
        }
  
        // Add class time
        const addTimeId = target.getAttribute("data-add-time");
        if (addTimeId) {
          e.preventDefault();
          this.addClassTime(addTimeId);
        }
  
        // Remove element
        const removeId = target.getAttribute("data-remove");
        if (removeId) {
          e.preventDefault();
          document.getElementById(removeId)?.remove();
        }
  
        // Save
        if (target.id === "saveSettingsBtn") {
          e.preventDefault();
          this.saveSettings();
        }
  
        // Reset
        if (target.id === "resetSettingsBtn") {
          e.preventDefault();
          this.resetSettings();
        }
  
        // Cancel
        if (target.id === "cancelSettingsBtn") {
          e.preventDefault();
          this.cancelSettings();
        }
      });
    }
  
    public addClassBlock(): void {
      const classId = `class-${Date.now()}`;
      const wrapper = document.createElement("div");
      wrapper.className = "p-4 border rounded-xl bg-gray-50 space-y-4";
      wrapper.id = classId;
  
      wrapper.innerHTML = `
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold">New Class</h4>
          <button type="button" class="text-red-600 text-sm hover:underline" data-remove="${classId}">Remove Class</button>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="block">
            <span class="text-sm font-medium">Class Title</span>
            <input type="text" class="input-style" placeholder="e.g. Data Structures" />
          </label>
          <label class="block">
            <span class="text-sm font-medium">Building</span>
            <input type="text" class="input-style" placeholder="e.g. Science Hall" />
          </label>
          <label class="block">
            <span class="text-sm font-medium">Room Number</span>
            <input type="text" class="input-style" placeholder="e.g. 204" />
          </label>
        </div>
  
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <h5 class="font-medium">Class Times</h5>
            <button type="button" class="text-blue-600 text-sm hover:underline" data-add-time="${classId}">+ Add Class Time</button>
          </div>
          <div class="space-y-2" id="${classId}-times"></div>
        </div>
      `;
  
      this.classesContainer.appendChild(wrapper);
      this.addClassTime(classId);
    }
  
    public addClassTime(classId: string): void {
        const timesContainer = document.getElementById(`${classId}-times`);
        const timeId = `${classId}-time-${Date.now()}`;
        
        const block = document.createElement("div");
        block.className = "grid grid-cols-1 md:grid-cols-4 gap-2 items-end";
        block.id = timeId;
        
        const useLabels = timesContainer?.childElementCount === 0;
        
        block.innerHTML = `
            <label class="block">
            ${useLabels ? '<span class="text-sm font-medium">Day</span>' : ''}
            <select class="input-style">
                <option value="">Select</option>
                <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                <option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
            </select>
            </label>
            <label class="block">
            ${useLabels ? '<span class="text-sm font-medium">Start Time</span>' : ''}
            <input type="time" class="input-style" />
            </label>
            <label class="block">
            ${useLabels ? '<span class="text-sm font-medium">End Time</span>' : ''}
            <input type="time" class="input-style" />
            </label>
            <button type="button" class="text-red-600 text-sm hover:underline mb-1" data-remove="${timeId}">
            Remove
            </button>
        `;
        
        timesContainer?.appendChild(block);
        
        // Clone values from previous input if available
        if (timesContainer && timesContainer.children.length > 1) {
            const previous = timesContainer.children[timesContainer.children.length - 2];
            const newInputs = block.querySelectorAll('input, select');
            const oldInputs = previous.querySelectorAll('input, select');
        
            newInputs.forEach((inputEl, i) => {
            const newEl = inputEl as HTMLInputElement | HTMLSelectElement;
            const oldEl = oldInputs[i] as HTMLInputElement | HTMLSelectElement;
            if (newEl && oldEl) {
                newEl.value = oldEl.value;
            }
            });
        }
    }
      
  
    public addOfficeHourBlock(): void {
      const blockId = `office-hour-${Date.now()}`;
      const wrapper = document.createElement("div");
      wrapper.className = "grid grid-cols-1 md:grid-cols-4 gap-2 items-end";
      wrapper.id = blockId;
  
      wrapper.innerHTML = `
        <label class="block">
          <span class="text-sm font-medium">Day</span>
          <select class="input-style">
            <option value="">Select</option>
            <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
            <option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm font-medium">Start Time</span>
          <input type="time" class="input-style" />
        </label>
        <label class="block">
          <span class="text-sm font-medium">End Time</span>
          <input type="time" class="input-style" />
        </label>
        <button type="button" class="text-red-600 text-sm hover:underline mb-1" data-remove="${blockId}">
          Remove
        </button>
      `;
  
      this.officeHoursContainer?.appendChild(wrapper);
    }
  
    // ------------------------- PLACEHOLDER ACTION METHODS -------------------------
  
    public saveSettings(): void {
      console.log("Saving settings...");
      // TODO: Gather data from inputs and persist (e.g., API, localStorage)
    }
  
    public resetSettings(): void {
      console.log("Resetting settings...");
      // TODO: Clear or restore defaults to inputs
    }
  
    public cancelSettings(): void {
      console.log("Cancelling settings...");
      window.location.href = "/index.html";
    }
  
    // ------------------------- UTILITY METHODS -------------------------
  
    private setupImageUploadPreview(): void {
        const fileInput = document.getElementById("profileImageInput") as HTMLInputElement | null;
        const canvas = document.getElementById("profileImageCanvas") as HTMLCanvasElement | null;
        const nameInput = document.getElementById("professorName") as HTMLInputElement | null;
        
        if (!fileInput || !canvas || !nameInput) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        fileInput.addEventListener("change", function () {
            const file = fileInput.files?.[0];
            if (!file) return;
        
            const reader = new FileReader();
            reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                // Resize + center
                canvas.width = 120;
                canvas.height = 120;
        
                // Clear and draw circular mask
                ctx.clearRect(0, 0, 120, 120);
                ctx.save();
                ctx.beginPath();
                ctx.arc(60, 60, 60, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
        
                // Calculate scaling to fill canvas
                const scale = Math.max(120 / img.width, 120 / img.height);
                const x = (120 - img.width * scale) / 2;
                const y = (120 - img.height * scale) / 2;
        
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                ctx.restore();
        
                // Show canvas
                canvas.classList.remove("hidden");
        
                // Optional: Rename file logic
                const professorName = nameInput.value.trim().replace(/\s+/g, '_').toLowerCase();
                const ext = file.name.split('.').pop();
                const renamed = `${professorName || 'profile'}_photo.${ext}`;
                console.log("Renamed image:", renamed);
        
                // Optionally: Save as blob or dataURL
                // const dataURL = canvas.toDataURL("image/png");
                // or export blob via canvas.toBlob()
            };
            img.src = e.target?.result as string;
            };
        
            reader.readAsDataURL(file);
        });
    }
  }
  