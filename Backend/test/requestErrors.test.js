import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { requestLogger } from '../src/middleware/requestLogger.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { createUser, loginUser } from '../src/controllers/userController.js';
import { generateToken, verifyToken } from '../src/middleware/auth.js';
import User from '../src/models/User.js';
import { rateLimiter } from '../src/middleware/rateLimiter.js';
import { getApiErrorMessage } from '../../Frontend/src/utils/apiErrors.js';
import { validateLogin, validateRegistration } from '../../Frontend/src/utils/authValidation.js';
import uploadKtm from '../src/middleware/uploadKtm.js';

test('requests produce actionable errors and one correlated, safe log each', async (t) => {
    const logs = [];
    for (const level of ['log', 'warn', 'error']) t.mock.method(console, level, (line) => logs.push(JSON.parse(line)));
    const app = express();
    app.use(requestLogger);
    app.use(express.json({ limit: '1kb' }));
    const router = express.Router();
    router.post('/register', uploadKtm.single('ktm'), createUser);
    router.post('/login', loginUser);
    router.get('/me', verifyToken, (req, res) => res.json({ ok: true }));
    app.use('/users', router);
    app.get('/success', (req, res) => res.json({ password: 'response-secret' }));
    app.get('/limited', rateLimiter({ maxRequests: 1, keyPrefix: 'test' }), (req, res) => res.json({ ok: true }));
    app.get('/failure/:kind', (req) => {
        const errors = {
            duplicate: Object.assign(new Error('secret@example.com'), { code: 11000, keyPattern: { email: 1 } }),
            database: Object.assign(new Error('mongodb://user:secret@host'), { name: 'MongoNetworkError' }),
            upload: Object.assign(new Error('raw upload details'), { code: 'INVALID_IMAGE_TYPE' }),
            large: Object.assign(new Error('raw upload details'), { code: 'LIMIT_FILE_SIZE' }),
            unexpected: new Error('password=secret'),
        };
        throw errors[req.params.kind];
    });
    app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
    app.use(errorHandler);
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, status, pattern, options) => {
        const before = logs.length;
        const response = await fetch(base + path, options);
        const body = await response.json();
        assert.equal(response.status, status);
        if (pattern) assert.match(body.message, pattern);
        assert.equal(logs.length, before + 1);
        assert.equal(logs.at(-1).status, status);
        assert.equal(logs.at(-1).requestId, response.headers.get('x-request-id'));
        if (status >= 400) assert.equal(body.requestId, logs.at(-1).requestId);
        return body;
    };
    const post = (body) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await request('/success?token=query-secret', 200);
    await request('/users/register', 400, /name.*email.*password.*university.*NIM/i, post({}));
    assert.equal(logs.at(-1).route, '/users/register');
    const registration = { name: 'Student', email: 'student@example.com', password: 'valid-password', university: 'University', nim: '123456' };
    const missingKtm = await request('/users/register', 400, /Upload your KTM/, post(registration));
    assert.ok(missingKtm.errors.ktm);
    const multipart = new FormData();
    for (const [key, value] of Object.entries(registration)) multipart.append(key, value);
    await request('/users/register', 400, /Upload your KTM/, { method: 'POST', body: multipart });
    multipart.append('ktm', new Blob(['not an image'], { type: 'application/pdf' }), 'student.pdf');
    await request('/users/register', 400, /file type is not supported/, { method: 'POST', body: multipart });
    await request('/users/login', 400, /valid email/, post({ email: { $ne: null }, password: 'secret' }));
    await request('/users/login', 400, /Enter your password/, post({ email: 'a@b.com' }));
    t.mock.method(User, 'findOne', (query) => {
        assert.equal(query.email, 'a@b.com');
        return { select: async () => null };
    });
    await request('/users/login', 401, /email address or password is incorrect/, post({ email: ' A@B.COM ', password: 'secret' }));
    await request('/users/me', 401, /log in/);
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret-for-request-errors-at-least-32-characters';
    t.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });
    const token = generateToken({ _id: '123456789012345678901234', role: 'user' });
    t.mock.method(User, 'findById', () => ({ select: async () => {
        throw Object.assign(new Error('private connection details'), { name: 'MongoNetworkError' });
    } }));
    await request('/users/me', 503, /database/, { headers: { Authorization: `Bearer ${token}` } });
    await request('/users/me', 401, /session is invalid/, { headers: { Authorization: 'Bearer invalid-token' } });
    await request('/failure/duplicate', 409, /email address is already registered/);
    await request('/failure/database', 503, /database/);
    await request('/failure/upload', 400, /file type/);
    await request('/failure/large', 400, /5 MB/);
    await request('/failure/unexpected', 500, /server could not complete/);
    await request('/users/login', 400, /could not be read/, { ...post({}), body: '{invalid' });
    await request('/users/login', 413, /too much data/, post({ password: 'x'.repeat(2000) }));
    await request('/limited', 200);
    await request('/limited', 429, /Wait.*minute/);
    await request('/missing', 404, /not found/);
    const serialized = JSON.stringify(logs);
    for (const secret of [token, 'query-secret', 'response-secret', 'password=secret', 'secret@example.com', 'mongodb://']) {
        assert.equal(serialized.includes(secret), false);
    }
});

test('form validation replaces browser popups and requires a usable KTM', () => {
    const valid = { name: 'Student', email: 'student@example.com', password: 'valid-password', university: 'University', nim: '123456', ktm: { type: 'image/png', size: 100 } };
    assert.equal(validateRegistration(valid), '');
    for (const [field, value, pattern] of [
        ['name', ' ', /name/], ['email', 'invalid', /email/],
        ['password', '', /password/], ['password', 'short', /8 to 128/],
        ['university', ' ', /university/], ['nim', ' ', /NIM/],
        ['ktm', '', /Upload your KTM/],
        ['ktm', { type: 'image/png', size: 0 }, /empty/],
        ['ktm', { type: 'application/pdf', size: 100 }, /JPG, JPEG, and PNG/],
        ['ktm', { type: 'image/png', size: 5 * 1024 * 1024 + 1 }, /5MB/],
    ]) assert.match(validateRegistration({ ...valid, [field]: value }), pattern);
    assert.match(validateLogin({ email: '', password: '' }), /email/);
    assert.match(validateLogin({ email: valid.email, password: '' }), /password/);
    assert.equal(validateLogin(valid), '');
});

test('frontend explains network, timeout, proxy, and backend errors', () => {
    assert.match(getApiErrorMessage({}), /internet connection/);
    assert.match(getApiErrorMessage({ code: 'ECONNABORTED' }), /too long/);
    assert.match(getApiErrorMessage({ response: { status: 502, data: '<html>Bad Gateway</html>' } }), /temporarily unavailable/);
    assert.match(getApiErrorMessage({ response: { status: 413 } }), /5 MB/);
    assert.equal(getApiErrorMessage({ response: { status: 400, data: { message: 'Enter your NIM.', requestId: 'abc' } } }), 'Enter your NIM.');
});
