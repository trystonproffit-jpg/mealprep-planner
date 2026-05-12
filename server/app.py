from flask import Flask, request, session
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

from config import db, migrate, bcrypt
from models import User, Recipe, RecipeIngredient, RecipeGroup


# --------------------------------------------------
# App setup
# --------------------------------------------------

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "dev-secret-key"

CORS(app, supports_credentials=True)

db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)


# --------------------------------------------------
# Helper functions
# --------------------------------------------------

def get_current_user():
    """Return the logged-in user based on the saved session."""
    user_id = session.get("user_id")

    if not user_id:
        return None

    return User.query.get(user_id)


# --------------------------------------------------
# Basic test route
# --------------------------------------------------

@app.get("/")
def index():
    return {"message": "MealPrep Planner API is running"}


# --------------------------------------------------
# Auth routes
# --------------------------------------------------

@app.post("/signup")
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


@app.post("/login")
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
    # Clear only the session, not the user or their data
    session.pop("user_id", None)
    return {}, 204


# --------------------------------------------------
# Recipe routes
# --------------------------------------------------

@app.get("/recipes")
def get_recipes():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    # Only return recipes owned by the logged-in user
    recipes = Recipe.query.filter_by(user_id=current_user.id).all()

    return [recipe.to_dict() for recipe in recipes], 200


@app.post("/recipes")
def create_recipe():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    ingredients_data = data.get("ingredients", [])

    # Ignore blank ingredient rows from the frontend
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

        # Create related ingredient records
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

    # Make sure the recipe belongs to the logged-in user
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
        # Update only the fields that were sent
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

        # If ingredients are sent, replace the old ingredient list
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

    # Deleting a recipe also deletes its ingredients because of cascade
    db.session.delete(recipe)
    db.session.commit()

    return {}, 204


# --------------------------------------------------
# Recipe group routes
# --------------------------------------------------

@app.get("/recipe-groups")
def get_recipe_groups():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    # Only custom groups are stored in the database
    recipe_groups = RecipeGroup.query.filter_by(user_id=current_user.id).all()

    return [group.to_dict_basic() for group in recipe_groups], 200


@app.post("/recipe-groups")
def create_recipe_group():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    try:
        new_group = RecipeGroup(
            name=data.get("name"),
            user_id=current_user.id,
        )

        db.session.add(new_group)
        db.session.commit()

        return new_group.to_dict_basic(), 201

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@app.patch("/recipe-groups/<int:id>")
def update_recipe_group(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe_group = RecipeGroup.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not recipe_group:
        return {"error": "Recipe group not found."}, 404

    data = request.get_json() or {}

    try:
        # Right now, the only editable group field is name
        if "name" in data:
            recipe_group.name = data.get("name")

        db.session.commit()

        return recipe_group.to_dict_basic(), 200

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@app.delete("/recipe-groups/<int:id>")
def delete_recipe_group(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe_group = RecipeGroup.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not recipe_group:
        return {"error": "Recipe group not found."}, 404

    # This deletes only the group, not the recipes inside it
    db.session.delete(recipe_group)
    db.session.commit()

    return {}, 204


# --------------------------------------------------
# Recipe group membership routes
# --------------------------------------------------

@app.post("/recipe-groups/<int:group_id>/recipes/<int:recipe_id>")
def add_recipe_to_group(group_id, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    # Make sure the group belongs to the logged-in user
    recipe_group = RecipeGroup.query.filter_by(
        id=group_id,
        user_id=current_user.id
    ).first()

    if not recipe_group:
        return {"error": "Recipe group not found."}, 404

    # Make sure the recipe also belongs to the logged-in user
    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=current_user.id
    ).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    # Avoid adding the same recipe to the same group twice
    if recipe not in recipe_group.recipes:
        recipe_group.recipes.append(recipe)

    db.session.commit()

    return recipe_group.to_dict(), 200

@app.delete("/recipe-groups/<int:group_id>/recipes/<int:recipe_id>")
def remove_recipe_from_group(group_id, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    # Make sure the group belongs to the logged-in user
    recipe_group = RecipeGroup.query.filter_by(
        id=group_id,
        user_id=current_user.id
    ).first()

    if not recipe_group:
        return {"error": "Recipe group not found."}, 404

    # Make sure the recipe also belongs to the logged-in user
    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=current_user.id
    ).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    # Remove the recipe from this group if it is currently inside it
    if recipe in recipe_group.recipes:
        recipe_group.recipes.remove(recipe)

    db.session.commit()

    return recipe_group.to_dict(), 200

# --------------------------------------------------
# Run app
# --------------------------------------------------

if __name__ == "__main__":
    app.run(port=5555, debug=True)