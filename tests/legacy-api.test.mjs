import test from "node:test";
import assert from "node:assert/strict";
import app from "../index.js/server.js";

test("legacy selection rejects writes even with a fabricated token", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    for (const headers of [
      {},
      { Authorization: "Bearer forged.payload.signature" },
    ]) {
      const response = await fetch(`${base}/api/timetables/select`, {
        method: "POST",
        headers,
      });
      assert.equal(response.status, 410);
      assert.match((await response.json()).error, /retired/);
    }
    assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
