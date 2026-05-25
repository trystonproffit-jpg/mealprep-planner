import re
from decimal import Decimal, InvalidOperation
from fractions import Fraction


IRREGULAR_SINGULARS = {
    "berries": "berry",
    "cherries": "cherry",
    "tomatoes": "tomato",
    "potatoes": "potato",
}

UNIT_ALIASES = {
    "teaspoon": "tsp",
    "teaspoons": "tsp",
    "tbsp": "tbsp",
    "tablespoon": "tbsp",
    "tablespoons": "tbsp",
    "cup": "cup",
    "cups": "cup",
    "pound": "lb",
    "pounds": "lb",
    "lb": "lb",
    "lbs": "lb",
    "ounce": "oz",
    "ounces": "oz",
    "oz": "oz",
    "gram": "g",
    "grams": "g",
    "g": "g",
    "kilogram": "kg",
    "kilograms": "kg",
    "kg": "kg",
}

UNITS_WITHOUT_PLURAL = {"tsp", "tbsp", "lb", "oz", "g", "kg"}


def normalize_grocery_name(name):
    cleaned_name = re.sub(r"[^a-z0-9\s]", " ", (name or "").lower())
    words = re.sub(r"\s+", " ", cleaned_name).strip().split(" ")
    singular_words = [_singularize_word(word) for word in words if word]
    return " ".join(singular_words)


def add_or_merge_grocery_item(grocery_list, name, quantity=None, purchased=False):
    from models import GroceryItem

    matching_item = find_matching_grocery_item(grocery_list, name)

    if matching_item:
        matching_item.quantity = combine_quantities(matching_item.quantity, quantity)
        return matching_item, True

    new_item = GroceryItem(
        name=name,
        quantity=quantity,
        purchased=purchased,
        grocery_list=grocery_list,
    )

    return new_item, False


def find_matching_grocery_item(grocery_list, name):
    normalized_name = normalize_grocery_name(name)

    for item in grocery_list.items:
        if normalize_grocery_name(item.name) == normalized_name:
            return item

    return None


def combine_quantities(existing_quantity, incoming_quantity):
    existing = _clean_quantity(existing_quantity)
    incoming = _clean_quantity(incoming_quantity)

    if not existing:
        return incoming

    if not incoming:
        return existing

    existing_parsed = _parse_quantity(existing)
    incoming_parsed = _parse_quantity(incoming)

    if existing.lower() == incoming.lower() and (
        not existing_parsed or not incoming_parsed
    ):
        return existing

    if not existing_parsed or not incoming_parsed:
        return f"{existing} + {incoming}"

    existing_amount, existing_unit = existing_parsed
    incoming_amount, incoming_unit = incoming_parsed

    if existing_unit != incoming_unit:
        return f"{existing} + {incoming}"

    combined_amount = existing_amount + incoming_amount
    return _format_quantity(combined_amount, existing_unit)


def _singularize_word(word):
    if word in IRREGULAR_SINGULARS:
        return IRREGULAR_SINGULARS[word]

    if len(word) > 4 and word.endswith("ies"):
        return f"{word[:-3]}y"

    if len(word) > 4 and word.endswith("oes"):
        return word[:-2]

    if len(word) > 3 and word.endswith("es") and not word.endswith(("ses", "xes")):
        return word[:-1]

    if len(word) > 3 and word.endswith("s") and not word.endswith(("ss", "us")):
        return word[:-1]

    return word


def _clean_quantity(quantity):
    if quantity is None:
        return ""

    return re.sub(r"\s+", " ", str(quantity)).strip()


def _parse_quantity(quantity):
    match = re.match(
        r"^(\d+(?:\.\d+)?|\d+\s+\d+/\d+|\d+/\d+)(?:\s+([a-zA-Z]+))?$",
        quantity,
    )

    if not match:
        return None

    amount_text = match.group(1)
    unit_text = match.group(2) or ""
    amount = _parse_amount(amount_text)

    if amount is None:
        return None

    return amount, _normalize_unit(unit_text)


def _parse_amount(amount_text):
    try:
        if "/" in amount_text:
            parts = amount_text.split()

            if len(parts) == 2:
                fraction = Fraction(parts[1])
                return (
                    Decimal(parts[0])
                    + Decimal(fraction.numerator) / Decimal(fraction.denominator)
                )

            fraction = Fraction(amount_text)
            return Decimal(fraction.numerator) / Decimal(fraction.denominator)

        return Decimal(amount_text)
    except (InvalidOperation, ValueError, ZeroDivisionError):
        return None


def _normalize_unit(unit):
    if not unit:
        return ""

    normalized_unit = unit.lower()
    return UNIT_ALIASES.get(normalized_unit, _singularize_word(normalized_unit))


def _format_quantity(amount, unit):
    formatted_amount = _format_amount(amount)

    if not unit:
        return formatted_amount

    display_unit = unit

    if amount != Decimal("1") and unit not in UNITS_WITHOUT_PLURAL:
        display_unit = f"{unit}s"

    return f"{formatted_amount} {display_unit}"


def _format_amount(amount):
    if amount == amount.to_integral_value():
        return str(int(amount))

    return str(amount.normalize())
