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
        console.log(data);
        navigate(`/recipes/${data.id}`);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-3xl">
        <h2 className="text-4xl font-black text-amber-900">
          {isEditing ? "Edit Recipe" : "Create Recipe"}
        </h2>

        <p className="mt-3 text-amber-700">
          {isEditing
            ? "Update this recipe's details."
            : "Add the basic recipe details first."}
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg"
        >
          {/* Basic recipe details */}
          <div>
            <label className="block font-bold text-amber-900">
              Recipe Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-bold text-amber-900">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 min-h-24 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-bold text-amber-900">
              Meal Type
            </label>

            <select
              name="meal_type"
              value={formData.meal_type}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
            >
              <option value="">None</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Time and serving details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block font-bold text-amber-900">
                Prep Time
              </label>

              <input
                type="text"
                name="prep_time"
                value={formData.prep_time}
                onChange={handleChange}
                placeholder="10 minutes"
                className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900">
                Cook Time
              </label>

              <input
                type="text"
                name="cook_time"
                value={formData.cook_time}
                onChange={handleChange}
                placeholder="15 minutes"
                className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900">
                Servings
              </label>

              <input
                type="text"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                placeholder="4 servings"
                className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Favorite checkbox */}
          <div>
            <label className="flex items-center gap-3 font-bold text-amber-900">
              <input
                type="checkbox"
                name="favorite"
                checked={formData.favorite}
                onChange={handleChange}
                className="h-5 w-5"
              />

              Mark as Favorite
            </label>
          </div>

          {/* Cooking instructions */}
          <div>
            <label className="block font-bold text-amber-900">
              Instructions
            </label>

            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Write the cooking instructions here..."
              className="mt-1 min-h-32 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
            />
          </div>

          {/* Ingredient rows */}
          <div>
            <label className="block font-bold text-amber-900">
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
                    className="w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
                  />

                  <input
                    type="text"
                    name="name"
                    value={ingredient.name}
                    onChange={(event) =>
                      handleIngredientChange(index, event)
                    }
                    placeholder="Ingredient name"
                    className="w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
                  />

                  {formData.ingredients.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeIngredientRow(index)}
                      className="rounded-lg border-2 border-red-700 bg-red-100 px-3 py-2 font-bold text-red-700 hover:bg-red-200"
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
              className="mt-4 rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
            >
              Add Ingredient
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-3 font-bold text-amber-50 hover:bg-amber-800"
          >
            {isEditing ? "Update Recipe" : "Save Recipe"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default RecipeForm;