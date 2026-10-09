const memberKey = (team, member) => `${team._id}:${team.competitionId}:${member._id}`;

export const mergeRacSnapshot = (current, incoming) => {
  const previous = new Map(current.teams.flatMap((team) =>
    team.members.map((member) => [memberKey(team, member), member.attendance])));
  return {
    ...incoming,
    teams: incoming.teams.map((team) => ({
      ...team,
      members: team.members.map((member) => {
        const attendance = previous.get(memberKey(team, member));
        return attendance?.version > member.attendance.version ? { ...member, attendance } : member;
      }),
    })),
  };
};

export const applyRacAttendance = (roster, update) => ({
  ...roster,
  teams: roster.teams.map((team) => team._id !== update.teamId || team.competitionId !== update.competitionId ? team : {
    ...team,
    members: team.members.map((member) =>
      member._id === update.memberId && update.attendance.version >= member.attendance.version
        ? { ...member, attendance: update.attendance } : member),
  }),
});

export const getRacAttendanceChanges = (previous, next, sourceId) => {
  const versions = new Map(previous.teams.flatMap((team) =>
    team.members.map((member) => [memberKey(team, member), member.attendance.version])));
  return next.teams.flatMap((team) => team.members
    .filter((member) => versions.has(memberKey(team, member)) &&
      member.attendance.version > versions.get(memberKey(team, member)) &&
      member.attendance.sourceId !== sourceId)
    .map((member) => `${member.name} (${team.teamName}) was marked ${member.attendance.present ? 'present' : 'not checked in'} by ${member.attendance.updatedBy}.`));
};
