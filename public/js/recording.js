import { showToast } from "./toast.js";

// Initialize Speech Recognition (Web Speech API)
let recognition = null;
let finalTranscript = "";
let interimTranscript = "";

function initSpeechRecognition() {
  // Check for browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Web Speech API not supported in this browser");
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = 'en-US';
  recognizer.maxAlternatives = 1;

  return recognizer;
}

async function transcribeAudio(dom, blob) {
  try {
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    const response = await fetch("/stt", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.transcript || "";
  } catch (err) {
    console.error("Transcription error:", err);
    showToast(dom, "Transcription failed: " + (err?.message || err), "error");
    return null;
  }
}

export async function startRecording(dom, state) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    // Reset transcripts
    finalTranscript = "";
    interimTranscript = "";

    // Initialize Web Speech API for real-time transcription
    recognition = initSpeechRecognition();
    
    if (recognition) {
      console.log("✅ Web Speech API initialized for real-time transcription");
      
      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
      };

      recognition.onresult = (event) => {
        interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
            console.log("✅ Final:", transcript);
          } else {
            interimTranscript += transcript;
            console.log("⏳ Interim:", transcript);
          }
        }

        // Update display in real-time
        const displayText = finalTranscript + interimTranscript;
        if (displayText.trim()) {
          dom.transcriptDisplay.textContent = displayText;
          dom.transcriptDisplay.classList.remove("empty");
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          console.log("No speech detected, waiting...");
        } else if (event.error === 'network') {
          showToast(dom, "Network error in speech recognition", "error");
        }
      };

      recognition.onend = () => {
        console.log("🛑 Speech recognition ended");
      };

      // Start speech recognition
      try {
        recognition.start();
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    } else {
      console.log("⚠️ Web Speech API not available - will use Whisper only");
      dom.transcriptDisplay.textContent = "Recording... (transcript will appear after you stop)";
      dom.transcriptDisplay.classList.remove("empty");
    }

    state.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    state.mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      stream.getTracks().forEach(track => track.stop());

      // Stop speech recognition if running
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.warn("Error stopping recognition:", err);
        }
      }

      // Store the real-time transcript
      const realtimeTranscript = (finalTranscript + interimTranscript).trim();
      console.log("📝 Real-time transcript:", realtimeTranscript);

      // Show loading state
      showToast(dom, "Processing with Whisper for accuracy...", "info");

      // Get Whisper transcription for accuracy
      const whisperTranscript = await transcribeAudio(dom, blob);

      if (whisperTranscript) {
        console.log("🎯 Whisper transcript:", whisperTranscript);
        
        // Use Whisper transcript as the final version (more accurate)
        state.currentTranscript = whisperTranscript;
        dom.transcriptDisplay.textContent = whisperTranscript;
        dom.transcriptDisplay.classList.remove("empty");
        
        showToast(dom, "Transcription complete!", "success");
      } else if (realtimeTranscript) {
        // Fallback to real-time transcript if Whisper fails
        console.log("⚠️ Using real-time transcript as fallback");
        state.currentTranscript = realtimeTranscript;
        dom.transcriptDisplay.textContent = realtimeTranscript;
        dom.transcriptDisplay.classList.remove("empty");
        
        showToast(dom, "Using real-time transcription", "info");
      } else {
        // Both failed
        showToast(dom, "No transcription available", "error");
      }

      // Reset for next recording
      finalTranscript = "";
      interimTranscript = "";
    };

    state.mediaRecorder.start();
    state.recordingStartTime = Date.now();
    state.isRecording = true;

    dom.recordBtn.disabled = true;
    dom.stopRecordBtn.disabled = false;

    showToast(dom, "Recording... Speak now!", "info");
  } catch (err) {
    console.error("Recording error:", err);
    showToast(dom, "Microphone access denied: " + (err?.message || err), "error");
  }
}

export function stopRecording(dom, state) {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;

    dom.recordBtn.disabled = false;
    dom.stopRecordBtn.disabled = true;

    // Speech recognition will be stopped in mediaRecorder.onstop
  }
}
