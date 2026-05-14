from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property

from config import db, bcrypt


recipe_group_association = db.Table(
    "recipe_group_association",
    db.Column("recipe_id", db.Integer, db.ForeignKey("recipes.id"), primary_key=True),
    db.Column("recipe_group_id", db.Integer, db.ForeignKey("recipe_groups.id"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    _password_hash = db.Column(db.String, nullable=False)

    recipes = db.relationship(
        "Recipe",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    recipe_groups = db.relationship(
        "RecipeGroup",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    meal_prep_slots = db.relationship(
        "MealPrepSlot",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    grocery_lists = db.relationship(
        "GroceryList",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hashes may not be viewed.")

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(
            password.encode("utf-8")
        )
        self._password_hash = password_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash,
            password.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
        }

    @validates("username")
    def validate_username(self, key, username):
        if not username or not username.strip():
            raise ValueError("Username is required.")
        return username.strip()

    @validates("email")
    def validate_email(self, key, email):
        if not email or not email.strip():
            raise ValueError("Email is required.")
        return email.strip().lower()

    def __repr__(self):
        return f"<User {self.id}: {self.username}>"
    
    
class Recipe(db.Model):
    __tablename__ = "recipes"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    meal_type = db.Column(db.String)
    instructions = db.Column(db.Text)
    prep_time = db.Column(db.String)
    cook_time = db.Column(db.String)
    servings = db.Column(db.String)
    favorite = db.Column(db.Boolean, default=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="recipes")

    ingredients = db.relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan"
    )

    groups = db.relationship(
        "RecipeGroup",
        secondary=recipe_group_association,
        back_populates="recipes"
    )

    @validates("name")
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError("Recipe name is required.")
        return name.strip()
    
    @validates("meal_type")
    def validate_meal_type(self, key, meal_type):
        allowed_meal_types = ["breakfast", "lunch", "dinner", "snack"]

        if meal_type is None or meal_type == "":
            return None
        
        meal_type = meal_type.strip().lower()

        if meal_type not in allowed_meal_types:
            raise ValueError("Meal type must be breakfast, lunch, dinner, snack, or blank.")
        
        return meal_type
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "meal_type": self.meal_type,
            "instructions": self.instructions,
            "prep_time": self.prep_time,
            "cook_time": self.cook_time,
            "servings": self.servings,
            "favorite": self.favorite,
            "user_id": self.user_id,
            "ingredients": [ingredient.to_dict() for ingredient in self.ingredients],
            "groups": [group.to_dict_basic() for group in self.groups],
        }
    
    def __repr__(self):
        return f"<Recipe {self.id}: {self.name}>"
    

class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredients"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String, nullable=False)
    quantity = db.Column(db.String)

    recipe_id = db.Column(db.Integer, db.ForeignKey("recipes.id"), nullable=False)

    recipe = db.relationship("Recipe", back_populates="ingredients")

    @validates("name")
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError("Ingredient name is required.")
        return name.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "recipe_id": self.recipe_id,
        }

    def __repr__(self):
        return f"<RecipeIngredient {self.id}: {self.name}>"
    

class RecipeGroup(db.Model):
    __tablename__ = "recipe_groups"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="recipe_groups")

    recipes = db.relationship(
        "Recipe",
        secondary=recipe_group_association,
        back_populates="groups"
    )

    @validates("name")
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError("Group name is required.")
        return name.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "recipes": [recipe.to_dict() for recipe in self.recipes],
        }

    def to_dict_basic(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
        }

    def __repr__(self):
        return f"<RecipeGroup {self.id}: {self.name}>"


class MealPrepSlot(db.Model):
    __tablename__ = "meal_prep_slots"

    id = db.Column(db.Integer, primary_key=True)

    day = db.Column(db.String, nullable=False)
    meal_type = db.Column(db.String, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipes.id"), nullable=True)

    user = db.relationship("User", back_populates="meal_prep_slots")

    recipe = db.relationship("Recipe")

    @validates("day")
    def validate_day(self, key, day):
        allowed_days = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]

        if not day or not day.strip():
            raise ValueError("Day is required.")

        day = day.strip().lower()

        if day not in allowed_days:
            raise ValueError("Day must be a valid weekday.")

        return day

    @validates("meal_type")
    def validate_meal_type(self, key, meal_type):
        allowed_meal_types = ["breakfast", "lunch", "dinner"]

        if not meal_type or not meal_type.strip():
            raise ValueError("Meal type is required.")

        meal_type = meal_type.strip().lower()

        if meal_type not in allowed_meal_types:
            raise ValueError("Meal type must be breakfast, lunch, or dinner.")

        return meal_type

    def to_dict(self):
        return {
            "id": self.id,
            "day": self.day,
            "meal_type": self.meal_type,
            "user_id": self.user_id,
            "recipe_id": self.recipe_id,
            "recipe": self.recipe.to_dict() if self.recipe else None,
        }

    def __repr__(self):
        return f"<MealPrepSlot {self.id}: {self.day} {self.meal_type}>"
    
class GroceryList(db.Model):
    __tablename__ = "grocery_lists"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="grocery_lists")

    items = db.relationship(
        "GroceryItem",
        back_populates="grocery_list",
        cascade="all, delete-orphan"
    )

    @validates("name")
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError("Grocery list name is required.")

        return name.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "items": [item.to_dict() for item in self.items],
        }

    def to_dict_basic(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
        }

    def __repr__(self):
        return f"<GroceryList {self.id}: {self.name}>"


class GroceryItem(db.Model):
    __tablename__ = "grocery_items"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String, nullable=False)
    quantity = db.Column(db.String)
    purchased = db.Column(db.Boolean, default=False)

    grocery_list_id = db.Column(
        db.Integer,
        db.ForeignKey("grocery_lists.id"),
        nullable=False
    )

    grocery_list = db.relationship("GroceryList", back_populates="items")

    @validates("name")
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError("Grocery item name is required.")

        return name.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "purchased": self.purchased,
            "grocery_list_id": self.grocery_list_id,
        }

    def __repr__(self):
        return f"<GroceryItem {self.id}: {self.name}>"