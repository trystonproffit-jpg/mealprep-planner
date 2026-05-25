import os

import requests


OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_OPENROUTER_MODEL = "openrouter/free"


class AIClientError(Exception):
    pass


class AIClientConfigurationError(AIClientError):
    pass


def chat_with_ai(messages, temperature=0.7, max_tokens=800):
    provider = os.environ.get("AI_PROVIDER", "openrouter").strip().lower()

    if provider != "openrouter":
        raise AIClientConfigurationError(
            f"Unsupported AI_PROVIDER '{provider}'. Use 'openrouter'."
        )

    return chat_with_openrouter(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def chat_with_openrouter(messages, temperature=0.7, max_tokens=800):
    api_key = os.environ.get("OPENROUTER_API_KEY")

    if not api_key:
        raise AIClientConfigurationError("OPENROUTER_API_KEY is required.")

    model = os.environ.get("AI_MODEL", DEFAULT_OPENROUTER_MODEL)

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.environ.get(
            "AI_APP_URL",
            "http://127.0.0.1:5173",
        ),
        "X-Title": "Mealstead",
    }

    try:
        response = requests.post(
            OPENROUTER_CHAT_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException as error:
        raise AIClientError("AI service is unavailable.") from error

    if response.status_code >= 400:
        raise AIClientError("AI service request failed.")

    data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise AIClientError("AI service returned an unexpected response.") from error
