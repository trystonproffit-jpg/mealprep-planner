from flask import Blueprint, request

from config import db
from models import Recipe, RecipeGroup
from helpers import get_current_user


recipe_group_bp = Blueprint("recipe_group_bp", __name__)


@recipe_group_bp.get("/recipe-groups")
def get_recipe_groups():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe_groups = RecipeGroup.query.filter_by(user_id=current_user.id).all()

    return [group.to_dict_basic() for group in recipe_groups], 200


@recipe_group_bp.post("/recipe-groups")
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


@recipe_group_bp.patch("/recipe-groups/<int:id>")
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
        if "name" in data:
            recipe_group.name = data.get("name")

        db.session.commit()

        return recipe_group.to_dict_basic(), 200

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@recipe_group_bp.delete("/recipe-groups/<int:id>")
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

    db.session.delete(recipe_group)
    db.session.commit()

    return {}, 204


@recipe_group_bp.post("/recipe-groups/<int:group_id>/recipes/<int:recipe_id>")
def add_recipe_to_group(group_id, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe_group = RecipeGroup.query.filter_by(
        id=group_id,
        user_id=current_user.id
    ).first()

    if not recipe_group:
        return {"error": "Recipe group not found."}, 404

    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=current_user.id
    ).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    if recipe not in recipe_group.recipes:
        recipe_group.recipes.append(recipe)

    db.session.commit()

    return recipe_group.to_dict(), 200


@recipe_group_bp.delete("/recipe-groups/<int:group_id>/recipes/<int:recipe_id>")
def remove_recipe_from_group(group_id, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipe_group = RecipeGroup.query.filter_by(
        id=group_id,
        user_id=current_user.id
    ).first()

    if not recipe_group:
        return {"error": "Recipe group not found."}, 404

    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=current_user.id
    ).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    if recipe in recipe_group.recipes:
        recipe_group.recipes.remove(recipe)

    db.session.commit()

    return recipe_group.to_dict(), 200