from flask import Blueprint, request

from config import db
from models import Recipe, RecipeIngredient
from helpers import get_current_user


recipe_bp = Blueprint("recipe_bp", __name__)


@recipe_bp.get("/recipes")
def get_recipes():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipes = Recipe.query.filter_by(user_id=current_user.id).all()

    return [recipe.to_dict() for recipe in recipes], 200


@recipe_bp.post("/recipes")
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
            source_url=data.get("source_url"),
            image_url=data.get("image_url"),
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


@recipe_bp.get("/recipes/<int:id>")
def get_recipe_by_id(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe = Recipe.query.filter_by(id=id, user_id=current_user.id).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    return recipe.to_dict(), 200


@recipe_bp.patch("/recipes/<int:id>")
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

        if "source_url" in data:
            recipe.source_url = data.get("source_url")

        if "image_url" in data:
            recipe.image_url = data.get("image_url")

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


@recipe_bp.delete("/recipes/<int:id>")
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