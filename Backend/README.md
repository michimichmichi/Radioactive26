# Backend request logs

Run the backend with `npm start`. Every completed request writes one JSON entry to the server console: successful requests use `console.log`, client failures use `console.warn`, and server failures use `console.error`. Disconnected requests are recorded as aborted with status 499.

Entries contain a timestamp, request ID, HTTP method, route, status, duration, and the user-facing error message when applicable. Server exceptions also include the error type/code and stack locations. Raw exception messages, request/response bodies, cookies, authorization headers, and query values are omitted to avoid logging credentials or submitted data. Unknown URL segments are masked when a request fails before routing.

Users see a reference ID with backend errors. Search the server console or your hosting service's process logs for that ID to find the matching request. Logs are server-side; they do not appear in the admin page's browser console. This application does not save logs to a separate file.

Run `npm test` for request/error regression tests. These use a local HTTP server and mocked database calls; no database connection is needed.
