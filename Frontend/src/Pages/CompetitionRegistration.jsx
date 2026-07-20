import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search, UploadCloud } from "lucide-react";
import API from "../api";
import logo from "../assets/LogoRadioactive.png";
import { validateImageFile } from "../utils/fileValidation";

function CompetitionRegistrationPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [competitions, setCompetitions] = useState([]);
  const [nimQuery, setNimQuery] = useState("");
  const [nimResults, setNimResults] = useState([]);
  const [nimStatus, setNimStatus] = useState("");
  const [isCompetitionOpen, setIsCompetitionOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [form, setForm] = useState({
    teamName: "",
    competitionId: "",
    members: [],
    buktiTransfer: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadRegistrationData = async () => {
      try {
        const competitionsRes = await API.get("/competitions");
        setCompetitions(competitionsRes.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load registration data.",
        );
      }
    };

    loadRegistrationData();
  }, []);

  useEffect(() => {
    const searchNim = async () => {
      const keyword = nimQuery.trim();

      if (keyword.length < 3 || !form.competitionId) {
        setNimResults([]);
        setNimStatus(
          !form.competitionId
            ? "Pilih kompetisi terlebih dahulu."
            : keyword.length > 0
              ? "Masukkan minimal 3 digit NIM."
              : "",
        );
        return;
      }

      setNimStatus("Mencari peserta...");
      try {
        const response = await API.get(
          `/users/participants?nim=${encodeURIComponent(keyword)}&competitionId=${encodeURIComponent(form.competitionId)}`,
        );
        const matches = (response.data || []).filter(
            (participant) =>
              participant._id !== currentUser?._id &&
              !form.members.includes(participant._id),
          );
        setNimResults(matches);
        setNimStatus(
          matches.length > 0
            ? ""
            : "Tidak ada peserta yang cocok dan tersedia untuk kompetisi ini.",
        );
      } catch (err) {
        setNimResults([]);
        setNimStatus(
          err.response?.data?.message || "Pencarian peserta gagal. Silakan coba lagi.",
        );
      }
    };

    const timeoutId = window.setTimeout(searchNim, 250);
    return () => window.clearTimeout(timeoutId);
  }, [currentUser?._id, form.competitionId, form.members, nimQuery]);

  const addMember = (participant) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(participant._id)
        ? current.members
        : [...current.members, participant._id],
    }));
    setSelectedMembers((current) =>
      current.some((member) => member._id === participant._id)
        ? current
        : [...current, participant],
    );
    setNimQuery("");
    setNimResults([]);
  };

  const removeMember = (memberId) => {
    setForm((current) => ({
      ...current,
      members: current.members.filter((id) => id !== memberId),
    }));
    setSelectedMembers((current) =>
      current.filter((member) => member._id !== memberId),
    );
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.competitionId) {
      setError("Silakan pilih kompetisi sebelum mendaftarkan tim.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("teamName", form.teamName);
      formData.append("leaderId", currentUser?._id || "");
      formData.append("competitionId", form.competitionId);

      form.members.forEach((memberId) => {
        formData.append("members", memberId);
      });

      if (form.buktiTransfer) {
        formData.append("buktiTransfer", form.buktiTransfer);
      }

      await API.post("/teams", formData);
      formRef.current?.reset();
      setForm({
        teamName: "",
        competitionId: "",
        members: [],
        buktiTransfer: "",
      });
      setSelectedMembers([]);
      setNimQuery("");
      setNimResults([]);
      navigate("/my-competitions");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit registration. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCompetition = competitions.find(
    (competition) => competition._id === form.competitionId,
  );

  const chooseCompetition = (competitionId) => {
    setForm({
      ...form,
      competitionId,
      members: [],
    });
    setSelectedMembers([]);
    setNimQuery("");
    setNimResults([]);
    setIsCompetitionOpen(false);
  };

  return (
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="pointer-events-none fixed -left-24 top-1/3 h-72 w-72 rounded-full bg-[#FF0990]/20 blur-[120px]" />
      <div className="pointer-events-none fixed -right-24 bottom-0 h-80 w-80 rounded-full bg-[#FF0990]/25 blur-[120px]" />
      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex">
            <img src={logo} alt="Radioactive" className="h-14 w-auto drop-shadow-[0_0_18px_rgba(255,9,144,0.55)]" />
          </Link>
          <Link to="/" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/10">
            Home
          </Link>
        </div>

        <div className="account-panel mt-8 p-6 sm:p-9">
          <p className="font-avrile text-xs uppercase tracking-[0.35em] text-pink-400">Join the signal</p>
          <h1 className="mt-2 font-boldfont text-3xl uppercase tracking-wide text-white sm:text-4xl">
            Competition Registration
          </h1>
          <p className="account-muted mt-3 text-sm leading-6">
            Daftarkan tim kamu dan unggah bukti transfer.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={submitRegistration} className="mt-6 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="account-label">
                  Nama Tim
                </span>
                <input
                  type="text"
                  value={form.teamName}
                  onChange={(event) =>
                    setForm({ ...form, teamName: event.target.value })
                  }
                  required
                  className="account-field mt-2 w-full px-4 py-3"
                  placeholder="Nama tim kamu"
                />
              </label>

              <label className="block">
                <span className="account-label">
                  Kompetisi
                </span>
                <div className="relative mt-2">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isCompetitionOpen}
                    onClick={() => setIsCompetitionOpen((current) => !current)}
                    className="account-field flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className={selectedCompetition ? "text-white" : "text-zinc-400"}>
                      {selectedCompetition?.competitionName || "Pilih kompetisi"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-pink-300 transition-transform ${isCompetitionOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isCompetitionOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 top-full z-40 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-pink-400/40 bg-[#120b12] p-1 shadow-[0_16px_40px_rgba(0,0,0,.45)]"
                    >
                      {competitions.map((competition) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={competition._id === form.competitionId}
                          key={competition._id}
                          onClick={() => chooseCompetition(competition._id)}
                          className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-zinc-200 transition hover:bg-pink-500/20 hover:text-white"
                        >
                          {competition.competitionName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>

            <section className="account-subpanel p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-boldfont text-lg uppercase tracking-wide text-pink-300">Anggota</h2>
                  <p className="account-muted text-sm">
                    Kamu akan terdaftar sebagai ketua tim.
                  </p>
                </div>

                <div className="w-full md:w-80">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-pink-400">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      value={nimQuery}
                      onChange={(event) => setNimQuery(event.target.value)}
                      placeholder={form.competitionId ? "Ketik NIM anggota..." : "Pilih kompetisi terlebih dahulu"}
                      className="account-field w-full py-3 pl-10 pr-4"
                    />
                  </div>
                  {nimStatus && (
                    <p className="account-muted mt-2 text-xs">{nimStatus}</p>
                  )}
                </div>
              </div>

              {nimResults.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {nimResults.map((participant) => (
                    <button
                      type="button"
                      key={participant._id}
                      onClick={() => addMember(participant)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm transition hover:border-pink-400/50 hover:bg-pink-500/10"
                    >
                      <span className="block font-semibold text-white">
                        {participant.nim}
                      </span>
                      <span className="block text-xs text-zinc-400">
                        {participant.name} - {participant.university || "-"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedMembers.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white">
                          {member.name}
                        </span>
                        <span className="block truncate text-xs text-zinc-400">
                          {member.university || "-"} - NIM: {member.nim || "-"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMember(member._id)}
                        className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <label className="block">
              <span className="account-label">
                Bukti Transfer
              </span>
              <div className="account-field mt-2 flex items-center gap-3 px-4 py-3">
                <UploadCloud className="shrink-0 text-pink-600" size={20} />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || "";
                    const validationError = validateImageFile(file);

                    if (validationError) {
                      event.target.value = "";
                      setError(validationError);
                      setForm({ ...form, buktiTransfer: "" });
                      return;
                    }

                    setError("");
                    setForm({
                      ...form,
                      buktiTransfer: file,
                    });
                  }}
                  className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-pink-500/20 file:px-4 file:py-2 file:font-semibold file:text-pink-200 hover:file:bg-pink-500/30"
                />
              </div>
              <span className="account-muted mt-1 block text-xs">
                JPG, JPEG, atau PNG. Maksimal 5MB.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="account-button px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? "Mengirim pendaftaran..." : "Daftarkan Tim"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CompetitionRegistrationPage;
