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
      <div className="pointer-events-none fixed -left-24 top-1/3 h-72 w-72 rounded-full bg-[#FF0990]/20 blur-[120px]" />
      <div className="pointer-events-none fixed -right-24 bottom-0 h-80 w-80 rounded-full bg-[#FF0990]/25 blur-[120px]" />
      <section className="relative z-10 mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex">
            <img src={logo} alt="Radioactive" className="h-14 w-auto drop-shadow-[0_0_18px_rgba(255,9,144,0.55)]" />
          </Link>
          <Link to="/" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/10">
            Home
          </Link>
        </div>

        <div className="account-panel mt-8 p-6 sm:p-9">
          <p className="font-avrile text-xs uppercase tracking-[0.35em] text-pink-400">Your frequency</p>
          <h1 className="mt-2 font-boldfont text-3xl uppercase tracking-wide text-white sm:text-4xl">
            Profile Management
          </h1>
          <p className="account-muted mt-3 text-sm leading-6">
            Lihat detail akun kamu.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
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
    <div className="account-subpanel px-4 py-4">
      <p className="account-label text-pink-300">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-white">
        {value || "-"}
      </p>
    </div>
  );
}

export default ProfilePage;
