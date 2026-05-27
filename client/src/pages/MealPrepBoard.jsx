import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";

import FarmPageLayout from "../components/FarmPageLayout";
import GameButton from "../components/GameButton";
import SectionHeader from "../components/SectionHeader";
import { apiUrl } from "../api";

const validDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const validMealTypes = ["breakfast", "lunch", "dinner"];

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readJsonOrThrow(response, fallbackMessage) {
  if (response.ok) {
    return response.json();
  }

  return response.json().then((data) => {
    throw new Error(data.error || fallbackMessage);
  });
}

function MealPrepBoard() {
  const { day, mealType } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [error, setError] = useState("");
  const [addingRecipeId, setAddingRecipeId] = useState(null);

  const cleanedDay = (day || "").toLowerCase();
  const cleanedMealType = (mealType || "").toLowerCase();
  const boardIsValid =
    validDays.includes(cleanedDay) && validMealTypes.includes(cleanedMealType);

  useEffect(() => {
    if (!boardIsValid) {
      setError("Meal prep board not found.");
      return;
    }

    fetch(apiUrl(`/meal-prep/${cleanedDay}/${cleanedMealType}`), {
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to load meal prep board.")
      )
      .then((loadedBoard) => {
        setBoard(loadedBoard);
      })
      .catch((error) => {
        setError(error.message);
      });

    fetch(apiUrl("/recipes"), {
      credentials: "include",
    })
      .then((response) => readJsonOrThrow(response, "Failed to load recipes."))
      .then((loadedRecipes) => {
        setRecipes(loadedRecipes);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [boardIsValid, cleanedDay, cleanedMealType]);

  const boardRecipes = board?.recipes || [];
  const boardRecipeIds = boardRecipes.map((recipe) => recipe.id);
  const availableRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(recipeSearch.toLowerCase());

    return matchesSearch && !boardRecipeIds.includes(recipe.id);
  });

  function handleAddRecipe(recipeId) {
    setError("");
    setAddingRecipeId(recipeId);

    fetch(apiUrl(`/meal-prep/${cleanedDay}/${cleanedMealType}/recipes/${recipeId}`), {
      method: "POST",
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to add recipe to meal board.")
      )
      .then((updatedBoard) => {
        setBoard(updatedBoard);
        setRecipeSearch("");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setAddingRecipeId(null);
      });
  }

  function handleRemoveRecipe(recipeId) {
    setError("");

    fetch(apiUrl(`/meal-prep/${cleanedDay}/${cleanedMealType}/recipes/${recipeId}`), {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to remove recipe from meal board.")
      )
      .then((updatedBoard) => {
        setBoard(updatedBoard);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleClearBoard() {
    const confirmed = window.confirm("Clear this meal board?");

    if (!confirmed) {
      return;
    }

    setError("");

    fetch(apiUrl(`/meal-prep/${cleanedDay}/${cleanedMealType}`), {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to clear meal board.")
      )
      .then((updatedBoard) => {
        setBoard(updatedBoard);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  if (!boardIsValid) {
    return (
      <FarmPageLayout maxWidth="max-w-4xl">
        <p className="farm-error">
          Meal prep board not found.
        </p>
      </FarmPageLayout>
    );
  }

  return (
    <FarmPageLayout maxWidth="max-w-6xl">
      <GameButton
        type="button"
        variant="secondary"
        onClick={() => navigate("/meal-prep")}
        className="inline-flex items-center gap-2 px-4 py-3"
      >
        <ArrowLeft
          size={18}
          strokeWidth={2.8}
          aria-hidden="true"
        />
        Back to Meal Prep
      </GameButton>

      <div className="farm-panel mt-6 p-5 md:p-8">
        <SectionHeader
          eyebrow={`${formatLabel(cleanedMealType)} Board`}
          title={`${formatLabel(cleanedDay)} ${formatLabel(cleanedMealType)}`}
          description="Add saved recipes to this meal board. Use it for entrees, sides, snacks, or anything else you want planned together."
          action={
            <GameButton
              type="button"
              variant="danger"
              onClick={handleClearBoard}
              className="inline-flex items-center gap-2 px-4 py-3"
            >
              <Trash2
                size={18}
                strokeWidth={2.8}
                aria-hidden="true"
              />
              Clear Board
            </GameButton>
          }
        />

        {error ? (
          <p className="farm-error mt-6">
            {error}
          </p>
        ) : null}

        <section className="mt-8">
          <h3 className="font-game text-3xl font-black text-[var(--farm-ink)]">
            Added Recipes
          </h3>

          {boardRecipes.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {boardRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="overflow-hidden rounded-2xl border-3 border-[var(--farm-wood)] bg-[var(--farm-paper-light)] shadow-[4px_4px_0_rgba(74,42,22,0.35)]"
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-[var(--farm-panel)]">
                      <p className="font-game font-black uppercase text-[var(--farm-muted)]">
                        No Image
                      </p>
                    </div>
                  )}

                  <div className="p-4">
                    <h4 className="font-game text-2xl font-black leading-tight text-[var(--farm-ink)]">
                      {recipe.name}
                    </h4>

                    {recipe.description ? (
                      <p className="mt-2 line-clamp-3 font-bold text-[var(--farm-muted)]">
                        {recipe.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <GameButton
                        type="button"
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        className="inline-flex items-center px-3 py-2"
                      >
                        Open Recipe
                      </GameButton>

                      <GameButton
                        type="button"
                        variant="danger"
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        className="inline-flex items-center gap-2 px-3 py-2"
                      >
                        <Trash2
                          size={16}
                          strokeWidth={2.8}
                          aria-hidden="true"
                        />
                        Remove
                      </GameButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border-3 border-dashed border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-6 text-center">
              <p className="font-game text-2xl font-black text-[var(--farm-ink)]">
                No recipes added yet.
              </p>

              <p className="mt-2 font-bold text-[var(--farm-muted)]">
                Search your saved recipes below and add anything you want on this board.
              </p>
            </div>
          )}
        </section>

        <section className="mt-9 rounded-2xl border-3 border-[var(--farm-wood)] bg-[var(--farm-panel)] p-4 shadow-[4px_4px_0_rgba(74,42,22,0.28)]">
          <h3 className="font-game text-3xl font-black text-[var(--farm-ink)]">
            Add Saved Recipe
          </h3>

          <div className="relative mt-4">
            <Search
              size={19}
              strokeWidth={2.6}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--farm-muted)]"
              aria-hidden="true"
            />

            <input
              type="text"
              value={recipeSearch}
              onChange={(event) => setRecipeSearch(event.target.value)}
              placeholder="Search your recipes..."
              className="farm-input farm-input-with-left-icon w-full"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {availableRecipes.length > 0 ? (
              availableRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => handleAddRecipe(recipe.id)}
                  disabled={addingRecipeId === recipe.id}
                  className="flex min-h-20 items-center gap-3 rounded-xl border-3 border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-3 text-left font-bold text-[var(--farm-ink)] shadow-[3px_3px_0_rgba(74,42,22,0.24)] transition hover:-translate-y-0.5 hover:bg-[#fff0b8]"
                >
                  <Plus
                    size={20}
                    strokeWidth={2.8}
                    className="shrink-0 text-[var(--farm-green-dark)]"
                    aria-hidden="true"
                  />

                  <span>
                    {addingRecipeId === recipe.id ? "Adding..." : recipe.name}
                  </span>
                </button>
              ))
            ) : (
              <p className="rounded-xl border-3 border-dashed border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-4 font-bold text-[var(--farm-muted)] md:col-span-2">
                {recipes.length === boardRecipeIds.length
                  ? "All saved recipes are already on this board."
                  : "No matching recipes found."}
              </p>
            )}
          </div>
        </section>
      </div>
    </FarmPageLayout>
  );
}

export default MealPrepBoard;
