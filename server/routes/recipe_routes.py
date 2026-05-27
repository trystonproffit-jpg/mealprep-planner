import os
import uuid

import boto3
from botocore.config import Config
from flask import Blueprint, request

from config import db
from models import MealPrepSlot, Recipe, RecipeIngredient
from helpers import get_current_user


recipe_bp = Blueprint("recipe_bp", __name__)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

# Keep frontend and backend upload limits in sync.
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


@recipe_bp.get("/recipes")
def get_recipes():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    recipes = Recipe.query.filter_by(user_id=current_user.id).all()

    return [recipe.to_dict() for recipe in recipes], 200


@recipe_bp.post("/recipes/image-upload-url")
def create_recipe_image_upload_url():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json() or {}

    filename = data.get("filename")
    content_type = data.get("content_type")
    file_size = data.get("file_size")

    if not filename:
        return {"error": "Filename is required."}, 400

    if content_type not in ALLOWED_IMAGE_TYPES:
        return {"error": "Image must be a PNG, JPEG, or WEBP file."}, 400

    if not isinstance(file_size, int) or file_size <= 0:
        return {"error": "File size is required."}, 400

    if file_size > MAX_IMAGE_SIZE_BYTES:
        return {"error": "Image must be 5 MB or smaller."}, 400

    bucket_name = os.environ.get("AWS_S3_BUCKET")
    region = os.environ.get("AWS_REGION", "us-east-1")

    if not bucket_name:
        return {"error": "S3 bucket is not configured."}, 500

    file_extension = ALLOWED_IMAGE_TYPES[content_type]
    object_key = f"recipe-images/user-{current_user.id}/{uuid.uuid4()}{file_extension}"

    # React uploads directly to S3 with this short-lived URL; Flask never handles
    # the image file bytes.
    s3_client = boto3.client(
        "s3",
        region_name=region,
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "virtual"},
        ),
    )

    upload_url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket_name,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=300,
    )

    # Uploaded recipe images are public-read under the bucket policy, so the app
    # can store this URL directly in Recipe.image_url.
    image_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{object_key}"

    return {
        "upload_url": upload_url,
        "image_url": image_url,
    }, 201


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

    meal_prep_slots = MealPrepSlot.query.filter_by(
        user_id=current_user.id,
        recipe_id=recipe.id,
    ).all()

    for slot in meal_prep_slots:
        slot.recipe_id = None

    db.session.delete(recipe)
    db.session.commit()

    return {}, 204
