import json
import re


SYSTEM_PROMPT = """
You are Mealstead's cooking assistant.
Help users with recipes, meal planning, grocery planning, and cooking questions.
Keep replies friendly, practical, and concise.
Do not include reasoning, analysis, markdown, or extra text outside the JSON.

When the user wants recipe ideas, suggest a short search query that can be sent
to TheMealDB. The search query should be simple, usually one to three words.
If the user's message could reasonably be used to find recipes, set intent to
"recipe_search". This includes cuisines, ingredients, dish names, meal types,
cravings, and vague food requests. Choose one simple TheMealDB-friendly search
query. Do not return a list of search options in search_query.

Return only valid JSON with this shape:
{
  "reply": "Short answer shown to the user.",
  "intent": "chat" | "recipe_search",
  "search_query": "optional recipe search query or empty string"
}

Do not claim that a recipe was saved or imported. The user must choose and save
recipes themselves.
"""


def get_assistant_response(user_message, conversation=None):
    from services.ai.ai_client import chat_with_ai

    messages = _build_messages(user_message, conversation or [])
    content = chat_with_ai(messages=messages, temperature=0.6, max_tokens=500)
    return _parse_assistant_content(content, user_message)


def _build_messages(user_message, conversation):
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.strip(),
        }
    ]

    for message in conversation[-8:]:
        role = message.get("role")
        content = message.get("content")

        if role in ["user", "assistant"] and content:
            messages.append({
                "role": role,
                "content": content,
            })

    messages.append({
        "role": "user",
        "content": user_message,
    })

    return messages


def _parse_assistant_content(content, user_message=""):
    json_text = _extract_json_text(content)

    try:
        parsed_content = json.loads(json_text)
    except json.JSONDecodeError:
        return _build_fallback_response(user_message)

    reply = str(parsed_content.get("reply") or "").strip()
    intent = parsed_content.get("intent")
    search_query = str(parsed_content.get("search_query") or "").strip()

    if intent not in ["chat", "recipe_search"]:
        intent = "chat"

    if not reply:
        reply = "I can help with recipe ideas, meal planning, and grocery lists."

    if intent != "recipe_search":
        search_query = ""
    else:
        search_query = _clean_search_query(search_query or user_message)

    return {
        "reply": reply,
        "intent": intent,
        "search_query": search_query,
    }


def _extract_json_text(content):
    cleaned_content = content.strip()

    if cleaned_content.startswith("```"):
        lines = cleaned_content.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]

        cleaned_content = "\n".join(lines).strip()

    start_index = cleaned_content.find("{")
    end_index = cleaned_content.rfind("}")

    if start_index != -1 and end_index != -1 and end_index > start_index:
        return cleaned_content[start_index:end_index + 1]

    return cleaned_content


def _build_fallback_response(user_message):
    search_query = _clean_search_query(user_message)

    if search_query:
        return {
            "reply": f"I can search for {search_query} recipes.",
            "intent": "recipe_search",
            "search_query": search_query,
        }

    return {
        "reply": "I can help find recipes, meal ideas, and grocery inspiration.",
        "intent": "chat",
        "search_query": "",
    }


def _clean_search_query(message):
    cleaned_message = re.sub(r"[^a-zA-Z0-9\s]", " ", message or "").lower()
    words = [
        word
        for word in re.sub(r"\s+", " ", cleaned_message).strip().split(" ")
        if word
    ]

    if not words:
        return ""

    filler_words = {
        "a",
        "an",
        "and",
        "any",
        "can",
        "could",
        "easy",
        "fast",
        "find",
        "for",
        "give",
        "good",
        "healthy",
        "help",
        "i",
        "idea",
        "ideas",
        "me",
        "meal",
        "meals",
        "need",
        "please",
        "quick",
        "recipe",
        "recipes",
        "show",
        "simple",
        "some",
        "the",
        "to",
        "want",
        "with",
    }

    food_words = [
        word
        for word in words
        if word not in filler_words
    ]

    if not food_words:
        return ""

    return " ".join(food_words[:3])
