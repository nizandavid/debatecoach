// progress-tracker.js - Track user progress and statistics

// Load progress from localStorage
export function loadProgress() {
  const saved = localStorage.getItem('debatecoach_progress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return getDefaultProgress();
    }
  }
  return getDefaultProgress();
}

function getDefaultProgress() {
  return {
    debatesCompleted: 0,
    totalArguments: 0,
    responseTimes: [],
    lastDebateDate: null
  };
}

// Save progress to localStorage
export function saveProgress(progress) {
  localStorage.setItem('debatecoach_progress', JSON.stringify(progress));
}

// Update progress display
export function updateProgressDisplay(progress) {
  const debatesCount = document.getElementById('debatesCount');
  const argumentsCount = document.getElementById('argumentsCount');
  const avgTime = document.getElementById('avgTime');
  
  if (debatesCount) {
    debatesCount.textContent = progress.debatesCompleted;
  }
  
  if (argumentsCount) {
    argumentsCount.textContent = progress.totalArguments;
  }
  
  if (avgTime && progress.responseTimes.length > 0) {
    const avg = progress.responseTimes.reduce((a, b) => a + b, 0) / progress.responseTimes.length;
    avgTime.textContent = formatTime(avg);
  } else if (avgTime) {
    avgTime.textContent = '--';
  }
}

function formatTime(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

// Record when debate is completed
export function recordDebateComplete(progress, state) {
  progress.debatesCompleted++;
  progress.totalArguments += (state.turnIndex || 0);
  progress.lastDebateDate = Date.now();
  saveProgress(progress);
  updateProgressDisplay(progress);
}

// Record response time
export function recordResponseTime(progress, timeInSeconds) {
  progress.responseTimes.push(timeInSeconds);
  // Keep only last 50 response times
  if (progress.responseTimes.length > 50) {
    progress.responseTimes.shift();
  }
  saveProgress(progress);
  updateProgressDisplay(progress);
}

// Show progress tracker
export function showProgressTracker() {
  const tracker = document.getElementById('progressTracker');
  if (tracker) {
    tracker.classList.remove('hidden');
  }
}

// Hide progress tracker
export function hideProgressTracker() {
  const tracker = document.getElementById('progressTracker');
  if (tracker) {
    tracker.classList.add('hidden');
  }
}

// Initialize progress tracker
export function initProgressTracker() {
  const progress = loadProgress();
  updateProgressDisplay(progress);
  return progress;
}
