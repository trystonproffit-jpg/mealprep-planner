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
      <main className="book-background p-4 md:p-8">
        <section className="mx-auto max-w-4xl">
          <p className="book-error">
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="book-background p-4 md:p-8">
        <section className="book-shell mx-auto max-w-4xl">
          <div className="book-page rounded-2xl p-6 text-center">
            <p className="font-game text-2xl font-black text-[#3f2108]">
              Loading recipe...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="book-background p-4 md:p-8">
      <section className="book-shell mx-auto max-w-5xl">
        <div className="book-tab">
          <p className="font-game text-sm font-black uppercase text-[#6b3200]">
            Recipe Entry
          </p>
        </div>

        <div className="book-page rounded-2xl p-5 md:p-8">
          <div className="book-page-texture" />

          <div className="relative">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/recipes/groups/all")}
                className="book-button-secondary px-4 py-2"
              >
                Back to All Recipes
              </button>

              <button
                onClick={() => navigate(`/recipes/${recipeId}/edit`)}
                className="book-button-primary px-4 py-2"
              >
                Edit Recipe
              </button>

              <button
                onClick={() => navigate(`/recipes/${recipeId}/groups`)}
                className="book-button-secondary px-4 py-2"
              >
                Manage Groups
              </button>

              <button
                onClick={handleDelete}
                className="book-button-danger px-4 py-2"
              >
                Delete Recipe
              </button>
            </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="h-80 w-full rounded-2xl border-4 border-[#a65a18] object-cover shadow-[4px_4px_0_#6b3200]"
                />
              ) : (
                <div className="flex h-80 w-full items-center justify-center rounded-2xl border-4 border-dashed border-[#a65a18] bg-[#fff0bd] shadow-[4px_4px_0_#6b3200]">
                  <p className="font-game font-black uppercase text-[#6b3200]">
                    No recipe image yet
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="book-badge font-game inline-block px-3 py-1 text-xs font-black uppercase">
                    Recipe Card
                  </p>

                  <h2 className="font-game mt-4 text-4xl font-black leading-tight text-[#3f2108]">
                    {recipe.name}
                  </h2>
                </div>

                {recipe.favorite ? (
                  <div
                    className="book-favorite-button h-12 w-12 shrink-0"
                    aria-label="Favorite recipe"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-7 w-7 fill-[#ffd43b]"
                      aria-hidden="true"
                    >
                      <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
                    </svg>
                  </div>
                ) : null}
              </div>

              {recipe.meal_type ? (
                <p className="mt-4 inline-block rounded-lg border-2 border-[#d99b48] bg-[#ffd98a] px-3 py-1 font-game text-sm font-black uppercase text-[#6b3200]">
                  {recipe.meal_type}
                </p>
              ) : null}

              {recipe.description ? (
                <p className="mt-4 rounded-xl border-2 border-[#d99b48] bg-[#fff0bd] p-4 font-bold text-[#7a3f0d]">
                  {recipe.description}
                </p>
              ) : null}

              {recipe.source_url ? (
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="book-button-primary mt-4 inline-block px-4 py-2"
                >
                  View Recipe Source
                </a>
              ) : null}
            </div>
          </div>

          {recipe.groups && recipe.groups.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-game text-xl font-black text-[#3f2108]">
                Groups
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {recipe.groups.map((group) => (
                  <span
                    key={group.id}
                    className="rounded-lg border-2 border-[#d99b48] bg-[#ffd98a] px-3 py-1 font-bold text-[#6b3200]"
                  >
                    {group.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {recipe.prep_time ? (
              <div className="book-menu-card p-4">
                <p className="font-game font-black text-[#3f2108]">Prep Time</p>
                <p className="font-bold text-[#7a3f0d]">{recipe.prep_time}</p>
              </div>
            ) : null}

            {recipe.cook_time ? (
              <div className="book-menu-card p-4">
                <p className="font-game font-black text-[#3f2108]">Cook Time</p>
                <p className="font-bold text-[#7a3f0d]">{recipe.cook_time}</p>
              </div>
            ) : null}

            {recipe.servings ? (
              <div className="book-menu-card p-4">
                <p className="font-game font-black text-[#3f2108]">Servings</p>
                <p className="font-bold text-[#7a3f0d]">{recipe.servings}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-8">
            <h3 className="font-game text-2xl font-black text-[#3f2108]">
              Ingredients
            </h3>

            {recipe.ingredients.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="rounded-lg border-2 border-[#d99b48] bg-[#fff0bd] p-3 text-[#6b3200]"
                  >
                    <span className="font-bold">{ingredient.quantity}</span>{" "}
                    {ingredient.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-bold text-[#7a3f0d]">No ingredients listed.</p>
            )}
          </div>

          <AddRecipeToGroceryList recipe={recipe} />

          {recipe.instructions ? (
            <div className="mt-8">
              <h3 className="font-game text-2xl font-black text-[#3f2108]">
                Instructions
              </h3>

              <p className="mt-3 whitespace-pre-wrap rounded-xl border-2 border-[#d99b48] bg-[#fff0bd] p-4 font-bold text-[#6b3200]">
                {recipe.instructions}
              </p>
            </div>
          ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export default RecipeDetail;
