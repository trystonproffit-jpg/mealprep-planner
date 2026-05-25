import { useState } from "react";
import { Bot, Send } from "lucide-react";

function RecipeAssistantPanel({ onUseSearchQuery }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Tell me what kind of recipe you want, and I can suggest a search.",
    },
  ]);
  const [messageText, setMessageText] = useState("");
  const [suggestedSearchQuery, setSuggestedSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    const conversation = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const nextMessages = [
      ...messages,
      {
        role: "user",
        content: trimmedMessage,
      },
    ];

    setMessages(nextMessages);
    setMessageText("");
    setSuggestedSearchQuery("");
    setIsSending(true);

    fetch("http://127.0.0.1:5555/assistant/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        message: trimmedMessage,
        conversation,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Assistant failed to respond.");
        });
      })
      .then((assistantResponse) => {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            role: "assistant",
            content: assistantResponse.reply,
          },
        ]);

        if (
          assistantResponse.intent === "recipe_search" &&
          assistantResponse.search_query
        ) {
          setSuggestedSearchQuery(assistantResponse.search_query);
          onUseSearchQuery(assistantResponse.search_query);
        }
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsSending(false);
      });
  }

  return (
    <section className="book-section mt-7 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-4 border-[#a65a18] bg-[#fff0bd] text-[#6b3200] shadow-[3px_3px_0_#6b3200]">
          <Bot
            size={24}
            strokeWidth={2.8}
            aria-hidden="true"
          />
        </div>

        <div>
          <h3 className="font-game text-2xl font-black text-[#3f2108]">
            Recipe Assistant
          </h3>

          <p className="mt-1 font-bold text-[#7a3f0d]">
            Ask for ideas, then search from a suggested query.
          </p>
        </div>
      </div>

      {error ? (
        <p className="book-error mt-4">
          {error}
        </p>
      ) : null}

      <div className="book-scrollbar mt-4 max-h-72 space-y-3 overflow-y-auto rounded-xl border-2 border-[#d99b48] bg-[#fff8dc] p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg border-2 p-3 font-bold ${
              message.role === "user"
                ? "ml-auto max-w-[85%] border-[#a65a18] bg-[#ffd98a] text-[#3f2108]"
                : "mr-auto max-w-[85%] border-[#d99b48] bg-[#fff0bd] text-[#6b3200]"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      {suggestedSearchQuery ? (
        <div className="mt-4 rounded-xl border-2 border-[#d99b48] bg-[#fff0bd] p-3">
          <p className="font-bold text-[#6b3200]">
            Searching for{" "}
            <span className="font-black text-[#3f2108]">
              {suggestedSearchQuery}
            </span>
          </p>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 md:flex-row"
      >
        <input
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Ask for dinner ideas, quick meals, or ingredient help..."
          className="book-input flex-1"
        />

        <button
          type="submit"
          disabled={isSending}
          className="book-button-primary inline-flex items-center justify-center gap-2 px-5 py-3"
        >
          <Send
            size={18}
            strokeWidth={2.8}
            aria-hidden="true"
          />
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default RecipeAssistantPanel;
