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

// ✅ GLOBAL MODE TRACKING
window.currentDebateMode = 'training';

/* ---------- init ---------- */
initAccordion();
initTTS(D, state);

/* ---------- Settings modal open/close ---------- */
function openSettings() {
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

D.settingsModal?.addEventListener("click", (e) => {
  if (e.target === D.settingsModal) closeSettings();
});

/* ---------- Topic suggestions ---------- */
D.suggestTopicsBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  unlockTTS();
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

/* ---------- Input controls ---------- */
D.recordBtn?.addEventListener("click", () => {
  unlockTTS();
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
  unlockTTS();
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
  unlockTTS();
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

/* ---------- Timer UI hint ---------- */
D.modeSelect?.addEventListener("change", () => {
  const mins = selectedTurnMinutes();
  if (D.modeSelect.value === "competition") {
    showToast(D, `Timer set to ${mins} min per turn`, "info");
  }
});

/* ---------- Debug helpers ---------- */
window.__DC_STATE__ = state;
window.__DC_DOM__ = D;
window.__unlockTTS = unlockTTS;
window.__stop = stopSpeaking;

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
// NEW FEATURES
// ============================================================

/* ---------- Enhanced Topics System ---------- */
import { getRandomTopic, CATEGORIES, getTopicsByCategory } from './topics.js';

let currentCategory = 'all';

function loadRandomTopic(category = null) {
  const cat = category || currentCategory;
  const randomTopic = getRandomTopic(cat);
  state.topic = randomTopic;
  
  const mainTopicDisplay = document.getElementById('mainTopicDisplay');
  if (mainTopicDisplay) {
    mainTopicDisplay.textContent = randomTopic;
  }
  if (D.topicInput) {
    D.topicInput.value = randomTopic;
  }
  
  console.log('Loaded random topic from', cat, ':', randomTopic);
}

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

window.addEventListener('DOMContentLoaded', () => {
  populateCategorySelector();
  loadRandomTopic();
});
/* ---------- Welcome Screen Listeners ---------- */
const startDebateBtn = document.getElementById('startDebateBtn');
if (startDebateBtn) {
  startDebateBtn.addEventListener('click', () => {
    console.log('Start debate clicked');
    unlockTTS();
    
    const mainTopicDisplay = document.getElementById('mainTopicDisplay');
    if (mainTopicDisplay) {
      state.topic = mainTopicDisplay.textContent.trim();
    }
    
    if (!state.topic || state.topic.trim().length < 5) {
      import('./ui.js').then(({ showError }) => {
        showError('Please enter a valid debate topic (at least 5 characters)');
      });
      return;
    }
    
    D.welcomeSection?.classList.add('hidden');
    
    if (D.topicInput) {
      D.topicInput.value = state.topic;
    }
    
    console.log('About to call startSession with topic:', state.topic);
    startSession(D, state);
    
    D.debateTopicDisplay?.classList.remove('hidden');
    D.currentTopicText.textContent = state.topic;
    
    document.getElementById('debateHeader')?.classList.remove('hidden');
    
    // ✅ Show Final Round button (Training mode only)
    setTimeout(() => {
      if (window.currentDebateMode === 'training') {
        const finalBtn = document.getElementById('finalRoundBtn');
        if (finalBtn) {
          finalBtn.style.display = 'inline-flex';
          console.log('✅ Final Round button shown');
        }
      }
    }, 500);
  });
}

const newTopicBtn = document.getElementById('newTopicBtn');
if (newTopicBtn) {
  newTopicBtn.addEventListener('click', () => {
    loadRandomTopic();
    showToast(D, 'New topic loaded!', 'success');
  });
}

const categorySelect = document.getElementById('categorySelect');
if (categorySelect) {
  categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    loadRandomTopic();
    showToast(D, `New topic from ${CATEGORIES[currentCategory]}!`, 'success');
  });
}

const aiTopicBtn = document.getElementById('aiTopicBtn');
if (aiTopicBtn) {
  aiTopicBtn.addEventListener('click', async () => {
    unlockTTS();
    
    try {
      aiTopicBtn.disabled = true;
      aiTopicBtn.textContent = '🤖 Generating...';
      
      const response = await fetch('/topics');
      const data = await response.json();
      
      if (data.topics && data.topics.length > 0) {
        const randomAITopic = data.topics[Math.floor(Math.random() * data.topics.length)];
        state.topic = randomAITopic;
        
        const mainTopicDisplay = document.getElementById('mainTopicDisplay');
        if (mainTopicDisplay) {
          mainTopicDisplay.textContent = randomAITopic;
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

/* ---------- Inline Topic Editing ---------- */
const mainTopicDisplay = document.getElementById('mainTopicDisplay');
if (mainTopicDisplay) {
  mainTopicDisplay.addEventListener('input', () => {
    state.topic = mainTopicDisplay.textContent.trim();
    if (D.topicInput) {
      D.topicInput.value = state.topic;
    }
  });
  
  mainTopicDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      mainTopicDisplay.blur();
    }
  });
  
  mainTopicDisplay.addEventListener('focus', () => {
    mainTopicDisplay.style.outline = '2px solid #4CAF50';
  });
  
  mainTopicDisplay.addEventListener('blur', () => {
    mainTopicDisplay.style.outline = 'none';
    if (state.topic.length < 5) {
      import('./ui.js').then(({ showError }) => {
        showError('Topic must be at least 5 characters long');
      });
      loadRandomTopic();
    }
  });
}

/* ---------- Keyboard Shortcuts ---------- */
D.manualInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    D.sendBtn?.click();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    stopSpeaking();
    showToast(D, 'Speech stopped', 'info');
  }
});

/* ---------- Argument Validation ---------- */
export function validateArgument(text) {
  const words = text.trim().split(/\s+/);
  
  if (words.length < 10) {
    return {
      valid: false,
      message: '⚠️ Your argument is too short. Please provide at least 10 words with clear reasoning.'
    };
  }
  
  const meaninglessPatterns = /^(hi|hello|hey|lets start|let's start|ok|okay|yes|no|start|begin)$/i;
  if (meaninglessPatterns.test(text.trim())) {
    return {
      valid: false,
      message: '⚠️ Please provide an actual argument about the topic, not just a greeting or command.'
    };
  }
  
  return { valid: true };
}

console.log('✅ New features loaded');

/* ---------- Help Modal ---------- */
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const helpClose = document.getElementById('helpClose');
const getHelpBtn = document.getElementById('getHelpBtn');

if (helpBtn) {
  helpBtn.addEventListener('click', () => {
    helpModal.classList.add('active');
    helpModal.classList.remove('hidden');
  });
}

if (helpClose) {
  helpClose.addEventListener('click', () => {
    helpModal.classList.remove('active');
    helpModal.classList.add('hidden');
  });
}

if (helpModal) {
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('active');
      helpModal.classList.add('hidden');
    }
  });
}

if (getHelpBtn) {
  getHelpBtn.addEventListener('click', async () => {
    const helpContent = document.getElementById('helpContent');
    helpContent.innerHTML = '<p>⏳ Generating talking points...</p>';
    
    try {
      const res = await fetch('/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic,
          stance: state.stance,
        }),
      });
      const data = await res.json();
      helpContent.innerHTML = data.reply || 'No suggestions available';
    } catch (err) {
      helpContent.innerHTML = '❌ Error generating help. Please try again.';
    }
  });
}

/* ==========================================
   MODE PICKER + STANCE PICKER
   ========================================== */

document.getElementById('modeTrainingBtn')?.addEventListener('click', () => {
  window.currentDebateMode = 'training';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('modeTrainingBtn').classList.add('active');
  const modeSelect = document.getElementById('modeSelect');
  if (modeSelect) modeSelect.value = 'practice';
  const startBtn = document.getElementById('startDebateBtn');
  if (startBtn) startBtn.textContent = '▶️ Start Debate';
});

document.getElementById('modeCompetitionBtn')?.addEventListener('click', () => {
  window.currentDebateMode = 'competition';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('modeCompetitionBtn').classList.add('active');
  const modeSelect = document.getElementById('modeSelect');
  if (modeSelect) modeSelect.value = 'competition';
  const startBtn = document.getElementById('startDebateBtn');
  if (startBtn) startBtn.textContent = '🏆 Start Competition';
});

document.getElementById('stanceForBtn')?.addEventListener('click', () => {
  document.querySelectorAll('.stance-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('stanceForBtn').classList.add('active');
  const stanceSelect = document.getElementById('stanceSelect');
  if (stanceSelect) stanceSelect.value = 'PRO';
});

document.getElementById('stanceAgainstBtn')?.addEventListener('click', () => {
  document.querySelectorAll('.stance-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('stanceAgainstBtn').classList.add('active');
  const stanceSelect = document.getElementById('stanceSelect');
  if (stanceSelect) stanceSelect.value = 'CON';
});

function updateSettingsForMode(mode) {
  const badge = document.getElementById('settingsModeBadge');
  const trainingSections = document.querySelector('.settings-sections-training');
  const competitionSections = document.querySelector('.settings-sections-competition');

  if (mode === 'training') {
    if (badge) { badge.textContent = '📚 Training'; badge.className = 'settings-mode-badge training'; }
    if (trainingSections) trainingSections.style.display = '';
    if (competitionSections) competitionSections.style.display = 'none';
  } else {
    if (badge) { badge.textContent = '🏆 Competition'; badge.className = 'settings-mode-badge competition'; }
    if (trainingSections) trainingSections.style.display = 'none';
    if (competitionSections) competitionSections.style.display = '';
    setTimeout(() => {
      document.querySelectorAll('.settings-slider').forEach(fillSlider);
    }, 10);
  }
}

D.settingsBtn?.addEventListener('click', () => {
  updateSettingsForMode(window.currentDebateMode);
}, true);

D.openSetupBtn?.addEventListener('click', () => {
  updateSettingsForMode(window.currentDebateMode);
}, true);

document.querySelectorAll('.diff-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const diffSelect = document.getElementById('difficultySelect');
    if (diffSelect) diffSelect.value = card.dataset.level;
  });
});

document.getElementById('closeModalBtn')?.addEventListener('click', () => {
  D.settingsModal?.classList.remove('active');
});

function fillSlider(el) {
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty('--pct', pct + '%');
}

function fmtSeconds(s) {
  if (s < 60) return s + ' sec';
  const m = Math.floor(s / 60), r = s % 60;
  return r ? `${m}m ${r}s` : `${m} min`;
}

document.getElementById('argTimeSlider')?.addEventListener('input', (e) => {
  fillSlider(e.target);
  const display = document.getElementById('argTimeDisplay');
  if (display) display.textContent = fmtSeconds(parseInt(e.target.value));
  const mins = Math.round(parseInt(e.target.value) / 60);
  const radio = document.querySelector(`input[name="turnMinutes"][value="${Math.max(1, Math.min(5, mins))}"]`);
  if (radio) radio.checked = true;
});

document.getElementById('warnTimeSlider')?.addEventListener('input', (e) => {
  fillSlider(e.target);
  const display = document.getElementById('warnTimeDisplay');
  if (display) display.textContent = e.target.value + 's left';
});

document.querySelectorAll('.settings-slider').forEach(fillSlider);

console.log('✅ Mode picker and settings loaded');

/* ---------- Welcome Settings Button ---------- */
document.getElementById('welcomeSettingsBtn')?.addEventListener('click', () => {
  unlockTTS();
  updateSettingsForMode(window.currentDebateMode);
  D.settingsModal?.classList.add('active');
});

document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal) {
    settingsModal.classList.remove('active');
    settingsModal.classList.add('hidden');
  }
});

console.log('✅ Settings handlers ready');

/* ==========================================
   GENERATE TALKING POINTS
   ========================================== */

const generateTalkingPointsBtn = document.getElementById('generateTalkingPointsBtn');
const talkingPointsContainer = document.getElementById('talkingPointsContainer');
const talkingPointsContent = document.getElementById('talkingPointsContent');
const closeTalkingPointsBtn = document.getElementById('closeTalkingPointsBtn');

if (generateTalkingPointsBtn) {
  generateTalkingPointsBtn.addEventListener('click', async () => {
    const topicElement = document.querySelector('.debate-topic-text') || 
                        document.querySelector('[contenteditable="true"]');
    const topic = topicElement ? topicElement.textContent.trim() : '';
    
    const stanceSelect = document.getElementById('stanceSelect');
    const stance = stanceSelect ? stanceSelect.value : 'PRO';
    
    if (!topic) {
      alert('Please select a debate topic first!');
      return;
    }
    
    generateTalkingPointsBtn.disabled = true;
    generateTalkingPointsBtn.classList.add('loading');
    
    talkingPointsContainer.classList.remove('hidden');
    talkingPointsContent.innerHTML = '<div class="talking-points-loading">Generating talking points...</div>';
    
    try {
      const response = await fetch('/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Generate 3-5 strong talking points ${stance === 'PRO' ? 'FOR' : 'AGAINST'} this debate topic: "${topic}". Format as a numbered list with brief explanations.`
        }),
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate talking points');
      }
      
      const data = await response.json();
      
      let responseText = '';
      if (data.response) {
        responseText = data.response;
      } else if (data.reply) {
        responseText = data.reply;
      } else if (data.message) {
        responseText = data.message;
      } else if (data.content) {
        responseText = data.content;
      }

      responseText = responseText
        .replace(/^["']|["']$/g, '')
        .replace(/\\n\\n/g, '\n\n')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .trim();

      if (responseText && responseText !== '{}') {
        talkingPointsContent.innerHTML = `
          <div style="white-space: pre-wrap; line-height: 1.8;">${responseText}</div>
        `;
      } else {
        throw new Error('No response received');
      }
      
    } catch (error) {
      console.error('Error generating talking points:', error);
      talkingPointsContent.innerHTML = `
        <div class="talking-points-error">
          ❌ Could not generate talking points. Please try again.
        </div>
      `;
    } finally {
      generateTalkingPointsBtn.disabled = false;
      generateTalkingPointsBtn.classList.remove('loading');
    }
  });
}

if (closeTalkingPointsBtn) {
  closeTalkingPointsBtn.addEventListener('click', () => {
    if (talkingPointsContainer) {
      talkingPointsContainer.classList.add('hidden');
    }
  });
}

console.log('✅ Generate Talking Points ready');

/* ==========================================
   FINAL ROUND BUTTON
   ========================================== */

window.isFinalRound = false;
window.finalRoundTurnsRemaining = 0;

const finalRoundBtn = document.getElementById('finalRoundBtn');
if (finalRoundBtn) {
  finalRoundBtn.addEventListener('click', function() {
    if (window.isFinalRound) return;
    
    console.log('🏁 Final Round clicked!');
    
    window.isFinalRound = true;
    window.finalRoundTurnsRemaining = 1;
    
    const conversationSection = document.getElementById('conversationSection');
    if (conversationSection) {
      const indicator = document.createElement('div');
      indicator.className = 'final-round-mode';
      indicator.innerHTML = '🏁 Final Round! Each side gives one closing argument';
      conversationSection.appendChild(indicator);
      conversationSection.scrollTop = conversationSection.scrollHeight;
    }
    
    this.style.display = 'none';
    showToast(D, 'Final Round started! Give your closing argument.', 'info');
  });
}


console.log('✅ Final Round Button ready');
