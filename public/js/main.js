import { state } from "./state.js";
import { dom, selectedTurnMinutes } from "./dom.js";
import { initAccordion } from "./accordion.js";
import { initTTS, stopSpeaking, unlockTTS } from "./tts.js";
import { fetchTopics, getFeedback } from "./api.js";
import { showToast } from "./toast.js";
import { startSession, endDebateEarly, switchSides, studentSend } from "./flow.js";
import { startRecording, stopRecording } from "./recording.js";
import { downloadSession, printSession } from "./export.js";

const D = dom();

/* ---------- init ---------- */
initAccordion();
initTTS(D, state);

/* ---------- Settings modal open/close ---------- */
function openSettings() {
  // ✅ unlock on user gesture (opening modal counts as a click)
  unlockTTS();
  D.settingsModal?.classList.add("active");
  D.topicsListWrapper?.classList.add("hidden");
}

function closeSettings() {
  D.settingsModal?.classList.remove("active");
}

D.settingsBtn?.addEventListener("click", openSettings);
D.openSetupBtn?.addEventListener("click", openSettings);
D.closeModalBtn?.addEventListener("click", closeSettings);
D.stopResetBtn?.addEventListener("click", () => {
  import("./flow.js").then(m => m.stopAndReset(D, state));
});

// close on overlay click
D.settingsModal?.addEventListener("click", (e) => {
  if (e.target === D.settingsModal) closeSettings();
});

/* ---------- Topic suggestions ---------- */
D.suggestTopicsBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  unlockTTS(); // ✅ still a click, safe to unlock here too
  fetchTopics(D);
});

D.topicsSelect?.addEventListener("change", () => {
  const val = D.topicsSelect?.value;
  if (val) {
    D.topicInput.value = val;
    D.topicsListWrapper?.classList.add("hidden");
    showToast(D, "Topic selected!", "success");
  }
});

D.hideTopicsBtn?.addEventListener("click", () => {
  unlockTTS();
  D.topicsListWrapper?.classList.add("hidden");
});

/* ---------- Start session ---------- */
D.startSessionBtn?.addEventListener("click", () => {
  unlockTTS(); // ✅ critical
  startSession(D, state);
  // Make sure topic is displayed
  D.debateTopicDisplay?.classList.remove('hidden');
  D.currentTopicText.textContent = state.topic;
});

/* ---------- Input controls ---------- */
D.recordBtn?.addEventListener("click", () => {
  unlockTTS(); // ✅ critical
  startRecording(D, state);
});

D.stopRecordBtn?.addEventListener("click", () => {
  unlockTTS();
  stopRecording(D, state);
});

D.typeBtn?.addEventListener("click", () => {
  unlockTTS();
  D.manualInput?.classList.toggle("hidden");
  if (D.manualInput && !D.manualInput.classList.contains("hidden")) D.manualInput.focus();
});

D.sendBtn?.addEventListener("click", () => {
  unlockTTS(); // ✅ critical
  studentSend(D, state);
});

D.endSessionBtn?.addEventListener("click", () => {
  unlockTTS();
  state.sessionActive = false;
  stopSpeaking();
  showToast(D, "Session ended!", "info");
  D.inputSection?.classList.add("hidden");
  D.resetSection?.classList.add("hidden");
  D.timerSection?.classList.add("hidden");
  D.feedbackSection?.classList.remove("hidden");
});

/* ---------- Debate action buttons ---------- */
D.resetBtn?.addEventListener("click", () => {
  unlockTTS();
  window.location.reload();
});

D.endDebateBtn?.addEventListener("click", () => {
  unlockTTS();
  if (state.sessionActive) endDebateEarly(D, state);
  D.feedbackSection?.classList.remove("hidden");
  getFeedback(D, state, "short");
  setTimeout(() => {
    D.feedbackSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
});

D.switchSidesBtn?.addEventListener("click", () => {
  unlockTTS(); // ✅ critical (computer may speak right away after switching)
  switchSides(D, state);
});

/* ---------- Feedback tabs ---------- */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    unlockTTS();
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    getFeedback(D, state, tab.dataset.mode || "short");
  });
});

/* ---------- Download / Print ---------- */
D.downloadFeedbackBtn?.addEventListener("click", () => {
  unlockTTS();
  downloadSession(D, state);
});

D.printFeedbackBtn?.addEventListener("click", () => {
  unlockTTS();
  printSession(D, state);
});

D.newSessionBtn?.addEventListener("click", () => {
  unlockTTS();
  window.location.reload();
});

/* ---------- Stop speaking ---------- */
D.stopSpeakingBtn?.addEventListener("click", () => {
  unlockTTS();
  stopSpeaking();
});

/* ---------- Timer UI hint (optional) ---------- */
D.modeSelect?.addEventListener("change", () => {
  const mins = selectedTurnMinutes();
  if (D.modeSelect.value === "competition") {
    showToast(D, `Timer set to ${mins} min per turn`, "info");
  }
});

/* ---------- Debug helpers ---------- */
window.__DC_STATE__ = state;
window.__DC_DOM__ = D;

// Debug hooks for console:
window.__unlockTTS = unlockTTS;
window.__stop = stopSpeaking;
window.__speak = (t) => {
  unlockTTS();
  if (typeof window.__internalSpeak === "function") return window.__internalSpeak(t);
  console.warn("__internalSpeak is missing (need to expose speakText from tts.js)");
};

// === DEBUG HOOKS (TEMP) ===
window.__DC = window.__DC || {};
window.__DC.unlockTTS = unlockTTS;
window.__DC.stop = stopSpeaking;
window.__DC.say = (t) => {
  try {
    unlockTTS();
    const u = new SpeechSynthesisUtterance(String(t || "Hello test"));
    u.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) {
    console.error("TTS debug failed:", e);
  }
};
console.log("✅ Debug hooks ready: __DC.say('hello')");

// ============================================================
// NEW FEATURES: Random Topics, Welcome Screen, Keyboard Shortcuts
// ============================================================

/* ---------- NEW: Enhanced Topics System ---------- */
import { getRandomTopic, CATEGORIES, getTopicsByCategory } from './topics.js';

// Current selected category
let currentCategory = 'all';

function loadRandomTopic(category = null) {
  const cat = category || currentCategory;
  const randomTopic = getRandomTopic(cat);
  state.topic = randomTopic;
  
  // Update both displays
  const mainTopicDisplay = document.getElementById('mainTopicDisplay');
  if (mainTopicDisplay) {
    mainTopicDisplay.textContent = randomTopic;
  }
  if (D.topicInput) {
    D.topicInput.value = randomTopic;
  }
  
  console.log('Loaded random topic from', cat, ':', randomTopic);
}

// Populate category selector
function populateCategorySelector() {
  const categorySelect = document.getElementById('categorySelect');
  if (categorySelect) {
    categorySelect.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([key, label]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = label;
      categorySelect.appendChild(option);
    });
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  populateCategorySelector();
  loadRandomTopic();
});

/* ---------- NEW: Welcome Screen Listeners ---------- */

// Start Debate button (new welcome screen)
const startDebateBtn = document.getElementById('startDebateBtn');
if (startDebateBtn) {
  startDebateBtn.addEventListener('click', () => {
    console.log('Start debate clicked');
    unlockTTS();
    
    if (!state.topic || state.topic.trim().length < 5) {
      import('./ui.js').then(({ showError }) => {
        showError('Please enter a valid debate topic (at least 5 characters)');
      });
      return;
    }
    
    // Close welcome and start session
    D.welcomeSection?.classList.add('hidden');
    
    // Make sure topicInput has the value (flow.js needs it!)
    if (D.topicInput) {
      D.topicInput.value = state.topic;
    }
    
    // Call startSession
console.log('About to call startSession with topic:', state.topic);
console.log('D.topicInput:', D.topicInput);
startSession(D, state);
console.log('startSession called!');
    
    // Make sure the topic is displayed
    D.debateTopicDisplay?.classList.remove('hidden');
    D.currentTopicText.textContent = state.topic;
  });
}

// Edit topic button
const editTopicBtn = document.getElementById('editTopicBtn');
const topicInputWrapper = document.getElementById('topicInputWrapper');
const mainTopicInput = document.getElementById('mainTopicInput');

if (editTopicBtn) {
  editTopicBtn.addEventListener('click', () => {
    console.log('Edit topic clicked');
    if (topicInputWrapper) {
      topicInputWrapper.classList.remove('hidden');
    }
    if (mainTopicInput) {
      mainTopicInput.value = state.topic;
      mainTopicInput.focus();
    }
  });
}

// New topic button
const newTopicBtn = document.getElementById('newTopicBtn');
if (newTopicBtn) {
  newTopicBtn.addEventListener('click', () => {
    console.log('New topic clicked');
    loadRandomTopic();
    showToast(D, 'New topic loaded!', 'success');
  });
}

// Category selector
const categorySelect = document.getElementById('categorySelect');
if (categorySelect) {
  categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    loadRandomTopic();
    showToast(D, `New topic from ${CATEGORIES[currentCategory]}!`, 'success');
  });
}

// AI Generate Topic button
const aiTopicBtn = document.getElementById('aiTopicBtn');
if (aiTopicBtn) {
  aiTopicBtn.addEventListener('click', async () => {
    console.log('AI topic clicked');
    unlockTTS();
    
    try {
      aiTopicBtn.disabled = true;
      aiTopicBtn.textContent = '🤖 Generating...';
      
      // Fetch AI-generated topics from API
      const response = await fetch('/topics');
      const data = await response.json();
      
      if (data.topics && data.topics.length > 0) {
        // Pick a random one from the AI suggestions
        const randomAITopic = data.topics[Math.floor(Math.random() * data.topics.length)];
        state.topic = randomAITopic;
        
        // Update displays
        const mainTopicDisplay = document.getElementById('mainTopicDisplay');
        if (mainTopicDisplay) {
          mainTopicDisplay.textContent = randomAITopic;
        }
        if (mainTopicInput) {
          mainTopicInput.value = randomAITopic;
        }
        if (D.topicInput) {
          D.topicInput.value = randomAITopic;
        }
        
        showToast(D, '🤖 AI-generated topic loaded!', 'success');
      }
    } catch (err) {
      console.error('Error generating AI topic:', err);
      showToast(D, 'Failed to generate AI topic', 'error');
    } finally {
      aiTopicBtn.disabled = false;
      aiTopicBtn.textContent = '🤖 AI Topic';
    }
  });
}

// Save topic button
const saveTopicBtn = document.getElementById('saveTopicBtn');
if (saveTopicBtn) {
  saveTopicBtn.addEventListener('click', () => {
    const newTopic = mainTopicInput.value.trim();
    if (newTopic.length < 5) {
      import('./ui.js').then(({ showError }) => {
        showError('Topic must be at least 5 characters long');
      });
      return;
    }
    state.topic = newTopic;
    
    const mainTopicDisplay = document.getElementById('mainTopicDisplay');
    if (mainTopicDisplay) {
      mainTopicDisplay.textContent = newTopic;
    }
    if (D.topicInput) {
      D.topicInput.value = newTopic;
    }
    if (topicInputWrapper) {
      topicInputWrapper.classList.add('hidden');
    }
    showToast(D, 'Topic updated!', 'success');
  });
}

// Cancel topic button
const cancelTopicBtn = document.getElementById('cancelTopicBtn');
if (cancelTopicBtn) {
  cancelTopicBtn.addEventListener('click', () => {
    if (topicInputWrapper) {
      topicInputWrapper.classList.add('hidden');
    }
  });
}

// Suggest topics button (main screen)
const suggestTopicsMainBtn = document.getElementById('suggestTopicsMainBtn');
if (suggestTopicsMainBtn) {
  suggestTopicsMainBtn.addEventListener('click', async () => {
    console.log('Suggest topics clicked (main)');
    unlockTTS();
    
    try {
      // Fetch topics from API
      const response = await fetch('/topics');
      const data = await response.json();
      
      if (data.topics && data.topics.length > 0) {
        // Fill the main screen dropdown
        const topicsSelectMain = document.getElementById('topicsSelectMain');
        if (topicsSelectMain) {
          topicsSelectMain.innerHTML = '';
          data.topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicsSelectMain.appendChild(option);
          });
        }
        
        // Show the dropdown
        const topicsListWrapperMain = document.getElementById('topicsListWrapperMain');
        if (topicsListWrapperMain) {
          topicsListWrapperMain.classList.remove('hidden');
        }
        
        showToast(D, 'Topics loaded!', 'success');
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      showToast(D, 'Failed to load topics', 'error');
    }
  });
}

// Topics select (main screen) - when user picks a topic
const topicsSelectMain = document.getElementById('topicsSelectMain');
if (topicsSelectMain) {
  topicsSelectMain.addEventListener('change', () => {
    const val = topicsSelectMain.value;
    if (val) {
      // Update topic
      state.topic = val;
      if (mainTopicInput) {
        mainTopicInput.value = val;
      }
      const mainTopicDisplay = document.getElementById('mainTopicDisplay');
      if (mainTopicDisplay) {
        mainTopicDisplay.textContent = val;
      }
      if (D.topicInput) {
        D.topicInput.value = val;
      }
      showToast(D, 'Topic selected!', 'success');
    }
  });
}
        
    
/* ---------- NEW: Keyboard Shortcuts ---------- */

// Enter to send
D.manualInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    D.sendBtn?.click();
  }
});

// Esc to stop speaking
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    stopSpeaking();
    showToast(D, 'Speech stopped', 'info');
  }
});

/* ---------- NEW: Argument Validation ---------- */
export function validateArgument(text) {
  const words = text.trim().split(/\s+/);
  
  // Check minimum words
  if (words.length < 10) {
    return {
      valid: false,
      message: '⚠️ Your argument is too short. Please provide at least 10 words with clear reasoning.'
    };
  }
  
  // Check for meaningless patterns
  const meaninglessPatterns = /^(hi|hello|hey|lets start|let's start|ok|okay|yes|no|start|begin)$/i;
  if (meaninglessPatterns.test(text.trim())) {
    return {
      valid: false,
      message: '⚠️ Please provide an actual argument about the topic, not just a greeting or command.'
    };
  }
  
  return { valid: true };
}

console.log('✅ New features loaded: Random topics, keyboard shortcuts, validation');
