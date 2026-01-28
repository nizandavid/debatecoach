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
  // אם speakText לא נגיש כאן, סימן שהוא לא מיוצא/מיובא נכון (נפתור מיד אחרי)
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