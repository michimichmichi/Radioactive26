import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "../api";

function ProtectedUserRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(response.data));
        window.dispatchEvent(new Event("auth-change"));
        setStatus("allowed");
      } catch {
        setStatus("unauthenticated");
      }
    };

    verifyUser();
  }, []);

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
        state={{ message: "Please login first." }}
      />
    );
  }

  return children;
}

export default ProtectedUserRoute;
