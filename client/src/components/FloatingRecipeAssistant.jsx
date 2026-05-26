import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link as LinkIcon, Search, Send, X } from "lucide-react";

import { apiUrl } from "../api";
import { buildFallbackSearchTerm } from "../utils/recipeUrl";

const RESULTS_LIMIT = 4;
const ASSISTANT_AVATARS = {
  idle: "/assistant/helper-idle.png",
  thinking: "/assistant/helper-thinking.png",
  success: "/assistant/helper-success.png",
  error: "/assistant/helper-error.png",
};

function FloatingRecipeAssistant() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask for recipe ideas or paste a recipe URL.",
    },
  ]);
  const [messageText, setMessageText] = useState("");
  const [recipeResults, setRecipeResults] = useState([]);
  const [fallbackSearchTerm, setFallbackSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [importingRecipeId, setImportingRecipeId] = useState(null);

  const avatarState = getAvatarState();
  const avatarSrc = ASSISTANT_AVATARS[avatarState];

  function getAvatarState() {
    if (isWorking || importingRecipeId) {
      return "thinking";
    }

    if (error) {
      return "error";
    }

    if (recipeResults.length > 0) {
      return "success";
    }

    return "idle";
  }

  function isRecipeUrl(value) {
    try {
      const parsedUrl = new URL(value);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  function addMessage(message) {
    setMessages((currentMessages) => [...currentMessages, message].slice(-8));
  }

  function readJsonOrThrow(response, fallbackMessage) {
    if (response.ok) {
      return response.json();
    }

    return response.json().then((data) => {
      throw new Error(data.error || fallbackMessage);
    });
  }

  function searchExternalRecipes(searchQuery, sourceLabel) {
    return fetch(
      apiUrl(`/external-recipes/search?q=${encodeURIComponent(
        searchQuery
      )}`),
      {
        credentials: "include",
      }
    )
      .then((response) => readJsonOrThrow(response, "Failed to search recipes."))
      .then((recipes) => {
        setRecipeResults(recipes.slice(0, RESULTS_LIMIT));
        addMessage({
          role: "assistant",
          content:
            recipes.length > 0
              ? `I found recipes for "${searchQuery}" using ${sourceLabel}.`
              : `I could not find recipes for "${searchQuery}".`,
        });
      });
  }

  function importRecipeUrl(recipeUrl) {
    return fetch(apiUrl("/external-recipes/import-url"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        url: recipeUrl,
      }),
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to import recipe URL.")
      )
      .then((importedRecipe) => {
        addMessage({
          role: "assistant",
          content: "I found recipe details. Review them before saving.",
        });
        setIsOpen(false);
        navigate("/recipes/new", {
          state: {
            importedRecipe,
          },
        });
      });
  }

  function getAssistantSearchQuery(userMessage) {
    const conversation = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    return fetch(apiUrl("/assistant/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        message: userMessage,
        conversation,
      }),
    })
      .then((response) =>
        readJsonOrThrow(response, "Assistant failed to respond.")
      )
      .then((assistantResponse) => {
        if (assistantResponse.reply) {
          addMessage({
            role: "assistant",
            content: assistantResponse.reply,
          });
        }

        if (
          assistantResponse.intent === "recipe_search" &&
          assistantResponse.search_query
        ) {
          return {
            query: assistantResponse.search_query,
            sourceLabel: "the assistant",
          };
        }

        return {
          query: userMessage,
          sourceLabel: "your message",
        };
      })
      .catch(() => ({
        query: userMessage,
        sourceLabel: "backup search",
      }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFallbackSearchTerm("");
    setRecipeResults([]);

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    addMessage({
      role: "user",
      content: trimmedMessage,
    });
    setMessageText("");
    setIsWorking(true);

    const request = isRecipeUrl(trimmedMessage)
      ? importRecipeUrl(trimmedMessage).catch((error) => {
          const suggestedSearchTerm = buildFallbackSearchTerm(trimmedMessage);

          setError(error.message);
          setFallbackSearchTerm(suggestedSearchTerm);
          addMessage({
            role: "assistant",
            content: suggestedSearchTerm
              ? "I could not import that URL. You can try a backup search."
              : "I could not import that URL.",
          });
        })
      : getAssistantSearchQuery(trimmedMessage).then(({ query, sourceLabel }) =>
          searchExternalRecipes(query, sourceLabel)
        );

    request.finally(() => {
      setIsWorking(false);
    });
  }

  function handleFallbackSearch() {
    if (!fallbackSearchTerm) {
      return;
    }

    setError("");
    setFallbackSearchTerm("");
    setIsWorking(true);

    searchExternalRecipes(fallbackSearchTerm, "backup search")
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsWorking(false);
      });
  }

  function handleUseRecipe(recipe) {
    setError("");
    setImportingRecipeId(recipe.external_id);

    fetch(
      apiUrl(`/external-recipes/themealdb/${recipe.external_id}`),
      {
        credentials: "include",
      }
    )
      .then((response) =>
        readJsonOrThrow(response, "Failed to load recipe details.")
      )
      .then((importedRecipe) => {
        setIsOpen(false);
        navigate("/recipes/new", {
          state: {
            importedRecipe,
          },
        });
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setImportingRecipeId(null);
      });
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
      {isOpen ? (
        <section className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border-4 border-[#a65a18] bg-[#fff0bd] shadow-[6px_6px_0_rgba(47,27,18,0.48)]">
          <div className="flex items-center justify-between gap-3 border-b-4 border-[#a65a18] bg-[#ffd98a] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-xl border-4 border-[#6b3200] bg-[#fff8dc] shadow-[2px_2px_0_#6b3200]">
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-24 w-24 object-contain object-bottom"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="font-game text-xl font-black text-[#3f2108]">
                  Mealstead Helper
                </h2>

                <p className="text-sm font-bold text-[#7a3f0d]">
                  Search recipes or import a URL.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="book-button-secondary flex h-10 w-10 items-center justify-center p-0"
              aria-label="Close assistant"
            >
              <X
                size={18}
                strokeWidth={2.8}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="book-scrollbar max-h-[60vh] overflow-y-auto p-3">
            <div className="space-y-2">
              {messages.map((message, index) => (
                <p
                  key={`${message.role}-${index}`}
                  className={`rounded-xl border-2 p-2 text-sm font-bold ${
                    message.role === "user"
                      ? "ml-auto max-w-[85%] border-[#a65a18] bg-[#ffd98a] text-[#3f2108]"
                      : "mr-auto max-w-[85%] border-[#d99b48] bg-[#fff8dc] text-[#6b3200]"
                  }`}
                >
                  {message.content}
                </p>
              ))}
            </div>

            {error ? (
              <div className="book-error mt-3 text-sm">
                <p>{error}</p>

                {fallbackSearchTerm ? (
                  <button
                    type="button"
                    onClick={handleFallbackSearch}
                    className="book-button-secondary mt-2 px-3 py-2"
                  >
                    Search "{fallbackSearchTerm}"
                  </button>
                ) : null}
              </div>
            ) : null}

            {recipeResults.length > 0 ? (
              <div className="mt-3 space-y-3">
                {recipeResults.map((recipe) => (
                  <article
                    key={recipe.external_id}
                    className="overflow-hidden rounded-xl border-4 border-[#a65a18] bg-[#ffd98a] shadow-[3px_3px_0_#6b3200]"
                  >
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="h-28 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-3">
                      <p className="font-game text-xs font-black uppercase text-[#6b3200]">
                        {[recipe.category, recipe.area].filter(Boolean).join(" / ") ||
                          "Recipe"}
                      </p>

                      <h3 className="font-game mt-1 text-lg font-black leading-tight text-[#3f2108]">
                        {recipe.name}
                      </h3>

                      <button
                        type="button"
                        onClick={() => handleUseRecipe(recipe)}
                        disabled={importingRecipeId === recipe.external_id}
                        className="book-button-primary mt-3 inline-flex w-full items-center justify-center gap-2 px-3 py-2"
                      >
                        <LinkIcon
                          size={16}
                          strokeWidth={2.8}
                          aria-hidden="true"
                        />
                        {importingRecipeId === recipe.external_id
                          ? "Preparing..."
                          : "Use Recipe"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t-4 border-[#a65a18] bg-[#ffe0a0] p-3"
          >
            <input
              type="text"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Ask for dinner ideas or paste a URL..."
              className="book-input w-full text-sm"
            />

            <button
              type="submit"
              disabled={isWorking}
              className="book-button-primary mt-2 inline-flex w-full items-center justify-center gap-2 px-3 py-3"
            >
              {isRecipeUrl(messageText.trim()) ? (
                <LinkIcon
                  size={17}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              ) : (
                <Send
                  size={17}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              )}
              {isWorking ? "Working..." : "Send"}
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex h-28 w-28 items-end justify-center overflow-hidden rounded-2xl border-4 border-[#6b3200] bg-[#ffd98a] shadow-[5px_5px_0_rgba(47,27,18,0.48)] transition hover:-translate-y-1 hover:bg-[#fff0bd]"
          aria-label="Open Mealstead Helper"
        >
          <img
            src={avatarSrc}
            alt=""
            className="h-36 w-36 object-contain object-bottom"
            aria-hidden="true"
          />

          <Search
            size={18}
            strokeWidth={3}
            className="absolute bottom-2 right-2 rounded-full border-2 border-[#6b3200] bg-[#fff8dc] p-0.5 text-[#6b3200]"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

export default FloatingRecipeAssistant;
