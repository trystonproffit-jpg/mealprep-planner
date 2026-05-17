import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

function RecipeGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  let title = "Recipe Group";
  let description = "Recipes in this custom group will go here.";

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
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load recipes.");
        });
      })
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
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [groupId]);

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/recipes")}
              className="mb-4 rounded-xl border-2 border-amber-900 bg-orange-200 px-4 py-2 font-bold text-amber-900 hover:bg-orange-300"
            >
              Back to Recipes
            </button>
            
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

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {recipes.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border-4 border-dashed border-amber-700 bg-orange-100 p-6 text-amber-700">
            No recipes found.
          </p>
        )}
      </section>
    </main>
  );
}

export default RecipeGroupPage;
