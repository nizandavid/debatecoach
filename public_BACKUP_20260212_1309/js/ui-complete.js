// ui.js - UI helper functions (UPDATED FOR NEW DESIGN)

import { clearTranscriptState } from "./recording.js";

// ============ UPDATED BUBBLE FUNCTION ============

export function addBubble(dom, state, who, text, extra = {}) {
  // Remove 'latest' class from all messages
  const allMessages = dom.conversationSection.querySelectorAll('.message');
  allMessages.forEach(msg => msg.classList.remove('latest'));
  
  const bubble = document.createElement('div');
  bubble.className = `message message-${who} latest`;
  
  // Avatar (outside the content box)
  const avatar = document.createElement('div');
  avatar.className = `message-avatar message-avatar-${who}`;
  
  const icon = document.createElement('span');
  icon.className = 'avatar-icon';
  // Simple icons: white silhouette for student, monitor for computer
  icon.textContent = who === 'computer' ? '🖥️' : who === 'student' ? '👤' : '';
  avatar.appendChild(icon);
  
  // Header (name + role tag, outside the content box)
  const header = document.createElement('div');
  header.className = 'message-header';
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'message-name';
  nameSpan.textContent = who === 'computer' ? 'AI Opponent' : who === 'student' ? 'You' : 'System';
  header.appendChild(nameSpan);
  
  // Add PRO/CON tag for computer and student
  if (who === 'computer' || who === 'student') {
    const roleTag = document.createElement('span');
    roleTag.className = 'message-role-tag';
    
    // Determine role based on stance
    if (who === 'computer') {
      roleTag.textContent = state.stance === 'PRO' ? 'CON' : 'PRO';
    } else {
      roleTag.textContent = state.stance || 'PRO';
    }
    
    header.appendChild(roleTag);
  }
  
  // Content box (white background with text)
  const contentBox = document.createElement('div');
  contentBox.className = 'message-content';
  contentBox.textContent = text;
  
  // Assemble: avatar + (header + content)
  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'message-inner';
  innerWrapper.appendChild(header);
  innerWrapper.appendChild(contentBox);
  
  bubble.appendChild(avatar);
  bubble.appendChild(innerWrapper);
  
  dom.conversationSection.appendChild(bubble);
  dom.conversationSection.scrollTop = dom.conversationSection.scrollHeight;

  // Save message to state
  if (who === 'student' || who === 'computer') {
    state.messages.push({
      who: who,
      text: text,
      timestamp: Date.now(),
      ...extra
    });
  }

  return bubble;
}

// ============ EXISTING FUNCTIONS (KEEP!) ============

export function clearInput(dom, state) {
  if (dom.manualInput) {
    dom.manualInput.value = '';
  }
  if (dom.transcriptDisplay) {
    dom.transcriptDisplay.textContent = 'Your transcript will appear here...';
    dom.transcriptDisplay.classList.add('empty');
  }
  
  // Clear recording state too
  clearTranscriptState();
  
  // Also clear state
  state.currentTranscript = '';
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
