import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function GroceryListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();

  const [groceryList, setGroceryList] = useState(null);
  const [error, setError] = useState("");

  // Load one grocery list and its items
  useEffect(() => {
    fetch(`http://127.0.0.1:5555/grocery-lists/${listId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Failed to load grocery list.");
        });
      })
      .then((list) => {
        setGroceryList(list);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [listId]);

  if (error) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-4xl">
          <p className="rounded-lg bg-red-100 p-3 font-bold text-red-700">
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!groceryList) {
    return (
      <main className="min-h-screen bg-amber-50 p-8">
        <section className="mx-auto max-w-4xl">
          <p className="font-bold text-amber-900">
            Loading grocery list...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/grocery-lists")}
          className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
        >
          ← Back to Grocery Lists
        </button>

        <div className="mt-6 rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg">
          <p className="text-5xl">🛒</p>

          <h2 className="mt-4 text-4xl font-black text-amber-900">
            {groceryList.name}
          </h2>

          <div className="mt-8">
            <h3 className="text-2xl font-black text-amber-900">
              Items
            </h3>

            {groceryList.items && groceryList.items.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {groceryList.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg bg-amber-50 p-3 font-bold text-amber-800"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border-4 border-dashed border-amber-700 bg-amber-50 p-4 text-amber-700">
                No items in this list yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default GroceryListDetail;