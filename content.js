const PR_CREATE_SOUND = "sounds/pr-created.mp3";

function play(sound) {
  chrome.runtime.sendMessage({ type: "PLAY_SOUND", sound });
}

let pendingCreate = false;
let playedForThisCreate = false;
let lastUrl = location.href;

function looksLikeFinalPRCreateButton(el) {
  const btn = el.closest("button, input[type=submit]");
  if (!btn) return false;

  const text = (btn.textContent || btn.value || "").trim().toLowerCase();

  const isCreate =
    text.includes("create pull request") ||
    text.includes("create draft pull request");

  if (!isCreate) return false;

  // Heuristic: final create button is on PR creation screen and inside a form
  const form = btn.closest("form");
  if (!form) return true; // sometimes GitHub uses JS submit without explicit form

  const action = (form.getAttribute("action") || "").toLowerCase();
  // Action often contains /pull/create or similar
  const looksPRForm =
    action.includes("/pull/create") ||
    action.includes("/compare/") ||
    action.includes("/pull/new");

  return looksPRForm || true; // keep permissive once text matches
}

function isPullRequestPage(url) {
  try {
    const u = new URL(url);
    return /\/pull\/\d+($|\/)/.test(u.pathname);
  } catch {
    return false;
  }
}

function checkForSuccessToast() {
  // GitHub shows a flash/notice on success; catch common containers
  const flashes = Array.from(
    document.querySelectorAll(".flash, .js-flash-alert, .Toast, [role='alert']")
  );

  return flashes.some((el) =>
    /pull request created|successfully created|created pull request/i.test(
      el.textContent || ""
    )
  );
}

// 1) Capture clicks anywhere (works even if button is re-rendered)
document.addEventListener(
  "click",
  (e) => {
    if (looksLikeFinalPRCreateButton(e.target)) {
      pendingCreate = true;
      playedForThisCreate = false;
    }
  },
  true // capture phase so we catch before GitHub handlers
);

// 2) Watch SPA navigations + DOM changes
const observer = new MutationObserver(() => {
  // URL change detection
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    if (pendingCreate && !playedForThisCreate && isPullRequestPage(lastUrl)) {
      playedForThisCreate = true;
      pendingCreate = false;
      play(PR_CREATE_SOUND);
    }
  }

  // Toast-based fallback (in case GitHub doesn't hard-navigate)
  if (pendingCreate && !playedForThisCreate && checkForSuccessToast()) {
    playedForThisCreate = true;
    pendingCreate = false;
    play(PR_CREATE_SOUND);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
