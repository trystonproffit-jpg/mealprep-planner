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
                onClick={() => onSelectRecipe(recipe)}
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
                  onChange={() => onToggleIngredient(ingredient.id)}
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
            onClick={onAddIngredients}
            className="mt-4 rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Add Selected Ingredients
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default RecipeIngredientPicker;