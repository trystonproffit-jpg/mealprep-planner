import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    fetch("http://127.0.0.1:5555/login", {
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
          throw new Error(data.error || "Login failed.");
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
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border-4 border-amber-800 bg-orange-100 p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-amber-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-amber-700">
          Log in to your kitchen planner.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-semibold text-amber-900">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-semibold text-amber-900">
              Password
            </label>
            <input
              className="mt-1 w-full rounded-lg border-2 border-amber-700 bg-amber-50 p-2 outline-none focus:border-orange-500"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            className="w-full rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
            type="submit"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-amber-800">
          Need an account?{" "}
          <Link className="font-bold underline" to="/signup">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;