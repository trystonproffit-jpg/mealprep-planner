import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Plus, ShoppingBasket } from "lucide-react";

import { apiUrl } from "../api";

function AddRecipeToGroceryList({ recipe }) {
  const [groceryLists, setGroceryLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/grocery-lists"), {
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
      apiUrl(`/grocery-lists/${selectedListId}/add-from-recipe/${recipe.id}`),
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
    <div className="book-section mt-8 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-4 border-[#a65a18] bg-[#fff0bd] text-[#6b3200] shadow-[3px_3px_0_#6b3200]">
          <ShoppingBasket
            size={24}
            strokeWidth={2.8}
            aria-hidden="true"
          />
        </div>

        <h3 className="font-game text-2xl font-black text-[#3f2108]">
          Add Ingredients to Grocery List
        </h3>
      </div>

      {error ? (
        <p className="book-error mt-4">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border-4 border-[#5f8f3a] bg-[#e4ffd4] p-3 font-black text-[#315a2d] shadow-[3px_3px_0_#6b3200]">
          <CheckCircle2
            size={20}
            strokeWidth={2.8}
            aria-hidden="true"
          />
          <span>{message}</span>
        </p>
      ) : null}

      {groceryLists.length > 0 ? (
        <form onSubmit={handleAddToGroceryList} className="mt-4 space-y-4">
          <div>
            <label className="block font-game text-lg font-black text-[#3f2108]">
              Grocery List
            </label>

            <select
              value={selectedListId}
              onChange={(event) => setSelectedListId(event.target.value)}
              className="book-input mt-2 w-full"
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
            <p className="font-game text-lg font-black text-[#3f2108]">
              Ingredients
            </p>

            <div className="mt-2 space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <label
                  key={ingredient.id}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border-2 border-[#d99b48] bg-[#fff0bd] p-3 font-bold text-[#6b3200]"
                >
                  <input
                    type="checkbox"
                    checked={selectedIngredientIds.includes(ingredient.id)}
                    onChange={() => handleToggleIngredient(ingredient.id)}
                    className="h-5 w-5 shrink-0 accent-[#e87817]"
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
            className="book-button-primary inline-flex items-center gap-2 px-4 py-3"
          >
            <Plus
              size={18}
              strokeWidth={2.8}
              aria-hidden="true"
            />
            Add Selected to Grocery List
          </button>
        </form>
      ) : (
        <div className="mt-4 rounded-xl border-4 border-dashed border-[#a65a18] bg-[#fff0bd] p-5 text-center">
          <ClipboardList
            size={34}
            strokeWidth={2.7}
            className="mx-auto text-[#6b3200]"
            aria-hidden="true"
          />

          <p className="mt-3 font-bold text-[#7a3f0d]">
            Create a grocery list first, then come back to add ingredients.
          </p>
        </div>
      )}
    </div>
  );
}

export default AddRecipeToGroceryList;
