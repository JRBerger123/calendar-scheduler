export function setupEventHandlers(calendar) {
  const selectBox = document.getElementById('visitCategory');
  const selectTrigger = selectBox.querySelector('.select-trigger');
  const selectOptions = selectBox.querySelector('.select-options');
  const hiddenInput = document.getElementById('visitCategory');
  const appointmentModal = document.getElementById('appointmentModal');
  const confirmButton = document.getElementById('confirmButton');
  const cancelButton = document.getElementById('cancelButton');
  const profileModal = document.getElementById('profileModal');
  const closeProfileappointmentModal = document.getElementById('closeProfileModal');
  const calendarLogo = document.getElementById('calendar-logo');

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

  // Functions for custom SelectBox
  selectTrigger.addEventListener('click', function() {
    selectOptions.style.display = selectOptions.style.display === 'flex' ? 'none' : 'flex';
  });

  selectOptions.addEventListener('click', function(event) {
    if (event.target.classList.contains('select-option')) {
      selectTrigger.textContent = event.target.textContent;
      hiddenInput.value = event.target.getAttribute('data-value');
      selectOptions.style.display = 'none';
    }
  });

  document.addEventListener('click', function(event) {
    if (!selectBox.contains(event.target)) {
      selectOptions.style.display = 'none';
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowDown' && document.activeElement === selectTrigger) {
      event.preventDefault();
    }
  });

  // Add event listener for Enter key on appointmentModal
  appointmentModal.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && appointmentModal.style.display !== 'none' && !confirmButton.disabled) {
      confirmButton.onclick();
    }
  });

  // Show profile appointmentModal when calendar logo is clicked
  calendarLogo.onclick = function() {
    profileModal.style.display = "block";
  };

  // Close profile appointmentModal when the close button is clicked
  closeProfileappointmentModal.onclick = function() {
    profileModal.style.display = "none";
  };

  // Handle Profile Settings button click
  const profileSettingsButton = document.getElementById('profileSettingsButton');
  profileSettingsButton.onclick = function() {
    alert("Profile Settings clicked");
    // Add your logic here
  };

  // Handle Settings button click
  const settingsButton = document.getElementById('settingsButton');
  settingsButton.onclick = function() {
    alert("Settings clicked");
    // Add your logic here
  };

  // Click events on Window
  window.onclick = function(event) {

    // Close modals when the user clicks outside the modal
    if (event.target == appointmentModal) {
      appointmentModal.style.display = "none";

    } else if (event.target == profileModal) {
      profileModal.style.display = "none";
    }
  };

  cancelButton.onclick = function() {
    appointmentModal.style.display = "none";
  };

  // Keydown events on document
  document.addEventListener('keydown', function(event) {
    const isAppointmentModalOpen = window.getComputedStyle(appointmentModal).display !== 'none';
    const isProfileModalOpen = window.getComputedStyle(profileModal).display !== 'none';

    if (isAppointmentModalOpen) {
      // Close appointmentModal with Escape key
      if (event.key === 'Escape') {
        appointmentModal.style.display = 'none';
      } else if (event.key === 'Enter' && !confirmButton.disabled) {
        confirmButton.onclick();
      }

    } else if (isProfileModalOpen) {
      // Close profileModal with Escape key
      if (event.key === 'Escape') {
        profileModal.style.display = 'none';
      }

    } else {
      // Navigate to the next or previous view based on arrow keys
      if (event.key === 'ArrowLeft') {
        navigateView(-1, calendar.view.type);
        console.log("left")
      } else if (event.key === 'ArrowRight') {
        navigateView(1, calendar.view.type);
        console.log("right")
      }
    }
  });
}