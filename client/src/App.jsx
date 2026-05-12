import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute user={user}>
            <Home user={user} setUser={setUser} />
          </ProtectedRoute>
        }
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