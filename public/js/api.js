import { safe } from "./utils.js";
import { showToast } from "./toast.js";

export async function fetchTopics(dom) {
  try {
    showToast(dom, "Generating topics...", "info");
    const res = await fetch("/topics");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to fetch topics");

    const topics = Array.isArray(data.topics) ? data.topics.map(String).filter(Boolean) : [];
    if (!topics.length) {
      showToast(dom, "No topics returned", "error");
      return;
    }
    const list = topics.slice(0, 5);

    if (dom.topicsSelect) {
      dom.topicsSelect.innerHTML = "";
      list.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        dom.topicsSelect.appendChild(opt);
      });
      dom.topicsListWrapper?.classList.remove("hidden");
      showToast(dom, "Pick a topic from the list", "success");
    } else if (dom.topicInput) {
      dom.topicInput.value = list[0];
      showToast(dom, "Topic suggested!", "success");
    }
  } catch (err) {
    showToast(dom, "Error: " + safe(err?.message), "error");
  }
}

export async function sendToAI(dom, state, userText, opts = {}) {
  try {
    // 🎯 Detect if this is computer's final argument
    const isComputerFinalArgument = opts.isComputerFinalArgument || false;
    
    let payloadText;
    if (opts.isSummary) {
      payloadText = `This is your closing summary. Keep it concise and strong.\n\n${userText}`;
    } else if (isComputerFinalArgument) {
      // 🆕 Special instructions for final argument
      payloadText = `This is your FINAL argument before closing statements. Summarize your main points and make a strong concluding statement. Do NOT ask a follow-up question.\n\n${userText}`;
    } else {
      payloadText = userText;
    }

const res = await fetch("/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    topic: state.topic,
    stance: state.stance,
    difficulty: state.difficulty,
    userText: payloadText,
    isComputerStarting: opts.isComputerStarting || false,
    isComputerFinalArgument: isComputerFinalArgument,
  }),
});

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.details || "Request failed");
    return safe(data.reply);
  } catch (err) {
    showToast(dom, "Error: " + safe(err?.message), "error");
    return "";
  }
}

export async function getFeedback(dom, state, mode = "short") {
  try {
    dom.feedbackContent.innerHTML =
      '<div style="text-align:center; padding:40px;"><div class="loading"></div><p style="margin-top:16px;">Generating feedback...</p></div>';

    const paired = state.feedbackTurns
      .map(t => ({
        studentText: t.studentText || "",
        studentTranscript: t.studentTranscript || "",
        recordingMs: t.recordingMs || 0,
        aiReply: t.aiReply || "",
      }))
      .slice(0, 12);

    const res = await fetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: state.topic,
        studentSide: state.stance,
        difficulty: state.difficulty,
        mode,
        turns: paired,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.details || "Request failed");

    dom.feedbackContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${safe(data.reply)}</pre>`;
  } catch (err) {
    dom.feedbackContent.innerHTML =
      `<div style="color:var(--danger); padding:40px; text-align:center;">Error: ${safe(err?.message)}</div>`;
  }
}

export async function transcribeAudio(dom, audioBlob) {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const res = await fetch("/stt", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Transcription failed");
    return safe(data.text);
  } catch (err) {
    showToast(dom, "Transcription error: " + safe(err?.message), "error");
    return "";
  }
}
