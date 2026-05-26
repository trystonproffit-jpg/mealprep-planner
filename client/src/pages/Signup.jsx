import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, UserPlus } from "lucide-react";

import FarmPageLayout from "../components/FarmPageLayout";
import GameButton from "../components/GameButton";
import { apiUrl } from "../api";

function Signup({ setUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    fetch(apiUrl("/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.error || "Signup failed.");
        });
      })
      .then((user) => {
        setUser(user);
        navigate("/home");
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <FarmPageLayout maxWidth="max-w-md">
      <section className="farm-panel p-6 md:p-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-[var(--farm-wood-dark)] bg-[var(--farm-paper-light)] text-[var(--farm-green-dark)] shadow-[4px_4px_0_rgba(47,36,24,0.34)]">
            <Sprout
              size={36}
              strokeWidth={2.8}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="mt-5 text-center">
          <h1 className="font-game text-4xl font-black text-[var(--farm-ink)]">
            Create Account
          </h1>

          <p className="mt-2 font-bold text-[var(--farm-muted)]">
            Start planning your cozy kitchen.
          </p>
        </div>

        {error ? (
          <p className="farm-error mt-5">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-black text-[var(--farm-ink)]">
              Username
            </label>
            <input
              className="farm-input mt-1 w-full"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-black text-[var(--farm-ink)]">
              Email
            </label>
            <input
              className="farm-input mt-1 w-full"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-black text-[var(--farm-ink)]">
              Password
            </label>
            <input
              className="farm-input mt-1 w-full"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-black text-[var(--farm-ink)]">
              Confirm Password
            </label>
            <input
              className="farm-input mt-1 w-full"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <GameButton
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-3"
            type="submit"
          >
            <UserPlus
              size={18}
              strokeWidth={2.8}
              aria-hidden="true"
            />
            Sign Up
          </GameButton>
        </form>

        <p className="mt-5 text-center font-bold text-[var(--farm-muted)]">
          Already have an account?{" "}
          <Link className="font-black text-[var(--farm-green-dark)] underline" to="/login">
            Log in
          </Link>
        </p>
      </section>
    </FarmPageLayout>
  );
}

export default Signup;
