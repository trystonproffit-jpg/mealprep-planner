import { useEffect, useState } from "react";

import MealPrepDayCard from "../components/MealPrepDayCard";
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

  function handleOpenPicker(day, mealType) {
    setActiveSlot({ day, mealType });
  }

  function handleClearSlotFromCard(day, mealType) {
    saveMealSlot(day, mealType, "");
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
            <MealPrepDayCard
              key={day}
              day={day}
              mealTypes={mealTypes}
              mealPrepPlan={mealPrepPlan}
              getRecipeById={getRecipeById}
              makeSlotKey={makeSlotKey}
              formatMealType={formatMealType}
              onOpenPicker={handleOpenPicker}
              onClearSlot={handleClearSlotFromCard}
            />
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
