from flask import Blueprint, request, session
from sqlalchemy.exc import IntegrityError

from config import db
from models import User


auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    # Basic signup validation
    if not username:
        return {"error": "Username is required."}, 400

    if not email:
        return {"error": "Email is required."}, 400

    if not password:
        return {"error": "Password is required."}, 400

    if not confirm_password:
        return {"error": "Confirm password is required."}, 400

    if password != confirm_password:
        return {"error": "Passwords do not match."}, 400

    if len(password) < 6:
        return {"error": "Password must be at least 6 characters long."}, 400

    # Check for duplicate username/email before creating user
    existing_username = User.query.filter_by(username=username.strip()).first()
    if existing_username:
        return {"error": "Username already exists."}, 400

    existing_email = User.query.filter_by(email=email.strip().lower()).first()
    if existing_email:
        return {"error": "Email already exists."}, 400

    try:
        new_user = User(
            username=username,
            email=email,
        )

        # This calls the password_hash setter in the User model
        new_user.password_hash = password

        db.session.add(new_user)
        db.session.commit()

        # Log the user in after signup
        session["user_id"] = new_user.id

        return new_user.to_dict(), 201

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400

    except IntegrityError:
        db.session.rollback()
        return {"error": "Username or email already exists."}, 400


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email:
        return {"error": "Email is required."}, 400

    if not password:
        return {"error": "Password is required."}, 400

    # Find user by normalized email
    user = User.query.filter_by(email=email.strip().lower()).first()

    # Check that user exists and password is correct
    if not user or not user.authenticate(password):
        return {"error": "Invalid email or password."}, 401

    # Save login in the session
    session["user_id"] = user.id

    return user.to_dict(), 200


@auth_bp.get("/me")
def me():
    user_id = session.get("user_id")

    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = User.query.get(user_id)

    if not user:
        session.pop("user_id", None)
        return {"error": "Unauthorized"}, 401

    return user.to_dict(), 200


@auth_bp.delete("/logout")
def logout():
    # Clear only the session, not the user or their data
    session.pop("user_id", None)
    return {}, 204