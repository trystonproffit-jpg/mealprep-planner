from flask import Blueprint, request

from config import db
from models import MealPrepSlot, Recipe
from helpers import get_current_user


meal_prep_bp = Blueprint("meal_prep_bp", __name__)


@meal_prep_bp.get("/meal-prep")
def get_meal_prep_slots():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    slots = MealPrepSlot.query.filter_by(user_id=current_user.id).all()

    return [slot.to_dict() for slot in slots], 200


@meal_prep_bp.patch("/meal-prep")
def update_meal_prep_slot():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    day = data.get("day")
    meal_type = data.get("meal_type")
    recipe_id = data.get("recipe_id")

    if not day:
        return {"error": "Day is required."}, 400

    if not meal_type:
        return {"error": "Meal type is required."}, 400

    # If recipe_id was sent, make sure that recipe belongs to the current user.
    if recipe_id is not None:
        recipe = Recipe.query.filter_by(
            id=recipe_id,
            user_id=current_user.id
        ).first()

        if not recipe:
            return {"error": "Recipe not found."}, 404

    slot = MealPrepSlot.query.filter_by(
        user_id=current_user.id,
        day=day.strip().lower(),
        meal_type=meal_type.strip().lower()
    ).first()

    try:
        # If the slot does not exist yet, create it.
        if not slot:
            slot = MealPrepSlot(
                user_id=current_user.id,
                day=day,
                meal_type=meal_type,
                recipe_id=recipe_id,
            )

            db.session.add(slot)

        # If the slot already exists, update the assigned recipe.
        else:
            slot.recipe_id = recipe_id

        db.session.commit()

        return slot.to_dict(), 200

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@meal_prep_bp.delete("/meal-prep")
def clear_meal_prep_slot():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    day = data.get("day")
    meal_type = data.get("meal_type")

    if not day:
        return {"error": "Day is required."}, 400

    if not meal_type:
        return {"error": "Meal type is required."}, 400

    slot = MealPrepSlot.query.filter_by(
        user_id=current_user.id,
        day=day.strip().lower(),
        meal_type=meal_type.strip().lower()
    ).first()

    if not slot:
        return {"error": "Meal prep slot not found."}, 404

    slot.recipe_id = None

    db.session.commit()

    return slot.to_dict(), 200