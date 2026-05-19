import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";

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
      <main className="book-background p-4 md:p-8">
        <section className="mx-auto max-w-3xl">
          <p className="book-error">
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="book-background p-4 md:p-8">
        <section className="book-shell mx-auto max-w-3xl">
          <div className="book-page rounded-2xl p-6 text-center">
            <p className="font-game text-2xl font-black text-[#3f2108]">
              Loading groups...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="book-background p-4 md:p-8">
      <section className="book-shell mx-auto max-w-4xl">
        <div className="book-tab">
          <p className="font-game text-sm font-black uppercase text-[#6b3200]">
            Recipe Groups
          </p>
        </div>

        <div className="book-page rounded-2xl p-5 md:p-8">
          <div className="book-page-texture" />

          <div className="relative">
            <button
              type="button"
              onClick={() => navigate(`/recipes/${recipeId}`)}
              className="book-button-secondary inline-flex items-center gap-2 px-4 py-2"
            >
              <ArrowLeft
                size={18}
                strokeWidth={2.8}
                aria-hidden="true"
              />
              Back to Recipe
            </button>

            <div className="mt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border-4 border-[#a65a18] bg-[#ffd98a] text-[#6b3200] shadow-[3px_3px_0_#6b3200]">
                <FolderOpen
                  size={30}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              </div>

              <h2 className="font-game mt-4 text-4xl font-black text-[#3f2108] md:text-5xl">
                Manage Recipe Groups
              </h2>

              <p className="mx-auto mt-3 max-w-2xl font-bold text-[#7a3f0d]">
                Choose groups for{" "}
                <span className="text-[#3f2108]">{recipe.name}</span>.
              </p>
            </div>

            <div className="book-section mt-8 p-5">
              {groups.length > 0 ? (
                <div className="space-y-3">
                  {groups.map((group) => (
                    <label
                      key={group.id}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-[#d99b48] bg-[#fff0bd] p-3 font-bold text-[#6b3200]"
                    >
                      <input
                        type="checkbox"
                        checked={recipe.groups.some(
                          (recipeGroup) => recipeGroup.id === group.id
                        )}
                        onChange={() => handleToggleGroup(group)}
                        className="h-5 w-5 shrink-0 accent-[#e87817]"
                      />

                      <span>{group.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border-4 border-dashed border-[#a65a18] bg-[#fff0bd] p-5 text-center font-bold text-[#7a3f0d]">
                  No custom groups yet. Create groups from the Recipes page first.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RecipeGroupsManager;
