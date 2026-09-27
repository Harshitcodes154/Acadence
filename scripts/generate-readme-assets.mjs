import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const destination = new URL("../public/readme/", import.meta.url);
await mkdir(destination, { recursive: true });
const escape = (text) =>
  String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const text = (
  x,
  y,
  value,
  size = 16,
  color = "#24243b",
  weight = 400,
  extra = "",
) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" ${extra}>${escape(value)}</text>`;
const rect = (x, y, w, h, fill, radius = 16, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
const svg = (width, height, title, content, description = title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${escape(title)}</title><desc id="desc">${escape(description)}</desc><g font-family="Arial, Helvetica, sans-serif">${content}</g></svg>`;

const colors = ["#d9d0ff", "#dceaff", "#d4f0e6", "#f8e6c8", "#f5ddeb"];
let cells = "";
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 5; col++) {
    cells += `<g class="tile" style="animation-delay:${(row + col) * -0.35}s">${rect(692 + col * 80, 184 + row * 49, 70, 39, colors[(row + col) % 5], 7)}${rect(702 + col * 80, 195 + row * 49, 39, 4, "#4b426d", 2, 'opacity=".28"')}${rect(702 + col * 80, 205 + row * 49, 25, 3, "#4b426d", 1.5, 'opacity=".15"')}</g>`;
  }
}
const hero = svg(
  1200,
  470,
  "Acadence — bring your academic week into focus",
  `
  <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#151629"/><stop offset="1" stop-color="#302747"/></linearGradient><linearGradient id="accent"><stop stop-color="#a58efa"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient></defs>
  <style>@keyframes breathe{0%,100%{opacity:1}50%{opacity:.6}}@keyframes travel{to{stroke-dashoffset:-48}}.tile{animation:breathe 6s ease-in-out infinite}.route{animation:travel 5s linear infinite}@media(prefers-reduced-motion:reduce){.tile,.route{animation:none}}</style>
  ${rect(0, 0, 1200, 470, "url(#bg)", 26)}
  <circle cx="1040" cy="90" r="235" fill="none" stroke="#a897e5" stroke-opacity=".13"/><circle cx="1040" cy="90" r="285" fill="none" stroke="#a897e5" stroke-opacity=".08"/>
  ${rect(56, 43, 40, 40, "#8c76ee", 11)}<g stroke="white" stroke-width="1.7" fill="none"><rect x="67" y="55" width="18" height="17" rx="3"/><path d="M67 61h18m-13-9v7m8-7v7m-10 6h4m3 0h4m-11 4h4"/></g>
  ${text(110, 71, "acadence.", 28, "#ffffff", 700)}
  ${text(58, 130, "ACADEMIC PLANNING, SIMPLIFIED", 11, "#b8a9ed", 700, 'letter-spacing="2.5"')}
  ${text(55, 199, "Bring your week", 53, "#ffffff", 700)}
  ${text(55, 262, "into focus.", 60, "url(#accent)", 700)}
  ${text(58, 309, "A thoughtful workspace for balanced timetables,", 17, "#bcbaca")}
  ${text(58, 336, "clear reviews, and a calmer academic semester.", 17, "#bcbaca")}
  ${rect(57, 378, 112, 32, "#ffffff", 16, 'fill-opacity=".07" stroke="#a897e5" stroke-opacity=".25"')}${text(77, 399, "PLAN WITH CLARITY", 9, "#e0d9f4", 700)}
  ${text(189, 399, "Configure  /  Generate  /  Review  /  Export", 12, "#aba4be")}
  ${rect(653, 97, 486, 293, "#0c0d1a", 19, 'opacity=".22"')}
  ${rect(640, 82, 486, 293, "#fafaff", 19)}
  ${text(665, 119, "A WEEK, IN HARMONY", 12, "#504167", 700, 'letter-spacing="1.2"')}
  ${rect(993, 101, 106, 23, "#e3f2ec", 11)}${text(1007, 117, "BALANCED PLAN", 9, "#25715a", 700)}
  ${["MON", "TUE", "WED", "THU", "FRI"].map((d, i) => text(705 + i * 80, 167, d, 9, "#797387", 700)).join("")}
  ${["01", "02", "03", "04"].map((d, i) => text(661, 207 + i * 49, d, 10, "#9890a6")).join("")}
  ${cells}
  <path class="route" d="M670 412h187" fill="none" stroke="#8b78bd" stroke-width="2" stroke-dasharray="6 6"/>
  ${text(881, 418, "A LITTLE ORDER. A LOT OF POSSIBILITY.", 9, "#c3b8de", 700, 'letter-spacing="1"')}
`,
  "Animated illustration of a balanced timetable, with gentle cell pulses. The banner remains readable without animation and respects reduced-motion preferences.",
);

const steps = [
  [
    "01",
    "Configure",
    "Departments, rooms, batches",
    "and the subjects that matter.",
  ],
  [
    "02",
    "Generate",
    "A balanced five-day timetable",
    "with a room for every batch.",
  ],
  ["03", "Review", "Approve a draft or leave", "a clear note for revision."],
  [
    "04",
    "Export",
    "Download every batch as CSV",
    "or print the selected batch.",
  ],
];
const workflow = svg(
  1200,
  228,
  "From setup to a shareable academic plan",
  `${rect(0, 0, 1200, 228, "#f6f5fb", 22)}${steps
    .map(([n, title, line1, line2], i) => {
      const x = 22 + i * 296;
      return `${rect(x, 22, 268, 182, "#ffffff", 16, 'stroke="#e5e1ef"')}${rect(x + 20, 42, 38, 32, i === 0 ? "#7660cf" : "#eeeafa", 9)}${text(x + 30, 64, n, 12, i === 0 ? "white" : "#7660cf", 700)}${text(x + 20, 110, title, 23, "#272237", 700)}${text(x + 20, 146, line1, 13, "#777182")}${text(x + 20, 167, line2, 13, "#777182")}${i < 3 ? `<path d="M${x + 274} 108h14m-5-5 5 5-5 5" stroke="#9c8ec1" stroke-width="2" fill="none"/>` : ""}`;
    })
    .join("")}`,
);

const architecture = svg(
  1200,
  446,
  "Application architecture: scheduling and storage stay in the browser",
  `
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#a293c7"/></marker></defs>
  ${rect(0, 0, 1200, 446, "#f6f5fb", 22)}
  ${text(32, 39, "INSIDE YOUR BROWSER", 11, "#7660a9", 700, 'letter-spacing="2"')}
  ${rect(30, 63, 300, 225, "white", 16, 'stroke="#e1dce9"')}
  ${text(52, 96, "Workspace", 23, "#302942", 700)}${text(52, 121, "Next.js · React · TypeScript", 13, "#81758f")}
  ${["Academic setup & validation", "Batch timetable preview", "Review queue & export"].map((s, i) => `${rect(50, 140 + i * 44, 258, 32, "#f6f4fb", 7)}${text(65, 161 + i * 44, s, 13, "#5b4b72")}`).join("")}
  <path d="M340 163h66" stroke="#a293c7" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  ${rect(422, 63, 354, 225, "#282039", 16)}
  ${text(447, 97, "Scheduling engine", 23, "white", 700)}${text(447, 123, "Pure, deterministic functions", 13, "#b6a7cc")}
  ${["Validate resource capacity", "Rotate subjects evenly", "Allocate one room per batch", "Serialize safe CSV output"].map((s, i) => `${text(447, 164 + i * 28, "✓", 14, "#b5a1f1")}${text(471, 164 + i * 28, s, 14, "#e1d8ee")}`).join("")}
  <path d="M788 163h66" stroke="#a293c7" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  ${rect(871, 63, 299, 225, "white", 16, 'stroke="#e1dce9"')}
  ${text(895, 97, "Local workspace", 23, "#302942", 700)}${text(895, 123, "Versioned localStorage", 13, "#81758f")}
  ${text(895, 169, "Settings + schedule snapshots", 14, "#5b4b72")}${text(895, 199, "Drafts, decisions & review notes", 14, "#5b4b72")}${text(895, 244, "No automatic cloud sync", 12, "#9d6d40", 700)}
  <path d="M180 299v26" stroke="#a293c7" stroke-width="2" stroke-dasharray="4 4"/>
  ${rect(30, 336, 1140, 80, "#eeebf6", 12)}
  ${rect(50, 353, 96, 23, "#fff5de", 10)}${text(63, 369, "OPTIONAL", 10, "#92692e", 700)}
  ${text(166, 368, "Firebase Authentication", 17, "#554363", 700)}
  ${text(166, 392, "Email/password identity only. Authentication does not move schedules to Firestore.", 13, "#81758f")}
`,
  "The browser UI passes validated settings to a deterministic scheduling engine and stores settings, schedules, and review notes in localStorage. Optional Firebase Authentication supplies identity only; schedules are not synchronized to Firestore.",
);

const stackItems = [
  ["NEXT.JS", "14", "#272237"],
  ["REACT", "18", "#167796"],
  ["TYPESCRIPT", "5", "#3265a8"],
  ["TAILWIND", "3", "#0e8799"],
  ["NODE.JS", "22+", "#42805a"],
  ["FIREBASE", "OPTIONAL", "#9a7125"],
];
const stack = svg(
  1200,
  66,
  "Built with Next.js 14, React 18, TypeScript 5, Tailwind 3, Node 22 or newer, and optional Firebase",
  stackItems
    .map(
      ([name, version, color], i) =>
        `${rect(2 + i * 200, 8, 190, 48, "#f7f6fa", 11, 'stroke="#e7e2ed"')}<circle cx="21" cy="32" r="4" transform="translate(${i * 200} 0)" fill="${color}"/>${text(35 + i * 200, 36, name, 11, "#655b75", 700)}${text(181 + i * 200, 36, version, 11, color, 700, 'text-anchor="end"')}`,
    )
    .join(""),
);

for (const [name, contents] of Object.entries({
  "hero.svg": hero,
  "workflow.svg": workflow,
  "architecture.svg": architecture,
  "stack.svg": stack,
})) {
  const target = new URL(name, destination);
  await writeFile(target, contents + "\n");
  console.log(fileURLToPath(target));
}
