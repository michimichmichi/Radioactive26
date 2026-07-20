import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UploadCloud } from "lucide-react";
import API from "../api";
import logo from "../assets/LogoRadioactive.png";
import { validateImageFile } from "../utils/fileValidation";

const API_ORIGIN = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

function MyCompetitionsPage() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id;

  const loadTeams = useCallback(async () => {
    try {
      const response = await API.get("/teams");
      const registeredTeams = response.data.filter((team) => {
        const leaderId = getId(team.leaderId);
        const memberIds = Array.isArray(team.members)
          ? team.members.map((member) => getId(member))
          : [];

        return leaderId === userId || memberIds.includes(userId);
      });

      setTeams(registeredTeams);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load registered competitions.",
      );
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadTeams(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadTeams]);

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
          <p className="font-avrile text-xs uppercase tracking-[0.35em] text-pink-400">Your registrations</p>
          <h1 className="mt-2 font-boldfont text-3xl uppercase tracking-wide text-white sm:text-4xl">
            Registered Competitions
          </h1>
          <p className="account-muted mt-3 text-sm leading-6">
            Ketua dapat mengelola tim, sementara anggota dapat melihat detail pendaftaran.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {teams.length === 0 && !error ? (
            <div className="account-subpanel px-4 py-5 text-sm font-semibold text-zinc-300">
                Belum ada kompetisi yang terdaftar.
              </div>
            ) : (
              teams.map((team) => (
                <TeamRegistrationCard
                  key={team._id}
                  team={team}
                  userId={userId}
                  onUpdated={loadTeams}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function TeamRegistrationCard({ team, userId, onUpdated }) {
  const isLeader = getId(team.leaderId) === userId;
  const transferInputRef = useRef(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [teamName, setTeamName] = useState(team.teamName || "");
  const [members, setMembers] = useState(team.members || []);
  const [transferFile, setTransferFile] = useState("");
  const [nimQuery, setNimQuery] = useState("");
  const [nimResults, setNimResults] = useState([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTeamName(team.teamName || "");
      setMembers(team.members || []);
      setTransferFile("");
      setNimQuery("");
      setNimResults([]);
      setMessage("");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [team]);

  useEffect(() => {
    if (!isLeader) return undefined;

    const searchNim = async () => {
      const keyword = nimQuery.trim();

      if (keyword.length < 3) {
        setNimResults([]);
        return;
      }

      try {
        const response = await API.get(
          `/users/participants?nim=${encodeURIComponent(keyword)}&competitionId=${encodeURIComponent(getId(team.competitionId))}&excludeTeamId=${encodeURIComponent(team._id)}`,
        );
        const existingIds = [getId(team.leaderId), ...members.map(getId)];
        setNimResults(
          (response.data || []).filter(
            (participant) => !existingIds.includes(participant._id),
          ),
        );
      } catch {
        setNimResults([]);
      }
    };

    const timeoutId = window.setTimeout(searchNim, 250);
    return () => window.clearTimeout(timeoutId);
  }, [isLeader, members, nimQuery, team._id, team.competitionId, team.leaderId]);

  const addMember = (participant) => {
    setMembers((current) =>
      current.some((member) => getId(member) === participant._id)
        ? current
        : [...current, participant],
    );
    setNimQuery("");
    setNimResults([]);
  };

  const removeMember = (memberId) => {
    setMembers((current) => current.filter((member) => getId(member) !== memberId));
  };

  const saveTeam = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("teamName", teamName);
      members.forEach((member) => {
        formData.append("members", getId(member));
      });

      if (transferFile) {
        formData.append("buktiTransfer", transferFile);
      }

      await API.put(`/teams/${team._id}`, formData);
      setMessage("Team updated successfully.");
      setTransferFile("");
      if (transferInputRef.current) {
        transferInputRef.current.value = "";
      }
      onUpdated();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to update team.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="account-subpanel px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-boldfont text-lg uppercase tracking-wide text-pink-300">
            {team.competitionId?.competitionName || "Competition"}
          </h2>
          <p className="account-muted mt-1 text-sm">
            Tempat: {team.competitionId?.place || "-"}
          </p>
          <p className="account-muted mt-1 text-sm">
            Waktu: {formatDate(team.competitionId?.time)}
          </p>
        </div>
        <span className="self-start rounded-lg border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
          {isLeader ? "Ketua" : "Anggota"}
        </span>
      </div>

      {!isViewingDetails ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Tim: {team.teamName || "-"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {isLeader
                ? "Buka detail untuk mengelola anggota dan bukti transfer."
                : "Buka detail untuk melihat pendaftaran tim."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsViewingDetails(true)}
            className="account-button px-5 py-3 text-sm"
          >
            Lihat Detail
          </button>
        </div>
      ) : (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setIsViewingDetails(false)}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            Tutup Detail
          </button>
        </div>
      )}

      {isViewingDetails && (
        <>
      {isLeader ? (
        <form onSubmit={saveTeam} className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Nama Tim
            </span>
            <input
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              required
              className="account-field mt-2 w-full px-4 py-3"
            />
          </label>

          <section className="account-subpanel p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="font-bold uppercase tracking-wider text-pink-300">Anggota</h3>
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-3 flex items-center text-pink-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  value={nimQuery}
                  onChange={(event) => setNimQuery(event.target.value)}
                  placeholder="Ketik NIM anggota..."
                  className="account-field w-full py-3 pl-10 pr-4"
                />
              </div>
            </div>

            {nimResults.length > 0 && (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
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

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {members.length > 0 ? (
                members.map((member) => (
                  <div
                    key={getId(member)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-white">
                        {member.name || "Member"}
                      </span>
                      <span className="block truncate text-xs text-zinc-400">
                        {member.university || "-"} - NIM: {member.nim || "-"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMember(getId(member))}
                      className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-zinc-500">
                  Belum ada anggota tim.
                </p>
              )}
            </div>
          </section>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Bukti Transfer
            </span>
            <div className="account-field mt-2 flex items-center gap-3 px-4 py-3">
              <UploadCloud className="shrink-0 text-pink-600" size={20} />
              <input
                ref={transferInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0] || "";
                  const validationError = validateImageFile(file);

                  if (validationError) {
                    event.target.value = "";
                    setMessage(validationError);
                    setTransferFile("");
                    return;
                  }

                  setMessage("");
                  setTransferFile(file);
                }}
                className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-pink-500/20 file:px-4 file:py-2 file:font-semibold file:text-pink-200 hover:file:bg-pink-500/30"
              />
            </div>
          </label>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <TransferLink value={team.buktiTransfer} />
            <button
              type="submit"
              disabled={isSaving}
              className="account-button px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Tim"}
            </button>
          </div>

          {message && (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              {message}
            </p>
          )}
        </form>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Detail label="Team" value={team.teamName} />
          <Detail label="Leader" value={team.leaderId?.name || "-"} />
          <div className="account-subpanel px-4 py-3 md:col-span-2">
            <p className="text-xs font-semibold uppercase text-pink-600">
            Anggota
            </p>
            <ul className="mt-2 grid gap-2 text-sm font-semibold text-zinc-200 md:grid-cols-2">
              {team.members?.length ? (
                team.members.map((member) => (
                  <li key={getId(member)}>
                    {member.name} - NIM: {member.nim || "-"}
                  </li>
                ))
              ) : (
                <li>-</li>
              )}
            </ul>
          </div>
          <TransferLink value={team.buktiTransfer} />
        </div>
      )}
        </>
      )}
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div className="account-subpanel px-4 py-3">
      <p className="account-label text-pink-300">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value || "-"}</p>
    </div>
  );
}

function TransferLink({ value }) {
  if (!value) {
    return (
      <p className="text-sm font-semibold text-zinc-400">
        Belum ada bukti transfer.
      </p>
    );
  }

  return (
    <a
      href={getUploadUrl(value)}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-bold text-pink-300 hover:text-pink-200"
    >
      Lihat bukti transfer
    </a>
  );
}

function getUploadUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value}`;
}

function getId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value._id;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default MyCompetitionsPage;
