export function dom() {
  const $ = (id) => document.getElementById(id);

  return {
    // sections
    welcomeSection: $("welcomeSection"),
    debateTopicDisplay: $("debateTopicDisplay"),
    currentTopicText: $("currentTopicText"),
    conversationSection: $("conversationSection"),
    inputSection: $("inputSection"),
    feedbackSection: $("feedbackSection"),
    resetSection: $("resetSection"),
    timerSection: $("timerSection"),
    timerDisplay: $("timerDisplay"),

    // settings modal
    settingsBtn: $("settingsBtn"),
    openSetupBtn: $("openSetupBtn"),
    settingsModal: $("settingsModal"),
    closeModalBtn: $("closeModalBtn"),

    stanceSelect: $("stanceSelect"),
    difficultySelect: $("difficultySelect"),
    modeSelect: $("modeSelect"),
    topicInput: $("topicInput"),
    suggestTopicsBtn: $("suggestTopicsBtn"),
    startSessionBtn: $("startSessionBtn"),
    autoSpeakSelect: $("autoSpeakSelect"),
    voiceSelect: $("voiceSelect"),
    testVoiceBtn: $("testVoiceBtn"),
    stopSpeakingBtn: $("stopSpeakingBtn"),

    topicsListWrapper: $("topicsListWrapper"),
    topicsSelect: $("topicsSelect"),
    hideTopicsBtn: $("hideTopicsBtn"),

    // input controls
    recordBtn: $("recordBtn"),
    stopRecordBtn: $("stopRecordBtn"),
    typeBtn: $("typeBtn"),
    transcriptDisplay: $("transcriptDisplay"),
    manualInput: $("manualInput"),
    sendBtn: $("sendBtn"),
    endSessionBtn: $("endSessionBtn"),

    // actions
    resetBtn: $("resetBtn"),
    endDebateBtn: $("endDebateBtn"),
    switchSidesBtn: $("switchSidesBtn"),
    continueDebateBtn: $("continueDebateBtn"),

    // feedback
    feedbackContent: $("feedbackContent"),
    downloadFeedbackBtn: $("downloadFeedbackBtn"),
    printFeedbackBtn: $("printFeedbackBtn"),
    newSessionBtn: $("newSessionBtn"),

    // toast
    toast: $("toast"),
    toastMessage: $("toastMessage"),
  };
}

export function selectedTurnMinutes() {
  const el = document.querySelector('input[name="turnMinutes"]:checked');
  const n = Number(el?.value);
  return Number.isFinite(n) ? n : 5;
}
