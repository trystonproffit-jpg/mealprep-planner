import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Sprout,
} from "lucide-react";

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

  const navLinks = [
    {
      to: "/home",
      label: "Home",
      Icon: Home,
    },
    {
      to: "/recipes",
      label: "Recipes",
      Icon: BookOpen,
    },
    {
      to: "/meal-prep",
      label: "Meal Prep",
      Icon: CalendarDays,
    },
    {
      to: "/grocery-lists",
      label: "Grocery Lists",
      Icon: ClipboardList,
    },
  ];

  const linkClass = ({ isActive }) =>
    isActive
      ? "shelf-nav-link shelf-nav-link-active"
      : "shelf-nav-link";

  return (
    <>
      <header className="kitchen-shelf-nav sticky top-0 z-40 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-3 border-[var(--farm-wood-dark)] bg-[var(--farm-paper)] text-[var(--farm-green-dark)] shadow-[3px_3px_0_rgba(47,36,24,0.35)]">
              <Sprout
                size={28}
                strokeWidth={2.8}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h1 className="font-game truncate text-2xl font-black text-[#fff3c7] md:text-3xl">
                Mealstead
              </h1>

              {user ? (
                <p className="truncate text-sm font-bold text-[#ffe5a8]">
                  Logged in as {user.username}
                </p>
              ) : null}
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
              >
                <Icon
                  size={19}
                  strokeWidth={2.7}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="farm-button-secondary hidden items-center gap-2 px-3 py-2 md:inline-flex"
          >
            <LogOut
              size={18}
              strokeWidth={2.7}
              aria-hidden="true"
            />
            <span>Log Out</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="farm-button-secondary inline-flex items-center gap-2 px-3 py-2 md:hidden"
            aria-label="Log out"
          >
            <LogOut
              size={18}
              strokeWidth={2.7}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      <nav className="mobile-farm-nav fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 gap-1 px-2 py-2 md:hidden">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? "flex flex-col items-center gap-1 rounded-xl border-2 border-[var(--farm-wood-dark)] bg-[var(--farm-paper)] px-2 py-2 text-xs font-black text-[var(--farm-wood-dark)] shadow-[2px_2px_0_rgba(47,36,24,0.28)]"
                : "flex flex-col items-center gap-1 rounded-xl border-2 border-transparent px-2 py-2 text-xs font-black text-[#fff3c7]"
            }
          >
            <Icon
              size={20}
              strokeWidth={2.7}
              aria-hidden="true"
            />
            <span className="leading-tight">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Navbar;
