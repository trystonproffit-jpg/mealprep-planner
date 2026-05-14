import { NavLink, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
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

  const linkClass = ({ isActive }) =>
    isActive
      ? "rounded-xl bg-amber-700 px-4 py-2 font-bold text-amber-50"
      : "rounded-xl px-4 py-2 font-bold text-amber-900 hover:bg-orange-200";

  return (
    <header className="border-b-4 border-amber-800 bg-orange-100 px-8 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-amber-900">
            MealPrep Planner
          </h1>

          {user ? (
            <p className="text-sm text-amber-700">
              Logged in as {user.username}
            </p>
          ) : null}
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/home" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/recipes" className={linkClass}>
            Recipes
          </NavLink>

          <NavLink to="/meal-prep" className={linkClass}>
            Meal Prep
          </NavLink>

          <NavLink to="/grocery-lists" className={linkClass}>
            Grocery Lists
          </NavLink>

          <button
            onClick={handleLogout}
            className="ml-4 rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
          >
            Log Out
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;