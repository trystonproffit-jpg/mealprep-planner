import { useEffect, useState } from "react";

function AddRecipeToGroceryList({ recipe }) {
  const [groceryLists, setGroceryLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5555/grocery-lists", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load grocery lists.");
        });
      })
      .then((lists) => {
        setGroceryLists(lists);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  useEffect(() => {
    setSelectedIngredientIds(
      recipe.ingredients.map((ingredient) => ingredient.id)
    );
  }, [recipe]);

  function handleToggleIngredient(ingredientId) {
    if (selectedIngredientIds.includes(ingredientId)) {
      setSelectedIngredientIds(
        selectedIngredientIds.filter((id) => id !== ingredientId)
      );
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, ingredientId]);
    }
  }

  function handleAddToGroceryList(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedListId) {
      setError("Choose a grocery list first.");
      return;
    }

    if (selectedIngredientIds.length === 0) {
      setError("Choose at least one ingredient.");
      return;
    }

    fetch(
      `http://127.0.0.1:5555/grocery-lists/${selectedListId}/add-from-recipe/${recipe.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ingredient_ids: selectedIngredientIds,
        }),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to add ingredients.");
        });
      })
      .then(() => {
        setMessage("Ingredients added to grocery list.");
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <div className="mt-8 rounded-xl border-2 border-amber-700 bg-amber-50 p-4">
      <h3 className="text-xl font-black text-amber-900">
        Add Ingredients to Grocery List
      </h3>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-100 p-3 font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-lg bg-green-100 p-3 font-bold text-green-800">
          {message}
        </p>
      ) : null}

      {groceryLists.length > 0 ? (
        <form onSubmit={handleAddToGroceryList} className="mt-4 space-y-4">
          <div>
            <label className="block font-bold text-amber-900">
              Grocery List
            </label>

            <select
              value={selectedListId}
              onChange={(event) => setSelectedListId(event.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-white p-2 outline-none focus:border-orange-500"
            >
              <option value="">Choose a grocery list</option>

              {groceryLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="font-bold text-amber-900">
              Ingredients
            </p>

            <div className="mt-2 space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <label
                  key={ingredient.id}
                  className="flex items-center gap-3 rounded-lg bg-orange-100 p-2 text-amber-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedIngredientIds.includes(ingredient.id)}
                    onChange={() => handleToggleIngredient(ingredient.id)}
                    className="h-5 w-5 accent-amber-700"
                  />

                  <span>
                    {ingredient.quantity ? `${ingredient.quantity} ` : ""}
                    {ingredient.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Add Selected to Grocery List
          </button>
        </form>
      ) : (
        <p className="mt-3 text-amber-700">
          Create a grocery list first, then come back to add ingredients.
        </p>
      )}
    </div>
  );
}

export default AddRecipeToGroceryList;