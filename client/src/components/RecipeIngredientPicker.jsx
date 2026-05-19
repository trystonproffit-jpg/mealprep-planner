import { BookOpen, Search } from "lucide-react";

import GameButton from "./GameButton";

function RecipeIngredientPicker({
  recipeSearch,
  setRecipeSearch,
  matchingRecipes,
  selectedRecipe,
  selectedIngredientIds,
  onSelectRecipe,
  onToggleIngredient,
  onAddIngredients,
}) {
  return (
    <div className="mt-6 rounded-xl border-3 border-[var(--farm-wood)] bg-[var(--farm-panel)] p-4 shadow-[3px_3px_0_rgba(74,42,22,0.24)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--farm-wood)] bg-[var(--farm-paper)] text-[var(--farm-green-dark)]">
          <BookOpen
            size={22}
            strokeWidth={2.7}
            aria-hidden="true"
          />
        </div>

        <h3 className="font-game text-2xl font-black text-[var(--farm-ink)]">
          Add Ingredients From Recipe
        </h3>
      </div>

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

      {recipeSearch ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {matchingRecipes.length > 0 ? (
            matchingRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onSelectRecipe(recipe)}
                className="rounded-lg border-2 border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-3 text-left font-bold text-[var(--farm-ink)] transition hover:-translate-y-0.5 hover:bg-[#fff0b8]"
              >
                {recipe.name}
              </button>
            ))
          ) : (
            <p className="font-bold text-[var(--farm-muted)]">No matching recipes found.</p>
          )}
        </div>
      ) : null}

      {selectedRecipe ? (
        <div className="mt-4 rounded-xl border-2 border-[var(--farm-wood)] bg-[var(--farm-paper)] p-4">
          <h4 className="font-game text-xl font-black text-[var(--farm-ink)]">
            {selectedRecipe.name}
          </h4>

          <div className="mt-3 space-y-2">
            {selectedRecipe.ingredients.map((ingredient) => (
              <label
                key={ingredient.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 border-[#d3a95f] bg-[var(--farm-paper-light)] p-2 font-bold text-[var(--farm-ink)]"
              >
                <input
                  type="checkbox"
                  checked={selectedIngredientIds.includes(ingredient.id)}
                  onChange={() => onToggleIngredient(ingredient.id)}
                  className="h-5 w-5 shrink-0 accent-[var(--farm-green)]"
                />

                <span>
                  {ingredient.quantity ? `${ingredient.quantity} ` : ""}
                  {ingredient.name}
                </span>
              </label>
            ))}
          </div>

          <GameButton
            type="button"
            onClick={onAddIngredients}
            className="mt-4 inline-flex items-center justify-center px-4 py-3"
          >
            Add Selected Ingredients
          </GameButton>
        </div>
      ) : null}
    </div>
  );
}

export default RecipeIngredientPicker;
