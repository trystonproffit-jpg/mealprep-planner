import { Link } from "react-router-dom";

function Home({ user }) {
  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <section className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-black text-amber-900">
          Welcome back, {user.username}.
        </h2>

        <p className="mt-3 max-w-2xl text-lg text-amber-700">
          Plan recipes, organize your weekly meals, and build grocery lists from
          your favorite meals.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            to="/recipes"
            className="block rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
          >
            <p className="text-4xl">🍳</p>
            <h3 className="mt-3 text-2xl font-black text-amber-900">
              Recipes
            </h3>
            <p className="mt-2 text-amber-700">
              Save recipes and organize them into cozy custom groups.
            </p>
          </Link>

          <Link
            to="/meal-prep"
            className="block rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
          >
            <p className="text-4xl">📅</p>
            <h3 className="mt-3 text-2xl font-black text-amber-900">
              Meal Prep
            </h3>
            <p className="mt-2 text-amber-700">
              Assign recipes to breakfast, lunch, and dinner for the week.
            </p>
          </Link>

          <Link
            to="/grocery-lists"
            className="block rounded-2xl border-4 border-amber-800 bg-orange-100 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-orange-200"
          >
            <p className="text-4xl">🛒</p>
            <h3 className="mt-3 text-2xl font-black text-amber-900">
              Grocery Lists
            </h3>
            <p className="mt-2 text-amber-700">
              Build shopping lists manually or from recipe ingredients.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;