import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PARAMETERS,
  generateLessons,
  validateParameters,
  isSchedule,
  scheduleCsv,
} from "../lib/scheduler.ts";

const parameters = (overrides = {}) => ({
  ...structuredClone(DEFAULT_PARAMETERS),
  ...overrides,
});
const schedule = () => ({
  id: "test",
  createdAt: "2026-09-27T10:00:00.000Z",
  parameters: parameters(),
  lessons: generateLessons(parameters()),
  status: "draft",
  comment: "",
});

test("rejects blank, malformed, fractional, non-finite and out-of-range inputs", () => {
  for (const value of [
    null,
    {},
    parameters({ department: "   " }),
    parameters({ semester: "0" }),
    parameters({ semester: "13" }),
    parameters({ subjects: [] }),
    parameters({ subjects: [null] }),
  ])
    assert.ok(validateParameters(value));
  for (const key of ["classrooms", "batches", "maxClassesPerDay"]) {
    for (const value of [0, -1, 1.5, NaN, Infinity, "2", 51])
      assert.ok(validateParameters(parameters({ [key]: value })));
  }
});

test("checks duplicates, text limits and room/weekly capacity", () => {
  for (const overrides of [
    { subjects: ["Math", " math "] },
    { subjects: [" "] },
    { subjects: ["a".repeat(61)] },
    { department: "a".repeat(81) },
    { classrooms: 1, batches: 2 },
    { maxClassesPerDay: 1, subjects: ["a", "b", "c", "d", "e", "f"] },
  ])
    assert.ok(validateParameters(parameters(overrides)));
});

test("creates a complete deterministic week with no room or batch collisions", () => {
  const p = parameters();
  const lessons = generateLessons(p);
  assert.equal(lessons.length, 5 * p.maxClassesPerDay * p.batches);
  assert.deepEqual(lessons, generateLessons(p));
  for (const resource of ["room", "batch"])
    assert.equal(
      new Set(lessons.map((l) => `${l.day}:${l.period}:${l[resource]}`)).size,
      lessons.length,
    );
  assert.ok(
    lessons.every(
      (l) => l.room >= 1 && l.room <= p.classrooms && l.day >= 0 && l.day < 5,
    ),
  );
});

test("balances subjects per batch and covers all subjects", () => {
  for (const periods of [1, 3, 8]) {
    const p = parameters({ maxClassesPerDay: periods });
    const lessons = generateLessons(p);
    for (let batch = 0; batch < p.batches; batch++) {
      const counts = p.subjects.map(
        (subject) =>
          lessons.filter((l) => l.batch === batch && l.subject === subject)
            .length,
      );
      assert.ok(Math.min(...counts) > 0);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
    }
  }
});

test("handles a single subject and maximum allowed capacity", () => {
  assert.equal(
    generateLessons(
      parameters({
        classrooms: 1,
        batches: 1,
        maxClassesPerDay: 1,
        subjects: ["Math"],
      }),
    ).length,
    5,
  );
  assert.equal(
    generateLessons(
      parameters({
        classrooms: 50,
        batches: 50,
        maxClassesPerDay: 8,
        subjects: Array.from({ length: 40 }, (_, i) => `S${i}`),
      }),
    ).length,
    2000,
  );
  assert.throws(() => generateLessons(parameters({ batches: 0 })));
});

test("accepts valid saved schedules and rejects corruption", () => {
  assert.equal(isSchedule(schedule()), true);
  for (const invalid of [
    null,
    {},
    { ...schedule(), createdAt: "invalid" },
    { ...schedule(), status: "published" },
    { ...schedule(), lessons: [] },
    { ...schedule(), comment: null },
  ])
    assert.equal(isSchedule(invalid), false);
  const tampered = schedule();
  tampered.lessons[0].room = 999;
  assert.equal(isSchedule(tampered), false);
});

test("CSV quotes punctuation and neutralizes spreadsheet formulas", () => {
  const s = schedule();
  s.parameters.department = '=HYPERLINK("bad")';
  s.lessons[0].subject = 'Hello, "world"\nSecond line';
  const csv = scheduleCsv(s);
  assert.ok(csv.startsWith('"Department","Semester"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"Hello, ""world""\nSecond line"'));
  for (const prefix of ["+", "-", "@", "\t="]) {
    s.lessons[0].subject = prefix + "formula";
    assert.ok(scheduleCsv(s).includes(`"'${prefix}formula"`));
  }
});
