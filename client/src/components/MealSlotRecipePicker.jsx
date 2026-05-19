import { useState } from "react";
import { Search, Trash2, X } from "lucide-react";

import GameButton from "./GameButton";

function MealSlotRecipePicker({ recipes, slotLabel, onSelectRecipe, onClearSlot, onClose }) {
  const [searchText, setSearchText] = useState("");

  const matchingRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="farm-panel max-h-[85vh] w-full max-w-3xl overflow-y-auto p-5 shadow-xl md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-game text-3xl font-black text-[var(--farm-ink)]">
              Choose Recipe
            </h3>

            <p className="mt-1 font-bold text-[var(--farm-muted)]">
              {slotLabel}
            </p>
          </div>

          <GameButton
            type="button"
            variant="secondary"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-2"
          >
            <X
              size={17}
              strokeWidth={2.8}
              aria-hidden="true"
            />
            Close
          </GameButton>
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
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search recipes..."
            className="farm-input farm-input-with-left-icon w-full"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <GameButton
            type="button"
            variant="danger"
            onClick={onClearSlot}
            className="inline-flex items-center gap-2 px-4 py-3"
          >
            <Trash2
              size={17}
              strokeWidth={2.8}
              aria-hidden="true"
            />
            Clear This Slot
          </GameButton>
        </div>

        {matchingRecipes.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {matchingRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onSelectRecipe(recipe.id)}
                className="overflow-hidden rounded-xl border-3 border-[var(--farm-wood)] bg-[var(--farm-paper-light)] text-left font-bold text-[var(--farm-ink)] shadow-[3px_3px_0_rgba(74,42,22,0.24)] transition hover:-translate-y-1 hover:bg-[#fff0b8]"
              >
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-[var(--farm-panel)]">
                    <p className="font-game font-black uppercase text-[var(--farm-muted)]">No Image</p>
                  </div>
                )}

                <div className="p-3">
                  <p className="text-lg">{recipe.name}</p>

                  {recipe.meal_type ? (
                    <p className="font-game mt-1 text-xs font-black uppercase text-[var(--farm-green-dark)]">
                      {recipe.meal_type}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border-3 border-dashed border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-4 font-bold text-[var(--farm-muted)]">
            No matching recipes found.
          </p>
        )}
      </div>
    </div>
  );
}

export default MealSlotRecipePicker;
