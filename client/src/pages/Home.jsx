function Home({ user }) {
  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-4xl font-bold text-amber-900">
        MealPrep Planner
      </h1>

      {user ? (
        <p className="mt-4 text-amber-700">
          Welcome back, {user.username}.
        </p>
      ) : (
        <p className="mt-4 text-amber-700">
          You are not logged in yet.
        </p>
      )}
    </main>
  );
}

export default Home;