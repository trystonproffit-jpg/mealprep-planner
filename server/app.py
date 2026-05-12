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

def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return None
    
    return User.query.get(user_id)

@app.get("/recipes")
def get_recipes():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipes = Recipe.query.filter_by(user_id=current_user.id).all()

    return [recipe.to_dict() for recipe in recipes], 200

@app.post("/recipes")
def create_recipe():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    ingredients_data = data.get("ingredients", [])

    valid_ingredients = [
        ingredient for ingredient in ingredients_data
        if ingredient.get("name") and ingredient.get("name").strip()
    ]

    if not valid_ingredients:
        return {"error": "At least one ingredient is required."}, 400

    try:
        new_recipe = Recipe(
            name=data.get("name"),
            description=data.get("description"),
            meal_type=data.get("meal_type"),
            instructions=data.get("instructions"),
            prep_time=data.get("prep_time"),
            cook_time=data.get("cook_time"),
            servings=data.get("servings"),
            favorite=data.get("favorite", False),
            user_id=current_user.id,
        )

        for ingredient_data in valid_ingredients:
            ingredient = RecipeIngredient(
                name=ingredient_data.get("name"),
                quantity=ingredient_data.get("quantity"),
            )

            new_recipe.ingredients.append(ingredient)

        db.session.add(new_recipe)
        db.session.commit()

        return new_recipe.to_dict(), 201

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400

@app.get("/recipes/<int:id>")
def get_recipe_by_id(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe = Recipe.query.filter_by(id=id, user_id=current_user.id).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    return recipe.to_dict(), 200

@app.patch("/recipes/<int:id>")
def update_recipe(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe = Recipe.query.filter_by(id=id, user_id=current_user.id).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    data = request.get_json() or {}

    try:
        if "name" in data:
            recipe.name = data.get("name")

        if "description" in data:
            recipe.description = data.get("description")

        if "meal_type" in data:
            recipe.meal_type = data.get("meal_type")

        if "instructions" in data:
            recipe.instructions = data.get("instructions")

        if "prep_time" in data:
            recipe.prep_time = data.get("prep_time")

        if "cook_time" in data:
            recipe.cook_time = data.get("cook_time")

        if "servings" in data:
            recipe.servings = data.get("servings")

        if "favorite" in data:
            recipe.favorite = data.get("favorite")

        if "ingredients" in data:
            ingredients_data = data.get("ingredients", [])

            valid_ingredients = [
                ingredient for ingredient in ingredients_data
                if ingredient.get("name") and ingredient.get("name").strip()
            ]

            if not valid_ingredients:
                return {"error": "At least one ingredient is required."}, 400

            recipe.ingredients.clear()

            for ingredient_data in valid_ingredients:
                ingredient = RecipeIngredient(
                    name=ingredient_data.get("name"),
                    quantity=ingredient_data.get("quantity"),
                )

                recipe.ingredients.append(ingredient)

        db.session.commit()

        return recipe.to_dict(), 200

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400

@app.delete("/recipes/<int:id>")
def delete_recipe(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe = Recipe.query.filter_by(id=id, user_id=current_user.id).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    db.session.delete(recipe)
    db.session.commit()

    return {}, 204

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