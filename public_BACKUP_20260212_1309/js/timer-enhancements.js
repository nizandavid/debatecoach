// timer-enhancements.js - Enhanced timer with warnings and notifications

let timerWarningShown = false;
let timerDangerShown = false;

export function updateTimerDisplay(seconds, timerDisplay) {
  if (!timerDisplay) return;
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  
  // Update timer appearance based on time remaining
  timerDisplay.classList.remove('warning', 'danger');
  
  if (seconds <= 30) {
    timerDisplay.classList.add('danger');
    if (!timerDangerShown) {
      showTimerNotification('⏰ 30 seconds left!', 'danger');
      timerDangerShown = true;
    }
  } else if (seconds <= 60) {
    timerDisplay.classList.add('warning');
    if (!timerWarningShown) {
      showTimerNotification('⏱️ 1 minute left!', 'warning');
      timerWarningShown = true;
    }
  }
}

export function resetTimerWarnings() {
  timerWarningShown = false;
  timerDangerShown = false;
}

function showTimerNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `timer-notification timer-notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

export function setupTimerControls(state) {
  const timerSection = document.getElementById('timerSection');
  const timerDisplay = document.getElementById('timerDisplay');
  
  if (!timerSection || !timerDisplay) return;
  
  // Add pause/resume button
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'btn btn-sm btn-secondary timer-pause-btn hidden';
  pauseBtn.id = 'timerPauseBtn';
  pauseBtn.textContent = '⏸️ Pause';
  
  timerSection.appendChild(pauseBtn);
  
  pauseBtn.addEventListener('click', () => {
    if (state.timerPaused) {
      resumeTimer(state, pauseBtn);
    } else {
      pauseTimer(state, pauseBtn);
    }
  });
}

function pauseTimer(state, pauseBtn) {
  state.timerPaused = true;
  pauseBtn.textContent = '▶️ Resume';
  pauseBtn.classList.add('paused');
}

function resumeTimer(state, pauseBtn) {
  state.timerPaused = false;
  pauseBtn.textContent = '⏸️ Pause';
  pauseBtn.classList.remove('paused');
}

export function showTimerPauseButton() {
  const pauseBtn = document.getElementById('timerPauseBtn');
  if (pauseBtn) {
    pauseBtn.classList.remove('hidden');
  }
}

export function hideTimerPauseButton() {
  const pauseBtn = document.getElementById('timerPauseBtn');
  if (pauseBtn) {
    pauseBtn.classList.add('hidden');
  }
}
