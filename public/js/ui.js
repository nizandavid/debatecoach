import { safe, nowTs } from "./utils.js";

export function addBubble(dom, state, who, text, extra = {}) {
  state.messages.push({
    who,
    text: safe(text),
    transcript: extra.transcript || "",
    recordingMs: extra.recordingMs || 0,
    debateNo: state.debateNo,
    turnIndex: typeof extra.turnIndex === "number" ? extra.turnIndex : null,
    ts: nowTs(),
  });

  const message = document.createElement("div");
  message.className = `message message-${who === "teacher" ? "system" : who}`;

  if (who === "teacher" || who === "system") {
    message.innerHTML = `<div class="message-body">${safe(text)}</div>`;
  } else {
    const icon = who === "computer" ? "💻" : "👤";
    const name = who === "computer" ? "Computer" : "You";
    message.innerHTML = `
      <div class="message-header">
        <span class="message-icon">${icon}</span>
        <span>${name}:</span>
      </div>
      <div class="message-body">${safe(text)}</div>
    `;
  }

  dom.conversationSection?.appendChild(message);
  if (dom.conversationSection) dom.conversationSection.scrollTop = dom.conversationSection.scrollHeight;
}

export function clearInput(dom, state) {
  if (dom.transcriptDisplay) {
    dom.transcriptDisplay.textContent = "Your transcript will appear here...";
    dom.transcriptDisplay.classList.add("empty");
  }
  if (dom.manualInput) {
    dom.manualInput.value = "";
    dom.manualInput.classList.add("hidden");
  }
  state.currentTranscript = "";
}

export function showInput(dom) {
  dom.inputSection?.classList.remove("hidden");
  if (dom.conversationSection) dom.conversationSection.scrollTop = dom.conversationSection.scrollHeight;
}

export function hideInput(dom) {
  dom.inputSection?.classList.add("hidden");
}

export function setTopicHeader(dom, state) {
  if (!dom.currentTopicText) return;
  const starter = state.studentStarts ? "You start" : "Computer starts";
  dom.currentTopicText.textContent = `${state.topic}  (Debate #${state.debateNo} • You: ${state.stance} • ${starter})`;
}

export function showFeedbackSection(dom) {
  dom.feedbackSection?.classList.remove("hidden");
}

export function hideFeedbackSection(dom) {
  dom.feedbackSection?.classList.add("hidden");
}
