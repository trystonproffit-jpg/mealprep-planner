import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Recipes() {
  const [recipeGroups, setRecipeGroups] = useState([]);
  const [error, setError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");

  // Load custom recipe groups from the backend
  useEffect(() => {
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
      .then((groups) => {
        setRecipeGroups(groups);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  // Creates a new custom recipe group
  function handleCreateGroup(event) {
    event.preventDefault();
    setError("");

    fetch("http://127.0.0.1:5555/recipe-groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: newGroupName,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to create group.");
        });
      })
      .then((createdGroup) => {
        setRecipeGroups([...recipeGroups, createdGroup]);
        setNewGroupName("");
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  // Deletes a custom recipe group without deleting its recipes
  function handleDeleteGroup(groupId) {
    const confirmed = window.confirm(
      "Delete this group? Recipes inside it will not be deleted."
    );

    if (!confirmed) {
      return;
    }

    fetch(`http://127.0.0.1:5555/recipe-groups/${groupId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setRecipeGroups(
            recipeGroups.filter((group) => group.id !== groupId)
          );
          return;
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to delete group.");
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

// Updates the name of a custom recipe group
function handleRenameGroup(event, groupId) {
  event.preventDefault();
  setError("");

  fetch(`http://127.0.0.1:5555/recipe-groups/${groupId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name: editingGroupName,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      return response.json().then((data) => {
        throw new Error(data.error || "Failed to rename group.");
      });
    })
    .then((updatedGroup) => {
      setRecipeGroups(
        recipeGroups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        )
      );

      setEditingGroupId(null);
      setEditingGroupName("");
    })
    .catch((error) => {
      setError(error.message);
    });
}

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-6xl">
        {/* Page heading */}
        <h2 className="text-4xl font-black text-amber-900">
          Recipes
        </h2>

        <p className="mt-3 text-amber-700">
          Organize your recipes into cozy custom groups.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        ) : null}

        {/* Create custom group form */}
        <form
          onSubmit={handleCreateGroup}
          className="mt-6 flex flex-col gap-3 rounded-2xl border-4 border-amber-800 bg-orange-100 p-4 shadow-lg md:flex-row"
        >
          <input
            type="text"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            placeholder="New group name"
            className="flex-1 rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
          />

          <button
            type="submit"
            className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Create Group
          </button>
        </form>

        {/* Built-in recipe group cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            to="/recipes/groups/all"
            className="block rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
          >
            <p className="text-4xl">📖</p>

            <h3 className="mt-3 text-2xl font-black text-amber-900">
              All Recipes
            </h3>

            <p className="mt-2 text-amber-700">
              View every recipe you have saved.
            </p>
          </Link>

          <Link
            to="/recipes/groups/favorites"
            className="block rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
          >
            <p className="text-4xl">⭐</p>

            <h3 className="mt-3 text-2xl font-black text-amber-900">
              Favorites
            </h3>

            <p className="mt-2 text-amber-700">
              Quickly find your favorite recipes.
            </p>
          </Link>
        </div>

        {/* Custom recipe group cards */}
        <div className="mt-8">
          <h3 className="text-2xl font-black text-amber-900">
            Custom Groups
          </h3>

          {recipeGroups.length > 0 ? (
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              {recipeGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg"
                >
                  <Link
                    to={`/recipes/groups/${group.id}`}
                    className="block transition hover:-translate-y-1"
                  >
                    <p className="text-4xl">🍽️</p>

                    <h4 className="mt-3 text-xl font-black text-amber-900">
                      {group.name}
                    </h4>

                    <p className="mt-2 text-amber-700">
                      View recipes in this group.
                    </p>
                  </Link>

                  {editingGroupId === group.id ? (
                    <form
                      onSubmit={(event) => handleRenameGroup(event, group.id)}
                      className="mt-4 space-y-2"
                    >
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={(event) => setEditingGroupName(event.target.value)}
                        className="w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded-xl border-2 border-amber-900 bg-amber-700 px-3 py-2 font-bold text-amber-50 hover:bg-amber-800"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingGroupId(null);
                            setEditingGroupName("");
                          }}
                          className="rounded-xl border-2 border-amber-900 bg-orange-200 px-3 py-2 font-bold text-amber-900 hover:bg-orange-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGroupId(group.id);
                        setEditingGroupName(group.name);
                      }}
                      className="mt-4 mr-2 rounded-xl border-2 border-amber-900 bg-orange-200 px-3 py-2 font-bold text-amber-900 hover:bg-orange-300"
                    >
                      Rename Group
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="mt-4 rounded-xl border-2 border-red-800 bg-red-100 px-3 py-2 font-bold text-red-700 hover:bg-red-200"
                  >
                    Delete Group
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border-4 border-dashed border-amber-700 bg-orange-100 p-6 text-amber-700">
              No custom groups yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default Recipes;