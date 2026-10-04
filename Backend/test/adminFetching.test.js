import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import mongoose from 'mongoose';
import Team from '../src/models/Team.js';
import User from '../src/models/User.js';
import Competition from '../src/models/Competition.js';
import { getAllTeams, searchTeams, updateTeam } from '../src/controllers/teamController.js';
import { buildTeamFormData } from '../../Frontend/src/utils/adminForms.js';
import { getAdminStats } from '../src/controllers/adminController.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import { generateToken } from '../src/middleware/auth.js';

const responseRecorder = () => ({
    statusCode: 200,
    locals: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
});

test('saving a team with all members unchecked clears existing members', async (t) => {
    const teamId = new mongoose.Types.ObjectId().toString();
    const leaderId = new mongoose.Types.ObjectId().toString();
    const competitionId = new mongoose.Types.ObjectId().toString();
    const oldMember = new mongoose.Types.ObjectId().toString();
    const form = { teamName: 'Team', leaderId, competitionId, members: [], buktiTransfer: '' };
    const formData = buildTeamFormData(form);
    assert.equal(formData.has('members'), true);
    assert.equal(formData.has('buktiTransfer'), false);
    assert.deepEqual(buildTeamFormData({ ...form, members: [oldMember] }).getAll('members'), [oldMember]);

    t.mock.method(Team, 'findById', async () => ({
        _id: teamId, leaderId, competitionId, members: [oldMember], teamName: 'Team'
    }));
    t.mock.method(Competition, 'exists', async () => ({ _id: competitionId }));
    t.mock.method(User, 'countDocuments', async (filter) => {
        assert.deepEqual(filter._id.$in, [leaderId]);
        return 1;
    });
    t.mock.method(Team, 'findOne', () => ({
        populate() { return this; },
        then(resolve) { return Promise.resolve(null).then(resolve); }
    }));
    t.mock.method(Team, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, teamId);
        assert.deepEqual(update.$set.members, []);
        return { _id: teamId, ...update.$set };
    });
    const response = responseRecorder();
    await updateTeam({ user: { role: 'admin' }, params: { id: teamId }, body: Object.fromEntries(formData) }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.updatedTeam.members, []);
});

test('team search populates the same leader, member, and competition data as the list', async (t) => {
    const leader = { _id: new mongoose.Types.ObjectId(), name: 'Leader', nim: '100' };
    const member = { _id: new mongoose.Types.ObjectId(), name: 'Member', nim: '101' };
    const competition = { _id: new mongoose.Types.ObjectId(), competitionName: 'Debate' };
    const team = {
        _id: new mongoose.Types.ObjectId(), teamName: 'A&B [team]',
        leaderId: leader._id, members: [member._id], competitionId: competition._id
    };
    const filters = [];
    t.mock.method(Team.collection, 'find', (filter) => {
        filters.push(filter);
        return { toArray: async () => [{ ...team }] };
    });
    t.mock.method(User.collection, 'find', (filter) => ({
        toArray: async () => [leader, member].filter((user) =>
            filter._id.$in.some((id) => id.equals(user._id)))
    }));
    t.mock.method(Competition.collection, 'find', () => ({ toArray: async () => [{ ...competition }] }));

    const listResponse = responseRecorder();
    await getAllTeams({ user: { role: 'admin' } }, listResponse);
    const searchResponse = responseRecorder();
    await searchTeams({ query: { query: '  A&B [team]  ' } }, searchResponse);

    assert.equal(searchResponse.statusCode, 200);
    assert.equal(searchResponse.body.count, 1);
    const result = searchResponse.body.teams[0];
    assert.equal(result.leaderId.name, 'Leader');
    assert.equal(result.leaderId._id.toString(), leader._id.toString());
    assert.equal(result.members[0].name, 'Member');
    assert.equal(result.members[0]._id.toString(), member._id.toString());
    assert.equal(result.competitionId.competitionName, 'Debate');
    assert.deepEqual(result, listResponse.body[0]);
    assert.equal(filters[1].teamName.$regex, 'A&B \\[team\\]');

    for (const query of ['', ' ', 'x'.repeat(81), { $ne: null }]) {
        const response = responseRecorder();
        await searchTeams({ query: { query } }, response);
        assert.equal(response.statusCode, 400);
    }
    assert.equal(filters.length, 2, 'invalid searches must not query the database');
});

test('competition filtering works alone, with team search, and when cleared', async (t) => {
    const competitionId = new mongoose.Types.ObjectId();
    const otherCompetitionId = new mongoose.Types.ObjectId();
    const leader = { _id: new mongoose.Types.ObjectId(), name: 'Leader' };
    const fixtures = [
        { _id: new mongoose.Types.ObjectId(), teamName: 'Alpha', competitionId, leaderId: leader._id, members: [] },
        { _id: new mongoose.Types.ObjectId(), teamName: 'Beta', competitionId, leaderId: leader._id, members: [] },
        { _id: new mongoose.Types.ObjectId(), teamName: 'Alpha Other', competitionId: otherCompetitionId, leaderId: leader._id, members: [] },
    ];
    const filters = [];
    t.mock.method(Team.collection, 'find', (filter) => {
        filters.push(filter);
        return { toArray: async () => fixtures.filter((team) =>
            (!filter.competitionId || team.competitionId.equals(filter.competitionId)) &&
            (!filter.teamName || new RegExp(filter.teamName.$regex, filter.teamName.$options).test(team.teamName))
        ).map((team) => ({ ...team })) };
    });
    t.mock.method(User.collection, 'find', () => ({ toArray: async () => [{ ...leader }] }));
    t.mock.method(Competition.collection, 'find', () => ({ toArray: async () => [
        { _id: competitionId, competitionName: 'Debate' },
        { _id: otherCompetitionId, competitionName: 'Radio' },
    ] }));

    const selected = competitionId.toString();
    const list = responseRecorder();
    await getAllTeams({ user: { role: 'admin' }, query: { competitionId: selected } }, list);
    assert.equal(list.statusCode, 200);
    assert.deepEqual(list.body.map((team) => team.teamName), ['Alpha', 'Beta']);
    assert.equal(list.body[0].leaderId.name, 'Leader');
    assert.equal(list.body[0].competitionId.competitionName, 'Debate');

    const search = responseRecorder();
    await searchTeams({ query: { query: 'Alpha', competitionId: selected } }, search);
    assert.equal(search.statusCode, 200);
    assert.deepEqual(search.body.teams.map((team) => team.teamName), ['Alpha']);

    const cleared = responseRecorder();
    await getAllTeams({ user: { role: 'admin' }, query: {} }, cleared);
    assert.equal(cleared.body.length, 3);

    const unmatched = responseRecorder();
    await searchTeams({ query: { query: 'Beta', competitionId: otherCompetitionId.toString() } }, unmatched);
    assert.equal(unmatched.body.count, 0);

    const restricted = responseRecorder();
    await getAllTeams({ user: { role: 'user', id: leader._id }, query: { competitionId: selected } }, restricted);
    assert.deepEqual(filters.at(-1).$or, [{ leaderId: leader._id }, { members: leader._id }]);
    assert.ok(filters.at(-1).competitionId.equals(competitionId));

    for (const invalidId of ['', 'invalid', [selected], { $ne: null }]) {
        for (const handler of [getAllTeams, searchTeams]) {
            const response = responseRecorder();
            await handler({ user: { role: 'admin' }, query: { query: 'Alpha', competitionId: invalidId } }, response);
            assert.equal(response.statusCode, 400);
        }
    }
    assert.equal(filters.length, 5, 'invalid competition filters must not query the database');
});

test('dashboard returns exact counts without fetching or populating records', async (t) => {
    for (const [Model, count] of [[User, 1400], [Team, 650], [Competition, 12]]) {
        t.mock.method(Model, 'countDocuments', async (filter) => {
            assert.deepEqual(filter, {});
            return count;
        });
        t.mock.method(Model, 'find', () => { throw new Error('Dashboard must only count records'); });
    }
    const response = responseRecorder();
    await getAdminStats({}, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { users: 1400, teams: 650, competitions: 12 });
});

test('dashboard stats require an authenticated admin', async (t) => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'admin-fetching-test-secret-at-least-32-characters';
    t.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });
    const user = { _id: new mongoose.Types.ObjectId(), role: 'user' };
    t.mock.method(User, 'findById', () => ({ select: async () => user }));
    for (const Model of [User, Team, Competition]) {
        t.mock.method(Model, 'countDocuments', () => { throw new Error('Unauthorized database access'); });
    }
    const app = express();
    app.use('/admin', adminRoutes);
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const url = `http://127.0.0.1:${server.address().port}/admin/stats`;
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await fetch(url, {
        headers: { Authorization: `Bearer ${generateToken(user)}` }
    })).status, 403);
});
