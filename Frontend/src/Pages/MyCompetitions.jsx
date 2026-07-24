import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { openProtectedFile } from "../api";
import logo from "../assets/LogoRadioactive.webp";

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
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-20 w-auto" />
        </Link>

        <div className="account-panel p-8 text-white shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Registered Competitions
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Team leaders and members can inspect their team registration details.
          </p>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {teams.length === 0 && !error ? (
              <div className="rounded-md border border-pink-100 bg-pink-50 px-4 py-5 text-sm font-semibold text-white ">
                No registered competitions found yet.
              </div>
            ) : (
              teams.map((team) => (
                <TeamRegistrationCard
                  key={team._id}
                  team={team}
                  userId={userId}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function TeamRegistrationCard({ team, userId }) {
  const isLeader = getId(team.leaderId) === userId;
  const [isViewingDetails, setIsViewingDetails] = useState(false);

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
            <p className="text-sm font-semibold text-white">
              Team: {team.teamName || "-"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Open details to inspect your team registration.
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
      <div className="flex min-w-0 flex-col gap-2 rounded-md border border-pink-100 bg-white px-4 py-3 md:col-span-2">
        <p className="text-xs font-semibold uppercase text-pink-600">
          Bukti Transfer
        </p>
        <p className="text-sm font-semibold text-zinc-500">
          No transfer proof uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-md border border-pink-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-pink-600">
          Bukti Transfer
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-600">
          Payment proof is available to view.
        </p>
      </div>
      <button
        type="button"
        onClick={() => openProtectedFile(value)}
        className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-pink-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-300 sm:w-auto"
      >
        View Transfer Proof
      </button>
    </div>
  );
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
