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
    <div className="rounded-2xl border-4 border-amber-800 bg-orange-100 p-4 shadow-lg">
      <h3 className="text-center text-xl font-black text-amber-900">
        {day}
      </h3>

      <div className="mt-4 space-y-4">
        {mealTypes.map((mealType) => {
          const slotKey = makeSlotKey(day, mealType);
          const selectedRecipe = getRecipeById(mealPrepPlan[slotKey]);

          return (
            <div
              key={mealType}
              className="flex min-h-56 flex-col rounded-xl border-2 border-amber-700 bg-amber-50 p-3"
            >
              <p className="text-sm font-black uppercase text-amber-700">
                {formatMealType(mealType)}
              </p>

              {selectedRecipe ? (
                <div className="mt-2 flex flex-1 flex-col">
                  {selectedRecipe.image_url ? (
                    <img
                      src={selectedRecipe.image_url}
                      alt={selectedRecipe.name}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded-lg bg-orange-100">
                      <p className="text-sm font-bold text-amber-700">
                        No Image
                      </p>
                    </div>
                  )}

                  <p className="mt-2 line-clamp-2 min-h-12 font-black text-amber-900">
                    {selectedRecipe.name}
                  </p>

                  <div className="mt-auto grid gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => onOpenPicker(day, mealType)}
                      className="w-full rounded-lg border-2 border-amber-900 bg-orange-200 px-2 py-1 text-sm font-bold text-amber-900 hover:bg-orange-300"
                    >
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={() => onClearSlot(day, mealType)}
                      className="w-full rounded-lg border-2 border-red-800 bg-red-100 px-2 py-1 text-sm font-bold text-red-700 hover:bg-red-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenPicker(day, mealType)}
                  className="mt-2 flex min-h-40 w-full flex-1 items-center justify-center rounded-lg border-2 border-dashed border-amber-700 bg-orange-100 px-3 py-4 font-bold text-amber-800 hover:bg-orange-200"
                >
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