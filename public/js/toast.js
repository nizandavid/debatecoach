export function showToast(dom, message, type = "info") {
  if (!dom.toast || !dom.toastMessage) return;
  dom.toastMessage.textContent = message;
  dom.toast.className = "toast show " + type;
  window.setTimeout(() => dom.toast.classList.remove("show"), 3000);
}