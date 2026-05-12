from flask import session

from models import User


def get_current_user():
    """Return the logged-in user based on the saved session."""
    user_id = session.get("user_id")

    if not user_id:
        return None

    return User.query.get(user_id)