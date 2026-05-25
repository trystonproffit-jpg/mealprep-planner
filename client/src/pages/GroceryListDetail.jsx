import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";

import FarmPageLayout from "../components/FarmPageLayout";
import GameButton from "../components/GameButton";
import GroceryItemForm from "../components/GroceryItemForm";
import GroceryItemList from "../components/GroceryItemList";
import PaperPanel from "../components/PaperPanel";
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
      .then((savedItem) => {
        const itemAlreadyExists = groceryList.items.some(
          (item) => item.id === savedItem.id
        );

        setGroceryList({
          ...groceryList,
          items: itemAlreadyExists
            ? groceryList.items.map((item) =>
                item.id === savedItem.id ? savedItem : item
              )
            : [...groceryList.items, savedItem],
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

  if (error && !groceryList) {
    return (
      <FarmPageLayout maxWidth="max-w-4xl">
        <p className="farm-error">
          {error}
        </p>
      </FarmPageLayout>
    );
  }

  if (!groceryList) {
    return (
      <FarmPageLayout maxWidth="max-w-4xl">
        <div className="farm-panel p-6 text-center">
          <p className="font-game text-2xl font-black text-[var(--farm-ink)]">
            Loading grocery list...
          </p>
        </div>
      </FarmPageLayout>
    );
  }

  return (
    <FarmPageLayout maxWidth="max-w-4xl">
      <GameButton
        type="button"
        variant="secondary"
        onClick={() => navigate("/grocery-lists")}
        className="inline-flex items-center gap-2 px-4 py-3"
      >
        <ArrowLeft
          size={18}
          strokeWidth={2.8}
          aria-hidden="true"
        />
        Back to Grocery Lists
      </GameButton>

      <PaperPanel className="mt-6 p-5 md:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-3 border-[#d3a95f] bg-[var(--farm-paper)] text-[var(--farm-green-dark)] shadow-[3px_3px_0_rgba(74,42,22,0.22)]">
            <ClipboardList
              size={31}
              strokeWidth={2.7}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-game text-sm font-black uppercase text-[var(--farm-green-dark)]">
              Grocery List
            </p>

            <h2 className="font-game mt-2 text-4xl font-black leading-tight text-[var(--farm-ink)] md:text-5xl">
              {groceryList.name}
            </h2>
          </div>
        </div>

        {error ? (
          <p className="farm-error mt-5">
            {error}
          </p>
        ) : null}

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
      </PaperPanel>
    </FarmPageLayout>
  );
}

export default GroceryListDetail;
