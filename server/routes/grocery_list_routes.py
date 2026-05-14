from flask import Blueprint, request

from config import db
from models import GroceryList, GroceryItem, Recipe, RecipeIngredient
from helpers import get_current_user


grocery_list_bp = Blueprint("grocery_list_bp", __name__)


@grocery_list_bp.get("/grocery-lists")
def get_grocery_lists():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_lists = GroceryList.query.filter_by(user_id=current_user.id).all()

    return [grocery_list.to_dict_basic() for grocery_list in grocery_lists], 200


@grocery_list_bp.post("/grocery-lists")
def create_grocery_list():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    try:
        new_grocery_list = GroceryList(
            name=data.get("name"),
            user_id=current_user.id,
        )

        db.session.add(new_grocery_list)
        db.session.commit()

        return new_grocery_list.to_dict(), 201

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@grocery_list_bp.get("/grocery-lists/<int:id>")
def get_grocery_list_by_id(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    return grocery_list.to_dict(), 200


@grocery_list_bp.patch("/grocery-lists/<int:id>")
def update_grocery_list(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    data = request.get_json() or {}

    try:
        if "name" in data:
            grocery_list.name = data.get("name")

        db.session.commit()

        return grocery_list.to_dict(), 200

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@grocery_list_bp.delete("/grocery-lists/<int:id>")
def delete_grocery_list(id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    db.session.delete(grocery_list)
    db.session.commit()

    return {}, 204


@grocery_list_bp.post("/grocery-lists/<int:list_id>/items")
def create_grocery_item(list_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=list_id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    data = request.get_json() or {}

    try:
        new_item = GroceryItem(
            name=data.get("name"),
            quantity=data.get("quantity"),
            purchased=data.get("purchased", False),
            grocery_list_id=grocery_list.id,
        )

        db.session.add(new_item)
        db.session.commit()

        return new_item.to_dict(), 201

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@grocery_list_bp.patch("/grocery-lists/<int:list_id>/items/<int:item_id>")
def update_grocery_item(list_id, item_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=list_id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    grocery_item = GroceryItem.query.filter_by(
        id=item_id,
        grocery_list_id=grocery_list.id
    ).first()

    if not grocery_item:
        return {"error": "Grocery item not found."}, 404

    data = request.get_json() or {}

    try:
        if "name" in data:
            grocery_item.name = data.get("name")

        if "quantity" in data:
            grocery_item.quantity = data.get("quantity")

        if "purchased" in data:
            grocery_item.purchased = data.get("purchased")

        db.session.commit()

        return grocery_item.to_dict(), 200

    except ValueError as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@grocery_list_bp.delete("/grocery-lists/<int:list_id>/items/<int:item_id>")
def delete_grocery_item(list_id, item_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=list_id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    grocery_item = GroceryItem.query.filter_by(
        id=item_id,
        grocery_list_id=grocery_list.id
    ).first()

    if not grocery_item:
        return {"error": "Grocery item not found."}, 404

    db.session.delete(grocery_item)
    db.session.commit()

    return {}, 204


@grocery_list_bp.patch("/grocery-lists/<int:list_id>/uncheck-all")
def uncheck_all_grocery_items(list_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=list_id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    for item in grocery_list.items:
        item.purchased = False

    db.session.commit()

    return grocery_list.to_dict(), 200

@grocery_list_bp.post("/grocery-lists/<int:list_id>/add-from-recipe/<int:recipe_id>")
def add_items_from_recipe(list_id, recipe_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    grocery_list = GroceryList.query.filter_by(
        id=list_id,
        user_id=current_user.id
    ).first()

    if not grocery_list:
        return {"error": "Grocery list not found."}, 404

    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=current_user.id
    ).first()

    if not recipe:
        return {"error": "Recipe not found."}, 404

    data = request.get_json() or {}

    ingredient_ids = data.get("ingredient_ids", [])

    if not ingredient_ids:
        return {"error": "At least one ingredient must be selected."}, 400

    selected_ingredients = RecipeIngredient.query.filter(
        RecipeIngredient.id.in_(ingredient_ids),
        RecipeIngredient.recipe_id == recipe.id
    ).all()

    if not selected_ingredients:
        return {"error": "No matching recipe ingredients found."}, 404

    for ingredient in selected_ingredients:
        existing_item = GroceryItem.query.filter_by(
            grocery_list_id=grocery_list.id,
            name=ingredient.name
        ).first()

        if existing_item:
            if existing_item.quantity and ingredient.quantity:
                existing_item.quantity = f"{existing_item.quantity} + {ingredient.quantity}"
            elif ingredient.quantity:
                existing_item.quantity = ingredient.quantity
        else:
            new_item = GroceryItem(
                name=ingredient.name,
                quantity=ingredient.quantity,
                purchased=False,
                grocery_list_id=grocery_list.id,
            )

            db.session.add(new_item)

    db.session.commit()

    return grocery_list.to_dict(), 200