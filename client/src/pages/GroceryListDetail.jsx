import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function GroceryListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();

  const [groceryList, setGroceryList] = useState(null);
  const [error, setError] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);

  // Load one grocery list and its items
  useEffect(() => {
    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load grocery list.");
        });
      })
      .then((list) => {
        setGroceryList(list);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [listId]);

  // Load all recipes
  useEffect(() => {
    fetch("http://127.0.0.1:5555/recipes", {
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
      .then((recipes) => {
        setRecipes(recipes);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  function handleAddItem(event) {
    event.preventDefault();
    setError("");

    if (!newItemName.trim()) {
      setError("Item name is required.");
      return;
    }

    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: newItemName,
        quantity: newItemQuantity,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to add grocery item.");
        });
      })
      .then((createdItem) => {
        setGroceryList({
          ...groceryList,
          items: [...groceryList.items, createdItem],
        });

        setNewItemName("");
        setNewItemQuantity("");
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleTogglePurchased(item) {
    setError("");

    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}/items/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        purchased: !item.purchased,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to update grocery item.");
        });
      })
      .then((updatedItem) => {
        setGroceryList({
          ...groceryList,
          items: groceryList.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleDeleteItem(itemId) {
    setError("");

    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}/items/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setGroceryList({
            ...groceryList,
            items: groceryList.items.filter((item) => item.id !== itemId),
          });
          return;
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to delete grocery item.");
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleUncheckAll() {
    setError("");

    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}/uncheck-all`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to uncheck grocery items.");
        });
      })
      .then((updatedList) => {
        setGroceryList(updatedList);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  const matchingRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  function handleSelectRecipe(recipe) {
    setSelectedRecipe(recipe);
    setSelectedIngredientIds(recipe.ingredients.map((ingredient) => ingredient.id));
  }

  function handleToggleIngredient(ingredientId) {
    if (selectedIngredientIds.includes(ingredientId)) {
      setSelectedIngredientIds(
        selectedIngredientIds.filter((id) => id !== ingredientId)
      );
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, ingredientId]);
    }
  }

  function handleAddIngredientsFromRecipe() {
    setError("");

    if (!selectedRecipe) {
      setError("Choose a recipe first.");
      return;
    }

    if (selectedIngredientIds.length === 0) {
      setError("Choose at least one ingredient.");
      return;
    }

    fetch(
      `http://127.0.0.1:5555/grocery-lists/${listId}/add-from-recipe/${selectedRecipe.id}`,
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
          throw new Error(data.error || "Failed to add recipe ingredients.");
        });
      })
      .then((updatedList) => {
        setGroceryList(updatedList);
        setSelectedRecipe(null);
        setSelectedIngredientIds([]);
        setRecipeSearch("");
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

  if (!groceryList) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-4xl">
          <p className="font-bold text-amber-900">
            Loading grocery list...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/grocery-lists")}
          className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
        >
          Back to Grocery Lists
        </button>

        <div className="mt-6 rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg">
          <p className="text-sm font-black uppercase tracking-wide text-amber-700">
            Grocery List
          </p>

          <h2 className="mt-4 text-4xl font-black text-amber-900">
            {groceryList.name}
          </h2>

          <form
            onSubmit={handleAddItem}
            className="mt-6 grid gap-3 rounded-xl border-2 border-amber-700 bg-amber-50 p-4 md:grid-cols-[1fr_1fr_auto]"
          >
            <input
              type="text"
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Item name"
              className="rounded-lg border-2 border-amber-700 bg-white p-2 outline-none focus:border-orange-500"
            />

            <input
              type="text"
              value={newItemQuantity}
              onChange={(event) => setNewItemQuantity(event.target.value)}
              placeholder="Quantity, optional"
              className="rounded-lg border-2 border-amber-700 bg-white p-2 outline-none focus:border-orange-500"
            />

            <button
              type="submit"
              className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
            >
              Add Item
            </button>
          </form>

          <div className="mt-6 rounded-xl border-2 border-amber-700 bg-amber-50 p-4">
            <h3 className="text-xl font-black text-amber-900">
              Add Ingredients From Recipe
            </h3>

            <input
              type="text"
              value={recipeSearch}
              onChange={(event) => setRecipeSearch(event.target.value)}
              placeholder="Search your recipes..."
              className="mt-3 w-full rounded-lg border-2 border-amber-700 bg-white p-2 outline-none focus:border-orange-500"
            />

            {recipeSearch ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {matchingRecipes.length > 0 ? (
                  matchingRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => handleSelectRecipe(recipe)}
                      className="rounded-lg border-2 border-amber-700 bg-orange-100 p-3 text-left font-bold text-amber-900 hover:bg-orange-200"
                    >
                      {recipe.name}
                    </button>
                  ))
                ) : (
                  <p className="text-amber-700">No matching recipes found.</p>
                )}
              </div>
            ) : null}

            {selectedRecipe ? (
              <div className="mt-4 rounded-lg bg-orange-100 p-4">
                <h4 className="font-black text-amber-900">
                  {selectedRecipe.name}
                </h4>

                <div className="mt-3 space-y-2">
                  {selectedRecipe.ingredients.map((ingredient) => (
                    <label
                      key={ingredient.id}
                      className="flex items-center gap-3 rounded-lg bg-amber-50 p-2 text-amber-800"
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

                <button
                  type="button"
                  onClick={handleAddIngredientsFromRecipe}
                  className="mt-4 rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
                >
                  Add Selected Ingredients
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-black text-amber-900">
                Items
              </h3>

              {groceryList.items && groceryList.items.length > 0 ? (
                <button
                  type="button"
                  onClick={handleUncheckAll}
                  className="rounded-lg border-2 border-amber-800 bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 hover:bg-amber-200"
                >
                  Uncheck All
                </button>
              ) : null}
            </div>

            {groceryList.items && groceryList.items.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {groceryList.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 font-bold text-amber-800"
                  >
                    <label className="flex flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => handleTogglePurchased(item)}
                        className="h-5 w-5 accent-amber-700"
                      />

                      <span className={item.purchased ? "text-amber-500 line-through" : ""}>
                        {item.quantity ? `${item.quantity} ` : ""}
                        {item.name}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="rounded-lg border-2 border-red-800 bg-red-100 px-3 py-1 text-sm font-bold text-red-800 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border-4 border-dashed border-amber-700 bg-amber-50 p-4 text-amber-700">
                No items in this list yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default GroceryListDetail;
