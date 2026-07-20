import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
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
import { validateImageFile } from "../utils/fileValidation";


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
  create: (data) => API.post("/users", data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

const API_ORIGIN = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

const isFile = (value) => typeof File !== "undefined" && value instanceof File;

const getUploadUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value}`;
};

const buildUserFormData = (form, { includeEmptyPassword = true } = {}) => {
  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("email", form.email);
  formData.append("role", form.role);
  formData.append("university", form.university);
  formData.append("nim", form.nim);

  if (includeEmptyPassword || form.password) {
    formData.append("password", form.password);
  }

  if (isFile(form.ktm)) {
    formData.append("ktm", form.ktm);
  }

  return formData;
};

const buildTeamFormData = (form) => {
  const formData = new FormData();
  formData.append("teamName", form.teamName);
  formData.append("leaderId", form.leaderId);
  formData.append("competitionId", form.competitionId);

  form.members.forEach((memberId) => {
    formData.append("members", memberId);
  });

  if (isFile(form.buktiTransfer)) {
    formData.append("buktiTransfer", form.buktiTransfer);
  }

  return formData;
};



function SectionCard({ children }) {
  return (
    <div className="account-panel rounded-3xl p-6">
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="admin-field"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="admin-field"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="admin-field"
    />
  );
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
}



function DashboardPanel({ users, teams, competitions }) {
  const cards = [
    {
      title: "Pengguna",
      value: users.length,
      icon: ShieldAlert,
      color: "bg-pink-500",
    },
    {
      title: "Tim",
      value: teams.length,
      icon: Users,
      color: "bg-fuchsia-500",
    },
    {
      title: "Kompetisi",
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
            className="account-panel rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-500 font-medium">{card.title}</p>
                <h1 className="mt-2 text-4xl font-bold text-white">
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

  const fetchCompetitions = async () => {
    try {
      const res = await competitionAPI.getAll();
      setCompetitions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchCompetitions(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

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
            {editingId ? "Edit Kompetisi" : "Buat Kompetisi"}
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
            {editingId ? "Perbarui Kompetisi" : "Buat Kompetisi"}
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
    role: "user",
    university: "",
    nim: "",
    ktm: "",
  };

  const [users, setUsers] = useState([]);
  const formRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchUsers(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    formRef.current?.reset();
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await userAPI.update(
          editingId,
          buildUserFormData(form, { includeEmptyPassword: false }),
        );
      } else {
        await userAPI.create(buildUserFormData(form));
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
      role: user.role || "user",
      university: user.university,
      ktm: "",
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
            {editingId ? "Edit Pengguna" : "Buat Pengguna"}
          </h2>

          <Button
            onClick={resetForm}
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        <form
          ref={formRef}
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

          <Select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </Select>

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

          <div className="md:col-span-2">
  <label className="block mb-2 font-semibold text-gray-600">
    KTM
  </label>
  <Input
    type="file"
    accept="image/jpeg,image/jpg,image/png"
    onChange={(e) => {
      const file = e.target.files?.[0] || "";
      const validationError = validateImageFile(file);

      if (validationError) {
        e.target.value = "";
        alert(validationError);
        setForm({
          ...form,
          ktm: "",
        });
        return;
      }

      setForm({
        ...form,
        ktm: file,
      });
    }}
  />
</div>

          <Button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white md:col-span-2"
          >
            {editingId ? "Perbarui Pengguna" : "Buat Pengguna"}
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
                <th className="text-left py-4">role</th>
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

                  <td>{u.role || "user"}</td>

                  <td>{u.university}</td>

                  <td>{u.nim}</td>

                  <td>
                    {u.ktm ? (
                      <a
                        href={getUploadUrl(u.ktm)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
                      >
                        <FileText size={16} />
                        View Image
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

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
  const formRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [search, setSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [currentTransfer, setCurrentTransfer] = useState("");

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCurrentTransfer("");
    formRef.current?.reset();
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
        await teamAPI.update(editingId, buildTeamFormData(form));
      } else {
        await teamAPI.create(buildTeamFormData(form));
      }

      resetForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const editTeam = (team) => {
    setEditingId(team._id);
    setCurrentTransfer(team.buktiTransfer || "");

    setForm({
      teamName: team.teamName,
      leaderId: team.leaderId?._id || "",
      members: team.members?.map((m) => m._id) || [],
      competitionId: team.competitionId?._id || "",
      buktiTransfer: "",
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
          ref={formRef}
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
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => {
              const file = e.target.files?.[0] || "";
              const validationError = validateImageFile(file);

              if (validationError) {
                e.target.value = "";
                alert(validationError);
                setForm({
                  ...form,
                  buktiTransfer: "",
                });
                return;
              }

              setForm({
                ...form,
                buktiTransfer: file,
              });
            }}
          />

          {editingId && currentTransfer && (
            <a
              href={getUploadUrl(currentTransfer)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-pink-600"
            >
              View current buktiTransfer
            </a>
          )}

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
            <option value="">Select Leader</option>

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
            <option value="">Select Competition</option>

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
          <h2 className="text-2xl font-bold text-pink-600">Tim</h2>

          <div className="relative w-80">
            <Search
              className="absolute left-3 top-3 text-pink-400"
              size={18}
            />

            <input
              value={search}
              onChange={(e) => searchTeams(e.target.value)}
              placeholder="Cari tim..."
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
                    Kompetisi: {team.competitionId?.competitionName}
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
                  <strong>Ketua:</strong> {team.leaderId?.name}
                </p>

                <div className="mt-3">
                  <strong>Anggota:</strong>

                  <ul className="list-disc ml-5 mt-2 text-sm">
                    {team.members?.map((m) => (
                      <li key={m._id}>{m.name}</li>
                    ))}
                  </ul>
                </div>

                {team.buktiTransfer && (
                  <a
                    href={getUploadUrl(team.buktiTransfer)}
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
  const [authError, setAuthError] = useState("");

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const loadDashboard = async () => {
    try {
      setAuthError("");
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
      setAuthError(
        err.response?.data?.message ||
          "Unable to load admin data. Please login again with an admin account.",
      );
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const menu = [
    {
      id: "dashboard",
      label: "Dasbor",
      icon: LayoutDashboard,
    },
    {
      id: "competitions",
      label: "Kompetisi",
      icon: Trophy,
    },
    {
      id: "teams",
      label: "Tim",
      icon: Users,
    },
    {
      id: "users",
      label: "Pengguna",
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
    <div className="admin-page flex min-h-screen">
      {/* SIDEBAR */}
      <div className="w-72 border-r border-pink-500/20 bg-black/70 p-6 text-pink-300 shadow-2xl backdrop-blur-md">
        <h1 className="text-4xl font-extrabold mb-10">
          ADMIN
        </h1>

        <Link
          to="/"
          className="mb-6 flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/10"
        >
          Kembali ke Beranda
        </Link>

        <div className="space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${
                  tab === item.id
                    ? "bg-pink-500/15 text-pink-200 shadow-lg"
                    : "text-zinc-400 hover:bg-pink-500/10 hover:text-pink-200"
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
          <h1 className="font-boldfont text-4xl uppercase tracking-wide text-pink-300">
            {{ dashboard: "Dasbor", competitions: "Kompetisi", teams: "Tim", users: "Pengguna" }[tab]}
          </h1>

        </div>

        {renderPage()}

        {authError && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm font-semibold text-red-200 shadow-xl">
            {authError}
          </div>
        )}
      </div>
    </div>
  );
}
     
