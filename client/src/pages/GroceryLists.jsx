import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GroceryLists() {
  const navigate = useNavigate();

  const [groceryLists, setGroceryLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState("");

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

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-black text-amber-900">
          Grocery Lists
        </h2>

        <p className="mt-3 text-amber-700">
          Create reusable grocery lists and track what you need to buy.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleCreateList}
          className="mt-6 flex flex-col gap-3 rounded-2xl border-4 border-amber-800 bg-orange-100 p-4 shadow-lg md:flex-row"
        >
          <input
            type="text"
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            placeholder="New grocery list name"
            className="flex-1 rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
          />

          <button
            type="submit"
            className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Create List
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-2xl font-black text-amber-900">
            Your Lists
          </h3>

          {groceryLists.length > 0 ? (
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              {groceryLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => navigate(`/grocery-lists/${list.id}`)}
                  className="cursor-pointer rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
                >
                  <p className="text-4xl">🛒</p>

                  <h4 className="mt-3 text-xl font-black text-amber-900">
                    {list.name}
                  </h4>

                  <p className="mt-2 text-amber-700">
                    Open this list to add and check off grocery items.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border-4 border-dashed border-amber-700 bg-orange-100 p-6 text-amber-700">
              No grocery lists yet. Create one above.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default GroceryLists;