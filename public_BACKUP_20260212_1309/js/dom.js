// dom.js - DOM references (FIXED WITH selectedTurnMinutes)
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
    stopResetBtn: $("stopResetBtn"),
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

    // input controls
    recordBtn: $("recordBtn"),
    stopRecordBtn: $("stopRecordBtn"),
    typeBtn: $("typeBtn"),
    sendBtn: $("sendBtn"),
    transcriptDisplay: $("transcriptDisplay"),
    manualInput: $("manualInput"),

    // action buttons
    resetBtn: $("resetBtn"),
    endDebateBtn: $("endDebateBtn"),
    endSessionBtn: $("endSessionBtn"),
    switchSidesBtn: $("switchSidesBtn"),

    // feedback
    feedbackContent: $("feedbackContent"),
    downloadFeedbackBtn: $("downloadFeedbackBtn"),
    printFeedbackBtn: $("printFeedbackBtn"),
    newSessionBtn: $("newSessionBtn"),

    // topics
    topicsListWrapper: $("topicsListWrapper"),
    topicsSelect: $("topicsSelect"),
    hideTopicsBtn: $("hideTopicsBtn"),

    // toast
    toast: $("toast"),
    toastMessage: $("toastMessage"),

    // ============ NEW ELEMENTS (ADDED!) ============
    
    // Welcome screen elements
    mainTopicDisplay: $("mainTopicDisplay"),
    editTopicBtn: $("editTopicBtn"),
    newTopicBtn: $("newTopicBtn"),
    topicInputWrapper: $("topicInputWrapper"),
    mainTopicInput: $("mainTopicInput"),
    saveTopicBtn: $("saveTopicBtn"),
    cancelTopicBtn: $("cancelTopicBtn"),
    suggestTopicsMainBtn: $("suggestTopicsMainBtn"),
    topicsListWrapperMain: $("topicsListWrapperMain"),
    topicsSelectMain: $("topicsSelectMain"),
    startDebateBtn: $("startDebateBtn"),
    
    // Loading state
    loadingState: $("loadingState"),
    
    // Continue prompt
    continuePrompt: $("continuePrompt"),
    continueMoreBtn: $("continueMoreBtn"),
    getFeedbackBtn: $("getFeedbackBtn"),
    newTopicBtn2: $("newTopicBtn2"),
    
    // Stats section
    statsSection: $("statsSection"),
    statArguments: $("statArguments"),
    statAvgLength: $("statAvgLength"),
    statDuration: $("statDuration"),
    statDifficulty: $("statDifficulty"),
    
    // Error modal
    errorOverlay: $("errorOverlay"),
    errorTitle: $("errorTitle"),
    errorMessage: $("errorMessage"),
    errorRetryBtn: $("errorRetryBtn"),
    errorCancelBtn: $("errorCancelBtn"),

    // Settings
    closeSettingsBtn: $("closeSettingsBtn")
  };
}

// ============ HELPER FUNCTION (REQUIRED BY flow.js) ============
export function selectedTurnMinutes() {
  const el = document.querySelector('input[name="turnMinutes"]:checked');
  const n = Number(el?.value);
  return Number.isFinite(n) ? n : 5;
}
