document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const alertsRegion = form.querySelector("[data-contact-alerts]");
  const errorsRegion = form.querySelector("[data-contact-errors]");
  const submitButton = form.querySelector("[data-contact-submit]");
  const submitText = submitButton?.querySelector("[data-contact-submit-text]");
  const submitSpinner = submitButton?.querySelector("[data-contact-submit-spinner]");

  const inputs = {
    email: form.querySelector('[data-contact-input="email"]'),
    subject: form.querySelector('[data-contact-input="subject"]'),
    body: form.querySelector('[data-contact-input="body"]'),
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const resetMessages = () => {
    alertsRegion.innerHTML = "";
    errorsRegion.innerHTML = "";
  };

  const renderAlert = (message, variant = "success") => {
    const div = document.createElement("div");
    div.className = variant === "success" ? "alert alert-success" : "alert alert-danger";
    div.setAttribute("role", "alert");
    div.textContent = message;
    alertsRegion.appendChild(div);
  };

  const renderErrors = (messages) => {
    if (!messages.length) return;

    const list = document.createElement("ul");
    list.className = "space-y-1";

    messages.forEach((message) => {
      const item = document.createElement("li");
      item.className = "flex items-start gap-2";
      item.innerHTML = `<span class="mt-0.5 inline-flex size-1.5 rounded-full bg-destructive"></span><span>${message}</span>`;
      list.appendChild(item);
    });

    errorsRegion.appendChild(list);
  };

  const setLoading = (isLoading) => {
    if (!submitButton) return;
    submitButton.disabled = isLoading;

    if (submitText) {
      submitText.classList.toggle("hidden", isLoading);
    }
    if (submitSpinner) {
      submitSpinner.classList.toggle("hidden", !isLoading);
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetMessages();

    const email = inputs.email?.value.trim() ?? "";
    const subject = inputs.subject?.value.trim() ?? "";
    const body = inputs.body?.value.trim() ?? "";

    const errors = [];
    if (!email || !emailRegex.test(email)) {
      errors.push("Enter a valid email address.");
    }
    if (!subject) {
      errors.push("Add a subject so we can triage your request.");
    }
    if (!body) {
      errors.push("Share a few details about what you need help with.");
    }

    if (errors.length) {
      renderErrors(errors);
      return;
    }

    const payload = {
      email,
      subject,
      body,
    };

    try {
      setLoading(true);
      const response = await fetch("/core/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": typeof csrfToken !== "undefined" ? csrfToken : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // PostHog tracking - track form submission (without PII)
      if (typeof Analytics !== 'undefined') {
        Analytics.trackFormSubmit('contact_form', {
          subject: subject
        });
      }

      renderAlert("Thanks for reaching out. A member of the team will contact you shortly.");
      form.reset();
    } catch (error) {
      console.error("Contact form submission failed", error);
      renderAlert("We couldn’t send your message right now. Please try again in a moment.", "danger");
    } finally {
      setLoading(false);
    }
  });
});