// download-transcript.js - Download debate transcript functionality

export function setupDownloadButton(dom, state) {
  const downloadBtn = document.getElementById('downloadTranscriptBtn');
  if (!downloadBtn) return;
  
  downloadBtn.addEventListener('click', () => {
    downloadTranscript(state);
  });
}

export function downloadTranscript(state) {
  if (!state.messages || state.messages.length === 0) {
    alert('No debate to download yet!');
    return;
  }
  
  // Generate transcript text
  let transcript = '='.repeat(60) + '\n';
  transcript += 'DEBATE TRANSCRIPT\n';
  transcript += '='.repeat(60) + '\n\n';
  
  transcript += `Topic: ${state.topic || 'N/A'}\n`;
  transcript += `Date: ${new Date().toLocaleString()}\n`;
  transcript += `Your Stance: ${state.stance || 'PRO'}\n`;
  transcript += `Total Arguments: ${state.turnIndex || 0}\n`;
  transcript += '\n' + '='.repeat(60) + '\n\n';
  
  // Add all messages
  state.messages.forEach((msg, index) => {
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
    const speaker = msg.who === 'student' ? 'YOU' : msg.who === 'computer' ? 'AI OPPONENT' : 'SYSTEM';
    const stance = msg.who === 'student' ? state.stance : (state.stance === 'PRO' ? 'CON' : 'PRO');
    
    if (msg.who !== 'system') {
      transcript += `[${timestamp}] ${speaker} (${stance}):\n`;
      transcript += `${msg.text}\n\n`;
      transcript += '-'.repeat(60) + '\n\n';
    }
  });
  
  transcript += '='.repeat(60) + '\n';
  transcript += 'END OF TRANSCRIPT\n';
  transcript += '='.repeat(60) + '\n';
  
  // Create download
  const blob = new Blob([transcript], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debate-transcript-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Transcript downloaded');
}

// Show download button when debate is active
export function showDownloadButton() {
  const downloadBtn = document.getElementById('downloadTranscriptBtn');
  if (downloadBtn) {
    downloadBtn.classList.remove('hidden');
  }
}

// Hide download button when no debate
export function hideDownloadButton() {
  const downloadBtn = document.getElementById('downloadTranscriptBtn');
  if (downloadBtn) {
    downloadBtn.classList.add('hidden');
  }
}
