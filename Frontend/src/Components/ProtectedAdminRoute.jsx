import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authAPI } from "../api";

function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(response.data));
        window.dispatchEvent(new Event("auth-change"));
        setUser(response.data);
        setStatus(response.data.role === "admin" ? "allowed" : "forbidden");
      } catch {
        setStatus("unauthenticated");
      }
    };

    verifyAdmin();
  }, []);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-lg border border-pink-400/30 px-6 py-4 text-pink-300">
          Checking admin access...
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Please login with an admin account first." }}
      />
    );
  }

  if (status === "forbidden") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md rounded-lg bg-white p-8 text-center text-zinc-900 shadow-2xl">
          <h1 className="text-2xl font-bold text-pink-600">Admin only</h1>
          <p className="mt-3 text-sm text-zinc-600">
            {user?.email || "This account"} is not allowed to access the admin dashboard.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-md bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return children;
}

export default ProtectedAdminRoute;
