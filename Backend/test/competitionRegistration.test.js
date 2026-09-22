import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import teamRoutes from '../src/routes/teamRoutes.js';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import Competition from '../src/models/Competition.js';
import { generateToken } from '../src/middleware/auth.js';

test('open registration requires login and allows authenticated team creation', async (t) => {
    const app = express();
    app.use(express.json());
    app.use('/api/teams', teamRoutes);
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const url = `http://127.0.0.1:${server.address().port}/api/teams`;

    const upload = new FormData();
    upload.append('buktiTransfer', new Blob(['invalid image']), 'proof.png');
    for (const options of [
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
        { method: 'POST', body: upload },
    ]) {
        const response = await fetch(url, options);
        assert.equal(response.status, 401);
        assert.match((await response.json()).message, /log in/i);
    }

    // Existing registration routes still require authentication.
    const response = await fetch(url);
    assert.equal(response.status, 401);

    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'registration-test-secret-at-least-32-characters';
    t.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });
    const user = { _id: '507f1f77bcf86cd799439011', role: 'user', tokenVersion: 0 };
    const competitionId = '507f1f77bcf86cd799439012';
    t.mock.method(User, 'findById', () => ({ select: async () => user }));
    t.mock.method(User, 'countDocuments', async () => 1);
    t.mock.method(Competition, 'exists', async () => ({ _id: competitionId }));
    const query = { populate() { return this; }, then(resolve) { return Promise.resolve(null).then(resolve); } };
    t.mock.method(Team, 'findOne', () => query);
    t.mock.method(Team, 'create', async (data) => ({ _id: '507f1f77bcf86cd799439013', ...data }));

    const created = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${generateToken(user)}` },
        body: JSON.stringify({ teamName: 'Reopened registration', competitionId }),
    });
    assert.equal(created.status, 201);
    const body = await created.json();
    assert.equal(body.team.leaderId, user._id);
    assert.equal(body.team.competitionId, competitionId);
});
