export function initAccordion() {
  document.querySelectorAll(".acc-header").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.acc;
      const item = btn.closest(".acc-item");
      const body = document.getElementById(targetId);
      if (!body || !item) return;

      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".acc-item").forEach(i => i.classList.remove("open"));
      document.querySelectorAll(".acc-body").forEach(b => b.classList.add("hidden"));

      if (!isOpen) {
        item.classList.add("open");
        body.classList.remove("hidden");
      }
    });
  });

  // default open setup
  const setupItem = document.getElementById("accItemSetup");
  const setupBody = document.getElementById("accSetup");
  if (setupItem && setupBody) {
    setupItem.classList.add("open");
    setupBody.classList.remove("hidden");
  }
}