import { showToast } from "./toast.js";
import { transcribeAudio } from "./api.js";

export async function startRecording(dom, state) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    state.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    state.mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      stream.getTracks().forEach(track => track.stop());

      showToast(dom, "Transcribing...", "info");
      const transcript = await transcribeAudio(dom, blob);

      if (transcript) {
        state.currentTranscript = transcript;
        dom.transcriptDisplay.textContent = transcript;
        dom.transcriptDisplay.classList.remove("empty");
        showToast(dom, "Transcription complete!", "success");
      }
    };

    state.mediaRecorder.start();
    state.recordingStartTime = Date.now();
    state.isRecording = true;

    dom.recordBtn.disabled = true;
    dom.stopRecordBtn.disabled = false;

    showToast(dom, "Recording...", "info");
  } catch (err) {
    showToast(dom, "Microphone access denied: " + (err?.message || err), "error");
  }
}

export function stopRecording(dom, state) {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;

    dom.recordBtn.disabled = false;
    dom.stopRecordBtn.disabled = true;
  }
}
