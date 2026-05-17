function RecipeCard({ recipe, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="overflow-hidden rounded-2xl border-4 border-amber-800 bg-orange-100 text-left shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
    >
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-amber-50">
          <p className="font-black text-amber-700">No Image</p>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black text-amber-900">
            {recipe.name}
          </h3>

          {recipe.favorite ? (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-black uppercase text-amber-700">
              Favorite
            </span>
          ) : null}
        </div>

        {recipe.meal_type ? (
          <p className="mt-2 text-sm font-bold uppercase text-amber-700">
            {recipe.meal_type}
          </p>
        ) : null}

        {recipe.description ? (
          <p className="mt-3 line-clamp-3 text-amber-700">
            {recipe.description}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export default RecipeCard;