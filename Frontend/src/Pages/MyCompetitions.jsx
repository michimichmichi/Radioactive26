import { useEffect, useRef, useState } from "react";
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

  const loadTeams = async () => {
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
  };

  useEffect(() => {
    loadTeams();
  }, [userId]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-20 w-auto" />
        </Link>

        <div className=" rounded-lg bg-white p-8 text-zinc-950 shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Registered Competitions
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Leaders can manage their teams. Members can inspect team details.
          </p>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {teams.length === 0 && !error ? (
              <div className="rounded-md border border-pink-100 bg-pink-50 px-4 py-5 text-sm font-semibold text-zinc-700">
                No registered competitions found yet.
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
    setTeamName(team.teamName || "");
    setMembers(team.members || []);
    setTransferFile("");
    setNimQuery("");
    setNimResults([]);
    setMessage("");
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
    <article className="rounded-md border border-pink-100 bg-pink-50 px-4 py-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-pink-600">
            {team.competitionId?.competitionName || "Competition"}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Place: {team.competitionId?.place || "-"}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Time: {formatDate(team.competitionId?.time)}
          </p>
        </div>
        <span className="self-start rounded-md bg-white px-3 py-1 text-xs font-bold uppercase text-pink-600">
          {isLeader ? "Leader" : "Member"}
        </span>
      </div>

      {!isViewingDetails ? (
        <div className="mt-5 flex flex-col gap-3 rounded-md border border-pink-100 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-800">
              Team: {team.teamName || "-"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {isLeader
                ? "Open details to manage members and transfer proof."
                : "Open details to inspect your team registration."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsViewingDetails(true)}
            className="rounded-md bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
          >
            View Detail
          </button>
        </div>
      ) : (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setIsViewingDetails(false)}
            className="rounded-md border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
          >
            Close Detail
          </button>
        </div>
      )}

      {isViewingDetails && (
        <>
      {isLeader ? (
        <form onSubmit={saveTeam} className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Team Name
            </span>
            <input
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              required
              className="mt-2 w-full rounded-md border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
            />
          </label>

          <section className="rounded-md border border-pink-100 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="font-bold text-pink-600">Members</h3>
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
                  className="w-full rounded-md border border-pink-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
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
                    className="rounded-md border border-pink-100 bg-pink-50 px-3 py-3 text-left text-sm transition hover:border-pink-300"
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

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {members.length > 0 ? (
                members.map((member) => (
                  <div
                    key={getId(member)}
                    className="flex items-center justify-between gap-3 rounded-md border border-pink-100 bg-pink-50 px-3 py-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-zinc-900">
                        {member.name || "Member"}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">
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
                  No team members added yet.
                </p>
              )}
            </div>
          </section>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Bukti Transfer
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-md border border-pink-200 bg-white px-4 py-3 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-200">
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
                className="w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-pink-700"
              />
            </div>
          </label>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <TransferLink value={team.buktiTransfer} />
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300"
            >
              {isSaving ? "Saving..." : "Save Team"}
            </button>
          </div>

          {message && (
            <p className="rounded-md border border-pink-100 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
              {message}
            </p>
          )}
        </form>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Detail label="Team" value={team.teamName} />
          <Detail label="Leader" value={team.leaderId?.name || "-"} />
          <div className="rounded-md border border-pink-100 bg-white px-4 py-3 md:col-span-2">
            <p className="text-xs font-semibold uppercase text-pink-600">
              Members
            </p>
            <ul className="mt-2 grid gap-2 text-sm font-semibold text-zinc-800 md:grid-cols-2">
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
    <div className="rounded-md border border-pink-100 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase text-pink-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-800">{value || "-"}</p>
    </div>
  );
}

function TransferLink({ value }) {
  if (!value) {
    return (
      <p className="text-sm font-semibold text-zinc-500">
        No transfer proof uploaded.
      </p>
    );
  }

  return (
    <a
      href={getUploadUrl(value)}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-bold text-pink-600 hover:text-pink-700"
    >
      View bukti transfer
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
