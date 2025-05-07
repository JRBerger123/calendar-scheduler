var c=Object.defineProperty;var p=(a,e,t)=>e in a?c(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var o=(a,e,t)=>p(a,typeof e!="symbol"?e+"":e,t);import"./assets/modulepreload-polyfill-B5Qt9EMX.js";class r{constructor(){o(this,"classesContainer");o(this,"officeHoursContainer");this.classesContainer=document.getElementById("classesContainer"),this.officeHoursContainer=document.getElementById("officeHoursContainer"),this.setupImageUploadPreview()}handleDelegatedEvents(){document.addEventListener("click",e=>{var i;const t=e.target;t.id==="addClassBtn"&&(e.preventDefault(),this.addClassBlock()),t.id==="addOfficeHourBtn"&&(e.preventDefault(),this.addOfficeHourBlock());const s=t.getAttribute("data-add-time");s&&(e.preventDefault(),this.addClassTime(s));const n=t.getAttribute("data-remove");n&&(e.preventDefault(),(i=document.getElementById(n))==null||i.remove()),t.id==="saveSettingsBtn"&&(e.preventDefault(),this.saveSettings()),t.id==="resetSettingsBtn"&&(e.preventDefault(),this.resetSettings()),t.id==="cancelSettingsBtn"&&(e.preventDefault(),this.cancelSettings())})}addClassBlock(){const e=`class-${Date.now()}`,t=document.createElement("div");t.className="p-4 border rounded-xl bg-gray-50 space-y-4",t.id=e,t.innerHTML=`
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold">New Class</h4>
          <button type="button" class="text-red-600 text-sm hover:underline" data-remove="${e}">Remove Class</button>
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
            <button type="button" class="text-blue-600 text-sm hover:underline" data-add-time="${e}">+ Add Class Time</button>
          </div>
          <div class="space-y-2" id="${e}-times"></div>
        </div>
      `,this.classesContainer.appendChild(t),this.addClassTime(e)}addClassTime(e){const t=document.getElementById(`${e}-times`),s=`${e}-time-${Date.now()}`,n=document.createElement("div");n.className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end",n.id=s,n.innerHTML=`
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
        <button type="button" class="text-red-600 text-sm hover:underline mb-1" data-remove="${s}">
          Remove
        </button>
      `,t==null||t.appendChild(n)}addOfficeHourBlock(){var s;const e=`office-hour-${Date.now()}`,t=document.createElement("div");t.className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end",t.id=e,t.innerHTML=`
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
        <button type="button" class="text-red-600 text-sm hover:underline mb-1" data-remove="${e}">
          Remove
        </button>
      `,(s=this.officeHoursContainer)==null||s.appendChild(t)}saveSettings(){console.log("Saving settings...")}resetSettings(){console.log("Resetting settings...")}cancelSettings(){console.log("Cancelling settings...")}setupImageUploadPreview(){const e=document.getElementById("profileImageInput"),t=document.getElementById("profileImagePreview");!e||!t||e.addEventListener("change",function(){var n;const s=(n=e.files)==null?void 0:n[0];if(s){const i=new FileReader;i.onload=function(d){var l;t.src=(l=d.target)==null?void 0:l.result,t.classList.remove("hidden")},i.readAsDataURL(s)}})}}const m=new r;m.handleDelegatedEvents();
