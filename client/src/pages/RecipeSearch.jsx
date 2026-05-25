import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Sparkles } from "lucide-react";

import RecipeAssistantPanel from "../components/RecipeAssistantPanel";

const RESULTS_PER_PAGE = 6;

function RecipeSearch() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [importingRecipeId, setImportingRecipeId] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);
  const [resultsPage, setResultsPage] = useState(1);

  const totalResultsPages = Math.max(
    1,
    Math.ceil(recipes.length / RESULTS_PER_PAGE)
  );
  const resultsPageStartIndex = (resultsPage - 1) * RESULTS_PER_PAGE;
  const visibleRecipes = recipes.slice(
    resultsPageStartIndex,
    resultsPageStartIndex + RESULTS_PER_PAGE
  );

  function runSearch(searchValue, source = "manual") {
    setError("");

    const trimmedSearchTerm = searchValue.trim();

    if (!trimmedSearchTerm) {
      setError("Enter a recipe search term.");
      return;
    }

    setIsSearching(true);

    fetch(
      `http://127.0.0.1:5555/external-recipes/search?q=${encodeURIComponent(
        trimmedSearchTerm
      )}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to search recipes.");
        });
      })
      .then((recipes) => {
        setRecipes(recipes);
        setResultsPage(1);
        setLastSearch({
          query: trimmedSearchTerm,
          source,
        });
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }

  function handleSearch(event) {
    event.preventDefault();
    runSearch(searchTerm, "manual");
  }

  function handleUseSearchQuery(searchQuery) {
    setSearchTerm(searchQuery);
    runSearch(searchQuery, "assistant");
  }

  function handleUseRecipe(recipe) {
    setError("");
    setImportingRecipeId(recipe.external_id);

    fetch(
      `http://127.0.0.1:5555/external-recipes/themealdb/${recipe.external_id}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load recipe details.");
        });
      })
      .then((importedRecipe) => {
        navigate("/recipes/new", {
          state: {
            importedRecipe,
          },
        });
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setImportingRecipeId(null);
      });
  }

  return (
    <main className="book-background p-4 md:p-8">
      <section className="book-shell mx-auto max-w-6xl">
        <div className="book-tab">
          <p className="font-game text-sm font-black uppercase text-[#6b3200]">
            Online Recipe Search
          </p>
        </div>

        <div className="book-page rounded-2xl p-5 md:p-8">
          <div className="book-page-texture" />

          <div className="relative">
            <button
              type="button"
              onClick={() => navigate("/recipes")}
              className="book-button-secondary inline-flex items-center gap-2 px-4 py-3"
            >
              <ArrowLeft
                size={18}
                strokeWidth={2.8}
                aria-hidden="true"
              />
              Back to Recipes
            </button>

            <div className="mt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border-4 border-[#a65a18] bg-[#fff0bd] text-[#6b3200] shadow-[3px_3px_0_#6b3200]">
                <Sparkles
                  size={30}
                  strokeWidth={2.7}
                  aria-hidden="true"
                />
              </div>

              <h2 className="font-game mt-4 text-4xl font-black text-[#3f2108] md:text-5xl">
                Find Recipes Online
              </h2>

              <p className="mx-auto mt-3 max-w-2xl font-bold text-[#7a3f0d]">
                Search TheMealDB, then use a result as a starting point for a
                new Mealstead recipe.
              </p>
            </div>

            {error ? (
              <p className="book-error mt-6">
                {error}
              </p>
            ) : null}

            <RecipeAssistantPanel onUseSearchQuery={handleUseSearchQuery} />

            <form
              onSubmit={handleSearch}
              className="book-menu-card mx-auto mt-7 flex max-w-3xl flex-col gap-3 p-4 md:flex-row"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search chicken, pasta, curry..."
                className="book-input flex-1"
              />

              <button
                type="submit"
                disabled={isSearching}
                className="book-button-primary inline-flex items-center justify-center gap-2 px-5 py-3"
              >
                <Search
                  size={18}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="mt-8">
              {lastSearch ? (
                <div className="book-menu-card mb-5 p-4 text-center">
                  <p className="font-game text-sm font-black uppercase text-[#6b3200]">
                    {lastSearch.source === "assistant"
                      ? "Assistant Search"
                      : "Search Results"}
                  </p>

                  <p className="mt-2 font-bold text-[#7a3f0d]">
                    Showing recipes for{" "}
                    <span className="font-black text-[#3f2108]">
                      {lastSearch.query}
                    </span>
                  </p>
                </div>
              ) : null}

              {recipes.length > 0 ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {visibleRecipes.map((recipe) => (
                      <article
                        key={recipe.external_id}
                        className="book-menu-card overflow-hidden"
                      >
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-[#fff0bd]">
                            <p className="font-game font-black text-[#6b3200]">
                              No Image
                            </p>
                          </div>
                        )}

                        <div className="p-5">
                          <p className="font-game text-xs font-black uppercase text-[#6b3200]">
                            {[recipe.category, recipe.area]
                              .filter(Boolean)
                              .join(" / ") || "Recipe"}
                          </p>

                          <h3 className="font-game mt-3 text-2xl font-black leading-tight text-[#3f2108]">
                            {recipe.name}
                          </h3>

                          <button
                            type="button"
                            onClick={() => handleUseRecipe(recipe)}
                            disabled={importingRecipeId === recipe.external_id}
                            className="book-button-primary mt-4 w-full px-4 py-3"
                          >
                            {importingRecipeId === recipe.external_id
                              ? "Preparing..."
                              : "Use This Recipe"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {recipes.length > RESULTS_PER_PAGE ? (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setResultsPage(resultsPage - 1)}
                        disabled={resultsPage === 1}
                        className="book-button-secondary px-4 py-2"
                      >
                        Previous
                      </button>

                      <p className="book-badge font-game px-4 py-2 font-black">
                        Page {resultsPage} of {totalResultsPages}
                      </p>

                      <button
                        type="button"
                        onClick={() => setResultsPage(resultsPage + 1)}
                        disabled={resultsPage === totalResultsPages}
                        className="book-button-secondary px-4 py-2"
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="book-menu-card border-dashed p-6 text-center">
                  <p className="font-game text-2xl font-black text-[#3f2108]">
                    {lastSearch
                      ? "No recipes found for that search."
                      : "Search for a recipe to get started."}
                  </p>

                  {lastSearch ? (
                    <p className="mx-auto mt-2 max-w-xl font-bold text-[#7a3f0d]">
                      Try a simpler term like chicken, pasta, beef, curry, or
                      rice.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RecipeSearch;
