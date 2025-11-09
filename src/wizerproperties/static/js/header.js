document.addEventListener("DOMContentLoaded", () => {
  const mobileTrigger = document.querySelector("[data-mobile-nav-trigger]");
  const mobilePanel = document.querySelector("[data-mobile-nav-panel]");
  const confirmationDialog = document.querySelector("[data-confirmation-dialog]");
  const confirmationCloseButtons = confirmationDialog
    ? confirmationDialog.querySelectorAll("[data-confirmation-close], [data-confirmation-dismiss]")
    : [];
  const authModal = document.querySelector("[data-auth-modal]");
  const authModalClose = authModal ? authModal.querySelector("[data-auth-modal-close]") : null;

  const toggleMobileNav = (forceState) => {
    if (!mobilePanel || !mobileTrigger) return;
    const isOpen = forceState !== undefined ? forceState : mobilePanel.hasAttribute("hidden");
    if (isOpen) {
      mobilePanel.removeAttribute("hidden");
      mobileTrigger.setAttribute("aria-expanded", "true");
      document.body.classList.add("overflow-hidden", "lg:overflow-visible");
    } else {
      mobilePanel.setAttribute("hidden", "");
      mobileTrigger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("overflow-hidden");
    }
  };

  mobileTrigger?.addEventListener("click", () => toggleMobileNav());

  document.addEventListener("click", (event) => {
    if (!mobilePanel || !mobileTrigger) return;
    const isClickInside =
      mobilePanel.contains(event.target) || mobileTrigger.contains(event.target);
    if (!isClickInside && !mobilePanel.hasAttribute("hidden")) {
      toggleMobileNav(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      toggleMobileNav(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleMobileNav(false);
      if (confirmationDialog && !confirmationDialog.classList.contains("hidden")) {
        confirmationDialog.classList.add("hidden");
      }
      if (authModal && !authModal.classList.contains("hidden")) {
        authModal.classList.add("hidden");
      }
    }
  });

  confirmationCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      confirmationDialog.classList.add("hidden");
    });
  });

  confirmationDialog?.addEventListener("click", (event) => {
    if (event.target === confirmationDialog) {
      confirmationDialog.classList.add("hidden");
    }
  });

  authModalClose?.addEventListener("click", () => authModal.classList.add("hidden"));
  authModal?.addEventListener("click", (event) => {
    if (event.target === authModal) {
      authModal.classList.add("hidden");
    }
  });
});