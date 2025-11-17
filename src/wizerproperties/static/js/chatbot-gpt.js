document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-chat-form]");
  const input = document.querySelector("[data-chat-input]");
  const sendButton = document.querySelector("[data-chat-send]");
  const statusText = document.querySelector("[data-chat-status]");
  const historyContainer = document.querySelector("[data-chat-history]");
  const messagesList = document.querySelector("[data-chat-messages]");
  const emptyState = messagesList ? messagesList.querySelector("[data-chat-empty]") : null;
  const promptButtons = document.querySelectorAll("[data-chat-prompt]");

  if (!form || !input || !sendButton || !messagesList || !historyContainer) return;

  const scrollToBottom = () => {
    historyContainer.scrollTo({ top: historyContainer.scrollHeight, behavior: "smooth" });
  };

  const setLoading = (isLoading) => {
    if (isLoading) {
      sendButton.setAttribute("disabled", "disabled");
      statusText?.removeAttribute("hidden");
    } else {
      sendButton.removeAttribute("disabled");
      statusText?.setAttribute("hidden", "hidden");
    }
  };

  const createMessageNode = (role, content) => {
    const li = document.createElement("li");
    li.className = "flex";

    const bubble = document.createElement("div");
    bubble.className = role === "user"
      ? "ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm"
      : "mr-auto max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-muted/60 px-4 py-3 text-sm text-foreground shadow-sm";
    bubble.textContent = content;

    li.appendChild(bubble);
    return li;
  };

  const appendMessage = (role, content) => {
    if (!content) return;
    if (emptyState && !emptyState.hasAttribute("hidden")) {
      emptyState.setAttribute("hidden", "hidden");
    }
    messagesList.appendChild(createMessageNode(role, content));
    scrollToBottom();
  };

  const parseAssistantMessage = (payload) => {
    try {
      const data = typeof payload === "string" ? JSON.parse(payload) : payload;
      const choice = data?.choices?.[0]?.message?.content;
      return choice || "I’m here if you have more questions.";
    } catch (error) {
      console.warn("Failed to parse Home Helper AI response", error);
      return "Here’s what I found. Please try again if you need more detail.";
    }
  };

  const autoResizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 200)}px`;
  };

  autoResizeInput();

  input.addEventListener("input", () => {
    autoResizeInput();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  promptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.textContent?.trim() || "";
      autoResizeInput();
      input.focus();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const value = input.value.trim();
    if (!value) return;

    appendMessage("user", value);
    setLoading(true);
    input.value = "";
    autoResizeInput();

    const body = new URLSearchParams();
    body.append("content", value);

    try {
      const response = await fetch("/core/api/chatbot-gpt-api/", {
        method: "POST",
        headers: {
          "X-CSRFToken": typeof csrfToken !== "undefined" ? csrfToken : "",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();
      const assistantMessage = parseAssistantMessage(result?.data);
      appendMessage("assistant", assistantMessage);
    } catch (error) {
      console.error("Home Helper AI request failed", error);
      appendMessage("assistant", "Sorry, I couldn’t reach the Home Helper service. Please try again in a moment.");
    } finally {
      setLoading(false);
      input.focus();
    }
  });
});