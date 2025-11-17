function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "en,th,zh-CN",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    "google_translate_element"
  );
}

function setLanguageLabel(languageCode) {
  const labelMap = {
    "/en/en": "EN",
    "/en/th": "TH",
    "/en/zh-CN": "ZH",
  };

  const label = labelMap[languageCode] ?? "EN";
  document.querySelectorAll("[data-translate-label]").forEach((node) => {
    node.textContent = label;
  });
}

function handleGoogleTranslateCookie() {
  const stored = Cookies.get("googtrans");
  if (!stored) {
    setLanguageLabel("/en/en");
    return;
  }
  setLanguageLabel(stored);
}

function removeGoogleTranslateCookie() {
  Cookies.remove("googtrans");
  Cookies.remove("googtrans", { domain: ".wizerproperties.com" });
  Cookies.remove("googtrans", { domain: "wizerproperties.com" });
}

function initTranslateDropdowns() {
  const components = document.querySelectorAll("[data-translate]");
  const closeAllMenus = () => {
    components.forEach((component) => {
      const menu = component.querySelector("[data-translate-menu]");
      const trigger = component.querySelector("[data-translate-trigger]");
      if (menu && trigger) {
        menu.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  };

  components.forEach((component) => {
    const trigger = component.querySelector("[data-translate-trigger]");
    const menu = component.querySelector("[data-translate-menu]");
    const options = component.querySelectorAll("[data-language]");

    if (!trigger || !menu) return;

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isHidden = menu.classList.contains("hidden");
      closeAllMenus();
      if (isHidden) {
        menu.classList.remove("hidden");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    menu.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const language = option.getAttribute("data-language");
        if (!language) return;

        removeGoogleTranslateCookie();
        setTimeout(() => {
          Cookies.set("googtrans", language);
          Cookies.set("googtrans", language, { domain: ".wizerproperties.com" });
          Cookies.set("googtrans", language, { domain: "wizerproperties.com" });
          window.location.reload();
        }, 300);
      });
    });
  });

  document.addEventListener("click", () => {
    closeAllMenus();
  });
}

handleGoogleTranslateCookie();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTranslateDropdowns);
} else {
  initTranslateDropdowns();
}