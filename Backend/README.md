# Backend request logs

Run the backend with `npm start`. Every completed request writes one JSON entry to the server console: successful requests use `console.log`, client failures use `console.warn`, and server failures use `console.error`. Disconnected requests are recorded as aborted with status 499.

Entries contain a timestamp, request ID, HTTP method, route, status, duration, and the user-facing error message when applicable. Server exceptions also include the error type/code and stack locations. Raw exception messages, request/response bodies, cookies, authorization headers, and query values are omitted to avoid logging credentials or submitted data. Unknown URL segments are masked when a request fails before routing.

Request IDs remain in response metadata and server logs for diagnostics, but are not displayed in user-facing messages. Use the route and timestamp to locate a failed request in the server console or hosting process logs. Logs are server-side; they do not appear in the admin page's browser console. This application does not save logs to a separate file.

Run `npm test` for request/error regression tests. These use a local HTTP server and mocked database calls; no database connection is needed.

# RAC attendance

The admin dashboard's **RAC Attendance** tab lists every team registered in competitions whose names start with `RAC` or `Radio Announcing`, including category suffixes. Team leaders are included once alongside the members. Other competitions are excluded.

Check-in and undo actions persist in each team's `racAttendance` map, keyed by competition and participant, with the time, admin email, and version. The admin-only PATCH endpoint uses an atomic version check to prevent stale changes from overwriting another admin's work. Existing teams need no data migration.

An authenticated server-sent event stream stays connected throughout the admin dashboard. A shared database poll every two seconds sends changed rosters to connected admins, including those connected to other backend workers. The browser updates attendance in place and shows a dismissible popup without refreshing the page or resetting other forms. Disconnections show a reconnecting status; reconnecting loads the current database state. Streams reconnect every minute to recheck authentication.

Deploy both backend and frontend changes. Apply the updated `deploy/nginx/radioactive26.conf` and reload Nginx so the attendance stream has buffering disabled. No additional service, dependency, or MongoDB replica set is required.
