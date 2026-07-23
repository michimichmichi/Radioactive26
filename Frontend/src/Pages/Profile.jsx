import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";

function ProfilePage() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile.");
      }
    };

    loadProfile();
  }, []);

  return (
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <section className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-20 w-auto" />
        </Link>

        <div className="account-panel p-8 text-white shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Profile Management
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Review your account details.
          </p>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProfileField label="Name" value={user?.name} />
            <ProfileField label="Email" value={user?.email} />
            <ProfileField label="University" value={user?.university} />
            <ProfileField label="NIM" value={user?.nim} />
            <ProfileField label="KTM" value={user?.ktm || "-"} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-md border border-pink-100 bg-pink-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-800">
        {value || "-"}
      </p>
    </div>
  );
}

export default ProfilePage;
