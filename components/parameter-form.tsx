"use client";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_PARAMETERS,
  validateParameters,
  type Parameters,
} from "@/lib/scheduler";

type Props = {
  value: Parameters;
  onChange: (value: Parameters) => void;
  onGenerate: () => void;
  disabled?: boolean;
};
export function ParameterForm({
  value,
  onChange,
  onGenerate,
  disabled,
}: Props) {
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const update = (patch: Partial<Parameters>) => {
    setError("");
    onChange({ ...value, ...patch });
  };
  const add = () => {
    const name = subject.trim().replace(/\s+/g, " ");
    if (!name) {
      setError("Enter a subject name before adding it.");
      return;
    }
    if (value.subjects.length >= 40) {
      setError("You can add up to 40 subjects.");
      return;
    }
    if (value.subjects.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setError("That subject is already in your list.");
      return;
    }
    update({ subjects: [...value.subjects, name] });
    setSubject("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (subject.trim()) {
      setError(
        "Add your typed subject to the list, or clear the field before generating.",
      );
      return;
    }
    const message = validateParameters(value);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onGenerate();
  };
  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="panel">
        <div className="flex items-center gap-3 border-b px-6 py-5">
          <span className="rounded-lg bg-violet-50 p-2 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Academic details</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The foundation for your weekly timetable
            </p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">01</span>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <input
              id="department"
              className="field"
              required
              maxLength={80}
              placeholder="e.g. Computer Science"
              value={value.department}
              onChange={(e) => update({ department: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <select
              id="semester"
              className="field"
              value={value.semester}
              onChange={(e) => update({ semester: e.target.value })}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option value={i + 1} key={i}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </div>
          {(
            [
              {
                key: "classrooms",
                label: "Available classrooms",
                max: 50,
                hint: "One room for each parallel batch",
              },
              {
                key: "batches",
                label: "Student batches",
                max: 50,
                hint: "Groups that follow their own timetable",
              },
              {
                key: "maxClassesPerDay",
                label: "Periods per day",
                max: 8,
                hint: "Monday to Friday · up to 8 periods",
              },
            ] as const
          ).map(({ key, label, max, hint }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <input
                className="field"
                id={key}
                type="number"
                min={1}
                max={max}
                step={1}
                required
                value={Number.isNaN(value[key]) ? "" : value[key]}
                onChange={(e) =>
                  update({
                    [key]: e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <CalendarIcon />
            <div>
              <p className="text-sm font-medium">A five-day learning week</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Subjects rotate evenly across the available periods.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="flex items-center gap-3 border-b px-6 py-5">
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Subjects & curriculum</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add the subjects you want to make time for
            </p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">02</span>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-subject" className="sr-only">
                Subject name
              </Label>
              <input
                className="field"
                id="new-subject"
                maxLength={60}
                placeholder="Type a subject name…"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={add}
            >
              <Plus /> Add<span className="hidden sm:inline"> subject</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {value.subjects.map((name, i) => (
              <span
                key={name}
                className="flex max-w-full items-center gap-2 rounded-lg border bg-slate-50 py-1.5 pl-3 pr-1.5 text-xs font-medium"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-400", "bg-pink-400"][i % 5]}`}
                />
                <span className="min-w-0 break-words">{name}</span>
                <button
                  type="button"
                  className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${name}`}
                  onClick={() =>
                    update({
                      subjects: value.subjects.filter((s) => s !== name),
                    })
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {value.subjects.length
              ? `${value.subjects.length} subjects added · Each subject gets a balanced share of the week.`
              : "Your curriculum is empty. Add at least one subject to get started."}
          </p>
        </div>
      </section>
      {error && (
        <p
          role="alert"
          className="notice border-red-200 bg-red-50 text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            update(structuredClone(DEFAULT_PARAMETERS));
            setSubject("");
          }}
        >
          <RotateCcw /> Load example
        </Button>
        <Button disabled={disabled} className="h-11 px-6" type="submit">
          Generate timetable <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
function CalendarIcon() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white text-sm font-semibold text-primary">
      5
    </span>
  );
}
