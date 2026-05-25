from flask import Blueprint, request
import requests

from helpers import get_current_user

external_recipe_bp = Blueprint("external_recipe_bp", __name__)

THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1"
SEARCH_FILLER_WORDS = {"food", "foods", "recipe", "recipes", "meal", "meals"}


@external_recipe_bp.get("/external-recipes/search")
def search_external_recipes():
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    search_term = request.args.get("q", "").strip()

    if not search_term:
        return {"error": "Search term is required."}, 400

    try:
        meals = _search_themealdb(search_term)
    except requests.RequestException:
        return {"error": "Recipe search is unavailable."}, 502

    return [_map_search_result(meal) for meal in meals], 200


@external_recipe_bp.get("/external-recipes/themealdb/<meal_id>")
def get_themealdb_recipe(meal_id):
    current_user = get_current_user()

    if not current_user:
        return {"error": "Unauthorized"}, 401

    try:
        response = requests.get(
            f"{THEMEALDB_BASE_URL}/lookup.php",
            params={"i": meal_id},
            timeout=10,
        )
    except requests.RequestException:
        return {"error": "Recipe lookup is unavailable."}, 502

    if response.status_code != 200:
        return {"error": "Recipe lookup failed."}, 502

    data = response.json()
    meals = data.get("meals") or []

    if not meals:
        return {"error": "Recipe not found."}, 404

    return map_themealdb_recipe(meals[0]), 200


def map_themealdb_recipe(meal):
    ingredients = []

    for index in range(1, 21):
        name = (meal.get(f"strIngredient{index}") or "").strip()
        quantity = (meal.get(f"strMeasure{index}") or "").strip()

        if name:
            ingredients.append({
                "name": name,
                "quantity": quantity,
            })

    return {
        "name": meal.get("strMeal") or "",
        "description": _build_description(meal),
        "meal_type": "",
        "instructions": meal.get("strInstructions") or "",
        "prep_time": "",
        "cook_time": "",
        "servings": "",
        "image_url": meal.get("strMealThumb") or "",
        "source_url": meal.get("strSource") or "",
        "ingredients": ingredients,
        "external_source": "themealdb",
        "external_id": meal.get("idMeal"),
    }


def _build_description(meal):
    parts = []

    if meal.get("strCategory"):
        parts.append(meal["strCategory"])

    if meal.get("strArea"):
        parts.append(meal["strArea"])

    if not parts:
        return "Imported from TheMealDB."

    return f"Imported from TheMealDB: {' / '.join(parts)}."


def _search_themealdb(search_term):
    meals = _search_meals_by_name(search_term)

    if meals:
        return meals

    return _search_meals_by_filters(search_term)


def _search_meals_by_name(search_term):
    response = requests.get(
        f"{THEMEALDB_BASE_URL}/search.php",
        params={"s": search_term},
        timeout=10,
    )

    if response.status_code != 200:
        return []

    data = response.json()
    return data.get("meals") or []


def _search_meals_by_filters(search_term):
    meals = []
    seen_meal_ids = set()

    for filter_term in _build_filter_terms(search_term):
        filter_options = [
            {
                "a": filter_term.title(),
                "fallback_area": filter_term.title(),
            },
            {
                "c": filter_term.title(),
                "fallback_category": filter_term.title(),
            },
            {
                "i": filter_term.lower().replace(" ", "_"),
            },
        ]

        for filter_option in filter_options:
            response = requests.get(
                f"{THEMEALDB_BASE_URL}/filter.php",
                params={
                    key: value
                    for key, value in filter_option.items()
                    if not key.startswith("fallback_")
                },
                timeout=10,
            )

            if response.status_code != 200:
                continue

            data = response.json()

            for meal in data.get("meals") or []:
                meal_id = meal.get("idMeal")

                if not meal_id or meal_id in seen_meal_ids:
                    continue

                seen_meal_ids.add(meal_id)
                meal.update({
                    "strArea": filter_option.get("fallback_area"),
                    "strCategory": filter_option.get("fallback_category"),
                })
                meals.append(meal)

        if meals:
            return meals

    return meals


def _build_filter_terms(search_term):
    words = [
        word
        for word in search_term.lower().split()
        if word not in SEARCH_FILLER_WORDS
    ]
    cleaned_term = " ".join(words).strip()

    return [
        term
        for term in [cleaned_term, search_term.strip()]
        if term
    ]


def _map_search_result(meal):
    return {
        "external_id": meal.get("idMeal"),
        "name": meal.get("strMeal"),
        "category": meal.get("strCategory"),
        "area": meal.get("strArea"),
        "image_url": meal.get("strMealThumb"),
        "source": "themealdb",
    }
