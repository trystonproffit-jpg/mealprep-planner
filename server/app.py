from flask import Flask, request, session
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

from config import db, migrate, bcrypt
from models import User, Recipe, RecipeIngredient, RecipeGroup

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "dev-secret-key"

CORS(app, supports_credentials=True)

db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)


@app.get("/")
def index():
    return {"message": "MealPrep Planner API is running"}


@app.post("/signup")
def signup():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

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
        new_user.password_hash = password

        db.session.add(new_user)
        db.session.commit()

        session["user_id"] = new_user.id

        return new_user.to_dict(), 201

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400

    except IntegrityError:
        db.session.rollback()
        return {"error": "Username or email already exists."}, 400


@app.post("/login")
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email:
        return {"error": "Email is required."}, 400

    if not password:
        return {"error": "Password is required."}, 400

    user = User.query.filter_by(email=email.strip().lower()).first()

    if not user or not user.authenticate(password):
        return {"error": "Invalid email or password."}, 401

    session["user_id"] = user.id

    return user.to_dict(), 200


@app.get("/me")
def me():
    user_id = session.get("user_id")

    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = User.query.get(user_id)

    if not user:
        session.pop("user_id", None)
        return {"error": "Unauthorized"}, 401

    return user.to_dict(), 200


@app.delete("/logout")
def logout():
    session.pop("user_id", None)
    return {}, 204


if __name__ == "__main__":
    app.run(port=5555, debug=True)