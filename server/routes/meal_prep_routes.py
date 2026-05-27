from flask import Blueprint

from config import db
from models import MealPrepSlot, MealPrepSlotRecipe, Recipe
from helpers import get_current_user


meal_prep_bp = Blueprint("meal_prep_bp", __name__)

ALLOWED_DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
]
ALLOWED_MEAL_TYPES = ["breakfast", "lunch", "dinner"]


@meal_prep_bp.get("/meal-prep")
def get_meal_prep_slots():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    slots = MealPrepSlot.query.filter_by(user_id=current_user.id).all()

    return [slot.to_dict() for slot in slots], 200


@meal_prep_bp.get("/meal-prep/<day>/<meal_type>")
def get_meal_prep_board(day, meal_type):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    cleaned_values = _clean_day_and_meal_type(day, meal_type)

    if _is_error_response(cleaned_values):
        return cleaned_values
    else:
        cleaned_day, cleaned_meal_type = cleaned_values

    slot = _get_or_create_slot(current_user.id, cleaned_day, cleaned_meal_type)
    db.session.commit()

    return slot.to_dict(), 200


@meal_prep_bp.post("/meal-prep/<day>/<meal_type>/recipes/<int:recipe_id>")
def add_recipe_to_meal_prep_board(day, meal_type, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    cleaned_values = _clean_day_and_meal_type(day, meal_type)

    if _is_error_response(cleaned_values):
        return cleaned_values
    else:
        cleaned_day, cleaned_meal_type = cleaned_values

    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=current_user.id,
    ).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    slot = _get_or_create_slot(current_user.id, cleaned_day, cleaned_meal_type)

    existing_entry = MealPrepSlotRecipe.query.filter_by(
        meal_prep_slot_id=slot.id,
        recipe_id=recipe.id,
    ).first()

    if not existing_entry:
        db.session.add(MealPrepSlotRecipe(
            meal_prep_slot=slot,
            recipe=recipe,
        ))

    db.session.commit()

    return slot.to_dict(), 200


@meal_prep_bp.delete("/meal-prep/<day>/<meal_type>/recipes/<int:recipe_id>")
def remove_recipe_from_meal_prep_board(day, meal_type, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    cleaned_values = _clean_day_and_meal_type(day, meal_type)

    if _is_error_response(cleaned_values):
        return cleaned_values
    else:
        cleaned_day, cleaned_meal_type = cleaned_values

    slot = MealPrepSlot.query.filter_by(
        user_id=current_user.id,
        day=cleaned_day,
        meal_type=cleaned_meal_type,
    ).first()

    if not slot:
        return {"error": "Meal board not found."}, 404

    entry = MealPrepSlotRecipe.query.filter_by(
        meal_prep_slot_id=slot.id,
        recipe_id=recipe_id,
    ).first()

    if entry:
        db.session.delete(entry)

    db.session.commit()

    return slot.to_dict(), 200


@meal_prep_bp.delete("/meal-prep/<day>/<meal_type>")
def clear_meal_prep_board(day, meal_type):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    cleaned_values = _clean_day_and_meal_type(day, meal_type)

    if _is_error_response(cleaned_values):
        return cleaned_values
    else:
        cleaned_day, cleaned_meal_type = cleaned_values

    slot = MealPrepSlot.query.filter_by(
        user_id=current_user.id,
        day=cleaned_day,
        meal_type=cleaned_meal_type,
    ).first()

    if slot:
        for entry in list(slot.meal_prep_recipes):
            db.session.delete(entry)
        slot.recipe_id = None

    db.session.commit()

    return slot.to_dict() if slot else {
        "day": cleaned_day,
        "meal_type": cleaned_meal_type,
        "recipes": [],
        "recipe_count": 0,
        "preview_recipe": None,
    }, 200


@meal_prep_bp.delete("/meal-prep")
def clear_meal_prep():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    slots = MealPrepSlot.query.filter_by(user_id=current_user.id).all()

    for slot in slots:
        db.session.delete(slot)

    db.session.commit()

    return {"message": "Meal prep cleared."}, 200


def _clean_day_and_meal_type(day, meal_type):
    cleaned_day = (day or "").strip().lower()
    cleaned_meal_type = (meal_type or "").strip().lower()

    if cleaned_day not in ALLOWED_DAYS:
        return {"error": "Day must be a valid weekday."}, 400

    if cleaned_meal_type not in ALLOWED_MEAL_TYPES:
        return {"error": "Meal type must be breakfast, lunch, or dinner."}, 400

    return cleaned_day, cleaned_meal_type


def _is_error_response(value):
    return (
        isinstance(value, tuple)
        and len(value) == 2
        and isinstance(value[0], dict)
    )


def _get_or_create_slot(user_id, day, meal_type):
    slot = MealPrepSlot.query.filter_by(
        user_id=user_id,
        day=day,
        meal_type=meal_type,
    ).first()

    if slot:
        return slot

    slot = MealPrepSlot(
        user_id=user_id,
        day=day,
        meal_type=meal_type,
    )

    db.session.add(slot)
    db.session.flush()

    return slot
