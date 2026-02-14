import { showToast } from "./toast.js";
import { selectedTurnMinutes } from "./dom.js";
import { stopSpeaking, speakText, unlockTTS } from "./tts.js";
import { stopTimer, startTurnTimer } from "./timer.js";
import { addBubble, clearInput, showInput, hideInput, setTopicHeader, showFeedbackSection, hideFeedbackSection } from "./ui.js";
import { sendToAI } from "./api.js";
import { setupDownloadButton, showDownloadButton, hideDownloadButton } from './download-transcript.js';
import { setupHelpButton } from './help-feature.js';
import { initProgressTracker, showProgressTracker, hideProgressTracker, recordDebateComplete, recordResponseTime, loadProgress } from './progress-tracker.js';
import { updateTimerDisplay, resetTimerWarnings, setupTimerControls, showTimerPauseButton, hideTimerPauseButton } from './timer-enhancements.js';

// Argument Validation
function validateArgument(text) {
  const words = text.trim().split(/\s+/);
  
  // Check minimum words
  if (words.length < 10) {
    return {
      valid: false,
      message: '⚠️ Your argument is too short. Please provide at least 10 words with clear reasoning.'
    };
  }
  
  // Check for meaningless patterns (greetings, commands)
  const meaninglessPatterns = /^(hi|hello|hey|let'?s start|ok|okay|yes|no|start|begin)$/i;
  if (meaninglessPatterns.test(text.trim())) {
    return {
      valid: false,
      message: '⚠️ Please provide an actual argument about the topic, not just a greeting or command.'
    };
  }
  
  return { valid: true };
}

export function isStudentTurn(state, idx) {
  // if student starts => idx even is student; else idx odd is student
  return state.studentStarts ? (idx % 2 === 0) : (idx % 2 === 1);
}

export function isSummaryTurn(idx) {
  return idx === 4 || idx === 5;
}

export function turnLabel(state, idx) {
  const n = idx + 1;
  const who = isStudentTurn(state, idx) ? "You" : "Computer";
  const phase = isSummaryTurn(idx) ? "Summary" : `Argument ${Math.ceil((idx + 1) / 2)}`;
  return `Debate #${state.debateNo} • Turn ${n}/6 • ${who} • ${phase}`;
}

export function startSession(dom, state) {
  const topic = (dom.topicInput?.value || "").trim();
  if (!topic) {
    showToast(dom, "Please enter a debate topic", "error");
    return;
  }

  // Pull settings
  state.sessionActive = true;
  dom.stopResetBtn?.classList.remove("hidden");
  
  // ✨ Show new feature buttons
  showDownloadButton();
  showProgressTracker();
  showTimerPauseButton();
  // Note: Help button is part of Input Section, shows automatically
  
  state.topic = topic;
  state.stance = dom.stanceSelect?.value || "PRO";
  state.difficulty = dom.difficultySelect?.value || "Medium";
  state.mode = dom.modeSelect?.value || "practice";
  const minutes = selectedTurnMinutes();
  state.turnTimeSec = Math.max(10, Math.min(900, minutes * 60));
  state.studentStarts = (state.stance === "PRO"); // PRO starts first

  // Reset flow
  state.debateNo = 1;
  state.turnIndex = 0;
  state.messages = [];
  state.feedbackTurns = [];

  // UI
  dom.welcomeSection?.classList.add("hidden");
  dom.settingsModal?.classList.remove("active");
  dom.debateTopicDisplay?.classList.remove("hidden");

  dom.conversationSection?.classList.remove("hidden");
  dom.resetSection?.classList.remove("hidden");
  hideFeedbackSection(dom);
  dom.inputSection?.classList.add("hidden");

  dom.switchSidesBtn?.classList.add("hidden");
  dom.continueDebateBtn?.classList.add("hidden");

  if (dom.conversationSection) dom.conversationSection.innerHTML = "";
  clearInput(dom, state);
  stopTimer(dom, state);
  stopSpeaking();

  setTopicHeader(dom, state);

  addBubble(dom, state, "system", `${turnLabel(state, state.turnIndex)}`);

  // Unlock TTS with a tiny utterance on a user gesture path (Start Session click)
  // It is silent-ish but counts as a gesture-initiated speak in many browsers.
  speakText(" ");


if (isStudentTurn(state, state.turnIndex)) {
  addBubble(dom, state, "system", "Your turn to respond");
  // Don't show input yet - wait for TTS to finish!
  if (!state.autoSpeak) {
    showInput(dom);
  }
  startTurnTimer(dom, state, state.turnTimeSec, () => studentSend(dom, state));
} else {
  addBubble(dom, state, "system", "Computer starts");
  hideInput(dom);
  computerTurn(dom, state);
}
}

export function endDebateEarly(dom, state) {
  if (!state.sessionActive) return;

  hideInput(dom);
  stopTimer(dom, state);
  stopSpeaking();
  addBubble(dom, state, "system", `🏁 Debate #${state.debateNo} ended early by the user.`);

  dom.resetSection?.classList.remove("hidden");
  dom.switchSidesBtn?.classList.remove("hidden");
  showToast(dom, "Debate ended. You can now request teacher feedback.", "info");
}

export function debateCompleteUI(dom, state) {
  hideInput(dom);
  stopTimer(dom, state);
  stopSpeaking();
  addBubble(dom, state, "system", `🎉 Debate #${state.debateNo} complete (6 turns).`);

  // ✨ Record progress when debate completes
  const progress = loadProgress();
  recordDebateComplete(progress, state);

  dom.resetSection?.classList.remove("hidden");
  dom.switchSidesBtn?.classList.remove("hidden");
  showToast(dom, "Debate complete. You can now request teacher feedback.", "success");
}

export function switchSides(dom, state) {
  if (!state.sessionActive) return;

  stopTimer(dom, state);
  stopSpeaking();

  state.debateNo += 1;
  state.turnIndex = 0;
  state.stance = (state.stance === "PRO") ? "CON" : "PRO";
  state.studentStarts = (state.stance === "PRO"); // PRO starts first

  setTopicHeader(dom, state);

  dom.switchSidesBtn?.classList.add("hidden");
  dom.continueDebateBtn?.classList.add("hidden");

  addBubble(dom, state, "system", "— 🔁 Switching sides —");
  addBubble(dom, state, "system", `${turnLabel(state, state.turnIndex)}`);

  clearInput(dom, state);

  if (isStudentTurn(state, state.turnIndex)) {
    addBubble(dom, state, "system", "Your turn to start");
    showInput(dom);
    startTurnTimer(dom, state, state.turnTimeSec, () => studentSend(dom, state));
  } else {
    addBubble(dom, state, "system", "Computer starts");
    hideInput(dom);
    computerTurn(dom, state);
  }
}

export function currentStudentText(dom, state) {
  const typed = dom.manualInput?.classList.contains("hidden") ? "" : (dom.manualInput?.value || "").trim();
  const spoken = (dom.transcriptDisplay?.textContent || "").trim();
  const hasTyped = typed.length > 0;
  const hasSpoken = spoken && spoken !== "Your transcript will appear here...";

  if (hasTyped) return { text: typed, transcript: state.currentTranscript || "" };
  if (hasSpoken) return { text: spoken, transcript: state.currentTranscript || "" };
  return { text: "", transcript: "" };
}

export async function studentSend(dom, state) {
  if (!state.sessionActive) return;
  if (!isStudentTurn(state, state.turnIndex)) return;

  const { text, transcript } = currentStudentText(dom, state);
  if (!text) {
    showToast(dom, "Please record or type your argument first", "error");
    return;
  }

  // ✅ VALIDATE ARGUMENT
  const validation = validateArgument(text);
  if (!validation.valid) {
    showToast(dom, validation.message, "error");
    return;
  }

  stopTimer(dom, state);

  const summaryFlag = isSummaryTurn(state.turnIndex);
  const finalText = (summaryFlag ? "SUMMARY: " : "") + text;

  addBubble(dom, state, "student", finalText, { transcript, recordingMs: Math.max(0, Date.now() - state.recordingStartTime), turnIndex: state.turnIndex });

  state.feedbackTurns.push({
    studentText: finalText,
    studentTranscript: transcript || "",
    recordingMs: Math.max(0, Math.floor(Date.now() - state.recordingStartTime)),
    aiReply: "",
  });

  clearInput(dom, state);
  hideInput(dom);

  state.turnIndex += 1;

  if (state.turnIndex >= state.totalTurns) {
    debateCompleteUI(dom, state);
    return;
  }

  addBubble(dom, state, "system", `${turnLabel(state, state.turnIndex)}`);
  await computerTurn(dom, state);
}

export async function computerTurn(dom, state) {
  if (!state.sessionActive) return;
  if (isStudentTurn(state, state.turnIndex)) return;

  stopTimer(dom, state);
  hideInput(dom);

  const lastStudent = [...state.messages].reverse().find(m => m.who === "student")?.text || "";
addBubble(dom, state, "system", "⏳ Computer is thinking...");

// Check if computer is starting first
const isComputerStarting = state.turnIndex === 0 && !lastStudent;
const reply = await sendToAI(dom, state, lastStudent, { 
  isSummary: isSummaryTurn(state.turnIndex),
  isComputerStarting: isComputerStarting
});

  // remove last "thinking" system bubble if it's last
  const nodes = dom.conversationSection?.querySelectorAll(".message-system") || [];
  const lastNode = nodes[nodes.length - 1];
  if (lastNode && lastNode.textContent?.toLowerCase().includes("thinking")) lastNode.remove();

  addBubble(dom, state, "computer", reply || "(no reply)", { turnIndex: state.turnIndex });

  // TTS - speak computer reply if autoSpeak is enabled
  if (reply && state.autoSpeak) {
    unlockTTS();
    setTimeout(() => speakText(reply, state.voiceURI), 200);
  }

  const lastPair = state.feedbackTurns[state.feedbackTurns.length - 1];
  if (lastPair) lastPair.aiReply = reply || "";

  state.turnIndex += 1;

  // ✅ CHECK FINAL ROUND COMPLETION
  if (window.isFinalRound && window.finalRoundTurnsRemaining !== undefined) {
    window.finalRoundTurnsRemaining--;
    console.log('🏁 Final Round turns remaining:', window.finalRoundTurnsRemaining);
    if (window.finalRoundTurnsRemaining <= 0) {
      console.log('🏁 Final Round complete! Ending debate...');
      addBubble(dom, state, "system", "🏁 Final Round complete!");
      
      setTimeout(() => {
        const endBtn = document.getElementById('endDebateBtn');
        if (endBtn) {
          endBtn.click();
        }
      }, 10000);
      return;
    }
  }

  if (state.turnIndex >= state.totalTurns) {
    debateCompleteUI(dom, state);
    return;
  }

  addBubble(dom, state, "system", `${turnLabel(state, state.turnIndex)}`);

  addBubble(dom, state, "system", `${turnLabel(state, state.turnIndex)}`);
  if (isStudentTurn(state, state.turnIndex)) {
    addBubble(dom, state, "system", "Your turn to respond");
    showInput(dom);
    startTurnTimer(dom, state, state.turnTimeSec, () => studentSend(dom, state));
  } else {
    // shouldn't happen, but keep safe
    addBubble(dom, state, "system", "Computer continues");
    await computerTurn(dom, state);
  }
}

export function stopAndReset(dom, state) {
  // Stop everything immediately
  stopTimer(dom, state);
  stopSpeaking();
  
  // Stop recording if active
  if (state.isRecording && state.mediaRecorder) {
    state.mediaRecorder.stop();
    state.isRecording = false;
  }
  
  // Reset session state
  state.sessionActive = false;
  state.turnIndex = 0;
  state.messages = [];
  state.feedbackTurns = [];
  
  // Clear UI
  if (dom.conversationSection) dom.conversationSection.innerHTML = "";
  clearInput(dom, state);
  hideInput(dom);
  hideFeedbackSection(dom);
  
  // Show welcome, hide debate sections
  dom.welcomeSection?.classList.remove("hidden");
  dom.debateTopicDisplay?.classList.add("hidden");
  dom.conversationSection?.classList.add("hidden");
  dom.resetSection?.classList.add("hidden");
  dom.stopResetBtn?.classList.add("hidden");
  
  // ✨ Hide new feature buttons and reset warnings
  hideDownloadButton();
  hideProgressTracker();
  hideTimerPauseButton();
  resetTimerWarnings();
  // Note: Help button is part of Input Section, hides automatically
  
  showToast(dom, "🛑 Session stopped and reset!", "info");
}

// ✨ Initialize all new features (call this from main.js or at app startup)
export function initializeFeatures(dom, state) {
  setupDownloadButton(dom, state);
  setupHelpButton(dom, state);
  initProgressTracker();
  setupTimerControls(state);
}
