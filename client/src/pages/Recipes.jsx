import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const GROUPS_PER_PAGE = 6;

function Recipes() {
  const [recipeGroups, setRecipeGroups] = useState([]);
  const [error, setError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [groupPage, setGroupPage] = useState(1);

  const totalGroupPages = Math.max(
    1,
    Math.ceil(recipeGroups.length / GROUPS_PER_PAGE)
  );

  const groupPageStartIndex = (groupPage - 1) * GROUPS_PER_PAGE;
  const visibleRecipeGroups = recipeGroups.slice(
    groupPageStartIndex,
    groupPageStartIndex + GROUPS_PER_PAGE
  );

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
        setGroupPage(1);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  // Creates a new custom recipe group
  function handleCreateGroup(event) {
    event.preventDefault();
    setError("");

    if (!newGroupName.trim()) {
      setError("Group name is required.");
      return;
    }

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
        setGroupPage(
          Math.ceil((recipeGroups.length + 1) / GROUPS_PER_PAGE)
        );
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
          const nextGroups = recipeGroups.filter(
            (group) => group.id !== groupId
          );
          const nextTotalPages = Math.max(
            1,
            Math.ceil(nextGroups.length / GROUPS_PER_PAGE)
          );

          setRecipeGroups(nextGroups);
          setGroupPage(Math.min(groupPage, nextTotalPages));
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

    if (!editingGroupName.trim()) {
      setError("Group name is required.");
      return;
    }

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
    <main className="book-background p-4 md:p-8">
      <section className="book-shell mx-auto max-w-6xl">
        <div className="book-tab">
          <p className="font-game text-sm font-black uppercase text-[#6b3200]">
            Recipe Index
          </p>
        </div>

        <div className="book-page rounded-2xl p-5 md:p-8">
          <div className="book-page-texture" />

          <div className="relative">
            <div className="text-center">
              <h2 className="font-game text-4xl font-black text-[#3f2108] md:text-5xl">
                Recipes
              </h2>

              <p className="mx-auto mt-3 max-w-2xl font-bold text-[#7a3f0d]">
                Organize your recipes into cozy custom groups.
              </p>
            </div>

            {error ? (
              <p className="book-error mt-6">
                {error}
              </p>
            ) : null}

            <form
              onSubmit={handleCreateGroup}
              className="book-menu-card mx-auto mt-7 flex max-w-3xl flex-col gap-3 p-4 md:flex-row"
            >
              <input
                type="text"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="New group name"
                className="book-input flex-1"
              />

              <button
                type="submit"
                className="book-button-primary px-5 py-3"
              >
                Create Group
              </button>
            </form>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Link
                to="/recipes/groups/all"
                className="book-menu-card block p-6"
              >
                <p className="font-game text-sm font-black uppercase text-[#6b3200]">
                  Recipes
                </p>

                <h3 className="font-game mt-3 text-3xl font-black text-[#3f2108]">
                  All Recipes
                </h3>

                <p className="mt-2 font-bold text-[#7a3f0d]">
                  View every recipe you have saved.
                </p>
              </Link>

              <Link
                to="/recipes/groups/favorites"
                className="book-menu-card block p-6"
              >
                <p className="font-game text-sm font-black uppercase text-[#6b3200]">
                  Favorites
                </p>

                <h3 className="font-game mt-3 text-3xl font-black text-[#3f2108]">
                  Favorites
                </h3>

                <p className="mt-2 font-bold text-[#7a3f0d]">
                  Quickly find your favorite recipes.
                </p>
              </Link>

              <Link
                to="/recipes/search"
                className="book-menu-card block p-6 md:col-span-2"
              >
                <p className="font-game text-sm font-black uppercase text-[#6b3200]">
                  Online Search
                </p>

                <h3 className="font-game mt-3 text-3xl font-black text-[#3f2108]">
                  Find Recipes Online
                </h3>

                <p className="mt-2 font-bold text-[#7a3f0d]">
                  Search for recipe ideas and prefill a new Mealstead recipe.
                </p>
              </Link>
            </div>

            <div className="mt-9">
              <div className="text-center">
                <h3 className="font-game text-3xl font-black text-[#3f2108]">
                  Custom Groups
                </h3>
              </div>

              {recipeGroups.length > 0 ? (
                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {visibleRecipeGroups.map((group) => (
                    <div
                      key={group.id}
                      className="book-menu-card p-5"
                    >
                      <Link
                        to={`/recipes/groups/${group.id}`}
                        className="block text-center transition hover:-translate-y-1"
                      >
                        <p className="font-game text-xs font-black uppercase text-[#6b3200]">
                          Custom Group
                        </p>

                        <h4 className="font-game mt-3 text-2xl font-black text-[#3f2108]">
                          {group.name}
                        </h4>

                        <p className="mt-2 font-bold text-[#7a3f0d]">
                          View recipes in this group.
                        </p>
                      </Link>

                      {editingGroupId === group.id ? (
                        <form
                          onSubmit={(event) => handleRenameGroup(event, group.id)}
                          className="mt-4 space-y-3"
                        >
                          <input
                            type="text"
                            value={editingGroupName}
                            onChange={(event) => setEditingGroupName(event.target.value)}
                            className="book-input w-full"
                          />

                          <div className="flex flex-wrap justify-center gap-2">
                            <button
                              type="submit"
                              className="book-button-primary px-3 py-2"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingGroupId(null);
                                setEditingGroupName("");
                              }}
                              className="book-button-secondary px-3 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGroupId(group.id);
                              setEditingGroupName(group.name);
                            }}
                            className="book-button-secondary px-3 py-2"
                          >
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="book-button-danger px-3 py-2"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="book-menu-card mt-5 border-dashed p-6 font-bold text-[#7a3f0d]">
                  No custom groups yet.
                </p>
              )}

              {recipeGroups.length > GROUPS_PER_PAGE ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGroupPage(groupPage - 1)}
                    disabled={groupPage === 1}
                    className="book-button-secondary px-4 py-2"
                  >
                    Previous
                  </button>

                  <p className="book-badge font-game px-4 py-2 font-black">
                    Page {groupPage} of {totalGroupPages}
                  </p>

                  <button
                    type="button"
                    onClick={() => setGroupPage(groupPage + 1)}
                    disabled={groupPage === totalGroupPages}
                    className="book-button-secondary px-4 py-2"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Recipes;
