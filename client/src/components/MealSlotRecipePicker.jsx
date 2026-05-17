import { useState } from "react";

function MealSlotRecipePicker({ recipes, slotLabel, onSelectRecipe, onClearSlot, onClose }) {
  const [searchText, setSearchText] = useState("");

  const matchingRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-amber-900">
              Choose Recipe
            </h3>

            <p className="mt-1 font-bold text-amber-700">
              {slotLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-amber-900 bg-orange-200 px-3 py-2 font-bold text-amber-900 hover:bg-orange-300"
          >
            Close
          </button>
        </div>

        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search recipes..."
          className="mt-4 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClearSlot}
            className="rounded-xl border-2 border-red-800 bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
          >
            Clear This Slot
          </button>
        </div>

        {matchingRecipes.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {matchingRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onSelectRecipe(recipe.id)}
                className="overflow-hidden rounded-xl border-2 border-amber-700 bg-amber-50 text-left font-bold text-amber-900 hover:bg-orange-200"
              >
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-orange-100">
                    <p className="text-amber-700">No Image</p>
                  </div>
                )}

                <div className="p-3">
                  <p>{recipe.name}</p>

                  {recipe.meal_type ? (
                    <p className="mt-1 text-xs font-black uppercase text-amber-700">
                      {recipe.meal_type}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border-4 border-dashed border-amber-700 bg-amber-50 p-4 text-amber-700">
            No matching recipes found.
          </p>
        )}
      </div>
    </div>
  );
}

export default MealSlotRecipePicker;