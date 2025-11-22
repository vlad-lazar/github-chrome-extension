const enabledToggle = document.getElementById("enabledToggle");
const volume = document.getElementById("volume");
const volumeOut = document.getElementById("volumeOut");
const statusEl = document.getElementById("status");
const testBtn = document.getElementById("testBtn");

async function loadSettings() {
  const { enabled = true, volume = 75 } = await chrome.storage.local.get([
    "enabled",
    "volume",
  ]);
  enabledToggle.checked = enabled;
  volume.value = volume;
  volumeOut.textContent = `${volume}%`;
  statusEl.textContent = enabled ? "Enabled ✅" : "Muted 🔇";
}

async function saveSettings(patch) {
  await chrome.storage.local.set(patch);
  loadSettings();
}

enabledToggle.addEventListener("change", () => {
  saveSettings({ enabled: enabledToggle.checked });
});

volume.addEventListener("input", () => {
  const v = Number(volume.value);
  volumeOut.textContent = `${v}%`;
});
volume.addEventListener("change", () => {
  saveSettings({ volume: Number(volume.value) });
});

testBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "PLAY_SOUND",
    sound: "sounds/pr-created.mp3",
  });
});

loadSettings();
