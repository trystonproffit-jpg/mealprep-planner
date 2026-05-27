import { BookOpen, ChefHat } from "lucide-react";

import GameButton from "./GameButton";

function formatMealType(mealType) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

function MealPrepDayCard({ day, mealType, board, onOpenBoard }) {
  const recipes = board?.recipes || [];
  const previewRecipe = recipes[0] || null;
  const recipeCount = recipes.length;

  return (
    <article className="flex min-h-[27rem] flex-col overflow-hidden rounded-2xl border-3 border-[var(--farm-wood-dark)] bg-[var(--farm-paper)] text-[var(--farm-ink)] shadow-[4px_4px_0_rgba(47,36,24,0.32)]">
      {previewRecipe?.image_url ? (
        <img
          src={previewRecipe.image_url}
          alt={previewRecipe.name}
          className="h-48 w-full border-b-3 border-[var(--farm-wood-dark)] object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center border-b-3 border-[var(--farm-wood-dark)] bg-[var(--farm-panel)]">
          <ChefHat
            size={46}
            strokeWidth={2.5}
            className="text-[var(--farm-green-dark)]"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <p className="font-game text-sm font-black uppercase text-[var(--farm-green-dark)]">
          {formatMealType(mealType)} Board
        </p>

        <h3 className="font-game mt-2 text-3xl font-black text-[var(--farm-ink)]">
          {day}
        </h3>

        <p className="mt-3 rounded-xl border-2 border-[#d3a95f] bg-[var(--farm-paper-light)] p-3 font-bold text-[var(--farm-muted)]">
          {recipeCount === 0
            ? "No recipes added yet."
            : recipeCount === 1
              ? "1 recipe added."
              : `${recipeCount} recipes added.`}
        </p>

        {previewRecipe ? (
          <div className="mt-3">
            <p className="font-game text-sm font-black uppercase text-[var(--farm-green-dark)]">
              First Recipe
            </p>

            <p className="mt-1 line-clamp-2 font-black text-[var(--farm-ink)]">
              {previewRecipe.name}
            </p>
          </div>
        ) : null}

        <GameButton
          type="button"
          onClick={onOpenBoard}
          className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-3"
        >
          <BookOpen
            size={18}
            strokeWidth={2.8}
            aria-hidden="true"
          />
          Open Board
        </GameButton>
      </div>
    </article>
  );
}

export default MealPrepDayCard;
