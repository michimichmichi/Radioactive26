import React, { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API, { openProtectedFile } from "../api";
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
  ChevronDown,
  Home,
  Check,
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

const isFile = (value) => typeof File !== "undefined" && value instanceof File;

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
      className="admin-field w-full px-4 py-3"
    />
  );
}

function Select(props) {
  const { children, value, onChange, placeholder = "Select an option", ...rest } = props;
  const dropdownRef = useRef(null);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const options = React.Children.toArray(children).filter(
    (child) => child?.type === "option",
  );
  const selectedOption = options.find((option) => option.props.value === value);

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const selectOption = (nextValue) => {
    onChange?.({ target: { value: nextValue } });
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
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-required={rest.required}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`admin-field flex w-full items-center justify-between px-4 py-3 text-left transition ${
          isOpen ? "border-pink-500 ring-2 ring-pink-500/20" : ""
        }`}
      >
        <span className={selectedOption ? "text-white" : "text-zinc-500"}>
          {selectedOption?.props.children || placeholder}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-pink-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={rest["aria-label"] || "Options"}
          className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-pink-500/70 bg-zinc-950 p-1 shadow-2xl"
        >
          {options.map((option) => {
            const isSelected = option.props.value === value;

            return (
              <button
                key={option.key || option.props.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(option.props.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-pink-600 text-white"
                    : "text-zinc-200 hover:bg-pink-500/20 hover:text-pink-200"
                }`}
              >
                {option.props.children}
                {isSelected && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      <input
        {...rest}
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        readOnly
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
    </div>
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="admin-field w-full px-4 py-3"
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

  const fetchCompetitions = async () => {
    try {
      const res = await competitionAPI.getAll();
      setCompetitions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCompetitions();
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
    role: "user",
    university: "",
    nim: "",
    ktm: "",
  };

  const [users, setUsers] = useState([]);
  const formRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [currentKtm, setCurrentKtm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCurrentKtm("");
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
    setCurrentKtm(user.ktm || "");

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
                      <button
                        type="button"
                        onClick={() => openProtectedFile(u.ktm)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
                      >
                        <FileText size={16} />
                        View Image
                      </button>
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
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCurrentTransfer("");
    setMemberSearch("");
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
  const keyword = memberSearch.trim().toLowerCase();

  return (
    String(u.name || "").toLowerCase().includes(keyword) ||
    String(u.email || "").toLowerCase().includes(keyword) ||
    String(u.university || "").toLowerCase().includes(keyword) ||
    String(u.nim || "").toLowerCase().includes(keyword)
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
            <button
              type="button"
              onClick={() => openProtectedFile(currentTransfer)}
              className="text-sm font-semibold text-pink-600"
            >
              View current buktiTransfer
            </button>
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
      placeholder="Search member by name, email, university, or NIM..."
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
                  <button
                    type="button"
                    onClick={() => openProtectedFile(team.buktiTransfer)}
                    className="mt-4 inline-flex items-center gap-2 text-pink-600"
                  >
                    <FileText size={16} />
                    buktiTransfer
                  </button>
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
    loadDashboard();
  }, []);

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
    <div className="admin-page flex min-h-screen">
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

        <Link
          to="/"
          className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-pink-500/30 px-4 py-4 font-semibold text-pink-200 transition-all duration-300 hover:bg-pink-500 hover:text-white"
        >
          <Home size={20} />
          Back to homepage
        </Link>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold capitalize text-pink-600">
            {tab}
          </h1>

        </div>

        {renderPage()}

        {authError && (
          <div className="mt-6 rounded-lg border border-pink-200 bg-white px-5 py-4 text-sm font-semibold text-pink-700 shadow-xl">
            {authError}
          </div>
        )}
      </div>
    </div>
  );
}
