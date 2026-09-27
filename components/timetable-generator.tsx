"use client";
import { useState } from "react";
import { CalendarDays, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAYS, scheduleCsv, type Schedule } from "@/lib/scheduler";

const colors = [
  "border-violet-200 bg-violet-50 text-violet-900",
  "border-blue-200 bg-blue-50 text-blue-900",
  "border-emerald-200 bg-emerald-50 text-emerald-900",
  "border-amber-200 bg-amber-50 text-amber-900",
  "border-rose-200 bg-rose-50 text-rose-900",
];
export function TimetableGenerator({
  schedule,
  onSetup,
}: {
  schedule: Schedule | null;
  onSetup: () => void;
}) {
  const [batch, setBatch] = useState(0);
  const [error, setError] = useState("");
  const selectedBatch = schedule
    ? Math.min(batch, schedule.parameters.batches - 1)
    : 0;
  if (!schedule)
    return (
      <div className="panel flex flex-col items-center px-6 py-20 text-center">
        <span className="mb-5 rounded-2xl bg-violet-50 p-5 text-primary">
          <CalendarDays className="h-9 w-9" />
        </span>
        <h2 className="text-xl font-semibold">Your week is a blank canvas</h2>
        <p className="mb-6 mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Start with your department, rooms, and subjects. We’ll bring them
          together into a weekly timetable.
        </p>
        <Button onClick={onSetup}>Set up a timetable</Button>
      </div>
    );
  const exportCsv = () => {
    setError("");
    try {
      const url = URL.createObjectURL(
        new Blob(["\uFEFF" + scheduleCsv(schedule)], {
          type: "text/csv;charset=utf-8;",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `acadence-semester-${schedule.parameters.semester}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("The download could not be created. Please try again.");
    }
  };
  const lessons = schedule.lessons.filter((l) => l.batch === selectedBatch);
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="eyebrow">Weekly timetable</span>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${schedule.status === "approved" ? "bg-emerald-50 text-emerald-700" : schedule.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
            >
              {schedule.status}
            </span>
          </div>
          <h2 className="break-words text-xl font-semibold">
            {schedule.parameters.department}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Semester {schedule.parameters.semester} · Monday – Friday
          </p>
        </div>
        <div className="no-print flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Print timetable"
            onClick={() => window.print()}
          >
            <Printer />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <label htmlFor="batch-view" className="text-sm font-medium">
            Viewing
          </label>
          <select
            className="field !h-9 !w-auto"
            id="batch-view"
            value={selectedBatch}
            onChange={(e) => setBatch(Number(e.target.value))}
          >
            {Array.from({ length: schedule.parameters.batches }, (_, i) => (
              <option key={i} value={i}>
                Batch {i + 1}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          {lessons.length} periods per week · Room {selectedBatch + 1}
        </p>
      </div>
      {error && (
        <p role="alert" className="px-6 pb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div
        className="overflow-x-auto px-4 pb-5"
        tabIndex={0}
        role="region"
        aria-label="Weekly timetable, scroll horizontally on small screens"
      >
        <table className="w-full min-w-[700px] table-fixed border-separate border-spacing-2 text-left">
          <caption className="sr-only">
            Batch {selectedBatch + 1}, {schedule.parameters.department},
            semester {schedule.parameters.semester}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="w-20 p-2 text-xs font-medium text-muted-foreground"
              >
                PERIOD
              </th>
              {DAYS.map((day) => (
                <th
                  scope="col"
                  className="p-2 text-xs font-semibold text-muted-foreground"
                  key={day}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(
              { length: schedule.parameters.maxClassesPerDay },
              (_, period) => (
                <tr key={period}>
                  <th
                    scope="row"
                    className="px-2 text-xs font-medium text-muted-foreground"
                  >
                    <span className="block text-sm text-foreground">
                      {String(period + 1).padStart(2, "0")}
                    </span>
                    Period
                  </th>
                  {DAYS.map((_, day) => {
                    const lesson = lessons.find(
                      (l) => l.day === day && l.period === period,
                    )!;
                    const color =
                      colors[
                        schedule.parameters.subjects.findIndex(
                          (s) => s.trim() === lesson.subject,
                        ) % colors.length
                      ];
                    return (
                      <td
                        key={day}
                        className={`h-24 rounded-lg border p-3 align-top ${color}`}
                      >
                        <p className="break-words text-xs font-semibold leading-5">
                          {lesson.subject}
                        </p>
                        <p className="mt-2 text-[10px] opacity-75">
                          Room {lesson.room} · B{lesson.batch + 1}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <p className="border-t bg-slate-50 px-6 py-4 text-xs leading-5 text-muted-foreground">
        Room and batch allocations are collision-free within this timetable.
        Periods are sequence numbers; faculty availability, breaks, and shared
        resources across timetables need separate review.
      </p>
    </section>
  );
}
