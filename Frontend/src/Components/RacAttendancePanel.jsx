import { useState } from 'react';
import { CheckCircle2, RefreshCcw, Search, X } from 'lucide-react';

const formatTime = (value) => new Date(value).toLocaleString('en-GB', {
  timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

export function AttendanceNotifications({ notifications, dismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-96 max-w-[calc(100vw-3rem)] flex-col gap-3" aria-live="polite" aria-atomic="false">
      {notifications.map(({ id, message, kind }) => (
        <div key={id} role="status" className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-zinc-950 p-4 text-sm text-white shadow-2xl ${kind === 'error' ? 'border-red-400/70' : 'border-pink-400/70'}`}>
          <p className="flex-1">{message}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(id)} className="rounded p-1 text-zinc-300 hover:text-white"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

export default function RacAttendancePanel({ attendance }) {
  const [search, setSearch] = useState('');
  const { roster, loading, error, connection, pending, takeAttendance, refresh } = attendance;
  const members = roster.teams.flatMap((team) => team.members);
  const presentCount = members.filter((member) => member.attendance.present).length;
  const query = search.trim().toLowerCase();
  const teams = roster.teams.filter((team) =>
    [team.teamName, team.competitionName, ...team.members.flatMap((member) =>
      [member.name, member.nim, member.university])].some((value) => value?.toLowerCase().includes(query)));

  return (
    <div className="space-y-6">
      <div className="account-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-pink-400">Radio Announcing Competition</h2>
            <p className="mt-2 text-sm text-zinc-300">Check in each team member, including the team leader. Updates appear automatically for all admins.</p>
          </div>
          <span role="status" className={`rounded-full px-3 py-2 text-sm ${connection === 'live' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}>
            {connection === 'live' ? 'Live updates connected' : connection === 'connecting' ? 'Connecting live updates…' : 'Reconnecting live updates…'}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-xl bg-pink-500/15 px-4 py-3">{roster.teams.length} teams</span>
          <span className="rounded-xl bg-emerald-500/15 px-4 py-3 text-emerald-200">{presentCount} / {members.length} checked in</span>
          <span className="rounded-xl bg-white/5 px-4 py-3">{members.length - presentCount} awaiting check-in</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <label className="relative min-w-60 flex-1">
            <Search size={18} aria-hidden="true" className="absolute left-4 top-3.5 text-pink-400" />
            <input className="admin-field w-full py-3 pl-11 pr-4" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search RAC teams and members" placeholder="Search team, member, student ID, or institution…" />
          </label>
          <button type="button" onClick={() => refresh()} className="inline-flex items-center gap-2 rounded-xl bg-pink-500/15 px-4 py-3 text-pink-200"><RefreshCcw size={16} />Refresh</button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        {loading && <p role="status" className="mt-4 text-sm text-zinc-300">Loading RAC participants…</p>}
        {!loading && !error && !roster.teams.length && <p className="mt-4 text-sm text-zinc-300">
          {roster.competitions.length ? 'No teams are registered in RAC yet.' : 'No RAC competition found. Create a competition named RAC or Radio Announcing Competition in Competitions.'}
        </p>}
        {!loading && roster.teams.length > 0 && !teams.length && <p className="mt-4 text-sm text-zinc-300">No teams or members match your search.</p>}
      </div>

      {teams.map((team) => (
        <section key={team._id} className="account-panel overflow-hidden" aria-label={`${team.teamName} attendance`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <div><h3 className="text-xl font-bold text-white">{team.teamName}</h3><p className="mt-1 text-sm text-pink-300">{team.competitionName}</p></div>
            <span className="text-sm text-zinc-300">{team.members.filter((member) => member.attendance.present).length} / {team.members.length} checked in</span>
          </div>
          <div className="divide-y divide-white/10">
            {team.members.map((member) => {
              const busy = pending[`${team._id}:${member._id}`];
              const record = member.attendance;
              return (
                <div key={member._id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{member.name} {member.isLeader && <span className="ml-2 rounded bg-pink-500/15 px-2 py-1 text-xs text-pink-300">Leader</span>}</p>
                    <p className="mt-2 text-sm text-zinc-300">{member.nim} · {member.university}</p>
                    <p className={`mt-2 text-sm ${record.present ? 'text-emerald-300' : 'text-zinc-400'}`}>
                      {record.present ? `Present · ${formatTime(record.checkedInAt)} WIB` : 'Not checked in'}
                    </p>
                    <p className="mt-1 min-h-4 text-xs text-zinc-400">{record.updatedBy ? `Last updated by ${record.updatedBy}` : '\u00a0'}</p>
                  </div>
                  <button type="button" disabled={busy} onClick={() => takeAttendance(team._id, member)} aria-label={`${record.present ? 'Undo check-in for' : 'Check in'} ${member.name} from ${team.teamName}`} className={`inline-flex min-w-40 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${record.present ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20' : 'bg-pink-600 text-white hover:bg-pink-500'}`}>
                    <CheckCircle2 size={18} />{busy ? 'Saving…' : record.present ? 'Undo check-in' : 'Check in'}
                  </button>
                </div>
              );
            })}
            {!team.members.length && <p className="p-5 text-sm text-zinc-300">This team has no available participant records.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
