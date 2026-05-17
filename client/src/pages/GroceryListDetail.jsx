import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import GroceryItemForm from "../components/GroceryItemForm";
import GroceryItemList from "../components/GroceryItemList";
import RecipeIngredientPicker from "../components/RecipeIngredientPicker";

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

          <GroceryItemForm
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            newItemQuantity={newItemQuantity}
            setNewItemQuantity={setNewItemQuantity}
            onAddItem={handleAddItem}
          />

          <RecipeIngredientPicker
            recipeSearch={recipeSearch}
            setRecipeSearch={setRecipeSearch}
            matchingRecipes={matchingRecipes}
            selectedRecipe={selectedRecipe}
            selectedIngredientIds={selectedIngredientIds}
            onSelectRecipe={handleSelectRecipe}
            onToggleIngredient={handleToggleIngredient}
            onAddIngredients={handleAddIngredientsFromRecipe}
          />

          <GroceryItemList
            items={groceryList.items}
            onTogglePurchased={handleTogglePurchased}
            onDeleteItem={handleDeleteItem}
            onUncheckAll={handleUncheckAll}
          />
        </div>
      </section>
    </main>
  );
}

export default GroceryListDetail;
