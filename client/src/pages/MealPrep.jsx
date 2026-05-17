import { useEffect, useState } from "react";

import MealSlotRecipePicker from "../components/MealSlotRecipePicker";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const mealTypes = ["breakfast", "lunch", "dinner"];

function makeSlotKey(day, mealType) {
  return `${day.toLowerCase()}-${mealType}`;
}

function formatMealType(mealType) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

function readJsonOrThrow(response, fallbackMessage) {
  if (response.ok) {
    return response.json();
  }

  return response.text().then((text) => {
    console.error("Backend error response:", text);
    throw new Error(fallbackMessage);
  });
}

function MealPrep() {
  const [recipes, setRecipes] = useState([]);
  const [mealPrepPlan, setMealPrepPlan] = useState({});
  const [activeSlot, setActiveSlot] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5555/recipes", {
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to load recipes.")
      )
      .then((data) => {
        setRecipes(data);
      })
      .catch((error) => {
        setError(error.message);
      });

    fetch("http://127.0.0.1:5555/meal-prep", {
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to load meal prep.")
      )
      .then((data) => {
        const loadedPlan = {};

        data.forEach((slot) => {
          loadedPlan[makeSlotKey(slot.day, slot.meal_type)] = slot.recipe_id
            ? String(slot.recipe_id)
            : "";
        });

        setMealPrepPlan(loadedPlan);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  function getRecipeById(recipeId) {
    return recipes.find((recipe) => String(recipe.id) === String(recipeId));
  }

  function saveMealSlot(day, mealType, recipeId) {
    setError("");

    setMealPrepPlan({
      ...mealPrepPlan,
      [makeSlotKey(day, mealType)]: recipeId ? String(recipeId) : "",
    });

    fetch("http://127.0.0.1:5555/meal-prep", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        day: day.toLowerCase(),
        meal_type: mealType,
        recipe_id: recipeId ? parseInt(recipeId) : null,
      }),
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to save meal prep slot.")
      )
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleSelectRecipe(recipeId) {
    saveMealSlot(activeSlot.day, activeSlot.mealType, recipeId);
    setActiveSlot(null);
  }

  function handleClearSlot() {
    saveMealSlot(activeSlot.day, activeSlot.mealType, "");
    setActiveSlot(null);
  }

  function handleClearMealPrep() {
    const confirmed = window.confirm("Clear the whole meal prep week?");

    if (!confirmed) {
      return;
    }

    setError("");

    fetch("http://127.0.0.1:5555/meal-prep", {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setMealPrepPlan({});
          return;
        }

        return response.text().then((text) => {
          console.error("Clear meal prep backend error:", text);
          throw new Error("Failed to clear meal prep.");
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-amber-900">
              Meal Prep
            </h2>

            <p className="mt-3 text-amber-700">
              Plan breakfast, lunch, and dinner for your reusable week.
            </p>
          </div>

          <button
            onClick={handleClearMealPrep}
            className="rounded-xl border-2 border-red-800 bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
          >
            Clear Meal Prep
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-7">
          {days.map((day) => (
            <div
              key={day}
              className="rounded-2xl border-4 border-amber-800 bg-orange-100 p-4 shadow-lg"
            >
              <h3 className="text-center text-xl font-black text-amber-900">
                {day}
              </h3>

              <div className="mt-4 space-y-4">
                {mealTypes.map((mealType) => {
                  const slotKey = makeSlotKey(day, mealType);
                  const selectedRecipe = getRecipeById(mealPrepPlan[slotKey]);

                  return (
                    <div
                      key={mealType}
                      className="flex min-h-56 flex-col rounded-xl border-2 border-amber-700 bg-amber-50 p-3"
                    >
                      <p className="text-sm font-black uppercase text-amber-700">
                        {formatMealType(mealType)}
                      </p>

                      {selectedRecipe ? (
                        <div className="mt-2">
                          {selectedRecipe.image_url ? (
                            <img
                              src={selectedRecipe.image_url}
                              alt={selectedRecipe.name}
                              className="h-24 w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-orange-100">
                              <p className="text-sm font-bold text-amber-700">
                                No Image
                              </p>
                            </div>
                          )}

                          <p className="mt-2 line-clamp-2 min-h-12 font-black text-amber-900">
                            {selectedRecipe.name}
                          </p>

                          <div className="mt-auto grid gap-2 pt-3">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveSlot({ day, mealType })
                              }
                              className="w-full rounded-lg border-2 border-amber-900 bg-orange-200 px-2 py-1 text-sm font-bold text-amber-900 hover:bg-orange-300"
                            >
                              Change
                            </button>

                            <button
                              type="button"
                              onClick={() => saveMealSlot(day, mealType, "")}
                              className="w-full rounded-lg border-2 border-red-800 bg-red-100 px-2 py-1 text-sm font-bold text-red-700 hover:bg-red-200"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveSlot({ day, mealType })}
                          className="mt-2 flex min-h-40 w-full flex-1 items-center justify-center rounded-lg border-2 border-dashed border-amber-700 bg-orange-100 px-3 py-4 font-bold text-amber-800 hover:bg-orange-200"
                        >
                          Add Recipe
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeSlot ? (
        <MealSlotRecipePicker
          recipes={recipes}
          slotLabel={`${activeSlot.day} ${formatMealType(activeSlot.mealType)}`}
          onSelectRecipe={handleSelectRecipe}
          onClearSlot={handleClearSlot}
          onClose={() => setActiveSlot(null)}
        />
      ) : null}
    </main>
  );
}

export default MealPrep;
