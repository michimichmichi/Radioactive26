import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API, { openProtectedFile, referralCodeAPI, otsTicketAPI } from "../api";
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
  Ticket,
  QrCode,
  Mail,
  CheckCircle2,
  XCircle,
  Tag,
  Copy,
  Plus,
  ExternalLink,
  Award,
  Share2,
  Menu,
  X,
  Banknote,
  DollarSign,
  Wallet,
  CreditCard,
} from "lucide-react";
import { validateImageFile } from "../utils/fileValidation";
import useAdminData from "../hooks/useAdminData";
import { buildTeamFormData } from "../utils/adminForms";
import useRacAttendance from "../hooks/useRacAttendance";
import RacAttendancePanel, { AttendanceNotifications } from "../Components/RacAttendancePanel";
import OtsTicketsPanel from "../Components/OtsTicketsPanel";


const competitionAPI = {
  create: (data) => API.post("/competitions", data),
  update: (id, data) => API.put(`/competitions/${id}`, data),
  delete: (id) => API.delete(`/competitions/${id}`),
};

const teamAPI = {
  update: (id, data) => API.put(`/teams/${id}`, data),
  delete: (id) => API.delete(`/teams/${id}`),
};

const userAPI = {
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



function SectionCard({ children, className = "" }) {
  return (
    <div className={`account-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function DataStatus({ loading, error, empty, emptyMessage = "No records found.", onRefresh }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div role={error ? "alert" : "status"} className="text-sm text-pink-200">
        {loading ? "Loading data…" : error || (empty ? emptyMessage : "")}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-pink-500/15 px-4 py-2 text-sm font-semibold text-pink-200 disabled:opacity-50"
      >
        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        {error ? "Retry" : "Refresh"}
      </button>
    </div>
  );
}

function useAdminAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const runAction = useCallback(async (action) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      await action();
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }, []);
  return { busy, runAction };
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
        aria-label={rest["aria-label"]}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-required={rest["aria-required"]}
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
      className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:cursor-wait disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}



function DashboardPanel() {
  const { data: stats, loading, error, refresh } = useAdminData("/admin/stats", { initialData: null });
  const cards = [
    {
      title: "Users",
      value: stats?.users ?? "…",
      icon: ShieldAlert,
      color: "bg-pink-500",
    },
    {
      title: "Teams",
      value: stats?.teams ?? "…",
      icon: Users,
      color: "bg-fuchsia-500",
    },
    {
      title: "Competitions",
      value: stats?.competitions ?? "…",
      icon: Trophy,
      color: "bg-rose-500",
    },
  ];

  return (
    <div>
      <DataStatus loading={loading} error={error} onRefresh={refresh} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}



function CompetitionsPanel() {
  const { busy, runAction } = useAdminAction();
  const emptyForm = {
    competitionName: "",
    time: "",
    place: "",
    termsAndConditions: "",
  };

  const { data: competitions, loading, error, refresh: fetchCompetitions } = useAdminData("/competitions");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

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
      alert(err.userMessage || "The request could not be completed. Please try again.");
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

    try {
      await competitionAPI.delete(id);
      fetchCompetitions();
    } catch (err) {
      alert(err.userMessage || "Unable to delete this item. Please try again.");
    }
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
            disabled={busy}
            aria-label="Reset competition form"
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        <form noValidate
          onSubmit={(event) => { event.preventDefault(); runAction(() => submitHandler(event)); }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <fieldset disabled={busy} className="contents">
          <Input
            placeholder="competitionName"
            value={form.competitionName}
            onChange={(e) =>
              setForm({ ...form, competitionName: e.target.value })
            }
            aria-required="true"
          />

          <Input
            type="datetime-local"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            aria-required="true"
          />

          <Input
            placeholder="place"
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            aria-required="true"
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
            aria-required="true"
          />

          <Button
            type="submit"
            disabled={busy}
            className="bg-pink-500 hover:bg-pink-600 text-white md:col-span-2"
          >
            {busy ? "Saving…" : editingId ? "Update Competition" : "Create Competition"}
          </Button>
          </fieldset>
        </form>
      </SectionCard>

      <SectionCard>
        <DataStatus loading={loading} error={error} empty={competitions.length === 0} onRefresh={fetchCompetitions} />
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[700px]">
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
                <tr key={comp._id} className="border-b border-pink-50 whitespace-nowrap">
                  <td className="py-4">{comp.competitionName}</td>

                  <td>{new Date(comp.time).toLocaleString()}</td>

                  <td>{comp.place}</td>

                  <td className="text-right space-x-3">
                    <button
                      disabled={busy}
                      aria-label={`Edit ${comp.competitionName}`}
                      onClick={() => editCompetition(comp)}
                      className="text-pink-600"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      disabled={busy}
                      aria-label={`Delete ${comp.competitionName}`}
                      onClick={() => runAction(() => deleteCompetition(comp._id))}
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
  const { busy, runAction } = useAdminAction();
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "user",
    university: "",
    nim: "",
    ktm: "",
  };

  const { data: users, loading, error, refresh: fetchUsers } = useAdminData("/users");
  const formRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [currentKtm, setCurrentKtm] = useState("");

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
      alert(err.userMessage || "The request could not be completed. Please try again.");
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

    try {
      await userAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.userMessage || "Unable to delete this item. Please try again.");
    }
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
            disabled={busy}
            aria-label="Reset user form"
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        <form noValidate
          ref={formRef}
          onSubmit={(event) => { event.preventDefault(); runAction(() => submitHandler(event)); }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <fieldset disabled={busy} className="contents">
          <Input
            placeholder="name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            aria-required="true"
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
            aria-required="true"
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
            aria-required="true"
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
            aria-required="true"
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

          {editingId && currentKtm && (
            <button type="button" onClick={() => openProtectedFile(currentKtm)} className="text-sm font-semibold text-pink-200">
              View current KTM
            </button>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="bg-pink-500 hover:bg-pink-600 text-white md:col-span-2"
          >
            {busy ? "Saving…" : editingId ? "Update User" : "Create User"}
          </Button>
          </fieldset>
        </form>
      </SectionCard>

      <SectionCard>
        <DataStatus loading={loading} error={error} empty={users.length === 0} onRefresh={fetchUsers} />
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[700px]">
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
                <tr key={u._id} className="border-b border-pink-50 whitespace-nowrap">
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
                      disabled={busy}
                      aria-label={`Edit ${u.name}`}
                      onClick={() => editUser(u)}
                      className="text-pink-600"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      disabled={busy}
                      aria-label={`Delete ${u.name}`}
                      onClick={() => runAction(() => deleteUser(u._id))}
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
  const { busy, runAction } = useAdminAction();
  const emptyForm = {
    teamName: "",
    leaderId: "",
    members: [],
    competitionId: "",
    buktiTransfer: "",
  };

  const formRef = useRef(null);
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("");
  const query = search.trim();
  const searchParams = new URLSearchParams();
  if (query) searchParams.set("query", query);
  if (competitionFilter) searchParams.set("competitionId", competitionFilter);
  const teamUrl = `${query ? "/teams/search" : "/teams"}${searchParams.size ? `?${searchParams}` : ""}`;
  const { data: teamData, loading, error, refresh } = useAdminData(
    teamUrl,
    { delay: query ? 300 : 0 },
  );
  const teams = query ? teamData.teams || [] : teamData;
  const userData = useAdminData("/users");
  const competitionData = useAdminData("/competitions");
  const users = userData.data;
  const competitions = competitionData.data;
  const [memberSearch, setMemberSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [currentTransfer, setCurrentTransfer] = useState("");

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
      }

      resetForm();
      refresh();
    } catch (err) {
      alert(err.userMessage || "The request could not be completed. Please try again.");
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

    try {
      await teamAPI.delete(id);
      refresh();
    } catch (err) {
      alert(err.userMessage || "Unable to delete this item. Please try again.");
    }
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
            {editingId ? "Edit Team" : "Team Details"}
          </h2>

          <Button
            onClick={resetForm}
            disabled={busy}
            aria-label="Reset team form"
            className="bg-pink-100 hover:bg-pink-200 text-pink-600"
          >
            <RefreshCcw size={18} />
          </Button>
        </div>

        {!editingId && <p className="mb-4 text-sm text-pink-200">Competition registration is closed. Select Edit on an existing team to update its details.</p>}
        <DataStatus
          loading={userData.loading || competitionData.loading}
          error={userData.error || competitionData.error}
          onRefresh={() => { userData.refresh(); competitionData.refresh(); }}
        />
        <form noValidate
          ref={formRef}
          onSubmit={(event) => { event.preventDefault(); if (editingId) runAction(() => submitHandler(event)); }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <fieldset disabled={busy || !editingId || userData.loading || competitionData.loading || Boolean(userData.error || competitionData.error)} className="contents">
          <Input
            placeholder="teamName"
            value={form.teamName}
            onChange={(e) =>
              setForm({
                ...form,
                teamName: e.target.value,
              })
            }
            aria-required="true"
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
            aria-required="true"
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
            aria-required="true"
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


  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto">
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
            {busy ? "Saving…" : editingId ? "Update Team" : "Select a team to edit"}
          </Button>
          </fieldset>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <h2 className="text-2xl font-bold text-pink-600">Teams</h2>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="w-full sm:w-64">
              <Select
                value={competitionFilter}
                onChange={(event) => setCompetitionFilter(event.target.value)}
                aria-label="Filter teams by competition"
              >
                <option value="">All competitions</option>
                {competitions.map((competition) => (
                  <option key={competition._id} value={competition._id}>
                    {competition.competitionName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-3 text-pink-400"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={80}
                aria-label="Search teams by name"
                placeholder="Search team..."
                className="w-full border border-pink-200 rounded-2xl py-3 pl-10 pr-4 bg-pink-50"
              />
            </div>
          </div>
        </div>

        <DataStatus
          loading={loading}
          error={error}
          empty={teams.length === 0}
          emptyMessage={query || competitionFilter ? "No teams match your filters." : "No teams registered."}
          onRefresh={refresh}
        />
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
                    disabled={busy}
                    aria-label={`Edit ${team.teamName}`}
                    onClick={() => editTeam(team)}
                    className="text-pink-600"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    disabled={busy}
                    aria-label={`Delete ${team.teamName}`}
                    onClick={() => runAction(() => deleteTeam(team._id))}
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



function EncoriansPanel() {
  const { busy, runAction } = useAdminAction();
  const [statusFilter, setStatusFilter] = useState("");
  const { data: encorians, loading, error, refresh: fetchEncorians } = useAdminData(
    statusFilter ? `/admin/encorians?status=${statusFilter}` : "/admin/encorians",
  );

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this ticket registration?")) return;
    try {
      const res = await API.patch(`/admin/encorians/${id}/approve`);
      if (res.status === 207) {
        alert(res.data.message || "Approved, but email sending failed.");
      }
      fetchEncorians();
    } catch (err) {
      alert(err.userMessage || "Error approving registration.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this ticket registration?")) return;
    try {
      await API.patch(`/admin/encorians/${id}/reject`);
      fetchEncorians();
    } catch (err) {
      alert(err.userMessage || "Error rejecting registration.");
    }
  };

  const handleResend = async (id) => {
    try {
      await API.patch(`/admin/encorians/${id}/resend-email`);
      alert("Email resent successfully.");
    } catch (err) {
      alert(err.userMessage || "Error resending email.");
    }
  };

  const filters = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                statusFilter === f.value
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-pink-500/20"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <DataStatus loading={loading} error={error} empty={encorians.length === 0} onRefresh={fetchEncorians} />
        {busy && <p role="status" className="mb-4 text-sm text-pink-200">Processing ticket action…</p>}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-pink-100">
                <th className="text-left py-4">Name</th>
                <th className="text-left py-4">Ref Code</th>
                <th className="text-left py-4">Email</th>
                <th className="text-left py-4">Phone</th>
                <th className="text-left py-4">Status</th>
                <th className="text-left py-4">Transfer Proof</th>
                <th className="text-left py-4">Date</th>
                <th className="text-right py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                encorians.map((e) => (
                  <tr key={e._id} className="border-b border-pink-50 whitespace-nowrap">
                    <td className="py-4">{e.name}</td>
                    <td>
                      {e.referralCode ? (
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {e.referralCode}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td>{e.email}</td>
                    <td>{e.phone}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          e.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : e.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td>
                      {e.buktiTransfer ? (
                        <button
                          onClick={() => openProtectedFile(e.buktiTransfer)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
                        >
                          <FileText size={16} /> View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="text-right space-x-3">
                      {e.status === "pending" && (
                        <>
                          <button
                            disabled={busy}
                            aria-label={`Approve ticket for ${e.name}`}
                            onClick={() => runAction(() => handleApprove(e._id))}
                            className="text-green-500"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            disabled={busy}
                            aria-label={`Reject ticket for ${e.name}`}
                            onClick={() => runAction(() => handleReject(e._id))}
                            className="text-red-500"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {e.status === "approved" && (
                        <button
                          disabled={busy}
                          aria-label={`Resend ticket email to ${e.name}`}
                          onClick={() => runAction(() => handleResend(e._id))}
                          className="text-pink-600"
                          title="Resend Email"
                        >
                          <Mail size={18} />
                        </button>
                      )}
                      {e.status === "rejected" && "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}



function ReferralCodesPanel() {
  const { busy, runAction } = useAdminAction();
  const { data: referralCodes, loading, error, refresh: fetchReferralCodes } = useAdminData(
    "/admin/referral-codes"
  );
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ panitiaName: "", targetQuota: 10, code: "" });
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 5; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm((prev) => ({ ...prev, code: `RAC-${rand}` }));
  };

  const handleOpenModal = () => {
    setForm({ panitiaName: "", targetQuota: 10, code: "" });
    generateRandomCode();
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.panitiaName.trim()) {
      alert("Committee member name is required.");
      return;
    }
    try {
      await referralCodeAPI.create(form);
      setModalOpen(false);
      fetchReferralCodes();
    } catch (err) {
      alert(err.userMessage || "Failed to create referral code.");
    }
  };

  const handleDelete = async (id, code, name) => {
    if (!window.confirm(`Delete referral code ${code} for committee member ${name}?`)) return;
    try {
      await referralCodeAPI.delete(id);
      fetchReferralCodes();
    } catch (err) {
      alert(err.userMessage || "Failed to delete referral code.");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await referralCodeAPI.update(id, { isActive: !currentStatus });
      fetchReferralCodes();
    } catch (err) {
      alert(err.userMessage || "Failed to update referral code status.");
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const copyShareLink = (code, id) => {
    const origin = window.location.origin;
    const url = `${origin}/the-encore?ref=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const items = referralCodes || [];
  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.panitiaName?.toLowerCase().includes(q) ||
      item.code?.toLowerCase().includes(q)
    );
  });

  const totalQuota = items.reduce((acc, c) => acc + (c.targetQuota || 0), 0);
  const totalApproved = items.reduce((acc, c) => acc + (c.approvedCount || 0), 0);
  const totalPending = items.reduce((acc, c) => acc + (c.pendingCount || 0), 0);
  const overallPercent = totalQuota > 0 ? Math.min(100, Math.round((totalApproved / totalQuota) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
       
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-xl bg-pink-600 hover:bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg shadow-pink-600/30"
        >
          <Plus size={18} /> Add Committee Member
        </button>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="account-panel rounded-2xl p-5 border border-pink-500/20">
          <p className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Total Committee Members</p>
          <p className="text-3xl font-extrabold text-white mt-1">{items.length}</p>
          <p className="text-xs text-pink-200/60 mt-1">Registered with referral codes</p>
        </div>

        <div className="account-panel rounded-2xl p-5 border border-pink-500/20">
          <p className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Total Target Quota</p>
          <p className="text-3xl font-extrabold text-white mt-1">{totalQuota} <span className="text-sm font-normal text-pink-300">tickets</span></p>
          <p className="text-xs text-pink-200/60 mt-1">Cumulative quota across all members</p>
        </div>

        <div className="account-panel rounded-2xl p-5 border border-pink-500/20">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Sold (Approved)</p>
          <p className="text-3xl font-extrabold text-green-400 mt-1">{totalApproved} <span className="text-sm font-normal text-green-300">tickets</span></p>
          <div className="w-full bg-black/40 rounded-full h-1.5 mt-2 overflow-hidden border border-green-500/20">
            <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallPercent}%` }}></div>
          </div>
          <p className="text-xs text-green-300/70 mt-1">{overallPercent}% of total target achieved</p>
        </div>

        <div className="account-panel rounded-2xl p-5 border border-pink-500/20">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Pending Review</p>
          <p className="text-3xl font-extrabold text-yellow-400 mt-1">{totalPending} <span className="text-sm font-normal text-yellow-300">tickets</span></p>
          <p className="text-xs text-yellow-200/60 mt-1">Awaiting transfer approval</p>
        </div>
      </div>


      <SectionCard>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/60" />
            <input
              type="text"
              placeholder="Search member name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-field w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <DataStatus loading={loading} error={error} empty={filtered.length === 0} onRefresh={fetchReferralCodes} />
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-pink-100/20 text-xs text-pink-300 uppercase tracking-wider">
                <th className="text-left py-3.5">Committee Member</th>
                <th className="text-left py-3.5">Referral Code</th>
                <th className="text-left py-3.5">Share Link</th>
                <th className="text-center py-3.5">Target</th>
                <th className="text-left py-3.5 min-w-[160px]">Sales Progress</th>
                <th className="text-center py-3.5">Pending</th>
                <th className="text-center py-3.5">Remaining Target</th>
                <th className="text-center py-3.5">Status</th>
                <th className="text-right py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-500/10 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-pink-300">
                    Loading referral data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-pink-300/60">
                    {search ? "No committee members found matching your search." : "No committee referral codes created yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const shareUrl = `${window.location.origin}/the-encore?ref=${encodeURIComponent(item.code)}`;
                  return (
                    <tr key={item._id} className="hover:bg-pink-500/5 transition-colors whitespace-nowrap">
                      <td className="py-4 font-semibold text-white">
                        {item.panitiaName}
                      </td>
                      <td>
                        <div className="inline-flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            {item.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(item.code, item._id)}
                            className="p-1 rounded hover:bg-pink-500/20 text-pink-400 transition-colors"
                            title="Copy Code"
                          >
                            {copiedCodeId === item._id ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyShareLink(item.code, item._id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-pink-500/20 text-pink-200 border border-pink-500/20 transition-colors"
                            title="Copy Registration Link"
                          >
                            {copiedLinkId === item._id ? (
                              <>
                                <Check size={12} className="text-green-400" />
                                <span className="text-green-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 size={12} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-400 hover:text-pink-300 p-1"
                            title="Open Registration Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                      <td className="text-center font-bold text-white">
                        {item.targetQuota}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-green-400">{item.approvedCount} sold</span>
                            <span className="text-pink-300/70">{item.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-pink-500/20">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.progressPercentage >= 100 ? "bg-green-400" : "bg-pink-500"
                              }`}
                              style={{ width: `${item.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        {item.pendingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            {item.pendingCount}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">0</span>
                        )}
                      </td>
                      <td className="text-center">
                        {item.remainingToTarget > 0 ? (
                          <span className="text-pink-200 text-xs font-medium">
                            {item.remainingToTarget} tickets
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-green-400 flex items-center justify-center gap-1">
                            <Check size={12} /> Target Reached!
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item._id, item.isActive)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            item.isActive
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          }`}
                          title="Click to toggle status"
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(item._id, item.code, item.panitiaName)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>


      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="account-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-pink-500/30 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-pink-500 mb-2">Add Committee Member Quota</h3>
            <p className="text-xs text-pink-200/70 mb-6">
              Create a dedicated referral code for committee members to track The Encore ticket sales targets.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="account-label block mb-2">Committee Member Name / Division</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Putri (Public Relations)"
                  className="admin-field w-full px-4 py-3"
                  value={form.panitiaName}
                  onChange={(e) => setForm({ ...form, panitiaName: e.target.value })}
                />
              </div>

              <div>
                <label className="account-label block mb-2">Target Quota (Number of Tickets)</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="admin-field w-full px-4 py-3"
                  value={form.targetQuota}
                  onChange={(e) => setForm({ ...form, targetQuota: Number(e.target.value) })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="account-label">Referral Code</label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-xs font-semibold text-pink-400 hover:text-pink-300 underline"
                  >
                    Regenerate
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="RAC-XXXXX"
                    className="admin-field flex-1 px-4 py-3 uppercase tracking-wider font-mono font-bold"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-semibold text-xs border border-pink-500/30"
                  >
                    Auto-generate
                  </button>
                </div>
                <p className="text-xs text-pink-300/60 mt-1">
                  Prefix with RAC- followed by 5 unique characters (customizable).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-pink-500/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-pink-500/30 text-pink-200 text-sm font-semibold hover:bg-pink-500/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold shadow-lg shadow-pink-600/30"
                >
                  Save & Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p) return p;
    }
    return "dashboard";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const attendance = useRacAttendance();

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
      id: "rac-attendance",
      label: "RAC Attendance",
      icon: CheckCircle2,
    },
    {
      id: "users",
      label: "Users",
      icon: ShieldAlert,
    },
    {
      id: "encorians",
      label: "The Encore",
      icon: Ticket,
    },
    {
      id: "referral-codes",
      label: "Committee Quotas",
      icon: Tag,
    },
    {
      id: "ots-tickets",
      label: "OTS Tickets",
      icon: Banknote,
    },
  ];

  const currentTab = menu.find((item) => item.id === tab);

  const handleSelectTab = (tabId) => {
    setTab(tabId);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPage = () => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardPanel />
        );

      case "competitions":
        return <CompetitionsPanel />;

      case "teams":
        return <TeamsPanel />;

      case "users":
        return <UsersPanel />;

      case "rac-attendance":
        return <RacAttendancePanel attendance={attendance} />;

      case "encorians":
        return <EncoriansPanel />;

      case "referral-codes":
        return <ReferralCodesPanel />;

      case "ots-tickets":
        return <OtsTicketsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="admin-page flex min-h-screen flex-col md:flex-row">

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-pink-500/25 bg-black/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-pink-500 tracking-wider">
            ADMIN
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 truncate max-w-[130px]">
            {currentTab?.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/scanner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 transition-all"
          >
            <QrCode size={15} />
            Scanner
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl bg-pink-500/15 text-pink-300 hover:bg-pink-500/25 border border-pink-500/25 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>


      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[53px] bottom-0 z-30 flex flex-col bg-black/95 backdrop-blur-xl p-4 overflow-y-auto border-b border-pink-500/30 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 px-1">
            Navigation
          </p>
          <div className="space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                      : "text-pink-200 hover:bg-pink-500/15"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-pink-500/20 space-y-2">
            <Link
              to="/admin/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-2xl border border-pink-500/40 bg-pink-500/10 px-4 py-3 text-sm font-bold text-pink-200"
            >
              <QrCode size={18} className="text-pink-400" />
              Ticket Scanner
            </Link>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white"
            >
              <Home size={18} />
              Back to homepage
            </Link>
          </div>
        </div>
      )}


      <div className="hidden md:flex md:flex-col md:w-72 md:shrink-0 bg-gradient-to-b bg-black p-6 text-pink-600 shadow-2xl md:min-h-screen md:sticky md:top-0">
        <h1 className="text-4xl font-extrabold mb-10">
          ADMIN
        </h1>

        <div className="grid grid-cols-2 gap-3 md:block md:space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
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
          to="/admin/scanner"
          className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-pink-500/30 px-4 py-4 font-semibold text-pink-200 transition-all duration-300 hover:bg-pink-500 hover:text-white"
        >
          <QrCode size={20} />
          Ticket Scanner
        </Link>

        <Link
          to="/"
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-pink-500/30 px-4 py-4 font-semibold text-pink-200 transition-all duration-300 hover:bg-pink-500 hover:text-white"
        >
          <Home size={20} />
          Back to homepage
        </Link>
      </div>


      <div className="min-w-0 flex-1 p-4 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold capitalize text-pink-600 sm:text-5xl">
            {menu.find((item) => item.id === tab)?.label}
          </h1>

        </div>

        {renderPage()}

      </div>
      <AttendanceNotifications notifications={attendance.notifications} dismiss={attendance.dismiss} />
    </div>
  );
}
