export function safe(str, fallback = "") {
  return typeof str === "string" ? str : fallback;
}

export function nowTs() { return Date.now(); }

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
