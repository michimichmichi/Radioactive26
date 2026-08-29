import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search, UploadCloud } from "lucide-react";
import API from "../api";
import logo from "../assets/LogoRadioactive.webp";
import { validateImageFile } from "../utils/fileValidation";

const RAC_GUIDEBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1g_PwDqTM62IuwucAvT2DyNtunxj0hR97";
const PODCAST_GUIDEBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1yP6t32jWi1I5r0aG5kiZ9jof74heA5kS";

function CompetitionDropdown({ competitions, value, onChange }) {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedCompetition = competitions.find(
    (competition) => competition._id === value,
  );

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const selectCompetition = (competitionId) => {
    onChange(competitionId);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((current) => !current);
    }
  };

  return (
    <div ref={dropdownRef} className="relative mt-2">
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="competition-options"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200 ${
          isOpen ? "border-pink-500 ring-2 ring-pink-200" : "border-zinc-300"
        }`}
      >
        <span className={selectedCompetition ? "text-white" : "text-zinc-500"}>
          {selectedCompetition?.competitionName || "Select competition"}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-pink-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="competition-options"
          role="listbox"
          aria-label="Competition options"
          className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-md border border-pink-500/70 bg-zinc-950 p-1 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
        >
          {competitions.length > 0 ? (
            competitions.map((competition) => (
              <button
                type="button"
                role="option"
                aria-selected={competition._id === value}
                key={competition._id}
                onClick={() => selectCompetition(competition._id)}
                className={`block w-full rounded px-3 py-2.5 text-left text-sm transition ${
                  competition._id === value
                    ? "bg-pink-600 text-white"
                    : "text-zinc-200 hover:bg-pink-500/20 hover:text-pink-200"
                }`}
              >
                {competition.competitionName}
              </button>
            ))
          ) : (
            <p className="px-3 py-2.5 text-sm text-zinc-500">
              No competitions available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CompetitionRegistrationPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [competitions, setCompetitions] = useState([]);
  const [nimQuery, setNimQuery] = useState("");
  const [nimResults, setNimResults] = useState([]);
  const [nimStatus, setNimStatus] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [form, setForm] = useState({
    teamName: "",
    competitionId: "",
    members: [],
    buktiTransfer: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCompetition = competitions.find(
    (competition) => competition._id === form.competitionId,
  );
  const isPodcastCompetition = selectedCompetition?.competitionName
    ?.toLowerCase()
    .includes("podcast");
  const guidebookUrl = isPodcastCompetition
    ? PODCAST_GUIDEBOOK_URL
    : RAC_GUIDEBOOK_URL;

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
            ? "Select a competition first."
            : keyword.length > 0
              ? "Enter at least 3 characters of the NIM."
              : "",
        );
        return;
      }

      setNimStatus("Searching participants...");
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
            : "No matching available participant found for this competition.",
        );
      } catch (err) {
        setNimResults([]);
        setNimStatus(
          err.response?.data?.message ||
            "Participant search failed. Please try again.",
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
    setNimStatus("");
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
    setError("Please select a competition before registering your team.");
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
    setNimStatus("");

    navigate("/my-competitions");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to submit registration. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-20 w-auto" />
        </Link>

        <div className="account-panel p-8 text-white shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Competition Registration
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Register your team and upload your transfer proof.
          </p>
          {selectedCompetition ? (
            <a
              href={guidebookUrl}
              download
              className="mt-4 inline-flex text-sm font-semibold text-pink-300 hover:text-pink-200"
            >
              Download {isPodcastCompetition ? "Podcast" : "RAC"} competition handbook
            </a>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Select a competition to download its handbook.
            </p>
          )}

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

              <div className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  Competition
                </span>
                <CompetitionDropdown
                  competitions={competitions}
                  value={form.competitionId}
                  onChange={(competitionId) => {
                    setForm({
                      ...form,
                      competitionId,
                      members: [],
                    });
                    setSelectedMembers([]);
                    setNimQuery("");
                    setNimResults([]);
                  }}
                >
                </CompetitionDropdown>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Bukti Transfer
              </span>
              <section className="rounded-md border border-pink-100 bg-pink-50 p-4">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-bold text-pink-600">
        Payment Information
      </h2>

      <p className="mt-1 text-sm text-zinc-600">
        Please transfer the registration fee to the following account before
        uploading your payment proof.
      </p>
    </div>
  </div>

  <div className="mt-5 space-y-3">
    <div className="rounded-md border border-pink-100 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Bank / App
      </p>
      <p className="mt-1 font-semibold">
        Blu by BCA Digital
      </p>
    </div>

    <div className="rounded-md border border-pink-100 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Account Number
          </p>

          <p className="mt-1 font-mono text-lg font-bold tracking-widest">
            004106128900
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigator.clipboard.writeText("004106128900")}
          className="rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
        >
          Copy
        </button>
      </div>
    </div>

    <div className="rounded-md border border-pink-100 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Account Name
      </p>

      <p className="mt-1 font-semibold">
        Lady Serenity
      </p>
    </div>
  </div>
</section>
              
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
                    disabled={!form.competitionId}
                    placeholder="Type member NIM..."
                    className="w-full rounded-md border border-pink-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  />
                  {nimStatus && (
                    <p className="mt-2 text-xs text-zinc-500">{nimStatus}</p>
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
                      className="rounded-md border border-pink-100 bg-white px-3 py-3 text-left text-sm transition hover:border-pink-300 hover:bg-pink-100"
                    >
                      <span className="block font-semibold text-zinc-300">
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
