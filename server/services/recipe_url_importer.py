import html
import json
import re
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


REQUEST_TIMEOUT_SECONDS = 10
USER_AGENT = (
    "MealsteadRecipeImporter/1.0 "
    "(educational recipe import; +http://127.0.0.1:5173)"
)
QUANTITY_PATTERN = re.compile(
    r"^(?P<quantity>"
    r"(?:\d+\s+\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)"
    r"(?:\s*\([^)]+\))?"
    r"(?:\s+(?:cups?|teaspoons?|tsp\.?|tablespoons?|tbsp\.?|"
    r"pounds?|lbs?\.?|ounces?|oz\.?|grams?|g|kilograms?|kg|"
    r"cans?|packages?|packets?|containers?|boxes?|bags?|cloves?|"
    r"sticks?|slices?|pieces?))?"
    r")\s+(?P<name>.+)$",
    re.IGNORECASE,
)


class RecipeUrlImportError(Exception):
    pass


def import_recipe_from_url(url):
    cleaned_url = _validate_url(url)
    html = _fetch_page_html(cleaned_url)
    soup = BeautifulSoup(html, "html.parser")
    recipe_data = _find_recipe_json_ld(soup)

    if not recipe_data:
        raise RecipeUrlImportError(
            "Could not find structured recipe data on that page."
        )

    imported_recipe = _map_recipe_data(recipe_data, cleaned_url)

    if not any([
        imported_recipe["name"],
        imported_recipe["ingredients"],
        imported_recipe["instructions"],
    ]):
        raise RecipeUrlImportError(
            "Could not extract usable recipe details from that page."
        )

    return imported_recipe


def _validate_url(url):
    cleaned_url = (url or "").strip()

    if not cleaned_url:
        raise RecipeUrlImportError("Recipe URL is required.")

    parsed_url = urlparse(cleaned_url)

    if parsed_url.scheme not in ["http", "https"] or not parsed_url.netloc:
        raise RecipeUrlImportError("Recipe URL must start with http:// or https://.")

    return cleaned_url


def _fetch_page_html(url):
    try:
        response = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.Timeout as error:
        raise RecipeUrlImportError("Recipe page took too long to respond.") from error
    except requests.RequestException as error:
        raise RecipeUrlImportError("Could not load that recipe page.") from error

    content_type = response.headers.get("Content-Type", "")

    if content_type and "html" not in content_type.lower():
        raise RecipeUrlImportError("That URL does not appear to be an HTML recipe page.")

    return response.text


def _find_recipe_json_ld(soup):
    for script_tag in soup.find_all("script", type="application/ld+json"):
        json_text = script_tag.string or script_tag.get_text()

        if not json_text or not json_text.strip():
            continue

        try:
            parsed_json = json.loads(json_text)
        except json.JSONDecodeError:
            continue

        recipe_data = _find_recipe_in_json_ld(parsed_json)

        if recipe_data:
            return recipe_data

    return None


def _find_recipe_in_json_ld(data):
    if isinstance(data, list):
        for item in data:
            recipe_data = _find_recipe_in_json_ld(item)

            if recipe_data:
                return recipe_data

    if not isinstance(data, dict):
        return None

    if _json_ld_type_matches(data.get("@type"), "Recipe"):
        return data

    for key in ["@graph", "mainEntity", "mainEntityOfPage"]:
        recipe_data = _find_recipe_in_json_ld(data.get(key))

        if recipe_data:
            return recipe_data

    return None


def _json_ld_type_matches(type_value, expected_type):
    if isinstance(type_value, list):
        return expected_type in type_value

    return type_value == expected_type


def _map_recipe_data(recipe_data, source_url):
    return {
        "name": _clean_text(recipe_data.get("name")),
        "description": _clean_text(recipe_data.get("description")),
        "meal_type": "",
        "instructions": _format_instructions(recipe_data.get("recipeInstructions")),
        "prep_time": _format_duration(recipe_data.get("prepTime")),
        "cook_time": _format_duration(recipe_data.get("cookTime")),
        "servings": _format_servings(recipe_data.get("recipeYield")),
        "image_url": _format_image_url(recipe_data.get("image")),
        "source_url": source_url,
        "ingredients": _format_ingredients(recipe_data.get("recipeIngredient")),
        "external_source": "url_import",
        "external_id": "",
    }


def _format_ingredients(ingredients):
    if not ingredients:
        return []

    if isinstance(ingredients, str):
        ingredients = [ingredients]

    if not isinstance(ingredients, list):
        return []

    formatted_ingredients = []

    for ingredient in ingredients:
        ingredient_text = _clean_text(ingredient)

        if ingredient_text:
            quantity, name = _split_ingredient_quantity(ingredient_text)

            formatted_ingredients.append({
                "name": name,
                "quantity": quantity,
            })

    return formatted_ingredients


def _format_instructions(instructions):
    if not instructions:
        return ""

    if isinstance(instructions, str):
        return _clean_multiline_text(instructions)

    if isinstance(instructions, list):
        steps = []

        for instruction in instructions:
            step_text = _extract_instruction_text(instruction)

            if step_text:
                steps.append(step_text)

        return "\n\n".join(steps)

    return _extract_instruction_text(instructions)


def _extract_instruction_text(instruction):
    if isinstance(instruction, str):
        return _clean_multiline_text(instruction)

    if not isinstance(instruction, dict):
        return ""

    if instruction.get("@type") == "HowToSection":
        return _format_instructions(instruction.get("itemListElement"))

    return _clean_multiline_text(instruction.get("text") or instruction.get("name"))


def _format_duration(duration):
    duration_text = _clean_text(duration)

    if not duration_text:
        return ""

    iso_duration_match = re.fullmatch(
        r"P(?:(?P<days>\d+)D)?(?:T(?:(?P<hours>\d+)H)?(?:(?P<minutes>\d+)M)?)?",
        duration_text,
    )

    if not iso_duration_match:
        return duration_text

    parts = []
    days = iso_duration_match.group("days")
    hours = iso_duration_match.group("hours")
    minutes = iso_duration_match.group("minutes")

    if days:
        parts.append(_pluralize(int(days), "day"))

    if hours:
        parts.append(_pluralize(int(hours), "hour"))

    if minutes:
        parts.append(_pluralize(int(minutes), "minute"))

    return " ".join(parts) if parts else duration_text


def _format_servings(servings):
    if isinstance(servings, list):
        servings = servings[0] if servings else ""

    return _clean_text(servings)


def _format_image_url(image):
    if isinstance(image, list):
        image = image[0] if image else ""

    if isinstance(image, dict):
        image = image.get("url")

    return _clean_text(image)


def _clean_text(value):
    if value is None:
        return ""

    if isinstance(value, dict):
        value = value.get("name") or value.get("text") or value.get("url") or ""

    decoded_value = html.unescape(str(value))
    return re.sub(r"\s+", " ", decoded_value).strip()


def _clean_multiline_text(value):
    if value is None:
        return ""

    text = html.unescape(str(value)).replace("\r\n", "\n").replace("\r", "\n")
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.split("\n")]
    return "\n".join(line for line in lines if line).strip()


def _split_ingredient_quantity(ingredient_text):
    match = QUANTITY_PATTERN.match(ingredient_text)

    if not match:
        return "", ingredient_text

    quantity = match.group("quantity").strip()
    name = match.group("name").strip()

    if not name:
        return "", ingredient_text

    return quantity, name


def _pluralize(amount, unit):
    if amount == 1:
        return f"1 {unit}"

    return f"{amount} {unit}s"
