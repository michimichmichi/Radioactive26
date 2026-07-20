import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";
import vinyl from "../assets/opening/vinyl.png";
import star7 from "../assets/opening/star 7.png";
import glistening from "../assets/opening/glistening peak.png";
import mascot from "../assets/mascot/glitz.png";

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
      localStorage.setItem("token", response.data.token);
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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)", backgroundSize: "5px 5px" }}>
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#FF0990]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#FF0990]/25 blur-[120px]" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center gap-12 px-5 py-10 sm:px-8 lg:gap-20">
        <div className="relative hidden min-h-[600px] flex-1 items-center justify-center lg:flex">
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF0990]/20 blur-[100px]" />
          <img src={vinyl} alt="" className="absolute right-[12%] top-[5%] w-56 rotate-12 opacity-80 drop-shadow-[0_0_24px_rgba(255,9,144,0.35)]" />
          <img src={glistening} alt="" className="absolute left-1/2 top-[24%] w-[430px] -translate-x-1/2 drop-shadow-[0_0_18px_rgba(255,9,144,0.3)]" />
          <img src={star7} alt="" className="absolute left-[8%] top-[35%] w-20 -rotate-12 drop-shadow-[0_0_24px_rgba(255,9,144,0.65)]" />
          <img src={star7} alt="" className="absolute bottom-[20%] right-[8%] w-16 rotate-12 drop-shadow-[0_0_24px_rgba(255,9,144,0.65)]" />
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-center">
            <p className="font-avrile text-xs uppercase tracking-[0.45em] text-pink-400">Embrace the best</p>
            <p className="mt-2 font-boldfont text-4xl uppercase tracking-wide text-white">Version of You</p>
          </div>
        </div>
        <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-black/70 p-6 shadow-[0_0_60px_rgba(255,9,144,0.16)] backdrop-blur-md sm:p-9 lg:flex-1">
          <img src={mascot} alt="Glitz Mascot" className="pointer-events-none absolute -right-36 top-[55%] z-20 hidden w-[210px] -translate-y-1/2 drop-shadow-[0_0_22px_rgba(255,9,144,0.45)] lg:block" />
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="Radioactive" className="h-14 w-auto drop-shadow-[0_0_18px_rgba(255,9,144,0.55)]" />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/10"
              >
                Beranda
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-pink-400/60 bg-pink-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-pink-300 transition hover:bg-pink-500/20"
              >
                Daftar
              </Link>
            </div>
          </div>

          <p className="font-avrile text-xs uppercase tracking-[0.35em] text-pink-400">Selamat datang kembali</p>
          <h1 className="mt-2 font-boldfont text-4xl uppercase tracking-wide text-white">Login</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Akses akun Radioactive kamu.
          </p>

          {location.state?.message && (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {location.state.message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-400 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                placeholder="kamu@contoh.com"
              />
            </label>

            <label className="block">
              <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">Kata Sandi</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                required
                minLength={6}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-400 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                placeholder="Kata sandi kamu"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#FF0990] px-5 py-3 font-avrile text-sm uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,9,144,0.35)] transition hover:scale-[1.02] hover:bg-[#ff36a8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Sedang masuk..." : "Masuk"}
            </button>

            <Link
              to="/"
              className="block text-center text-sm font-semibold text-zinc-500 transition hover:text-pink-300"
            >
              Kembali ke beranda
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
