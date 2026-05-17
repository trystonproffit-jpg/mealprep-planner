import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddRecipeToGroceryList from "../components/AddRecipeToGroceryList";

function RecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
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
      .then((data) => {
        setRecipe(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [recipeId]);

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmed) {
      return;
    }

    fetch(`http://127.0.0.1:5555/recipes/${recipeId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          navigate("/recipes/groups/all");
          return;
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to delete recipe.");
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  if (error) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-4xl">
          <p className="rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-4xl">
          <p className="font-bold text-amber-900">Loading recipe...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/recipes/groups/all")}
              className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
            >
              Back to All Recipes
            </button>

            <button
              onClick={() => navigate(`/recipes/${recipeId}/edit`)}
              className="rounded-xl border-2 border-amber-900 bg-orange-200 px-4 py-2 font-bold text-amber-900 hover:bg-orange-300"
            >
              Edit Recipe
            </button>

            <button
              onClick={() => navigate(`/recipes/${recipeId}/groups`)}
              className="rounded-xl border-2 border-amber-900 bg-orange-200 px-4 py-2 font-bold text-amber-900 hover:bg-orange-300"
            >
              Manage Groups
            </button>

            <button
              onClick={handleDelete}
              className="rounded-xl border-2 border-red-800 bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
            >
              Delete Recipe
            </button>
          </div>

          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="mt-6 h-72 w-full rounded-xl border-4 border-amber-800 object-cover"
            />
          ) : (
            <div className="mt-6 flex h-72 w-full items-center justify-center rounded-xl border-4 border-dashed border-amber-700 bg-amber-50">
              <p className="font-black text-amber-700">No recipe image yet</p>
            </div>
          )}

          <h2 className="mt-4 text-4xl font-black text-amber-900">
            {recipe.name}
          </h2>

          {recipe.favorite ? (
            <p className="mt-2 font-bold text-amber-700">Favorite</p>
          ) : null}

          {recipe.meal_type ? (
            <p className="mt-3 text-sm font-bold uppercase text-amber-700">
              {recipe.meal_type}
            </p>
          ) : null}

          {recipe.description ? (
            <p className="mt-4 text-amber-700">{recipe.description}</p>
          ) : null}

          {recipe.source_url ? (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
            >
              View Recipe Source
            </a>
          ) : null}

          {recipe.groups && recipe.groups.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-xl font-black text-amber-900">
                Groups
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {recipe.groups.map((group) => (
                  <span
                    key={group.id}
                    className="rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-800"
                  >
                    {group.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {recipe.prep_time ? (
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="font-black text-amber-900">Prep Time</p>
                <p className="text-amber-700">{recipe.prep_time}</p>
              </div>
            ) : null}

            {recipe.cook_time ? (
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="font-black text-amber-900">Cook Time</p>
                <p className="text-amber-700">{recipe.cook_time}</p>
              </div>
            ) : null}

            {recipe.servings ? (
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="font-black text-amber-900">Servings</p>
                <p className="text-amber-700">{recipe.servings}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-black text-amber-900">
              Ingredients
            </h3>

            {recipe.ingredients.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="rounded-lg bg-amber-50 p-3 text-amber-800"
                  >
                    <span className="font-bold">{ingredient.quantity}</span>{" "}
                    {ingredient.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-amber-700">No ingredients listed.</p>
            )}
          </div>

          <AddRecipeToGroceryList recipe={recipe} />

          {recipe.instructions ? (
            <div className="mt-8">
              <h3 className="text-2xl font-black text-amber-900">
                Instructions
              </h3>

              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-amber-50 p-4 text-amber-800">
                {recipe.instructions}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default RecipeDetail;
