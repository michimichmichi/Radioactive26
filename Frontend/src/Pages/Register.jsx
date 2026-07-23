import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";
import { validateImageFile } from "../utils/fileValidation";

function RegisterPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    nim: "",
    ktm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (event) => {
    const { files, name, type, value } = event.target;

    if (type === "file") {
      const file = files?.[0] || "";
      const validationError = validateImageFile(file);

      if (validationError) {
        event.target.value = "";
        setError(validationError);
        setForm((current) => ({ ...current, [name]: "" }));
        return;
      }

      setError("");
      setForm((current) => ({ ...current, [name]: file }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("university", form.university);
      formData.append("nim", form.nim);

      if (form.ktm) {
        formData.append("ktm", form.ktm);
      }

      await authAPI.register(formData);
      formRef.current?.reset();
      navigate("/login", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="account-panel w-full max-w-2xl p-8 text-white shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="Radioactive" className="h-20 w-auto" />
            </Link>
          </div>

          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Register
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Create your Radioactive account. New accounts are registered as users.
          </p>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                placeholder="Full name"
              />
            </label>

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
                placeholder="Create a password"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                University
              </span>
              <input
                type="text"
                name="university"
                value={form.university}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                placeholder="University name"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">NIM</span>
              <input
                type="text"
                name="nim"
                value={form.nim}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                placeholder="Student number"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">KTM</span>
              <input
                type="file"
                name="ktm"
                onChange={updateField}
                accept="image/jpeg,image/jpg,image/png"
                className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              />
              <span className="mt-1 block text-xs text-zinc-500">
                JPG, JPEG, or PNG. Maximum 5MB.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300 md:col-span-2"
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>

            <p className="text-center text-sm text-zinc-600 md:col-span-2">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-pink-600 hover:text-pink-700">
                Login here
              </Link>
            </p>

            <Link
              to="/"
              className="block text-center text-sm font-semibold text-zinc-600 hover:text-pink-600 md:col-span-2"
            >
              Back to home
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
