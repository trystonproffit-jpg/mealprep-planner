function RecipeCard({ recipe, onClick, onToggleFavorite, isSelected = false }) {
  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`group relative h-64 overflow-hidden rounded-2xl border-4 bg-[#f6bd63] text-left transition hover:-translate-y-1 ${
        isSelected
          ? "border-[#e87817] shadow-[0_0_0_4px_#ffd43b,6px_6px_0_#6b3200]"
          : "border-[#a65a18] shadow-[4px_4px_0_#6b3200] hover:shadow-[6px_6px_0_#6b3200]"
      }`}
    >
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#ffe0a0]">
          <p className="font-black uppercase text-[#6b3200]">
            Choose Image
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl border-4 border-[#6b3200] bg-[#ffe0a0]/95 px-4 py-3 text-center shadow-[3px_3px_0_rgba(107,50,0,0.65)]">
        <h3 className="font-game line-clamp-2 text-xl font-black leading-tight text-[#2a1609]">
          {recipe.name}
        </h3>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(recipe);
        }}
        className="book-favorite-button absolute right-3 top-3 z-20 h-10 w-10"
        aria-label={
          recipe.favorite
            ? `Remove ${recipe.name} from favorites`
            : `Add ${recipe.name} to favorites`
        }
        aria-pressed={recipe.favorite}
      >
        <svg
          viewBox="0 0 24 24"
          className={
            recipe.favorite
              ? "h-6 w-6 fill-[#ffd43b]"
              : "h-6 w-6 fill-transparent stroke-[#ffd43b] stroke-2"
          }
          aria-hidden="true"
        >
          <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
        </svg>
      </button>
    </div>
  );
}

export default RecipeCard;
