import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sprout } from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Recipes from "./pages/Recipes";
import MealPrep from "./pages/MealPrep";
import GroceryLists from "./pages/GroceryLists";
import GroceryListDetail from "./pages/GroceryListDetail";
import RecipeGroupPage from "./pages/RecipeGroupPage";
import RecipeForm from "./pages/RecipeForm";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeGroupsManager from "./pages/RecipeGroupsManager";
import RecipeSearch from "./pages/RecipeSearch";


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoggedOutRoute from "./components/LoggedOutRoute";
import FloatingRecipeAssistant from "./components/FloatingRecipeAssistant";
import { apiUrl } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/me"), {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        setUser(null);
        return null;
      })
      .then((data) => {
        if (data) {
          setUser(data);
        }
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  if (isCheckingSession) {
    return (
      <main className="farm-background flex min-h-screen items-center justify-center p-6">
        <section className="farm-panel w-full max-w-sm p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-[var(--farm-wood-dark)] bg-[var(--farm-paper-light)] text-[var(--farm-green-dark)] shadow-[4px_4px_0_rgba(47,36,24,0.34)]">
            <Sprout
              size={36}
              strokeWidth={2.8}
              aria-hidden="true"
            />
          </div>

          <p className="font-game mt-5 text-2xl font-black text-[var(--farm-ink)]">
            Loading your kitchen...
          </p>
        </section>
      </main>
    );
  }

  function protectedPage(page) {
    return (
      <ProtectedRoute user={user}>
        <>
          <Navbar user={user} setUser={setUser} />
          {page}
        </>
      </ProtectedRoute>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route
          path="/home"
          element={protectedPage(<Home user={user} />)}
        />

        <Route
          path="/recipes"
          element={protectedPage(<Recipes />)}
        />

        <Route
          path="/recipes/search"
          element={protectedPage(<RecipeSearch />)}
        />

        <Route
          path="/recipes/groups/:groupId"
          element={protectedPage(<RecipeGroupPage />)}
        />

        <Route
          path="/recipes/new"
          element={protectedPage(<RecipeForm />)}
        />

        <Route
          path="/recipes/:recipeId"
          element={protectedPage(<RecipeDetail />)}
        />

        <Route
          path="/recipes/:recipeId/edit"
          element={protectedPage(<RecipeForm />)}
        />

        <Route
          path="/recipes/:recipeId/groups"
          element={protectedPage(<RecipeGroupsManager />)}
        />

        <Route
          path="/meal-prep"
          element={protectedPage(<MealPrep />)}
        />

        <Route
          path="/grocery-lists"
          element={protectedPage(<GroceryLists />)}
        />

        <Route
          path="/grocery-lists/:listId"
          element={protectedPage(<GroceryListDetail />)}
        />

        <Route
          path="/login"
          element={
            <LoggedOutRoute user={user}>
              <Login setUser={setUser} />
            </LoggedOutRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <LoggedOutRoute user={user}>
              <Signup setUser={setUser} />
            </LoggedOutRoute>
          }
        />
      </Routes>

      {user ? <FloatingRecipeAssistant /> : null}
    </>
  );
}

export default App;
