import { useEffect, useState } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const mealTypes = ["breakfast", "lunch", "dinner"];

function makeSlotKey(day, mealType) {
  return `${day.toLowerCase()}-${mealType}`;
}

// Safely handles backend responses.
// This prevents the app from crashing if Flask returns an HTML error page.
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

  function handleMealChange(day, mealType, recipeId) {
    setError("");

    setMealPrepPlan({
      ...mealPrepPlan,
      [makeSlotKey(day, mealType)]: recipeId,
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
      <section className="mx-auto max-w-6xl">
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

        <div className="mt-8 overflow-x-auto rounded-2xl border-4 border-amber-800 bg-orange-100 p-4 shadow-lg">
          <table className="w-full border-separate border-spacing-3">
            <thead>
              <tr>
                <th className="text-left text-lg font-black text-amber-900">
                  Day
                </th>

                <th className="text-left text-lg font-black text-amber-900">
                  Breakfast
                </th>

                <th className="text-left text-lg font-black text-amber-900">
                  Lunch
                </th>

                <th className="text-left text-lg font-black text-amber-900">
                  Dinner
                </th>
              </tr>
            </thead>

            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="rounded-xl bg-amber-700 p-3 font-black text-amber-50">
                    {day}
                  </td>

                  {mealTypes.map((mealType) => (
                    <td key={mealType}>
                      <select
                        value={mealPrepPlan[makeSlotKey(day, mealType)] || ""}
                        onChange={(event) =>
                          handleMealChange(day, mealType, event.target.value)
                        }
                        className="w-full rounded-xl border-2 border-amber-700 bg-amber-50 p-3 font-bold text-amber-900 outline-none focus:border-orange-500"
                      >
                        <option value="">Choose recipe</option>

                        {recipes.map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default MealPrep;