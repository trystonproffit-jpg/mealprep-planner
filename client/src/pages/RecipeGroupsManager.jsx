import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RecipeGroupsManager() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5555/recipes/${recipeId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load recipe.");
        });
      })
      .then((data) => {
        setRecipe(data);
      })
      .catch((error) => {
        setError(error.message);
      });

    fetch("http://127.0.0.1:5555/recipe-groups", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load recipe groups.");
        });
      })
      .then((data) => {
        setGroups(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [recipeId]);

  function handleToggleGroup(group) {
    const recipeIsInGroup = recipe.groups.some(
      (recipeGroup) => recipeGroup.id === group.id
    );

    const url = `http://127.0.0.1:5555/recipe-groups/${group.id}/recipes/${recipeId}`;
    const method = recipeIsInGroup ? "DELETE" : "POST";

    fetch(url, {
      method: method,
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to update recipe group.");
        });
      })
      .then(() => {
        if (recipeIsInGroup) {
          setRecipe({
            ...recipe,
            groups: recipe.groups.filter(
              (recipeGroup) => recipeGroup.id !== group.id
            ),
          });
        } else {
          setRecipe({
            ...recipe,
            groups: [...recipe.groups, group],
          });
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  if (error) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-3xl">
          <p className="rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-3xl">
          <p className="font-bold text-amber-900">Loading groups...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(`/recipes/${recipeId}`)}
          className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
        >
          Back to Recipe
        </button>

        <h2 className="mt-6 text-4xl font-black text-amber-900">
          Manage Recipe Groups
        </h2>

        <p className="mt-3 text-amber-700">
          Choose groups for:{" "}
          <span className="font-bold">{recipe.name}</span>
        </p>

        <div className="mt-8 rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg">
          {groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 font-bold text-amber-900"
                >
                  <input
                    type="checkbox"
                    checked={recipe.groups.some(
                      (recipeGroup) => recipeGroup.id === group.id
                    )}
                    onChange={() => handleToggleGroup(group)}
                    className="h-5 w-5"
                  />

                  {group.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-amber-700">
              No custom groups yet. Create groups from the Recipes page first.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default RecipeGroupsManager;
