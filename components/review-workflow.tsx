"use client";
import { useState } from "react";
import { Check, ClipboardCheck, Eye, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Schedule } from "@/lib/scheduler";

type Props = {
  schedules: Schedule[];
  onReview: (
    id: string,
    status: "approved" | "rejected",
    comment: string,
  ) => void;
  onView: (id: string) => void;
  onSetup: () => void;
};
export function ReviewWorkflow({
  schedules,
  onReview,
  onView,
  onSetup,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const visible = schedules.filter(
    (s) => filter === "all" || s.status === filter,
  );
  const review = (schedule: Schedule, status: "approved" | "rejected") => {
    if (status === "rejected" && !comment.trim()) {
      setError("Add a reason so you know what to revise.");
      return;
    }
    onReview(schedule.id, status, comment.trim());
    setSelected(null);
    setComment("");
    setError("");
  };
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
        <div>
          <h2 className="font-semibold">Your review queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep track of the plans that are ready and the ones that need work.
          </p>
        </div>
        <select
          aria-label="Filter by review status"
          className="field !w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All timetables</option>
          <option value="draft">Awaiting review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Needs revision</option>
        </select>
      </div>
      {!visible.length ? (
        <div className="px-6 py-16 text-center">
          <ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-primary/60" />
          <h3 className="font-semibold">
            {schedules.length
              ? "All clear in this view"
              : "Nothing to review just yet"}
          </h3>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">
            {schedules.length
              ? "Choose another status to see your other timetables."
              : "Generate a timetable to start your review."}
          </p>
          {!schedules.length && (
            <Button onClick={onSetup}>Create a timetable</Button>
          )}
        </div>
      ) : (
        <div className="divide-y">
          {visible.map((schedule) => (
            <article key={schedule.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${schedule.status === "approved" ? "bg-emerald-50 text-emerald-700" : schedule.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {schedule.status === "draft"
                      ? "Awaiting review"
                      : schedule.status === "rejected"
                        ? "Needs revision"
                        : "Approved"}
                  </span>
                  <h3 className="break-words font-semibold">
                    {schedule.parameters.department} · Semester{" "}
                    {schedule.parameters.semester}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(schedule.createdAt).toLocaleString()} ·{" "}
                    {schedule.parameters.batches} batches ·{" "}
                    {schedule.lessons.length} lessons
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(schedule.id)}
                >
                  <Eye /> View timetable
                </Button>
              </div>
              {schedule.comment && (
                <p className="mt-4 break-words rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
                  {schedule.comment}
                </p>
              )}
              {schedule.status === "draft" && (
                <div className="mt-4">
                  {selected === schedule.id ? (
                    <div className="space-y-3">
                      <label
                        className="block text-sm font-medium"
                        htmlFor={`comment-${schedule.id}`}
                      >
                        Review note{" "}
                        <span className="font-normal text-muted-foreground">
                          (required for revision)
                        </span>
                      </label>
                      <textarea
                        className="field min-h-24 py-3"
                        id={`comment-${schedule.id}`}
                        autoFocus
                        maxLength={500}
                        value={comment}
                        onChange={(e) => {
                          setComment(e.target.value);
                          setError("");
                        }}
                        placeholder="What needs attention?"
                      />
                      <p className="text-xs text-muted-foreground">
                        {comment.length}/500 characters
                      </p>
                      {error && (
                        <p role="alert" className="text-sm text-destructive">
                          {error}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => review(schedule, "approved")}>
                          <Check /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => review(schedule, "rejected")}
                        >
                          <X /> Request revision
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelected(null);
                            setError("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelected(schedule.id);
                        setComment("");
                        setError("");
                      }}
                    >
                      <MessageSquare /> Review timetable
                    </Button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <p className="border-t bg-slate-50 px-6 py-4 text-xs leading-5 text-muted-foreground">
        Reviews are personal planning labels saved in this browser. They do not
        publish a timetable or notify other users.
      </p>
    </section>
  );
}
