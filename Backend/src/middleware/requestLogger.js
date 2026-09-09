import { randomUUID } from 'node:crypto';

export const requestLogger = (req, res, next) => {
    const started = performance.now();
    req.requestId = randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    let message;
    let route;
    const publicSegments = new Set(['', 'users', 'teams', 'competitions', 'uploads', 'register', 'login', 'logout', 'me', 'participants', 'search', 'ktm', 'transfer']);
    const fallbackRoute = req.path.split('/').map((segment) => publicSegments.has(segment) ? segment : ':value').join('/');
    const writeHead = res.writeHead;
    res.writeHead = function (...args) {
        route = req.route ? `${req.baseUrl || ''}${req.route.path}` : fallbackRoute;
        return writeHead.apply(this, args);
    };
    const json = res.json;
    res.json = function (body) {
        if (res.statusCode >= 400 && body && typeof body === 'object') {
            message = body.message;
            body = { ...body, requestId: req.requestId };
        }
        return json.call(this, body);
    };

    let logged = false;
    const log = (aborted = false) => {
        if (logged) return;
        logged = true;
        const status = aborted ? 499 : res.statusCode;
        const entry = {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
            method: req.method,
            // Route templates avoid logging search terms, filenames, or URL secrets.
            route: route || fallbackRoute,
            status,
            outcome: aborted ? 'aborted' : status >= 400 ? 'failed' : 'successful',
            durationMs: Math.round(performance.now() - started),
            message,
            error: res.locals.errorDetails,
        };
        const write = status >= 500 ? console.error : status >= 400 ? console.warn : console.log;
        write(JSON.stringify(entry));
    };
    res.once('finish', () => log());
    res.once('close', () => log(!res.writableFinished));
    next();
};
