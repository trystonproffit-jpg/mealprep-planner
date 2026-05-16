import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoggedOutRoute from "./components/LoggedOutRoute";

function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5555/me", {
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
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-900 text-xl font-semibold">
          Loading your kitchen...
        </p>
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
  );
}

export default App;