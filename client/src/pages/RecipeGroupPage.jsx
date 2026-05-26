import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { apiUrl } from "../api";

const RECIPES_PER_PAGE = 4;

function RecipeGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipePage, setRecipePage] = useState(1);
  const [error, setError] = useState("");

  let title = "Recipe Group";
  let description = "Recipes in this custom group will go here.";

  if (groupId === "all") {
    title = "All Recipes";
    description = "Every recipe you have saved will appear here.";
  }

  if (groupId === "favorites") {
    title = "Favorites";
    description = "Your favorite recipes will appear here.";
  }

  const recipeCountText =
    recipes.length === 1
      ? "1 recipe in this book"
      : `${recipes.length} recipes in this book`;

  const totalRecipePages = Math.max(
    1,
    Math.ceil(recipes.length / RECIPES_PER_PAGE)
  );

  const pageStartIndex = (recipePage - 1) * RECIPES_PER_PAGE;
  const visibleRecipes = recipes.slice(
    pageStartIndex,
    pageStartIndex + RECIPES_PER_PAGE
  );

  useEffect(() => {
    fetch(apiUrl("/recipes"), {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load recipes.");
        });
      })
      .then((data) => {
        let filteredRecipes = data;

        if (groupId === "favorites") {
          filteredRecipes = data.filter((recipe) => recipe.favorite);
        }

        if (groupId !== "all" && groupId !== "favorites") {
          filteredRecipes = data.filter((recipe) =>
            recipe.groups.some((group) => String(group.id) === groupId)
          );
        }

        setRecipes(filteredRecipes);
        setSelectedRecipe(filteredRecipes[0] || null);
        setRecipePage(1);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [groupId]);

  function handleToggleFavorite(recipe) {
    setError("");

    fetch(apiUrl(`/recipes/${recipe.id}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        favorite: !recipe.favorite,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to update favorite.");
        });
      })
      .then((updatedRecipe) => {
        if (groupId === "favorites" && !updatedRecipe.favorite) {
          const nextRecipes = recipes.filter(
            (savedRecipe) => savedRecipe.id !== recipe.id
          );
          const nextTotalPages = Math.max(
            1,
            Math.ceil(nextRecipes.length / RECIPES_PER_PAGE)
          );
          const nextPage = Math.min(recipePage, nextTotalPages);
          const nextStartIndex = (nextPage - 1) * RECIPES_PER_PAGE;

          setRecipes(nextRecipes);
          setRecipePage(nextPage);
          setSelectedRecipe(nextRecipes[nextStartIndex] || null);

          return;
        }

        const nextRecipes = recipes.map((savedRecipe) =>
          savedRecipe.id === updatedRecipe.id ? updatedRecipe : savedRecipe
        );

        setRecipes(nextRecipes);

        if (selectedRecipe?.id === updatedRecipe.id) {
          setSelectedRecipe(updatedRecipe);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleChangeRecipePage(nextPage) {
    const nextStartIndex = (nextPage - 1) * RECIPES_PER_PAGE;

    setRecipePage(nextPage);
    setSelectedRecipe(recipes[nextStartIndex] || null);
  }

  return (
    <main className="book-background p-4 md:p-8">
      <section className="book-shell mx-auto max-w-7xl">
        <div className="book-tab">
          <p className="font-game text-sm font-black uppercase text-[#6b3200]">
            Recipe Book
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)]">
          <div className="book-page rounded-l-2xl p-4 md:p-6">
            <div className="book-page-texture" />

            <div className="relative">
              <div className="text-center">
                <p className="book-badge font-game inline-block px-5 py-2 text-base font-black uppercase">
                  {recipeCountText}
                </p>

                <h2 className="font-game mt-4 text-3xl font-black text-[#3f2108]">
                  {title}
                </h2>

                <p className="mx-auto mt-2 max-w-md font-bold text-[#7a3f0d]">
                  {description}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/recipes")}
                  className="book-button-secondary px-4 py-2"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/recipes/new")}
                  className="book-button-primary px-4 py-2"
                >
                  New Recipe
                </button>
              </div>

              {error ? (
                <p className="book-error mt-5">
                  {error}
                </p>
              ) : null}

              {recipes.length > 0 ? (
                <div className="mt-6 grid min-h-[536px] content-start gap-5 sm:grid-cols-2">
                  {visibleRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      isSelected={selectedRecipe?.id === recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="book-menu-card mt-6 border-dashed p-8">
                  <p className="font-game text-xl font-black text-[#3f2108]">
                    No recipes found.
                  </p>

                  <p className="mt-2 font-bold text-[#7a3f0d]">
                    This recipe page is waiting for something tasty.
                  </p>
                </div>
              )}

              {recipes.length > RECIPES_PER_PAGE ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleChangeRecipePage(recipePage - 1)}
                    disabled={recipePage === 1}
                    className="book-button-secondary px-4 py-2"
                  >
                    Previous
                  </button>

                  <p className="book-badge font-game px-4 py-2 font-black">
                    Page {recipePage} of {totalRecipePages}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleChangeRecipePage(recipePage + 1)}
                    disabled={recipePage === totalRecipePages}
                    className="book-button-secondary px-4 py-2"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden bg-[#6b3200] lg:block">
            <div className="mx-auto h-full w-4 bg-[#2f1b12] shadow-[inset_3px_0_0_rgba(255,255,255,0.12),inset_-3px_0_0_rgba(0,0,0,0.35)]" />
          </div>

          <div className="book-page book-page-light relative mt-4 rounded-r-2xl p-4 lg:mt-0 md:p-6">
            <div className="book-page-texture book-page-texture-right" />

            <div className="relative">
              {selectedRecipe ? (
                <>
                  <div className="overflow-hidden rounded-2xl border-4 border-[#a65a18] bg-[#f6bd63] shadow-[4px_4px_0_#6b3200]">
                    {selectedRecipe.image_url ? (
                      <img
                        src={selectedRecipe.image_url}
                        alt={selectedRecipe.name}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-[#ffe0a0]">
                        <p className="font-game font-black uppercase text-[#6b3200]">
                          Choose Image
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-game inline-block rounded-lg border-2 border-[#a65a18] bg-[#ffd98a] px-3 py-1 text-xs font-black uppercase text-[#6b3200]">
                        Selected Recipe
                      </p>

                      <h3 className="font-game mt-3 text-3xl font-black leading-tight text-[#3f2108]">
                        {selectedRecipe.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(selectedRecipe)}
                      className="book-favorite-button h-12 w-12 shrink-0"
                      aria-label={
                        selectedRecipe.favorite
                          ? `Remove ${selectedRecipe.name} from favorites`
                          : `Add ${selectedRecipe.name} to favorites`
                      }
                      aria-pressed={selectedRecipe.favorite}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={
                          selectedRecipe.favorite
                            ? "h-7 w-7 fill-[#ffd43b]"
                            : "h-7 w-7 fill-transparent stroke-[#ffd43b] stroke-2"
                        }
                        aria-hidden="true"
                      >
                        <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
                      </svg>
                    </button>
                  </div>

                  {selectedRecipe.description ? (
                    <p className="mt-4 rounded-xl border-2 border-[#d99b48] bg-[#ffe0a0] p-3 font-bold text-[#7a3f0d]">
                      {selectedRecipe.description}
                    </p>
                  ) : null}

                  {selectedRecipe.ingredients?.length > 0 ? (
                    <div className="mt-5">
                      <h4 className="font-game text-lg font-black text-[#3f2108]">
                        Ingredients
                      </h4>

                      <ul className="mt-2 space-y-2">
                        {selectedRecipe.ingredients.slice(0, 5).map((ingredient) => (
                          <li
                            key={ingredient.id}
                            className="rounded-lg border-2 border-[#d99b48] bg-[#ffe0a0] px-3 py-2 font-bold text-[#6b3200]"
                          >
                            {ingredient.quantity ? `${ingredient.quantity} ` : ""}
                            {ingredient.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {selectedRecipe.instructions ? (
                    <div className="mt-5">
                      <h4 className="font-game text-lg font-black text-[#3f2108]">
                        Notes
                      </h4>

                      <p className="book-scrollbar mt-2 max-h-40 overflow-y-auto rounded-xl border-2 border-[#d99b48] bg-[#ffe0a0] p-3 font-bold text-[#6b3200]">
                        {selectedRecipe.instructions}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/recipes/${selectedRecipe.id}`)}
                      className="book-button-primary px-4 py-2"
                    >
                      Open Full Recipe
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/recipes/${selectedRecipe.id}/edit`)}
                      className="book-button-secondary px-4 py-2"
                    >
                      Edit
                    </button>
                  </div>
                </>
              ) : (
                <div className="book-menu-card flex min-h-96 items-center justify-center border-dashed p-8">
                  <div>
                    <p className="font-game text-2xl font-black text-[#3f2108]">
                      Pick a recipe
                    </p>

                    <p className="mt-2 font-bold text-[#7a3f0d]">
                      Select a recipe from the left page to preview it here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RecipeGroupPage;
