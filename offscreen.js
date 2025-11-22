chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "OFFSCREEN_PLAY") return;

  const audio = new Audio(chrome.runtime.getURL(msg.sound));
  audio.volume = Math.max(0, Math.min(1, (msg.volume ?? 70) / 100));
  audio.play().catch(() => {});
});
