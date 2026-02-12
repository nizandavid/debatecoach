export const state = {
  sessionActive: false,

  // Debate settings
  topic: "",
  stance: "PRO",          // student's side
  difficulty: "Medium",
  mode: "practice",       // 'practice' or 'competition'
  turnTimeSec: 300,       // seconds per TURN (competition)
  autoSpeak: true,
  voiceURI: "",

  // Flow
  debateNo: 1,
  turnIndex: 0,
  totalTurns: 6,
  studentStarts: true,    // PRO starts first; if student is PRO => true

  // Data for feedback/export
  messages: [],
  feedbackTurns: [],

  // Recording
  currentTranscript: "",
  isRecording: false,
  mediaRecorder: null,
  recordingStartTime: 0,

  // Timer
  timerInterval: null,
  timeRemaining: 0,
};