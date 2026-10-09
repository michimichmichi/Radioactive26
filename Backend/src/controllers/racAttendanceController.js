import Team from '../models/Team.js';
import Competition from '../models/Competition.js';
import { sendError } from '../middleware/errorHandler.js';
import { isValidObjectId } from '../utils/security.js';
import {
    attendanceKey, getRacRoster, RAC_COMPETITION_NAME, subscribeRacAttendance
} from '../services/racAttendanceService.js';

export const getRacAttendance = async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        return res.json(await getRacRoster());
    } catch (error) {
        return sendError(error, req, res);
    }
};

export const updateRacAttendance = async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const { present, version, sourceId = '' } = req.body;
        if (!isValidObjectId(teamId) || !isValidObjectId(memberId) ||
            typeof present !== 'boolean' || !Number.isSafeInteger(version) || version < 0 ||
            typeof sourceId !== 'string' || !/^[a-zA-Z0-9-]{0,64}$/.test(sourceId)) {
            return res.status(400).json({ message: 'Select a valid participant and attendance status.' });
        }
        const team = await Team.findById(teamId).select('competitionId leaderId members racAttendance').lean();
        if (!team) return res.status(404).json({ message: 'This team is no longer registered.' });
        const isParticipant = [team.leaderId, ...team.members].some((id) => String(id) === memberId);
        const competition = await Competition.exists({ _id: team.competitionId, competitionName: RAC_COMPETITION_NAME });
        if (!isParticipant || !competition) {
            return res.status(404).json({ message: 'This participant is not registered in RAC.' });
        }
        const identity = { teamId, memberId, competitionId: String(team.competitionId) };
        const field = `racAttendance.${attendanceKey(team.competitionId, memberId)}`;
        const current = team.racAttendance?.[attendanceKey(team.competitionId, memberId)];
        if ((current?.present || false) === present) {
            return res.json({ ...identity, attendance: current || { present: false, version: 0 } });
        }
        const now = new Date();
        const attendance = {
            present, checkedInAt: present ? now : null, updatedAt: now,
            updatedBy: req.user.email, version: version + 1, sourceId
        };
        // Compare-and-set prevents stale screens from undoing a newer admin's change.
        // Different participants have separate fields and can be updated concurrently.
        const updated = await Team.findOneAndUpdate({
            _id: teamId, competitionId: team.competitionId,
            $or: [{ leaderId: memberId }, { members: memberId }],
            [`${field}.version`]: version === 0 ? { $exists: false } : version
        }, { $set: { [field]: attendance } }, { returnDocument: 'after', runValidators: true })
            .select('competitionId racAttendance').lean();
        if (!updated) {
            const latest = await Team.findById(teamId).select('competitionId leaderId members racAttendance').lean();
            const latestAttendance = latest?.racAttendance?.[attendanceKey(team.competitionId, memberId)];
            if (!latest || String(latest.competitionId) !== String(team.competitionId) ||
                ![latest.leaderId, ...latest.members].some((id) => String(id) === memberId)) {
                return res.status(409).json({ message: 'The team registration changed. Refresh the attendance list.' });
            }
            return res.status(latestAttendance?.present === present ? 200 : 409).json({
                message: 'Another admin updated this attendance. The latest status has been loaded.',
                ...identity, attendance: latestAttendance || { present: false, version: 0 }
            });
        }
        return res.json({ ...identity, attendance });
    } catch (error) {
        return sendError(error, req, res);
    }
};

export const streamRacAttendance = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.write('retry: 3000\n\n');
    let previous;
    const unsubscribe = subscribeRacAttendance({
        snapshot(serialized) {
            if (res.destroyed) return;
            if (serialized !== previous) {
                res.write(`event: snapshot\ndata: ${serialized}\n\n`);
                previous = serialized;
            }
            res.write('event: synced\ndata: {}\n\n');
        },
        unavailable() {
            if (!res.destroyed) res.write('event: unavailable\ndata: {}\n\n');
        }
    });
    const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 15000);
    // Reconnect periodically through authentication to enforce session expiry/revocation.
    const expiry = setTimeout(() => res.end(), 60000);
    res.on('close', () => {
        unsubscribe();
        clearInterval(heartbeat);
        clearTimeout(expiry);
    });
};
