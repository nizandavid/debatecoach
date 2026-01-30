// ui.js - UI helper functions (FIXED FOR EXISTING STRUCTURE)

// ============ EXISTING FUNCTIONS (KEEP!) ============

export function addBubble(dom, state, who, text, extra = {}) {
  const bubble = document.createElement('div');
  bubble.className = `message message-${who}`;
  
  const header = document.createElement('div');
  header.className = 'message-header';
  
  const icon = document.createElement('span');
  icon.className = 'message-icon';
  icon.textContent = who === 'computer' ? '🤖' : who === 'student' ? '👤' : 'ℹ️';
  
  const label = document.createElement('span');
  label.textContent = who === 'computer' ? 'Computer' : who === 'student' ? 'You' : 'System';
  
  header.appendChild(icon);
  header.appendChild(label);
  
  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = text;
  
  bubble.appendChild(header);
  bubble.appendChild(body);
  
  dom.conversationSection.appendChild(bubble);
  dom.conversationSection.scrollTop = dom.conversationSection.scrollHeight;
  
  return bubble;
}

export function clearInput(dom, state) {
  if (dom.manualInput) {
    dom.manualInput.value = '';
  }
  if (dom.transcriptDisplay) {
    dom.transcriptDisplay.textContent = 'Your transcript will appear here...';
    dom.transcriptDisplay.classList.add('empty');
  }
}

export function showInput(dom) {
  if (dom.inputSection) {
    dom.inputSection.classList.remove('hidden');
  }
}

export function hideInput(dom) {
  if (dom.inputSection) {
    dom.inputSection.classList.add('hidden');
  }
}

export function setTopicHeader(dom, state) {
  if (dom.currentTopicText && state.topic) {
    dom.currentTopicText.textContent = state.topic;
  }
  if (dom.debateTopicDisplay) {
    dom.debateTopicDisplay.classList.remove('hidden');
  }
}

export function showFeedbackSection(dom) {
  if (dom.feedbackSection) {
    dom.feedbackSection.classList.remove('hidden');
  }
}

export function hideFeedbackSection(dom) {
  if (dom.feedbackSection) {
    dom.feedbackSection.classList.add('hidden');
  }
}

// ============ NEW FUNCTIONS (ADDED!) ============

// Show error modal
export function showError(message, title = 'Error') {
  const errorOverlay = document.getElementById('errorOverlay');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const errorCancelBtn = document.getElementById('errorCancelBtn');
  const errorRetryBtn = document.getElementById('errorRetryBtn');
  
  if (!errorOverlay) {
    // Fallback to toast if modal not available
    showToast(message, 'error');
    return;
  }
  
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  errorOverlay.classList.remove('hidden');
  
  // Cancel button
  errorCancelBtn.onclick = () => {
    errorOverlay.classList.add('hidden');
  };
  
  // Retry button (default: just close)
  errorRetryBtn.onclick = () => {
    errorOverlay.classList.add('hidden');
  };
}

// Show loading state
export function showLoading(message = 'Loading...') {
  const loadingState = document.getElementById('loadingState');
  if (!loadingState) return;
  
  const loadingText = loadingState.querySelector('.loading-text');
  if (loadingText) {
    loadingText.textContent = message;
  }
  
  loadingState.classList.remove('hidden');
}

// Hide loading state
export function hideLoading() {
  const loadingState = document.getElementById('loadingState');
  if (!loadingState) return;
  loadingState.classList.add('hidden');
}

// Show success message
export function showSuccess(message) {
  showToast(message, 'success');
}

// Show info message
export function showInfo(message) {
  showToast(message, 'info');
}

// Toast notification
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toast) return;
  
  toastMessage.textContent = message;
  toast.className = 'toast show ' + type;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
