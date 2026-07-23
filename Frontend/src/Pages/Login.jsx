import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(form);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("auth-change"));
      navigate(response.data.user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="account-panel w-full max-w-md p-8 text-white shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="Radioactive" className="h-12 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Home
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50"
              >
                Register
              </Link>
            </div>
          </div>

          <h1 className="font-thebold text-3xl uppercase text-pink-600">Login</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Access your Radioactive account.
          </p>

          {location.state?.message && (
            <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {location.state.message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                required
                minLength={6}
                className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                placeholder="Your password"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <Link
              to="/"
              className="block text-center text-sm font-semibold text-zinc-600 hover:text-pink-600"
            >
              Back to home
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
