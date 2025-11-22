const PR_CREATE_SOUND = "sounds/pr-created.mp3";

function play(sound) {
  chrome.runtime.sendMessage({ type: "PLAY_SOUND", sound });
}

function hookCreatePRButton() {
  const candidates = Array.from(
    document.querySelectorAll("button, input[type=submit]")
  );

  const createBtn = candidates.find((el) => {
    const text = (el.textContent || el.value || "").trim();
    return /create pull request/i.test(text);
  });

  if (createBtn && !createBtn.__prSfxHooked) {
    createBtn.__prSfxHooked = true;
    createBtn.addEventListener("click", () => play(PR_CREATE_SOUND), {
      once: true,
    });
  }
}

// GitHub is a SPA, so watch for DOM changes
const observer = new MutationObserver(hookCreatePRButton);
observer.observe(document.body, { childList: true, subtree: true });

// first run
hookCreatePRButton();
