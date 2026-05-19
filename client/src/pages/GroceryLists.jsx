import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Pencil, Plus, Trash2, X } from "lucide-react";

import FarmPageLayout from "../components/FarmPageLayout";
import GameButton from "../components/GameButton";
import PageCard from "../components/PageCard";
import SectionHeader from "../components/SectionHeader";

function GroceryLists() {
  const navigate = useNavigate();

  const [groceryLists, setGroceryLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState("");
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState("");

  // Load the user's grocery lists when the page opens
  useEffect(() => {
    fetch("http://127.0.0.1:5555/grocery-lists", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load grocery lists.");
        });
      })
      .then((lists) => {
        setGroceryLists(lists);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  // Create a new grocery list
  function handleCreateList(event) {
    event.preventDefault();
    setError("");

    if (!newListName.trim()) {
      setError("Grocery list name is required.");
      return;
    }

    fetch("http://127.0.0.1:5555/grocery-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: newListName,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to create grocery list.");
        });
      })
      .then((createdList) => {
        setGroceryLists([...groceryLists, createdList]);
        setNewListName("");
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleDeleteList(event, listId) {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Delete this grocery list? This will also delete its items."
    );

    if (!confirmed) {
      return;
    }

    setError("");

    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setGroceryLists(
            groceryLists.filter((list) => list.id !== listId)
          );
          return;
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to delete grocery list.");
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleRenameList(event, listId) {
    event.preventDefault();
    event.stopPropagation();
    setError("");

    if (!editingListName.trim()) {
      setError("Grocery list name is required.");
      return;
    }

    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: editingListName,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to rename grocery list.");
        });
      })
      .then((updatedList) => {
        setGroceryLists(
          groceryLists.map((list) =>
            list.id === updatedList.id ? updatedList : list
          )
        );

        setEditingListId(null);
        setEditingListName("");
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <FarmPageLayout>
      <div className="farm-panel p-5 md:p-8">
        <SectionHeader
          eyebrow="Market Prep"
          title="Grocery Lists"
          description="Create reusable grocery lists and track what you need to buy."
        />

        {error ? (
          <p className="farm-error mt-6">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleCreateList}
          className="mt-7 flex flex-col gap-3 rounded-2xl border-3 border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-4 shadow-[4px_4px_0_rgba(74,42,22,0.28)] md:flex-row"
        >
          <input
            type="text"
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            placeholder="New grocery list name"
            className="farm-input flex-1"
          />

          <GameButton
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-3"
          >
            <Plus
              size={18}
              strokeWidth={2.8}
              aria-hidden="true"
            />
            Create List
          </GameButton>
        </form>

        <div className="mt-8">
          <h3 className="font-game text-3xl font-black text-[var(--farm-ink)]">
            Your Lists
          </h3>

          {groceryLists.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {groceryLists.map((list) => (
                <PageCard
                  key={list.id}
                  onClick={() => navigate(`/grocery-lists/${list.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/grocery-lists/${list.id}`);
                    }
                  }}
                  className="cursor-pointer p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-3 border-[var(--farm-wood)] bg-[var(--farm-panel)] text-[var(--farm-green-dark)] shadow-[3px_3px_0_rgba(74,42,22,0.26)]">
                      <ClipboardList
                        size={27}
                        strokeWidth={2.7}
                        aria-hidden="true"
                      />
                    </div>

                    <p className="rounded-full border-2 border-[var(--farm-wood)] bg-[var(--farm-paper)] px-3 py-1 text-sm font-black text-[var(--farm-muted)]">
                      {list.item_count === 1 ? "1 item" : `${list.item_count} items`}
                    </p>
                  </div>

                  <p className="font-game mt-5 text-sm font-black uppercase text-[var(--farm-green-dark)]">
                    Grocery List
                  </p>

                  {editingListId === list.id ? (
                    <form
                      onSubmit={(event) => handleRenameList(event, list.id)}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-3 space-y-3"
                    >
                      <input
                        type="text"
                        value={editingListName}
                        onChange={(event) => setEditingListName(event.target.value)}
                        className="farm-input w-full"
                      />

                      <div className="flex flex-wrap gap-2">
                        <GameButton
                          type="submit"
                          className="inline-flex items-center gap-2 px-3 py-2"
                        >
                          <Pencil
                            size={16}
                            strokeWidth={2.8}
                            aria-hidden="true"
                          />
                          Save
                        </GameButton>

                        <GameButton
                          type="button"
                          variant="secondary"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingListId(null);
                            setEditingListName("");
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2"
                        >
                          <X
                            size={16}
                            strokeWidth={2.8}
                            aria-hidden="true"
                          />
                          Cancel
                        </GameButton>
                      </div>
                    </form>
                  ) : (
                    <h4 className="font-game mt-2 text-2xl font-black text-[var(--farm-ink)]">
                      {list.name}
                    </h4>
                  )}

                  <p className="mt-3 font-bold leading-relaxed text-[var(--farm-muted)]">
                    Open this list to add and check off grocery items.
                  </p>

                  {editingListId === list.id ? null : (
                    <GameButton
                      type="button"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingListId(list.id);
                        setEditingListName(list.name);
                      }}
                      className="mr-2 mt-5 inline-flex items-center gap-2 px-3 py-2"
                    >
                      <Pencil
                        size={16}
                        strokeWidth={2.8}
                        aria-hidden="true"
                      />
                      Rename List
                    </GameButton>
                  )}

                  <GameButton
                    type="button"
                    variant="danger"
                    onClick={(event) => handleDeleteList(event, list.id)}
                    className="mt-5 inline-flex items-center gap-2 px-3 py-2"
                  >
                    <Trash2
                      size={16}
                      strokeWidth={2.8}
                      aria-hidden="true"
                    />
                    Delete List
                  </GameButton>
                </PageCard>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border-3 border-dashed border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-6 text-center">
              <ClipboardList
                size={38}
                strokeWidth={2.5}
                className="mx-auto text-[var(--farm-green-dark)]"
                aria-hidden="true"
              />

              <p className="font-game mt-3 text-2xl font-black text-[var(--farm-ink)]">
                No grocery lists yet.
              </p>

              <p className="mt-2 font-bold text-[var(--farm-muted)]">
                Create one above before your next market run.
              </p>
            </div>
          )}
        </div>
      </div>
    </FarmPageLayout>
  );
}

export default GroceryLists;
