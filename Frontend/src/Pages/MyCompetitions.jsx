import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import logo from "../assets/LogoRadioactive.png";

function MyCompetitionsPage() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id;

  useEffect(() => {
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

    loadTeams();
  }, [userId]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-14 w-auto" />
        </Link>

        <div className="mt-8 rounded-lg bg-white p-8 text-zinc-950 shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Registered Competitions
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Competitions connected to teams where you are the leader or a member.
          </p>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {teams.length === 0 && !error ? (
              <div className="rounded-md border border-pink-100 bg-pink-50 px-4 py-5 text-sm font-semibold text-zinc-700">
                No registered competitions found yet.
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team._id}
                  className="rounded-md border border-pink-100 bg-pink-50 px-4 py-4"
                >
                  <h2 className="text-lg font-bold text-pink-600">
                    {team.competitionId?.competitionName || "Competition"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-zinc-800">
                    Team: {team.teamName}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Place: {team.competitionId?.place || "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function getId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value._id;
}

export default MyCompetitionsPage;
