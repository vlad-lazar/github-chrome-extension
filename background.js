async function ensureOffscreen() {
  const has = await chrome.offscreen.hasDocument?.();
  if (has) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play PR creation sound",
  });
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type !== "PLAY_SOUND") return;

  const { enabled = true, volume = 70 } = await chrome.storage.local.get([
    "enabled",
    "volume",
  ]);
  if (!enabled) return;

  await ensureOffscreen();
  chrome.runtime.sendMessage({
    type: "OFFSCREEN_PLAY",
    sound: msg.sound,
    volume,
  });
});
