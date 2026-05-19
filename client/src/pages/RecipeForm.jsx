import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RecipeForm() {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  const isEditing = Boolean(recipeId);

  // Main form state for the recipe being created or edited
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    meal_type: "",
    prep_time: "",
    cook_time: "",
    servings: "",
    source_url: "",
    image_url: "",
    favorite: false,
    instructions: "",
    ingredients: [
      {
        name: "",
        quantity: "",
      },
    ],
  });

  const [error, setError] = useState("");

  // If editing, load the existing recipe data into the form
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    fetch(`http://127.0.0.1:5555/recipes/${recipeId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load recipe.");
        });
      })
      .then((recipe) => {
        setFormData({
          name: recipe.name || "",
          description: recipe.description || "",
          meal_type: recipe.meal_type || "",
          prep_time: recipe.prep_time || "",
          cook_time: recipe.cook_time || "",
          servings: recipe.servings || "",
          source_url: recipe.source_url || "",
          image_url: recipe.image_url || "",
          favorite: recipe.favorite || false,
          instructions: recipe.instructions || "",
          ingredients:
            recipe.ingredients.length > 0
              ? recipe.ingredients.map((ingredient) => ({
                  name: ingredient.name || "",
                  quantity: ingredient.quantity || "",
                }))
              : [
                  {
                    name: "",
                    quantity: "",
                  },
                ],
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [isEditing, recipeId]);

  // Handles regular input, textarea, select, and checkbox changes
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  // Handles changes for one ingredient row at a time
  function handleIngredientChange(index, event) {
    const { name, value } = event.target;

    const updatedIngredients = formData.ingredients.map(
      (ingredient, ingredientIndex) => {
        if (ingredientIndex === index) {
          return {
            ...ingredient,
            [name]: value,
          };
        }

        return ingredient;
      }
    );

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  }

  // Adds another blank ingredient row
  function addIngredientRow() {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          name: "",
          quantity: "",
        },
      ],
    });
  }

  // Removes one ingredient row
  function removeIngredientRow(index) {
    const updatedIngredients = formData.ingredients.filter(
      (ingredient, ingredientIndex) => ingredientIndex !== index
    );

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  }

  // Sends the recipe data to the backend
  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const url = isEditing
      ? `http://127.0.0.1:5555/recipes/${recipeId}`
      : "http://127.0.0.1:5555/recipes";

    const method = isEditing ? "PATCH" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(
            data.error ||
              (isEditing ? "Failed to update recipe." : "Failed to create recipe.")
          );
        });
      })
      .then((data) => {
        navigate(`/recipes/${data.id}`);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <main className="book-background p-4 md:p-8">
      <section className="book-shell mx-auto max-w-5xl">
        <div className="book-tab">
          <p className="font-game text-sm font-black uppercase text-[#6b3200]">
            {isEditing ? "Edit Recipe" : "New Recipe"}
          </p>
        </div>

        <div className="book-page rounded-2xl p-5 md:p-8">
          <div className="book-page-texture" />

          <div className="relative">
            <div className="text-center">
              <h2 className="font-game text-4xl font-black text-[#3f2108] md:text-5xl">
                {isEditing ? "Edit Recipe" : "Create Recipe"}
              </h2>

              <p className="mx-auto mt-3 max-w-2xl font-bold text-[#7a3f0d]">
                {isEditing
                  ? "Update this recipe's details."
                  : "Add the basic recipe details first."}
              </p>
            </div>

        {error ? (
              <p className="book-error mt-6">
                {error}
              </p>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              {/* Basic recipe details */}
              <div className="book-section p-5 text-left">
            <h3 className="font-game text-2xl font-black text-[#3f2108]">
              Recipe Basics
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-bold text-[#3f2108]">
                  Recipe Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="book-input mt-1 w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3f2108]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="book-input book-scrollbar mt-1 min-h-24 w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3f2108]">
                  Meal Type
                </label>

                <select
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleChange}
                  className="book-input mt-1 w-full"
                >
                  <option value="">None</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time and serving details */}
          <div className="book-section grid gap-4 p-5 text-left md:grid-cols-3">
            <div>
              <label className="block font-bold text-[#3f2108]">
                Prep Time
              </label>

              <input
                type="text"
                name="prep_time"
                value={formData.prep_time}
                onChange={handleChange}
                placeholder="10 minutes"
                className="book-input mt-1 w-full"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3f2108]">
                Cook Time
              </label>

              <input
                type="text"
                name="cook_time"
                value={formData.cook_time}
                onChange={handleChange}
                placeholder="15 minutes"
                className="book-input mt-1 w-full"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3f2108]">
                Servings
              </label>

              <input
                type="text"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                placeholder="4 servings"
                className="book-input mt-1 w-full"
              />
            </div>
          </div>

          <div className="book-section grid gap-4 p-5 text-left md:grid-cols-2">
            <div>
              <label className="block font-bold text-[#3f2108]">
                Source URL
              </label>

              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                placeholder="https://example.com/recipe-or-video"
                className="book-input mt-1 w-full"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3f2108]">
                Image URL
              </label>

              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/recipe-image.jpg"
                className="book-input mt-1 w-full"
              />
            </div>
          </div>

          {/* Favorite checkbox */}
          <div className="book-section p-5 text-left">
            <label className="flex items-center gap-3 font-bold text-[#3f2108]">
              <input
                type="checkbox"
                name="favorite"
                checked={formData.favorite}
                onChange={handleChange}
                className="h-5 w-5 accent-[#e87817]"
              />

              Mark as Favorite
            </label>
          </div>

          {/* Cooking instructions */}
          <div className="book-section p-5 text-left">
            <label className="font-game block text-2xl font-black text-[#3f2108]">
              Instructions
            </label>

            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Write the cooking instructions here..."
              className="book-input book-scrollbar mt-3 min-h-40 w-full"
            />
          </div>

          {/* Ingredient rows */}
          <div className="book-section p-5 text-left">
            <label className="font-game block text-2xl font-black text-[#3f2108]">
              Ingredients
            </label>

            <div className="mt-2 space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    type="text"
                    name="quantity"
                    value={ingredient.quantity}
                    onChange={(event) =>
                      handleIngredientChange(index, event)
                    }
                    placeholder="Quantity"
                    className="book-input w-full"
                  />

                  <input
                    type="text"
                    name="name"
                    value={ingredient.name}
                    onChange={(event) =>
                      handleIngredientChange(index, event)
                    }
                    placeholder="Ingredient name"
                    className="book-input w-full"
                  />

                  {formData.ingredients.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeIngredientRow(index)}
                      className="book-button-danger px-3 py-2"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredientRow}
              className="book-button-secondary mt-4 px-4 py-2"
            >
              Add Ingredient
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="submit"
              className="book-button-primary flex-1 px-4 py-3"
            >
              {isEditing ? "Update Recipe" : "Save Recipe"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(isEditing ? `/recipes/${recipeId}` : "/recipes/groups/all")
              }
              className="book-button-secondary flex-1 px-4 py-3"
            >
              Cancel
            </button>
          </div>

            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RecipeForm;
