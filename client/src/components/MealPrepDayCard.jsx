import { Pencil, Plus, Trash2, Utensils } from "lucide-react";

import GameButton from "./GameButton";

function MealPrepDayCard({
  day,
  mealTypes,
  mealPrepPlan,
  getRecipeById,
  makeSlotKey,
  formatMealType,
  onOpenPicker,
  onClearSlot,
}) {
  return (
    <div className="min-w-0 rounded-2xl border-3 border-[var(--farm-wood-dark)] bg-[var(--farm-paper)] p-3 text-[var(--farm-ink)] shadow-[4px_4px_0_rgba(47,36,24,0.32)]">
      <h3 className="font-game min-w-0 rounded-xl border-3 border-[var(--farm-wood)] bg-[var(--farm-panel)] px-1.5 py-2 text-center text-[clamp(1rem,1vw,1.25rem)] font-black leading-tight text-[var(--farm-ink)]">
        {day}
      </h3>

      <div className="mt-3 space-y-3">
        {mealTypes.map((mealType) => {
          const slotKey = makeSlotKey(day, mealType);
          const selectedRecipe = getRecipeById(mealPrepPlan[slotKey]);

          return (
            <div
              key={mealType}
              className="flex min-h-60 flex-col rounded-xl border-2 border-[#d3a95f] bg-[var(--farm-paper-light)] p-3"
            >
              <div className="flex items-center gap-2">
                <Utensils
                  size={16}
                  strokeWidth={2.7}
                  className="text-[var(--farm-green-dark)]"
                  aria-hidden="true"
                />

                <p className="font-game text-sm font-black uppercase text-[var(--farm-green-dark)]">
                  {formatMealType(mealType)}
                </p>
              </div>

              {selectedRecipe ? (
                <div className="mt-2 flex flex-1 flex-col">
                  {selectedRecipe.image_url ? (
                    <img
                      src={selectedRecipe.image_url}
                      alt={selectedRecipe.name}
                      className="h-24 w-full rounded-lg border-2 border-[var(--farm-wood)] object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-[var(--farm-wood)] bg-[var(--farm-panel)]">
                      <p className="font-game text-sm font-black uppercase text-[var(--farm-muted)]">
                        No Image
                      </p>
                    </div>
                  )}

                  <p className="mt-2 line-clamp-2 min-h-12 font-black leading-snug text-[var(--farm-ink)]">
                    {selectedRecipe.name}
                  </p>

                  <div className="mt-auto grid gap-2 pt-3">
                    <GameButton
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenPicker(day, mealType)}
                      className="inline-flex w-full min-w-0 items-center justify-center gap-1 px-2 py-2 text-xs 2xl:text-sm"
                    >
                      <Pencil
                        size={15}
                        strokeWidth={2.8}
                        aria-hidden="true"
                      />
                      Change
                    </GameButton>

                    <GameButton
                      type="button"
                      variant="danger"
                      onClick={() => onClearSlot(day, mealType)}
                      className="inline-flex w-full min-w-0 items-center justify-center gap-1 px-2 py-2 text-xs 2xl:text-sm"
                    >
                      <Trash2
                        size={15}
                        strokeWidth={2.8}
                        aria-hidden="true"
                      />
                      Clear
                    </GameButton>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenPicker(day, mealType)}
                  className="mt-2 flex min-h-40 w-full flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--farm-wood)] bg-[var(--farm-panel)] px-3 py-4 font-game font-black text-[var(--farm-wood-dark)] transition hover:-translate-y-0.5 hover:bg-[#fff0b8]"
                >
                  <Plus
                    size={24}
                    strokeWidth={2.8}
                    aria-hidden="true"
                  />
                  Add Recipe
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MealPrepDayCard;
