import confetti from "canvas-confetti";

export function celebrate() {
  const defaults = {
    spread: 60,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
  };

  confetti({
    ...defaults,
    angle: 60,
    origin: { x: 0, y: 0.7 },
    particleCount: 80,
  });
  confetti({
    ...defaults,
    angle: 120,
    origin: { x: 1, y: 0.7 },
    particleCount: 80,
  });
}

export function showLevelUp(level, title) {
  celebrate();

  const overlay = document.createElement("div");
  overlay.className = "lexis-levelup-overlay";

  overlay.innerHTML = `
    <div class="lexis-levelup-card">
      <div style="font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">Level Up!</div>
      <div style="font-size: 1.3rem; opacity: 0.85;">Level ${level} - ${title}</div>
    </div>`;

  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);

  setTimeout(() => {
    if (document.body.contains(overlay)) overlay.remove();
  }, 2500);
}

export function showFloatingLabel(container, text, colorClass) {
  const el = document.createElement("span");
  el.className = `lexis-float-label ${colorClass}`;
  el.textContent = text;

  const rect = container.getBoundingClientRect();
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 2}px`;

  document.body.appendChild(el);
  setTimeout(() => {
    if (document.body.contains(el)) el.remove();
  }, 1000);
}
