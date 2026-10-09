import Competition from '../models/Competition.js';
import Team from '../models/Team.js';

// Covers RAC, full names, and category suffixes without including Podcast teams.
export const RAC_COMPETITION_NAME = /^(?:RAC\b|Radio\s+Announcing\b)/i;

export const attendanceKey = (competitionId, memberId) => `${competitionId}_${memberId}`;

export const getRacRoster = async () => {
    const competitions = await Competition.find({ competitionName: RAC_COMPETITION_NAME })
        .select('_id competitionName').sort({ competitionName: 1, _id: 1 }).lean();
    const teams = await Team.find({ competitionId: { $in: competitions.map((entry) => entry._id) } })
        .select('teamName leaderId members competitionId racAttendance')
        .sort({ teamName: 1, _id: 1 })
        .populate('leaderId', 'name nim university')
        .populate('members', 'name nim university').lean();
    const competitionNames = new Map(competitions.map((entry) => [String(entry._id), entry.competitionName]));
    return {
        competitions,
        teams: teams.map((team) => {
            const participants = new Map();
            for (const member of [team.leaderId, ...team.members]) {
                if (!member?._id || participants.has(String(member._id))) continue;
                const record = team.racAttendance?.[attendanceKey(team.competitionId, member._id)];
                participants.set(String(member._id), {
                    _id: member._id, name: member.name, nim: member.nim, university: member.university,
                    isLeader: String(member._id) === String(team.leaderId?._id),
                    attendance: record || { present: false, version: 0 }
                });
            }
            return {
                _id: team._id, teamName: team.teamName,
                competitionId: team.competitionId,
                competitionName: competitionNames.get(String(team.competitionId)),
                members: [...participants.values()]
            };
        })
    };
};

// One database poll per process, regardless of the number of connected admins.
// Reading MongoDB also synchronizes admins connected to different server workers.
const subscribers = new Set();
let timer;
let polling = false;

const poll = async () => {
    if (polling) return;
    polling = true;
    try {
        const serialized = JSON.stringify(await getRacRoster());
        for (const subscriber of subscribers) subscriber.snapshot(serialized);
    } catch {
        for (const subscriber of subscribers) subscriber.unavailable();
    } finally {
        polling = false;
    }
};

export const subscribeRacAttendance = (subscriber) => {
    subscribers.add(subscriber);
    if (!timer) timer = setInterval(poll, 2000);
    void poll();
    return () => {
        subscribers.delete(subscriber);
        if (!subscribers.size) {
            clearInterval(timer);
            timer = undefined;
        }
    };
};
