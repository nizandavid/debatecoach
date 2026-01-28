import { showToast } from "./toast.js";

export function buildTranscriptText(state) {
  const lines = [];
  lines.push("DebateCoach Transcript");
  lines.push(`Topic: ${state.topic}`);
  lines.push(`Difficulty: ${state.difficulty}`);
  lines.push(`Mode: ${state.mode}`);
  lines.push("");

  state.messages.forEach(m => {
    if (m.who === "system") return;
    const tag = m.who === "computer" ? "COMPUTER" : (m.who === "student" ? "STUDENT" : "TEACHER");
    lines.push(`[${tag}] ${m.text}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function downloadSession(dom, state) {
  const content = buildTranscriptText(state) + "\n\n--- FEEDBACK ---\n\n" + (dom.feedbackContent?.textContent || "");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "debatecoach-session.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(dom, "Session downloaded!", "success");
}

export function printSession(dom, state) {
  const transcript = buildTranscriptText(state);
  const feedback = dom.feedbackContent?.textContent || "";
  const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const win = window.open("", "_blank");
  win.document.write(`
    <div style="font-family:system-ui; padding:24px; line-height:1.5;">
      <h2>DebateCoach — Session</h2>
      <h3>Transcript</h3>
      <pre style="white-space:pre-wrap; font-size:15px;">${esc(transcript)}</pre>
      <h3>Teacher Feedback</h3>
      <pre style="white-space:pre-wrap; font-size:15px;">${esc(feedback)}</pre>
    </div>
  `);
  win.document.close();
  win.focus();
  win.print();
}
