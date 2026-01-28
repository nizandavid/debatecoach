import { formatTime } from "./utils.js";
import { showToast } from "./toast.js";

export function stopTimer(dom, state) {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  dom.timerSection?.classList.add("hidden");
}

export function startTurnTimer(dom, state, seconds, onExpire) {
  stopTimer(dom, state);
  if (state.mode !== "competition") return;

  state.timeRemaining = seconds;
  dom.timerSection?.classList.remove("hidden");
  if (dom.timerDisplay) dom.timerDisplay.textContent = formatTime(state.timeRemaining);

  state.timerInterval = setInterval(() => {
    state.timeRemaining -= 1;
    if (dom.timerDisplay) dom.timerDisplay.textContent = formatTime(state.timeRemaining);

    if (state.timeRemaining <= 0) {
      stopTimer(dom, state);
      showToast(dom, "Time's up for this turn — sending!", "error");
      onExpire?.();
    }
  }, 1000);
}
