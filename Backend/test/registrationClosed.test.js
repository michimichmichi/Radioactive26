import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import teamRoutes from '../src/routes/teamRoutes.js';

test('closed registration rejects direct requests and payment uploads before processing', async (t) => {
    const app = express();
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
        assert.equal(response.status, 403);
        assert.match((await response.json()).message, /registration is closed/i);
    }

    // Existing registration routes still require authentication, rather than being closed.
    const response = await fetch(url);
    assert.equal(response.status, 401);
});
