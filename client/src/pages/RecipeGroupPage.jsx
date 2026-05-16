import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RecipeGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  let title = "Recipe Group";
  let description = "Recipes in this custom group will go here."

  if (groupId === "all") {
    title = "All Recipes";
    description = "Every recipe you have saved will appear here.";
  }

  if (groupId === "favorites") {
    title = "Favorites";
    description = "Your favorite recipes will appear here.";
  }

  useEffect(() => {
    fetch("http://127.0.0.1:5555/recipes", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
          if (groupId === "favorites") {
            setRecipes(data.filter((recipe) => recipe.favorite));
            return;
          }

          if (groupId !== "all") {
            setRecipes(
              data.filter((recipe) =>
                recipe.groups.some((group) => String(group.id) === groupId)
              )
            );
            return;
          }

        setRecipes(data);
      });
  }, [groupId]);

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-amber-900">
              {title}
            </h2>

            <p className="mt-3 text-amber-700">
              {description}
            </p>
          </div>

          <button
            onClick={() => navigate("/recipes/new")}
            className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Create Recipe
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {recipes.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                  className="cursor-pointer rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
                >
                  <p className="text-4xl">🍲</p>

                  <h3 className="mt-3 text-xl font-black text-amber-900">
                    {recipe.name}
                  </h3>

                  {recipe.meal_type ? (
                    <p className="mt-2 text-sm font-bold uppercase text-amber-700">
                      {recipe.meal_type}
                    </p>
                  ) : null}

                  {recipe.description ? (
                    <p className="mt-3 text-amber-700">
                      {recipe.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border-4 border-dashed border-amber-700 bg-orange-100 p-6 text-amber-700">
              No recipes found.
            </p>
          )}
        </div>

      </section>
    </main>
  );
}

export default RecipeGroupPage;