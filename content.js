const PR_CREATE_SOUND = "sounds/pr-created.mp3";

function play(sound) {
  chrome.runtime.sendMessage({ type: "PLAY_SOUND", sound });
}

let pendingCreate = false;
let lastUrl = location.href;

function findFinalCreateButton() {
  // On the PR creation form, the final submit is usually:
  // button with text "Create pull request" and type="submit"
  const buttons = Array.from(
    document.querySelectorAll("button, input[type=submit]")
  );

  return buttons.find((el) => {
    const text = (el.textContent || el.value || "").trim();
    const isCreateText = /create pull request/i.test(text);

    // Heuristic: final button is submit OR in a form
    const isSubmit =
      el.type === "submit" || el.getAttribute("type") === "submit";
    const inForm = !!el.closest("form");

    return isCreateText && (isSubmit || inForm);
  });
}

function hookFinalCreateClick() {
  const btn = findFinalCreateButton();
  if (!btn || btn.__prSfxHooked) return;

  btn.__prSfxHooked = true;
  btn.addEventListener(
    "click",
    () => {
      // User clicked the final submit
      pendingCreate = true;
    },
    { capture: true }
  );
}

function isPullRequestPage(url) {
  // Matches https://github.com/owner/repo/pull/123
  try {
    const u = new URL(url);
    return /\/pull\/\d+($|\/)/.test(u.pathname);
  } catch {
    return false;
  }
}

function handleNav() {
  if (location.href === lastUrl) return;

  lastUrl = location.href;

  if (pendingCreate && isPullRequestPage(lastUrl)) {
    pendingCreate = false;
    play(PR_CREATE_SOUND);
  } else {
    // If they navigated elsewhere, clear the flag
    if (!/compare|pull\/new/i.test(lastUrl)) {
      pendingCreate = false;
    }
  }

  hookFinalCreateClick();
}

// GitHub SPA: observe DOM + URL changes
const observer = new MutationObserver(() => {
  hookFinalCreateClick();
  handleNav();
});

observer.observe(document.body, { childList: true, subtree: true });

// initial
hookFinalCreateClick();
