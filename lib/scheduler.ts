export type Parameters = {
  department: string;
  semester: string;
  classrooms: number;
  batches: number;
  maxClassesPerDay: number;
  subjects: string[];
};
export type Lesson = {
  day: number;
  period: number;
  batch: number;
  room: number;
  subject: string;
};
export type Schedule = {
  id: string;
  createdAt: string;
  parameters: Parameters;
  lessons: Lesson[];
  status: "draft" | "approved" | "rejected";
  comment: string;
};
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const DEFAULT_PARAMETERS: Parameters = {
  department: "Computer Science",
  semester: "5",
  classrooms: 4,
  batches: 3,
  maxClassesPerDay: 6,
  subjects: [
    "Data Structures",
    "Operating Systems",
    "Computer Networks",
    "Database Systems",
    "Mathematics",
  ],
};
export function validateParameters(value: unknown): string | null {
  if (!value || typeof value !== "object")
    return "Please configure your scheduling parameters.";
  const p = value as Parameters;
  if (
    typeof p.department !== "string" ||
    !p.department.trim() ||
    p.department.trim().length > 80
  )
    return "Enter a department name between 1 and 80 characters.";
  if (typeof p.semester !== "string" || !/^(?:[1-9]|1[0-2])$/.test(p.semester))
    return "Choose a semester from 1 to 12.";
  for (const [key, label, max] of [
    ["classrooms", "Classrooms", 50],
    ["batches", "Batches", 50],
    ["maxClassesPerDay", "Periods per day", 8],
  ] as const) {
    if (!Number.isInteger(p[key]) || p[key] < 1 || p[key] > max)
      return `${label} must be a whole number between 1 and ${max}.`;
  }
  if (p.batches > p.classrooms)
    return "Add at least one classroom per batch. All batches run in parallel.";
  if (
    !Array.isArray(p.subjects) ||
    p.subjects.length === 0 ||
    p.subjects.length > 40
  )
    return "Add between 1 and 40 subjects.";
  if (
    p.subjects.some(
      (s) => typeof s !== "string" || !s.trim() || s.trim().length > 60,
    )
  )
    return "Subject names must contain 1 to 60 characters.";
  if (
    new Set(p.subjects.map((s) => s.trim().toLocaleLowerCase())).size !==
    p.subjects.length
  )
    return "Each subject must have a unique name (ignoring case).";
  if (p.subjects.length > DAYS.length * p.maxClassesPerDay)
    return "There are more subjects than weekly periods. Increase periods per day or remove subjects.";
  return null;
}
// Dedicated rooms prevent collisions. Round-robin allocation balances weekly
// subject counts within one lesson. This does not model faculty availability.
export function generateLessons(parameters: Parameters): Lesson[] {
  const error = validateParameters(parameters);
  if (error) throw new Error(error);
  const lessons: Lesson[] = [];
  for (let day = 0; day < DAYS.length; day++) {
    for (let period = 0; period < parameters.maxClassesPerDay; period++) {
      for (let batch = 0; batch < parameters.batches; batch++) {
        lessons.push({
          day,
          period,
          batch,
          room: batch + 1,
          subject:
            parameters.subjects[
              (day * parameters.maxClassesPerDay + period + batch) %
                parameters.subjects.length
            ].trim(),
        });
      }
    }
  }
  return lessons;
}
export function isSchedule(value: unknown): value is Schedule {
  if (!value || typeof value !== "object") return false;
  const s = value as Schedule;
  if (
    typeof s.id !== "string" ||
    !s.id ||
    typeof s.createdAt !== "string" ||
    !Number.isFinite(Date.parse(s.createdAt)) ||
    validateParameters(s.parameters) ||
    !["draft", "approved", "rejected"].includes(s.status) ||
    typeof s.comment !== "string" ||
    s.comment.length > 500
  )
    return false;
  const expected = generateLessons(s.parameters);
  return (
    Array.isArray(s.lessons) &&
    s.lessons.length === expected.length &&
    s.lessons.every(
      (l, i) =>
        l &&
        ["day", "period", "batch", "room", "subject"].every(
          (key) => l[key as keyof Lesson] === expected[i][key as keyof Lesson],
        ),
    )
  );
}
export function scheduleCsv(schedule: Schedule): string {
  const cell = (value: string | number) => {
    const text = String(value);
    // Prevent spreadsheet formula execution from exported user input.
    return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
  };
  return [
    ["Department", "Semester", "Day", "Period", "Batch", "Room", "Subject"],
    ...schedule.lessons.map((l) => [
      schedule.parameters.department,
      schedule.parameters.semester,
      DAYS[l.day],
      l.period + 1,
      l.batch + 1,
      l.room,
      l.subject,
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
