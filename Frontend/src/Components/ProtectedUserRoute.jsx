import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "../api";

function ProtectedUserRoute({ children }) {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(response.data));
        window.dispatchEvent(new Event("auth-change"));
        setStatus("allowed");
      } catch (err) {
        setError(err.userMessage || "Unable to verify your account. Please try again.");
        setStatus(err.response?.status === 401 ? "unauthenticated" : "error");
      }
    };

    verifyUser();
  }, []);

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div role="alert" className="max-w-xl rounded-lg border border-pink-400/30 p-6">
          <p>{error}</p>
          <button className="mt-4 rounded bg-pink-600 px-4 py-2" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-lg border border-pink-400/30 px-6 py-4 text-pink-300">
          Checking account...
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: error || "Please login first." }}
      />
    );
  }

  return children;
}

export default ProtectedUserRoute;
