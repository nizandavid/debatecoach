// tts.js - Chrome TTS workaround
let unlocked = false;
let voices = [];

export function initTTS(D, state) {
  if (!window.speechSynthesis) {
    console.error("Browser does not support TTS");
    return;
  }
  
  // Clear on init
  try {
    speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }
  
  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log("Loaded " + voices.length + " voices");
    populateVoiceSelect(D);
  }

  function populateVoiceSelect(D) {
    if (!D.voiceSelect) return;
    
    const englishVoices = voices.filter(function(v) {
      return v.lang.startsWith("en");
    });
    
    console.log("Found " + englishVoices.length + " English voices");
    
    D.voiceSelect.innerHTML = '<option value="">(System Default)</option>';
    
    englishVoices.forEach(function(voice) {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = voice.name + " (" + voice.lang + ")";
      D.voiceSelect.appendChild(option);
    });
  }

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
  
  document.body.addEventListener('click', function() {
    if (!unlocked) {
      unlockTTS();
    }
  });

  if (D.autoSpeakSelect) {
    D.autoSpeakSelect.addEventListener("change", function() {
      state.autoSpeak = D.autoSpeakSelect.value === "true";
      console.log("Auto-speak: " + state.autoSpeak);
    });
  }

  if (D.voiceSelect) {
    D.voiceSelect.addEventListener("change", function() {
      state.voiceURI = D.voiceSelect.value;
      console.log("Voice: " + state.voiceURI);
    });
  }

  if (D.testVoiceBtn) {
    D.testVoiceBtn.addEventListener("click", function() {
      console.log("Testing voice...");
      stopSpeaking();
      setTimeout(function() {
        unlockTTS();
        setTimeout(function() {
          speak("Hello! This is a test of the text to speech system.", state.voiceURI);
        }, 200);
      }, 200);
    });
  }

  if (D.stopSpeakingBtn) {
    D.stopSpeakingBtn.addEventListener("click", function() {
      console.log("Stopping...");
      stopSpeaking();
    });
  }
}

export function unlockTTS() {
  if (unlocked) {
    return;
  }

  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    speechSynthesis.speak(u);
    unlocked = true;
    console.log("TTS unlocked");
  } catch (e) {
    console.error("Unlock failed");
  }
}

export function speak(text, selectedVoiceURI) {
  if (!text) return;
  if (!speechSynthesis) return;
  
  console.log("speak() called");
  
  // Force stop any stuck speech
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    console.log("Canceling stuck speech...");
    speechSynthesis.cancel();
  }
  
  if (!unlocked) {
    console.log("Unlocking...");
    unlockTTS();
    setTimeout(function() {
      speak(text, selectedVoiceURI);
    }, 300);
    return;
  }

  // Wait for cancel to complete
  setTimeout(function() {
    actuallySpeak(text, selectedVoiceURI);
  }, 150);
}

function actuallySpeak(text, selectedVoiceURI) {
  console.log("actuallySpeak() called");
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find voice
  let selectedVoice = null;
  
  if (selectedVoiceURI) {
    selectedVoice = voices.find(function(v) {
      return v.name === selectedVoiceURI;
    });
  }
  
  // If no voice selected or not found, use Alex (more reliable than Samantha in Chrome)
  if (!selectedVoice) {
    selectedVoice = voices.find(function(v) {
      return v.name === "Alex";
    });
  }
  
  // Fallback to any English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(function(v) {
      return v.lang.startsWith("en") && !v.name.includes("Google");
    });
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log("Using voice: " + selectedVoice.name);
  } else {
    console.log("Using browser default voice");
  }

  utterance.onend = function() {
  console.log("✅ Speaking ended");
  
  // Show input when TTS finishes
  import('./ui.js').then(module => {
    const dom = {
      inputSection: document.getElementById('inputSection'),
      recordBtn: document.getElementById('recordBtn'),
      stopRecordBtn: document.getElementById('stopRecordBtn')
    };
    module.showInput(dom);
    
    // Reset recording buttons
    if (dom.recordBtn) dom.recordBtn.disabled = false;
    if (dom.stopRecordBtn) dom.stopRecordBtn.disabled = true;
  });
  
  import('./toast.js').then(module => {
    module.showToast(
      { toastEl: document.getElementById('toast'), toastTextEl: document.getElementById('toastText') },
      "✨ Your turn! Click Record to respond",
      "info"
    );
  });
};

  utterance.onerror = function(e) {
    console.error("❌ Speech error:", e.error);
  };

  try {
    console.log("Calling speak()...");
    speechSynthesis.speak(utterance);
    
    // CHROME WORKAROUND: Force resume after a tiny delay
    // This fixes the "stuck speaking" issue in Chrome
    setTimeout(function() {
      if (speechSynthesis.paused) {
        console.log("Resuming (Chrome workaround)...");
        speechSynthesis.resume();
      }
    }, 10);
    
    // Another workaround: pause and resume
    setTimeout(function() {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        console.log("Pause/Resume workaround...");
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, 100);
    
    console.log("Speak command sent");
    
  } catch (e) {
    console.error("Failed to speak:", e);
  }
}

export function stopSpeaking() {
  try {
    speechSynthesis.cancel();
    console.log("Speech stopped");
  } catch (e) {
    console.error("Error stopping:", e);
  }
}

export const speakText = speak;
window.__internalSpeak = speakText;
