document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-chat-form]");
  const input = document.querySelector("[data-chat-input]");
  const sendButton = document.querySelector("[data-chat-send]");
  const statusText = document.querySelector("[data-chat-status]");
  const historyContainer = document.querySelector("[data-chat-history]");
  const messagesList = document.querySelector("[data-chat-messages]");
  const emptyState = messagesList ? messagesList.querySelector("[data-chat-empty]") : null;
  const promptsContainer = document.querySelector("[data-chat-prompts-container]");
  const promptButtons = document.querySelectorAll("[data-chat-prompt]");

  if (!form || !input || !sendButton || !messagesList || !historyContainer) return;

  let typingIndicator = null;

  const scrollToBottom = () => {
    historyContainer.scrollTo({ top: historyContainer.scrollHeight, behavior: "smooth" });
  };

  const showTypingIndicator = () => {
    if (typingIndicator) return; // Already showing
    
    if (emptyState && !emptyState.hasAttribute("hidden")) {
      emptyState.setAttribute("hidden", "hidden");
    }
    if (promptsContainer && !promptsContainer.hasAttribute("hidden")) {
      promptsContainer.setAttribute("hidden", "hidden");
    }

    const li = document.createElement("li");
    li.className = "flex";
    li.setAttribute("data-typing-indicator", "");

    const bubble = document.createElement("div");
    bubble.className = "mr-auto max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white shadow-sm";
    bubble.style.backgroundColor = "rgba(127, 19, 119, 1)";
    bubble.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-flex size-2 animate-ping rounded-full bg-white"></span>
        <span>Getting your answer…</span>
      </div>
    `;

    li.appendChild(bubble);
    messagesList.appendChild(li);
    typingIndicator = li;
    scrollToBottom();
  };

  const hideTypingIndicator = () => {
    if (typingIndicator) {
      typingIndicator.remove();
      typingIndicator = null;
    }
  };

  const setLoading = (isLoading) => {
    if (isLoading) {
      sendButton.setAttribute("disabled", "disabled");
      showTypingIndicator();
    } else {
      sendButton.removeAttribute("disabled");
      hideTypingIndicator();
    }
  };

  const escapeHtml = (str) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const renderMarkdown = (text) => {
    let html = escapeHtml(text);
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Inline links: [label](url) — only http/https
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-white hover:opacity-80">$1</a>');
    // Line breaks
    html = html.replace(/\n/g, "<br>");
    return html;
  };

  const createMessageNode = (role, content) => {
    const li = document.createElement("li");
    li.className = "flex";

    const bubble = document.createElement("div");
    bubble.className = role === "user"
      ? "ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-sm font-medium text-white shadow-sm"
      : "mr-auto max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white shadow-sm";

    if (role === "user") {
      bubble.textContent = content;
    } else {
      bubble.style.backgroundColor = "rgba(127, 19, 119, 1)";
      bubble.innerHTML = renderMarkdown(content);
    }

    li.appendChild(bubble);
    return li;
  };

  const appendMessage = (role, content) => {
    if (!content) return;
    hideTypingIndicator();
    if (emptyState && !emptyState.hasAttribute("hidden")) {
      emptyState.setAttribute("hidden", "hidden");
    }
    if (promptsContainer && !promptsContainer.hasAttribute("hidden")) {
      promptsContainer.setAttribute("hidden", "hidden");
    }
    messagesList.appendChild(createMessageNode(role, content));
    scrollToBottom();
  };

  const parseAssistantMessage = (payload) => {
    try {
      const data = typeof payload === "string" ? JSON.parse(payload) : payload;
      const choice = data?.choices?.[0]?.message?.content;
      return choice || "I'm here to help. What else would you like to know about buying property in Bangkok?";
    } catch (error) {
      console.warn("Failed to parse Home Helper AI response", error);
      return "I found some information, but there was an issue processing it. Try asking your question again or rephrase it. I'm here to help.";
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.data?.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Check for error in response
      if (result.error || (result.data && result.data.error)) {
        const errorMessage = result.error || result.data.error;
        appendMessage("assistant", `I'm having trouble right now: ${errorMessage}. Please check your OpenRouter API key configuration in Admin Settings.`);
        return;
      }
      
      const assistantMessage = parseAssistantMessage(result?.data);
      appendMessage("assistant", assistantMessage);
    } catch (error) {
      console.error("Home Helper AI request failed", error);
      const errorMessage = error.message || "I'm having trouble connecting right now. Please try again in a moment. Your question is important and I want to give you the right answer.";
      appendMessage("assistant", errorMessage);
    } finally {
      setLoading(false);
      input.focus();
    }
  });
});