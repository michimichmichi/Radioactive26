import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import mongoose from 'mongoose';
import Team from '../src/models/Team.js';
import Competition from '../src/models/Competition.js';
import User from '../src/models/User.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import { generateToken } from '../src/middleware/auth.js';
import { getRacRoster, attendanceKey, RAC_COMPETITION_NAME } from '../src/services/racAttendanceService.js';
import { updateRacAttendance } from '../src/controllers/racAttendanceController.js';
import { applyRacAttendance, getRacAttendanceChanges, mergeRacSnapshot } from '../../Frontend/src/utils/racAttendance.js';

const id = () => new mongoose.Types.ObjectId();
const recorder = () => ({
    locals: {}, statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
});

function fixtures(t) {
    const leader = { _id: id(), name: 'Leader', nim: '100', university: 'Campus' };
    const member = { _id: id(), name: 'Member', nim: '101', university: 'Campus' };
    const competition = { _id: id(), competitionName: 'Radio Announcing Competition - University' };
    const team = { _id: id(), teamName: 'Team Alpha', leaderId: leader._id,
        members: [member._id, leader._id], competitionId: competition._id, racAttendance: {} };
    const copy = () => ({ ...team, members: [...team.members], racAttendance: { ...team.racAttendance } });
    t.mock.method(Competition.collection, 'find', (filter) => ({
        toArray: async () => filter.competitionName.test(competition.competitionName) ? [{ ...competition }] : []
    }));
    t.mock.method(Competition.collection, 'findOne', (filter) => Promise.resolve(
        filter._id.equals(competition._id) && filter.competitionName.test(competition.competitionName) ? { _id: competition._id } : null
    ));
    t.mock.method(Team.collection, 'find', (filter, options) => {
        assert.equal(options.projection.racAttendance, 1, 'attendance must be explicitly selected');
        assert.equal(options.limit, undefined, 'every RAC team must be listed');
        return { toArray: async () => filter.competitionId.$in.some((value) => value.equals(team.competitionId)) ? [copy()] : [] };
    });
    t.mock.method(Team.collection, 'findOne', (filter, options) => {
        assert.equal(options.projection.racAttendance, 1, 'updates must read persisted attendance');
        return Promise.resolve(filter._id.equals(team._id) ? copy() : null);
    });
    t.mock.method(User.collection, 'find', (filter) => ({
        toArray: async () => [leader, member].filter((user) => filter._id.$in.some((value) => value.equals(user._id)))
    }));
    const updateMock = t.mock.method(Team.collection, 'findOneAndUpdate', async (filter, update, options) => {
        assert.equal(options.projection.racAttendance, 1);
        assert.equal(options.returnDocument, 'after');
        const field = Object.keys(filter).find((key) => key.endsWith('.version'));
        const key = field.split('.')[1];
        const current = team.racAttendance[key];
        const matches = typeof filter[field] === 'object' ? !current : current?.version === filter[field];
        if (!matches) return null;
        assert.ok(filter.competitionId.equals(team.competitionId));
        assert.ok(filter.$or[0].leaderId.equals(leader._id) || filter.$or[1].members.equals(member._id));
        team.racAttendance[key] = update.$set[`racAttendance.${key}`];
        return copy();
    });
    return { team, leader, member, competition, updateMock };
}

const request = (fixture, { member = fixture.member, present = true, version = 0, sourceId = 'admin-a' } = {}) => ({
    params: { teamId: String(fixture.team._id), memberId: String(member._id) },
    body: { present, version, sourceId }, user: { email: 'admin@example.com' }
});

test('RAC roster includes leaders once, all members, and persisted attendance; excludes other competitions', async (t) => {
    const fixture = fixtures(t);
    fixture.team.racAttendance[attendanceKey(fixture.competition._id, fixture.member._id)] = {
        present: true, checkedInAt: new Date(), updatedAt: new Date(), updatedBy: 'other@example.com', version: 3
    };
    const roster = await getRacRoster();
    assert.equal(roster.teams.length, 1);
    assert.equal(roster.teams[0].members.length, 2);
    assert.equal(roster.teams[0].members[0].isLeader, true);
    assert.equal(roster.teams[0].members[0].attendance.version, 0);
    assert.equal(roster.teams[0].members[1].attendance.version, 3);
    assert.equal(roster.teams[0].members[1].attendance.present, true);
    for (const name of ['RAC', 'RAC - High School', 'Radio Announcing', 'Radio Announcing Competition']) assert.ok(RAC_COMPETITION_NAME.test(name));
    for (const name of ['Podcast Competition', 'Radio Drama Challenge', 'Track Race']) assert.equal(RAC_COMPETITION_NAME.test(name), false);
    fixture.competition.competitionName = 'Podcast Competition';
    assert.equal((await getRacRoster()).teams.length, 0);
});

test('attendance persists independently for concurrent members and repeated check-ins are idempotent', async (t) => {
    const fixture = fixtures(t);
    const responses = [recorder(), recorder()];
    await Promise.all([
        updateRacAttendance(request(fixture), responses[0]),
        updateRacAttendance(request(fixture, { member: fixture.leader }), responses[1])
    ]);
    for (const response of responses) {
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.attendance.version, 1);
        assert.equal(response.body.attendance.present, true);
        assert.equal(response.body.attendance.updatedBy, 'admin@example.com');
        assert.ok(response.body.attendance.checkedInAt instanceof Date);
    }
    assert.equal(Object.keys(fixture.team.racAttendance).length, 2);
    const repeated = recorder();
    await updateRacAttendance(request(fixture), repeated);
    assert.equal(repeated.body.attendance.version, 1);
    assert.equal(fixture.updateMock.mock.callCount(), 2);
    const undo = recorder();
    await updateRacAttendance(request(fixture, { present: false, version: 1 }), undo);
    assert.equal(undo.body.attendance.version, 2);
    assert.equal(undo.body.attendance.checkedInAt, null);
    assert.equal((await getRacRoster()).teams[0].members[1].attendance.present, false);
});

test('two admins checking in the same member produce one record and stale undo cannot overwrite it', async (t) => {
    const fixture = fixtures(t);
    const a = recorder();
    const b = recorder();
    await Promise.all([updateRacAttendance(request(fixture), a), updateRacAttendance(request(fixture, { sourceId: 'admin-b' }), b)]);
    assert.equal(a.statusCode, 200);
    assert.equal(b.statusCode, 200);
    assert.equal(a.body.attendance.version, 1);
    assert.equal(b.body.attendance.version, 1);
    const staleUndo = recorder();
    await updateRacAttendance(request(fixture, { present: false, version: 0 }), staleUndo);
    assert.equal(staleUndo.statusCode, 409);
    assert.equal(staleUndo.body.attendance.present, true);
    assert.equal(staleUndo.body.attendance.version, 1);
});

test('attendance rejects invalid requests, nonmembers, missing teams and non-RAC teams', async (t) => {
    const fixture = fixtures(t);
    for (const patch of [{ present: 'true' }, { version: -1 }, { version: '0' }, { sourceId: '../bad' }]) {
        const req = request(fixture);
        Object.assign(req.body, patch);
        const response = recorder();
        await updateRacAttendance(req, response);
        assert.equal(response.statusCode, 400);
    }
    for (const params of [{ teamId: 'invalid' }, { memberId: 'invalid' }]) {
        const req = request(fixture);
        Object.assign(req.params, params);
        const response = recorder();
        await updateRacAttendance(req, response);
        assert.equal(response.statusCode, 400);
    }
    for (const req of [request(fixture, { member: { _id: id() } }), {
        ...request(fixture), params: { ...request(fixture).params, teamId: String(id()) }
    }]) {
        const response = recorder();
        await updateRacAttendance(req, response);
        assert.equal(response.statusCode, 404);
    }
    fixture.competition.competitionName = 'Podcast Competition';
    const response = recorder();
    await updateRacAttendance(request(fixture), response);
    assert.equal(response.statusCode, 404);
    assert.equal(fixture.updateMock.mock.callCount(), 0);
});

async function startServer(t, role = 'admin') {
    const previous = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'rac-attendance-tests-secret-at-least-32-characters';
    t.after(() => { if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous; });
    const user = { _id: id(), role, email: 'admin@example.com' };
    t.mock.method(User, 'findById', () => ({ select: async () => user }));
    const app = express();
    app.use(express.json());
    app.use('/admin', adminRoutes);
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));
    return { url: `http://127.0.0.1:${server.address().port}/admin/rac-attendance`,
        headers: { Authorization: `Bearer ${generateToken(user)}` } };
}

test('all attendance endpoints require authenticated admins', async (t) => {
    const { url, headers } = await startServer(t, 'user');
    for (const [path, method] of [['', 'GET'], ['/stream', 'GET'], [`/${id()}/members/${id()}`, 'PATCH']]) {
        assert.equal((await fetch(url + path, { method })).status, 401);
        assert.equal((await fetch(url + path, { method, headers })).status, 403);
    }
});

async function nextSnapshot(reader) {
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { value, done } = await reader.read();
        if (done) throw new Error('Stream ended before a snapshot arrived');
        buffer += decoder.decode(value, { stream: true });
        const match = buffer.match(/event: snapshot\ndata: ([^\n]+)\n\n/);
        if (match) return JSON.parse(match[1]);
    }
}

test('two live admin streams receive another admin check-in and reconnect recovers persisted data', async (t) => {
    const fixture = fixtures(t);
    const { url, headers } = await startServer(t);
    const controllers = [new AbortController(), new AbortController(), new AbortController()];
    t.after(() => controllers.forEach((controller) => controller.abort()));
    const timeout = setTimeout(() => controllers.forEach((controller) => controller.abort()), 12000);
    t.after(() => clearTimeout(timeout));
    const streams = await Promise.all(controllers.slice(0, 2).map((controller) => fetch(`${url}/stream`, { headers, signal: controller.signal })));
    for (const stream of streams) {
        assert.equal(stream.status, 200);
        assert.match(stream.headers.get('content-type'), /text\/event-stream/);
        assert.equal(stream.headers.get('x-accel-buffering'), 'no');
    }
    const readers = streams.map((stream) => stream.body.getReader());
    const initial = await Promise.all(readers.map(nextSnapshot));
    for (const snapshot of initial) assert.equal(snapshot.teams[0].members[1].attendance.present, false);
    const updates = readers.map(nextSnapshot);
    const patch = await fetch(`${url}/${fixture.team._id}/members/${fixture.member._id}`, {
        method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ present: true, version: 0, sourceId: 'admin-a' })
    });
    assert.equal(patch.status, 200);
    for (const snapshot of await Promise.all(updates)) {
        assert.equal(snapshot.teams[0].members[1].attendance.present, true);
        assert.equal(snapshot.teams[0].members[1].attendance.version, 1);
    }
    controllers.slice(0, 2).forEach((controller) => controller.abort());
    const reconnected = await fetch(`${url}/stream`, { headers, signal: controllers[2].signal });
    assert.equal((await nextSnapshot(reconnected.body.getReader())).teams[0].members[1].attendance.present, true);
    controllers[2].abort();
});

test('frontend reconciliation preserves newer changes and reports remote updates without echoing own actions', () => {
    const makeRoster = (version, present = true, sourceId = 'admin-b') => ({ competitions: [], teams: [{
        _id: 'team', competitionId: 'rac', teamName: 'Alpha', members: [{
            _id: 'member', name: 'Member', attendance: { version, present, sourceId, updatedBy: 'b@example.com' }
        }]
    }] });
    const previous = makeRoster(0, false);
    const current = makeRoster(2, false);
    assert.equal(mergeRacSnapshot(current, makeRoster(1)).teams[0].members[0].attendance.version, 2);
    assert.equal(applyRacAttendance(current, {
        teamId: 'team', memberId: 'member', competitionId: 'rac', attendance: { version: 1, present: true }
    }).teams[0].members[0].attendance.version, 2);
    assert.equal(applyRacAttendance(previous, {
        teamId: 'team', memberId: 'member', competitionId: 'old-rac', attendance: { version: 9, present: true }
    }).teams[0].members[0].attendance.version, 0);
    assert.equal(getRacAttendanceChanges(previous, makeRoster(1), 'admin-a').length, 1);
    assert.equal(getRacAttendanceChanges(previous, makeRoster(1, true, 'admin-a'), 'admin-a').length, 0);
    assert.equal(getRacAttendanceChanges(current, current, 'admin-a').length, 0);
});
