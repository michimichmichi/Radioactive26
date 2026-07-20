import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";
import { validateImageFile } from "../utils/fileValidation";
import vinyl from "../assets/opening/vinyl.png";
import star7 from "../assets/opening/star 7.png";
import glistening from "../assets/opening/glistening peak.png";
import mascot from "../assets/mascot/glitz.png";

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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)", backgroundSize: "5px 5px" }}>
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-[#FF0990]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#FF0990]/25 blur-[130px]" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center gap-12 px-5 py-10 sm:px-8 lg:gap-20">
        <div className="relative hidden min-h-[600px] flex-1 items-center justify-center lg:flex">
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF0990]/20 blur-[110px]" />
          <img src={vinyl} alt="" className="absolute right-[10%] top-[3%] w-60 -rotate-12 opacity-80 drop-shadow-[0_0_24px_rgba(255,9,144,0.35)]" />
          <img src={glistening} alt="" className="absolute left-1/2 top-[25%] w-[460px] -translate-x-1/2 drop-shadow-[0_0_18px_rgba(255,9,144,0.3)]" />
          <img src={star7} alt="" className="absolute left-[6%] top-[32%] w-24 -rotate-12 drop-shadow-[0_0_24px_rgba(255,9,144,0.65)]" />
          <img src={star7} alt="" className="absolute bottom-[17%] right-[7%] w-20 rotate-12 drop-shadow-[0_0_24px_rgba(255,9,144,0.65)]" />
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 text-center">
            <p className="font-avrile text-xs uppercase tracking-[0.45em] text-pink-400">Your frequency starts here</p>
            <p className="mt-2 font-boldfont text-4xl uppercase tracking-wide text-white">Tune In</p>
          </div>
        </div>
        <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-black/70 p-6 shadow-[0_0_60px_rgba(255,9,144,0.16)] backdrop-blur-md sm:p-9 lg:flex-[1.15]">
          <img src={mascot} alt="Glitz Mascot" className="pointer-events-none absolute -right-40 top-[58%] z-20 hidden w-[235px] -translate-y-1/2 drop-shadow-[0_0_22px_rgba(255,9,144,0.45)] lg:block" />
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
                to="/login"
                className="rounded-xl border border-pink-400/60 bg-pink-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-pink-300 transition hover:bg-pink-500/20"
              >
                Masuk
              </Link>
            </div>
          </div>

          <p className="font-avrile text-xs uppercase tracking-[0.35em] text-pink-400">Bergabung bersama kami</p>
          <h1 className="mt-2 font-boldfont text-4xl uppercase tracking-wide text-white">
            Register
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Buat akun Radioactive kamu. Akun baru akan terdaftar sebagai pengguna.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">Nama</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-400 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                placeholder="Nama lengkap"
              />
            </label>

            <label className="block">
              <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-400 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                placeholder="you@example.com"
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
                placeholder="Buat kata sandi"
              />
            </label>

            <label className="block">
                <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">
                Universitas
              </span>
              <input
                type="text"
                name="university"
                value={form.university}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-400 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                placeholder="Nama universitas"
              />
            </label>

            <label className="block">
              <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">NIM</span>
              <input
                type="text"
                name="nim"
                value={form.nim}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-400 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                placeholder="Nomor mahasiswa"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="font-avrile text-xs uppercase tracking-wider text-zinc-300">KTM</span>
              <input
                type="file"
                name="ktm"
                onChange={updateField}
                accept="image/jpeg,image/jpg,image/png"
                className="mt-2 w-full rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-zinc-300 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-pink-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-pink-300 hover:border-pink-400/60 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
              />
              <span className="mt-1 block text-xs text-zinc-500">
                JPG, JPEG, atau PNG. Maksimal 5MB.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#FF0990] px-5 py-3 font-avrile text-sm uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,9,144,0.35)] transition hover:scale-[1.02] hover:bg-[#ff36a8] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
            >
              {isLoading ? "Membuat akun..." : "Daftar"}
            </button>

            <Link
              to="/"
              className="block text-center text-sm font-semibold text-zinc-500 transition hover:text-pink-300 md:col-span-2"
            >
              Kembali ke beranda
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
