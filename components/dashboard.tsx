"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useAuth, type UserType } from "@/app/AuthContext";
import { Button } from "@/components/ui/button";
import { ParameterForm } from "@/components/parameter-form";
import { TimetableGenerator } from "@/components/timetable-generator";
import { ReviewWorkflow } from "@/components/review-workflow";
import {
  DEFAULT_PARAMETERS,
  generateLessons,
  isSchedule,
  validateParameters,
  type Parameters,
  type Schedule,
} from "@/lib/scheduler";

type Tab = "parameters" | "timetable" | "review";
const navigation = [
  { id: "parameters" as const, label: "Schedule setup", icon: LayoutDashboard },
  { id: "timetable" as const, label: "My timetables", icon: CalendarDays },
  { id: "review" as const, label: "Review & approve", icon: ClipboardCheck },
];
const headings = {
  parameters: [
    "A well-planned week starts here.",
    "Set the details. Add your subjects. Make space for learning.",
  ],
  timetable: [
    "Your week, beautifully organized.",
    "A clear view of every subject, batch, and classroom.",
  ],
  review: [
    "A final look. A confident start.",
    "Review your weekly plans before putting them into practice.",
  ],
};

export function Dashboard({
  user,
  onLogout,
}: {
  user: UserType;
  onLogout: () => Promise<void>;
}) {
  const { error: authError } = useAuth();
  const [tab, setTab] = useState<Tab>("parameters");
  const [menu, setMenu] = useState(false);
  const [parameters, setParameters] = useState<Parameters>(
    structuredClone(DEFAULT_PARAMETERS),
  );
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const lastValidParameters = useRef(structuredClone(DEFAULT_PARAMETERS));
  const storageKey = `acadence:workspace:v1:${user.id}`;
  useEffect(() => {
    if (!menu) return;
    const trigger = menuButton.current;
    const focusable = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)",
        ) || [],
      ).filter((button) => button.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        return;
      }
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [menu]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (
          !data ||
          data.version !== 1 ||
          validateParameters(data.parameters) ||
          !Array.isArray(data.schedules) ||
          data.schedules.length > 20 ||
          !data.schedules.every(isSchedule) ||
          new Set(data.schedules.map((s: Schedule) => s.id)).size !==
            data.schedules.length
        )
          throw new Error("Invalid saved workspace");
        setParameters(data.parameters);
        lastValidParameters.current = data.parameters;
        setSchedules(data.schedules);
        setSelectedId(data.schedules[0]?.id || "");
      }
    } catch {
      setStorageError(
        "Saved data could not be loaded. You can keep working with the example below; save a valid change to replace the unavailable data.",
      );
    }
    setReady(true);
  }, [storageKey]);
  const persist = (nextParameters: Parameters, nextSchedules: Schedule[]) => {
    const incomplete = !!validateParameters(nextParameters);
    if (!incomplete)
      lastValidParameters.current = structuredClone(nextParameters);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          parameters: lastValidParameters.current,
          schedules: nextSchedules,
        }),
      );
      setStorageError("");
      setNotice(
        incomplete
          ? "Timetables saved. Complete the fields to save your setup changes."
          : "Saved in this browser.",
      );
    } catch {
      setStorageError(
        "Browser storage is unavailable or full. Your changes are kept for this session only. Export any timetable you want to keep.",
      );
      setNotice("");
    }
  };
  const changeParameters = (value: Parameters) => {
    setParameters(value);
    if (validateParameters(value)) {
      setNotice("Unsaved changes · complete the fields to save your setup.");
      return;
    }
    persist(value, schedules);
  };
  const navigate = (next: Tab) => {
    setTab(next);
    setMenu(false);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const generate = () => {
    const message = validateParameters(parameters);
    if (message) {
      setNotice(message);
      return;
    }
    if (schedules.length >= 20) {
      setNotice(
        "You have reached 20 saved timetables. Remove an older timetable before generating another.",
      );
      return;
    }
    const clean = {
      ...parameters,
      department: parameters.department.trim(),
      subjects: parameters.subjects.map((s) => s.trim()),
    };
    const schedule: Schedule = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      parameters: structuredClone(clean),
      lessons: generateLessons(clean),
      status: "draft",
      comment: "",
    };
    const next = [schedule, ...schedules];
    setSchedules(next);
    setSelectedId(schedule.id);
    persist(clean, next);
    navigate("timetable");
  };
  const review = (
    id: string,
    status: "approved" | "rejected",
    comment: string,
  ) => {
    const next = schedules.map((s) =>
      s.id === id && s.status === "draft" ? { ...s, status, comment } : s,
    );
    setSchedules(next);
    // Incomplete edits to setup must not prevent saving review decisions.
    persist(parameters, next);
  };
  const selected =
    schedules.find((s) => s.id === selectedId) || schedules[0] || null;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const remove = () => {
    const next = schedules.filter((s) => s.id !== deleteId);
    setSchedules(next);
    setSelectedId(next[0]?.id || "");
    setDeleteId(null);
    persist(parameters, next);
  };
  const pending = schedules.filter((s) => s.status === "draft").length;
  const safeCount = (n: number) => (Number.isFinite(n) && n > 0 ? n : "—");
  return (
    <div className="min-h-screen">
      <a
        href="#workspace"
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed"
      >
        Skip to workspace
      </a>
      {menu && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="workspace-navigation"
        role={menu ? "dialog" : undefined}
        aria-modal={menu || undefined}
        aria-label={menu ? "Workspace navigation" : undefined}
        className={`no-print fixed inset-y-0 left-0 z-40 w-64 flex-col overflow-y-auto bg-[#191a2f] px-5 py-7 text-white lg:flex ${menu ? "flex" : "hidden"}`}
      >
        <div className="mb-12 flex items-center gap-3 px-3">
          <span className="rounded-xl bg-[#8c7bf7] p-2">
            <CalendarDays className="h-6 w-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            acadence<span className="text-violet-300">.</span>
          </span>
          <button
            className="ml-auto lg:hidden"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 px-4 text-[10px] font-semibold tracking-[0.18em] text-slate-400">
          WORKSPACE
        </p>
        <nav aria-label="Main navigation" className="space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm transition-colors ${tab === item.id ? "bg-[#7762db] font-medium text-white shadow-lg shadow-violet-950/20" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              {item.id === "review" && pending > 0 && (
                <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-10">
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="mb-3 flex items-center gap-2 text-xs font-medium text-violet-200">
              <HardDrive className="h-4 w-4" /> Your local planning space
            </span>
            <p className="text-xs leading-5 text-slate-400">
              Your work lives in this browser. Export a copy when you’re ready
              to share.
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 px-2 pt-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#38354f] text-xs font-semibold text-violet-200">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" title={user.name}>
                {user.name}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">{user.role}</p>
            </div>
            <button
              disabled={signingOut}
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              onClick={async () => {
                setSigningOut(true);
                await onLogout();
                setSigningOut(false);
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-main lg:ml-64">
        <header className="flex h-20 items-center justify-between gap-4 border-b bg-white px-5 sm:px-9">
          <div className="flex items-center gap-3">
            <button
              ref={menuButton}
              className="rounded p-2 lg:hidden"
              aria-expanded={menu}
              aria-controls="workspace-navigation"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Workspace
            </span>
            <ChevronRight className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            <span className="text-sm font-medium">
              {navigation.find((n) => n.id === tab)?.label}
            </span>
          </div>
          <span className="flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {user.isDemo ? "Demo workspace" : "Personal workspace"}
          </span>
        </header>
        <main
          id="workspace"
          className="mx-auto max-w-[1500px] px-5 py-8 sm:px-9"
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">ACADEMIC PLANNING, SIMPLIFIED</p>
              <h1
                ref={heading}
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight outline-none sm:text-[28px]"
              >
                {headings[tab][0]}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {headings[tab][1]}
              </p>
            </div>
            {tab !== "parameters" && (
              <Button
                className="no-print"
                onClick={() => navigate("parameters")}
              >
                New timetable <ArrowRight />
              </Button>
            )}
          </div>
          <div className="no-print mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                label: "Subjects in curriculum",
                value: parameters.subjects.length,
                icon: BookOpen,
                color: "bg-violet-50 text-violet-600",
              },
              {
                label: "Available classrooms",
                value: safeCount(parameters.classrooms),
                icon: Building2,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Student batches",
                value: safeCount(parameters.batches),
                icon: Users,
                color: "bg-amber-50 text-amber-600",
              },
              {
                label: "Timetables created",
                value: schedules.length,
                icon: CalendarDays,
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((item) => (
              <div
                className="panel flex items-center gap-4 p-4 xl:p-5"
                key={item.label}
              >
                <span
                  className={`hidden rounded-xl p-3 sm:block ${item.color}`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {(storageError || authError) && (
            <p
              role="alert"
              className="notice mb-5 border-amber-200 bg-amber-50 text-amber-900"
            >
              {storageError || authError}
            </p>
          )}
          <p
            role="status"
            aria-live="polite"
            className="no-print mb-4 min-h-4 text-xs text-muted-foreground"
          >
            {notice ||
              (ready
                ? "Ready when you are. Changes to valid settings save automatically."
                : "Loading your saved workspace…")}
          </p>
          {tab === "parameters" && (
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <ParameterForm
                value={parameters}
                onChange={changeParameters}
                onGenerate={generate}
                disabled={!ready}
              />
              <div className="space-y-5">
                <section className="relative overflow-hidden rounded-2xl bg-[#eeeafa] p-6">
                  <Sparkles className="mb-5 h-7 w-7 text-[#7660cb]" />
                  <p className="eyebrow !text-[#7660cb]">
                    LESS ADMIN, MORE IMPACT
                  </p>
                  <h2 className="mt-3 text-xl font-semibold leading-7 text-[#37295e]">
                    A smoother semester
                    <br />
                    is on the schedule.
                  </h2>
                  <p className="mt-3 text-xs leading-6 text-[#76668f]">
                    Start with a balanced plan. Give every subject its space,
                    and every batch a place to learn.
                  </p>
                  <div
                    aria-hidden="true"
                    className="mt-6 grid grid-cols-5 gap-1.5"
                  >
                    {Array.from({ length: 15 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-7 rounded ${["bg-[#d5caf6]", "bg-white/70", "bg-[#beb0e9]"][i % 3]}`}
                      />
                    ))}
                  </div>
                </section>
                <section className="panel p-5">
                  <h2 className="mb-5 text-sm font-semibold">
                    From setup to semester
                  </h2>
                  <ol className="space-y-5">
                    {[
                      [
                        "Set your parameters",
                        "Tell us about your academic week.",
                      ],
                      [
                        "Generate your timetable",
                        "Get a balanced plan for every batch.",
                      ],
                      [
                        "Review & make it yours",
                        "Check the details, then export.",
                      ],
                    ].map(([title, description], i) => (
                      <li key={title} className="flex gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${i === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="text-xs font-semibold">{title}</h3>
                          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
                <p className="flex items-start gap-2 px-2 text-[11px] leading-5 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Room and batch conflicts are prevented within each generated
                  timetable.
                </p>
              </div>
            </div>
          )}
          {tab === "timetable" && (
            <div className="space-y-4">
              {schedules.length > 0 && (
                <div className="no-print flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="saved-timetable"
                    className="text-sm font-medium"
                  >
                    Saved plan
                  </label>
                  <select
                    id="saved-timetable"
                    className="field !w-auto max-w-full flex-1 sm:flex-none sm:!max-w-md"
                    value={selected?.id}
                    onChange={(e) => {
                      setSelectedId(e.target.value);
                      setDeleteId(null);
                    }}
                  >
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.parameters.department} · Sem {s.parameters.semester}{" "}
                        · {new Date(s.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    className="text-destructive sm:ml-auto"
                    onClick={() => setDeleteId(selected!.id)}
                  >
                    Remove plan
                  </Button>
                </div>
              )}
              {deleteId && (
                <div
                  role="alert"
                  className="notice no-print flex flex-wrap items-center gap-3 border-red-200 bg-red-50"
                >
                  <span className="mr-auto">
                    Remove this saved timetable? Export it first if you need a
                    copy.
                  </span>
                  <Button size="sm" variant="destructive" onClick={remove}>
                    Remove timetable
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <TimetableGenerator
                key={selected?.id || "empty"}
                schedule={selected}
                onSetup={() => navigate("parameters")}
              />
              {selected && (
                <div className="no-print flex justify-end">
                  <Button variant="outline" onClick={() => navigate("review")}>
                    Continue to review <ArrowRight />
                  </Button>
                </div>
              )}
            </div>
          )}
          {tab === "review" && (
            <ReviewWorkflow
              schedules={schedules}
              onReview={review}
              onView={(id) => {
                setSelectedId(id);
                navigate("timetable");
              }}
              onSetup={() => navigate("parameters")}
            />
          )}
          <footer className="no-print mt-10 flex flex-wrap justify-between gap-2 border-t pt-5 text-[10px] text-muted-foreground">
            <span>acadence · A little order for a better academic week.</span>
            <span>Local workspace · Monday to Friday</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
