import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Users,
  ShieldAlert,
  Trash2,
  Edit,
  Search,
  FileText,
  LayoutDashboard,
  RefreshCcw,
} from "lucide-react";



const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const competitionAPI = {
  getAll: () => API.get("/competitions"),
  create: (data) => API.post("/competitions", data),
  update: (id, data) => API.put(`/competitions/${id}`, data),
  delete: (id) => API.delete(`/competitions/${id}`),
};

const teamAPI = {
  getAll: () => API.get("/teams"),
  search: (query) => API.get(`/teams/search?query=${query}`),
  create: (data) => API.post("/teams", data),
  update: (id, data) => API.put(`/teams/${id}`, data),
  delete: (id) => API.delete(`/teams/${id}`),
};

const userAPI = {
  getAll: () => API.get("/users"),
  create: (data) => API.post("/users/register", data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};



function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6">
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border border-pink-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full border border-pink-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full border border-pink-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50"
    />
  );
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
}



function DashboardPanel({ users, teams, competitions }) {
  const cards = [
    {
      title: "Users",
      value: users.length,
      icon: ShieldAlert,
      color: "bg-pink-500",
    },
    {
      title: "Teams",
      value: teams.length,
      icon: Users,
      color: "bg-fuchsia-500",
    },
    {
      title: "Competitions",
      value: competitions.length,
      icon: Trophy,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className=" grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;

        return (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-500 font-medium">{card.title}</p>
                <h1 className="text-4xl font-bold mt-2 text-slate-800">
                  {card.value}
                </h1>
              </div>

              <div className={`${card.color} p-4 rounded-2xl text-white`}>
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}



function CompetitionsPanel() {
  const emptyForm = {
    competitionName: "",
    time: "",
    place: "",
    termsAndConditions: "",
  };

  const [competitions, setCompetitions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const res = await competitionAPI.getAll();
      setCompetitions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await competitionAPI.update(editingId, form);
      } else {
        await competitionAPI.create(form);
      }

      resetForm();
      fetchCompetitions();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const editCompetition = (comp) => {
    setEditingId(comp._id);

    setForm({
      competitionName: comp.competitionName,
      time: comp.time?.substring(0, 16),
      place: comp.place,
      termsAndConditions: comp.termsAndConditions,
    });
  };

  const deleteCompetition = async (id) => {
    if (!window.confirm("Delete competition?")) return;

    await competitionAPI.delete(id);
    fetchCompetitions();
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-pink-600">
            {editingId ? "Edit Competition" : "Create Competition"}
          </h2>

          <Button
            onClick={resetForm}
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            placeholder="competitionName"
            value={form.competitionName}
            onChange={(e) =>
              setForm({ ...form, competitionName: e.target.value })
            }
            required
          />

          <Input
            type="datetime-local"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />

          <Input
            placeholder="place"
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            required
          />

          <Textarea
            placeholder="termsAndConditions"
            value={form.termsAndConditions}
            onChange={(e) =>
              setForm({
                ...form,
                termsAndConditions: e.target.value,
              })
            }
            required
          />

          <Button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white md:col-span-2"
          >
            {editingId ? "Update Competition" : "Create Competition"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-100">
                <th className="text-left py-4">competitionName</th>
                <th className="text-left py-4">time</th>
                <th className="text-left py-4">place</th>
                <th className="text-right py-4">actions</th>
              </tr>
            </thead>

            <tbody>
              {competitions.map((comp) => (
                <tr key={comp._id} className="border-b border-pink-50">
                  <td className="py-4">{comp.competitionName}</td>

                  <td>{new Date(comp.time).toLocaleString()}</td>

                  <td>{comp.place}</td>

                  <td className="text-right space-x-3">
                    <button
                      onClick={() => editCompetition(comp)}
                      className="text-pink-600"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => deleteCompetition(comp._id)}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}



function UsersPanel() {
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    university: "",
    nim: "",
    ktm: "",
  };

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const payload = { ...form };

        if (!payload.password) {
          delete payload.password;
        }

        await userAPI.update(editingId, payload);
      } else {
        await userAPI.create(form);
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const editUser = (user) => {
    setEditingId(user._id);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      university: user.university,
      ktm: user.ktm,
      nim: user.nim,
    });
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    await userAPI.delete(id);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-pink-600">
            {editingId ? "Edit User" : "Create User"}
          </h2>

          <Button
            onClick={resetForm}
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            placeholder="name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />

          <Input
            type="email"
            placeholder="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          <Input
            type="password"
            placeholder="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <Input
            placeholder="university"
            value={form.university}
            onChange={(e) =>
              setForm({
                ...form,
                university: e.target.value,
              })
            }
            required
          />
          <Input
            placeholder="nim"
            value={form.nim}
            onChange={(e) =>
              setForm({
                ...form,
                nim: e.target.value,
              })
            }
            required
          />

          <Input
            placeholder="ktm"
            value={form.ktm}
            onChange={(e) =>
              setForm({
                ...form,
                ktm: e.target.value,
              })
            }
          />

          <Button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white md:col-span-2"
          >
            {editingId ? "Update User" : "Create User"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-100">
                <th className="text-left py-4">name</th>
                <th className="text-left py-4">email</th>
                <th className="text-left py-4">university</th>
                <th className="text-left py-4">nim</th>
                <th className="text-left py-4">ktm</th>
                <th className="text-right py-4">actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-pink-50">
                  <td className="py-4">{u.name}</td>

                  <td>{u.email}</td>

                  <td>{u.university}</td>

                  <td>{u.nim}</td>

                  <td>{u.ktm}</td>

                  <td className="text-right space-x-3">
                    <button
                      onClick={() => editUser(u)}
                      className="text-pink-600"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}



function TeamsPanel() {
  const emptyForm = {
    teamName: "",
    leaderId: "",
    members: [],
    competitionId: "",
    buktiTransfer: "",
  };

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [search, setSearch] = useState("");
const [memberSearch, setMemberSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsRes, usersRes, competitionsRes] = await Promise.all([
        teamAPI.getAll(),
        userAPI.getAll(),
        competitionAPI.getAll(),
      ]);

      setTeams(teamsRes.data);
      setUsers(usersRes.data);
      setCompetitions(competitionsRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleMemberChange = (id) => {
    if (form.members.includes(id)) {
      setForm({
        ...form,
        members: form.members.filter((m) => m !== id),
      });
    } else {
      setForm({
        ...form,
        members: [...form.members, id],
      });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await teamAPI.update(editingId, form);
      } else {
        await teamAPI.create(form);
      }

      resetForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const editTeam = (team) => {
    setEditingId(team._id);

    setForm({
      teamName: team.teamName,
      leaderId: team.leaderId?._id || "",
      members: team.members?.map((m) => m._id),
      competitionId: team.competitionId?._id || "",
      buktiTransfer: team.buktiTransfer,
    });
  };

  const deleteTeam = async (id) => {
    if (!window.confirm("Delete team?")) return;

    await teamAPI.delete(id);
    loadData();
  };

  const searchTeams = async (value) => {
    setSearch(value);

    if (!value.trim()) {
      loadData();
      return;
    }

    const res = await teamAPI.search(value);
    setTeams(res.data.teams);
  };

  const filteredUsers = users.filter((u) => {
  const keyword = memberSearch.toLowerCase();

  return (
    u.name.toLowerCase().includes(keyword) ||
    u.email.toLowerCase().includes(keyword) ||
    u.university.toLowerCase().includes(keyword) ||
    u.nim.toLowerCase().includes(keyword)
  );
});

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-pink-600">
            {editingId ? "Edit Team" : "Create Team"}
          </h2>

          <Button
            onClick={resetForm}
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            placeholder="teamName"
            value={form.teamName}
            onChange={(e) =>
              setForm({
                ...form,
                teamName: e.target.value,
              })
            }
            required
          />

          <Input
            placeholder="buktiTransfer"
            value={form.buktiTransfer}
            onChange={(e) =>
              setForm({
                ...form,
                buktiTransfer: e.target.value,
              })
            }
          />

          <Select
            value={form.leaderId}
            onChange={(e) =>
              setForm({
                ...form,
                leaderId: e.target.value,
              })
            }
            required
          >
            <option value="">Select leaderId</option>

            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </Select>

          <Select
            value={form.competitionId}
            onChange={(e) =>
              setForm({
                ...form,
                competitionId: e.target.value,
              })
            }
            required
          >
            <option value="">Select competitionId</option>

            {competitions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.competitionName}
              </option>
            ))}
          </Select>

       <div className="md:col-span-2 border border-pink-200 rounded-2xl p-4 bg-pink-50">
  <h3 className="font-semibold mb-3 text-pink-600">
    Members
  </h3>

  {/* Search box */}
  <div className="relative mb-4">
    <Search
      className="absolute left-3 top-3 text-pink-400"
      size={18}
    />

    <input
      type="text"
      value={memberSearch}
      onChange={(e) => setMemberSearch(e.target.value)}
      placeholder="Search member by name, email or university..."
      className="w-full border border-pink-200 rounded-2xl py-3 pl-10 pr-4 bg-white"
    />
  </div>

  {/* Members */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto">
    {filteredUsers.length > 0 ? (
      filteredUsers.map((u) => (
        <label
          key={u._id}
          className="flex items-center gap-2 text-sm"
        >
          <input
            type="checkbox"
            checked={form.members.includes(u._id)}
            onChange={() => handleMemberChange(u._id)}
          />

         <div className="flex flex-col">
        <span className="font-medium">{u.name}</span>
        <span className="text-xs text-gray-500">
          NIM: {u.nim}
        </span>
</div>
        </label>
      ))
    ) : (
      <p className="text-gray-500 text-sm col-span-4">
        No users found.
      </p>
    )}
  </div>
</div>

          <Button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white md:col-span-2"
          >
            {editingId ? "Update Team" : "Create Team"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-pink-600">Teams</h2>

          <div className="relative w-80">
            <Search
              className="absolute left-3 top-3 text-pink-400"
              size={18}
            />

            <input
              value={search}
              onChange={(e) => searchTeams(e.target.value)}
              placeholder="Search team..."
              className="w-full border border-pink-200 rounded-2xl py-3 pl-10 pr-4 bg-pink-50"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              className="border border-pink-100 rounded-3xl p-5 bg-white shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-xl text-pink-600">
                    {team.teamName}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Competition: {team.competitionId?.competitionName}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editTeam(team)}
                    className="text-pink-600"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => deleteTeam(team._id)}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p>
                  <strong>leaderId:</strong> {team.leaderId?.name}
                </p>

                <div className="mt-3">
                  <strong>members:</strong>

                  <ul className="list-disc ml-5 mt-2 text-sm">
                    {team.members?.map((m) => (
                      <li key={m._id}>{m.name}</li>
                    ))}
                  </ul>
                </div>

                {team.buktiTransfer && (
                  <a
                    href={team.buktiTransfer}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-pink-600"
                  >
                    <FileText size={16} />
                    buktiTransfer
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}



export default function Admin() {
  const [tab, setTab] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [u, t, c] = await Promise.all([
        userAPI.getAll(),
        teamAPI.getAll(),
        competitionAPI.getAll(),
      ]);

      setUsers(u.data || []);
      setTeams(t.data || []);
      setCompetitions(c.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const menu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "competitions",
      label: "Competitions",
      icon: Trophy,
    },
    {
      id: "teams",
      label: "Teams",
      icon: Users,
    },
    {
      id: "users",
      label: "Users",
      icon: ShieldAlert,
    },
  ];

  const renderPage = () => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardPanel
            users={users}
            teams={teams}
            competitions={competitions}
          />
        );

      case "competitions":
        return <CompetitionsPanel />;

      case "teams":
        return <TeamsPanel />;

      case "users":
        return <UsersPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* SIDEBAR */}
      <div className="w-72 bg-gradient-to-b bg-black text-pink-600 p-6 shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-10">
          ADMIN
        </h1>

        <div className="space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${
                  tab === item.id
                    ? "bg-white text-pink-600 shadow-lg"
                    : "hover:bg-pink-400"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold capitalize text-pink-600">
            {tab}
          </h1>

        </div>

        {renderPage()}
      </div>
    </div>
  );
}
     