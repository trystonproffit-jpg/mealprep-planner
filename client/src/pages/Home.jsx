import { useNavigate } from "react-router-dom";

function Home({ user, setUser }) {
  const navigate = useNavigate();

  function handleLogout() {
    fetch("http://127.0.0.1:5555/logout", {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      setUser(null);
      navigate("/login");
    });
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="flex items-center justify-between">
        <div>
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
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Log Out
          </button>
        ) : null}
      </div>
    </main>
  );
}

export default Home;