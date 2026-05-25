from flask import Blueprint, request

from helpers import get_current_user
from services.ai.ai_client import AIClientConfigurationError, AIClientError
from services.ai.mealstead_assistant import get_assistant_response


assistant_bp = Blueprint("assistant_bp", __name__)


@assistant_bp.post("/assistant/chat")
def chat_with_assistant():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    conversation = data.get("conversation") or []

    if not message:
        return {"error": "Message is required."}, 400

    if not isinstance(conversation, list):
        return {"error": "Conversation must be a list."}, 400

    try:
        assistant_response = get_assistant_response(
            user_message=message,
            conversation=conversation,
        )
    except AIClientConfigurationError as error:
        return {"error": str(error)}, 500
    except AIClientError:
        return {"error": "Assistant is unavailable right now."}, 502

    return assistant_response, 200
