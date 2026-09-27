// Legacy API: the active application uses browser-local workspaces.
// The former select endpoint only decoded JWTs and allowed unauthenticated writes.
// Keep it fail-closed until a verified, authorized persistence API is implemented.
const express = require("express");
const app = express();
app.disable("x-powered-by");
app.get("/health", (_req, res) =>
  res.json({ status: "ok", mode: "local-workspace" }),
);
app.post("/api/timetables/select", (_req, res) => {
  res
    .status(410)
    .json({
      error:
        "The legacy selection API is retired. Use the browser-local timetable workspace.",
    });
});
app.use((_req, res) => res.status(404).json({ error: "Endpoint not found." }));
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, "127.0.0.1", () =>
    console.log(
      `Legacy API listening on http://127.0.0.1:${port}; no persistence endpoints are enabled.`,
    ),
  );
}
module.exports = app;
