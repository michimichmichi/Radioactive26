import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, UploadCloud } from "lucide-react";
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
        return;
      }

      try {
        const response = await API.get(
          `/users/participants?nim=${encodeURIComponent(keyword)}&competitionId=${encodeURIComponent(form.competitionId)}`,
        );
        setNimResults(
          (response.data || []).filter(
            (participant) =>
              participant._id !== currentUser?._id &&
              !form.members.includes(participant._id),
          ),
        );
      } catch {
        setNimResults([]);
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

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-14 w-auto" />
        </Link>

        <div className="mt-8 rounded-lg bg-white p-8 text-zinc-950 shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Competition Registration
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Register your team and upload your transfer proof.
          </p>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={submitRegistration} className="mt-6 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  Team Name
                </span>
                <input
                  type="text"
                  value={form.teamName}
                  onChange={(event) =>
                    setForm({ ...form, teamName: event.target.value })
                  }
                  required
                  className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="Your team name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  Competition
                </span>
                <select
                  value={form.competitionId}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      competitionId: event.target.value,
                      members: [],
                    });
                    setSelectedMembers([]);
                    setNimQuery("");
                    setNimResults([]);
                  }}
                  required
                  className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                >
                  <option value="">Select competition</option>
                  {competitions.map((competition) => (
                    <option key={competition._id} value={competition._id}>
                      {competition.competitionName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Bukti Transfer
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-zinc-300 px-4 py-3 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-200">
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
                  className="w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-pink-700"
                />
              </div>
              <span className="mt-1 block text-xs text-zinc-500">
                JPG, JPEG, or PNG. Maximum 5MB.
              </span>
            </label>

            <section className="rounded-md border border-pink-100 bg-pink-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-pink-600">Members</h2>
                  <p className="text-sm text-zinc-600">
                    You will be registered as the team leader.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search
                    className="absolute left-3 top-3 text-pink-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={nimQuery}
                    onChange={(event) => setNimQuery(event.target.value)}
                    placeholder="Type member NIM..."
                    disabled={!form.competitionId}
                    className="w-full rounded-md border border-pink-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  />
                </div>
              </div>

              {nimResults.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {nimResults.map((participant) => (
                    <button
                      type="button"
                      key={participant._id}
                      onClick={() => addMember(participant)}
                      className="rounded-md border border-pink-100 bg-white px-3 py-3 text-left text-sm transition hover:border-pink-300 hover:bg-pink-100"
                    >
                      <span className="block font-semibold text-zinc-900">
                        {participant.nim}
                      </span>
                      <span className="block text-xs text-zinc-500">
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
                      className="flex items-center justify-between gap-3 rounded-md border border-pink-100 bg-white px-3 py-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-zinc-900">
                          {member.name}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">
                          {member.university || "-"} - NIM: {member.nim || "-"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMember(member._id)}
                        className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300"
            >
              {isSubmitting ? "Submitting registration..." : "Register Team"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CompetitionRegistrationPage;
