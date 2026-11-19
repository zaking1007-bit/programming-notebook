import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs/product-launch-project-tracker");
const outputPath = path.join(outputDir, "product-launch-project-tracker.xlsx");

const tasks = [
  ["PL-01", "Strategy", "Finalize launch positioning and core messaging", "Avery", "Complete", "High", new Date("2026-05-04"), new Date("2026-05-15"), "Customer insight synthesis", "Low", "Message drift across teams", 100, "Lock narrative into launch brief"],
  ["PL-02", "Product", "Approve release scope for launch build", "Morgan", "Complete", "Critical", new Date("2026-05-11"), new Date("2026-05-22"), "PL-01", "Low", "Scope change late in cycle", 100, "Freeze v1 feature list"],
  ["PL-03", "Engineering", "Finish launch readiness QA sweep", "Jordan", "In Progress", "Critical", new Date("2026-05-18"), new Date("2026-06-12"), "PL-02", "Medium", "Regression risk in checkout", 72, "Burn down Sev 2 issues"],
  ["PL-04", "Design", "Finalize screenshots and product visuals", "Casey", "In Progress", "High", new Date("2026-05-25"), new Date("2026-06-05"), "PL-01", "Low", "Late UI changes require refresh", 85, "Prepare final export set"],
  ["PL-05", "Lifecycle", "Build onboarding email and nurture flow", "Taylor", "In Progress", "Medium", new Date("2026-05-25"), new Date("2026-06-19"), "PL-01", "Medium", "Segment logic still being validated", 58, "Confirm trigger timing"],
  ["PL-06", "Web", "Publish launch landing page and conversion tracking", "Riley", "In Progress", "High", new Date("2026-06-01"), new Date("2026-06-26"), "PL-04", "Medium", "Analytics gaps could hide drop-off", 60, "Validate events in staging"],
  ["PL-07", "Sales Enablement", "Create pitch deck, battlecard, and FAQ", "Parker", "Not Started", "High", new Date("2026-06-08"), new Date("2026-07-03"), "PL-01", "Medium", "Field teams may use outdated deck", 18, "Draft first-pass enablement pack"],
  ["PL-08", "Operations", "Stand up support macros and escalation paths", "Quinn", "Not Started", "Medium", new Date("2026-06-15"), new Date("2026-07-10"), "PL-03", "Low", "Edge cases not covered in scripts", 10, "Define tier-two handoff"],
  ["PL-09", "Data", "Ship launch KPI dashboard and attribution model", "Harper", "In Progress", "High", new Date("2026-06-15"), new Date("2026-07-17"), "PL-06", "High", "Source joins still inconsistent", 42, "Finalize revenue attribution logic"],
  ["PL-10", "Legal", "Complete compliance and privacy review", "Reese", "Blocked", "Critical", new Date("2026-06-22"), new Date("2026-07-08"), "PL-06", "High", "Consent copy awaiting approval", 35, "Resolve copy edits with counsel"],
  ["PL-11", "PR", "Confirm announcement plan and media targets", "Sydney", "Not Started", "Medium", new Date("2026-06-29"), new Date("2026-07-15"), "PL-01", "Medium", "Embargo timing may slip", 12, "Align launch window with executives"],
  ["PL-12", "Customer Marketing", "Recruit launch advocates and case study quotes", "Blake", "Not Started", "Medium", new Date("2026-07-01"), new Date("2026-07-24"), "PL-05", "Low", "Reference approvals move slowly", 15, "Confirm customer shortlist"],
  ["PL-13", "Revenue Ops", "Set pricing, packaging, and CRM workflows", "Drew", "Not Started", "High", new Date("2026-07-06"), new Date("2026-07-22"), "PL-02", "Medium", "Order form logic still untested", 20, "Review handoff with sales ops"],
  ["PL-14", "Executive", "Run launch readiness review and go/no-go", "Jamie", "Not Started", "Critical", new Date("2026-07-20"), new Date("2026-07-28"), "PL-03, PL-06, PL-10, PL-13", "High", "Readiness gaps may delay date", 8, "Collect final department sign-offs"],
  ["PL-15", "Launch", "Go live, monitor, and coordinate rapid response", "Alex", "Not Started", "Critical", new Date("2026-07-29"), new Date("2026-08-07"), "PL-14", "High", "Traffic spike could stress support and infra", 0, "Prepare launch-day command center"],
];

const owners = ["All", ...new Set(tasks.map((task) => task[3]))];
const statuses = ["All", "Not Started", "In Progress", "Blocked", "Complete"];
const priorities = ["All", "Medium", "High", "Critical"];
const statusLegend = statuses.slice(1);
const ownerLegend = owners.slice(1);

const workbook = Workbook.create();
const tracker = workbook.worksheets.add("Tracker");
const timeline = workbook.worksheets.add("Timeline");
const dashboard = workbook.worksheets.add("Dashboard");

const theme = {
  titleFill: { type: "solid", color: { type: "theme", value: "accent1", transform: { darken: 10 } } },
  headerFill: { type: "solid", color: { type: "theme", value: "accent1", transform: { lighten: 50 } } },
  subHeaderFill: { type: "solid", color: { type: "theme", value: "accent2", transform: { lighten: 55 } } },
  panelFill: { type: "solid", color: { type: "theme", value: "accent1", transform: { lighten: 80 } } },
  neutralFill: { type: "solid", color: "#F8FAFC" },
  border: { preset: "outside", style: "thin", color: "#CBD5E1" },
};

function styleRange(range, overrides = {}) {
  range.format = {
    font: { name: "Aptos", size: 10, color: "#0F172A" },
    verticalAlignment: "center",
    ...overrides,
  };
}

function applyGrid(range, fill = theme.neutralFill) {
  styleRange(range, {
    fill,
    borders: { preset: "insideHorizontal", style: "thin", color: "#E2E8F0" },
  });
  range.format.borders = { preset: "outside", style: "thin", color: "#CBD5E1" };
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && aEnd >= bStart;
}

function weekLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function excelDateLiteral(date) {
  return `DATE(${date.getFullYear()},${date.getMonth() + 1},${date.getDate()})`;
}

function statusFill(status) {
  if (status === "Complete") return { type: "solid", color: "#DCFCE7" };
  if (status === "Blocked") return { type: "solid", color: "#FEE2E2" };
  if (status === "In Progress") return { type: "solid", color: "#DBEAFE" };
  return { type: "solid", color: "#F8FAFC" };
}

function priorityFill(priority) {
  if (priority === "Critical") return { type: "solid", color: "#FEE2E2" };
  if (priority === "High") return { type: "solid", color: "#FEF3C7" };
  return { type: "solid", color: "#E0F2FE" };
}

const trackerHeaders = [
  "Task ID",
  "Workstream",
  "Task",
  "Owner",
  "Status",
  "Priority",
  "Start Date",
  "Deadline",
  "Days Left",
  "Dependencies",
  "Risk Level",
  "Risk Notes",
  "Completion %",
  "Next Step",
];

tracker.getRange("A1:N1").values = [[
  "Product Launch Project Tracker",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
]];
styleRange(tracker.getRange("A1:N1"), {
  fill: theme.titleFill,
  font: { name: "Aptos Display", size: 16, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
});

tracker.getRange("A2:N2").values = [trackerHeaders];
styleRange(tracker.getRange("A2:N2"), {
  fill: theme.headerFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
  wrapText: true,
  borders: theme.border,
});

const trackerRows = tasks.map((task, index) => {
  const rowNum = index + 3;
  return [
    task[0],
    task[1],
    task[2],
    task[3],
    task[4],
    task[5],
    task[6],
    task[7],
    `=MAX(0,H${rowNum}-TODAY())`,
    task[8],
    task[9],
    task[10],
    task[11] / 100,
    task[12],
  ];
});

tracker.getRange(`A3:N${tasks.length + 2}`).values = trackerRows;
applyGrid(tracker.getRange(`A3:N${tasks.length + 2}`));
tracker.getRange(`M3:M${tasks.length + 2}`).format.numberFormat = "0%";
tracker.getRange(`G3:H${tasks.length + 2}`).format.numberFormat = "yyyy-mm-dd";
tracker.getRange(`I3:I${tasks.length + 2}`).format.numberFormat = "0";
tracker.freezePanes.freezeRows(2);
tracker.freezePanes.freezeColumns(3);

tracker.getRange(`D3:D${tasks.length + 2}`).dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: ownerLegend },
};
tracker.getRange(`E3:E${tasks.length + 2}`).dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: statusLegend },
};
tracker.getRange(`F3:F${tasks.length + 2}`).dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: priorities.slice(1) },
};
tracker.getRange(`K3:K${tasks.length + 2}`).dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: ["Low", "Medium", "High"] },
};

for (let i = 0; i < tasks.length; i += 1) {
  const row = i + 3;
  styleRange(tracker.getRange(`E${row}`), { fill: statusFill(tasks[i][4]), horizontalAlignment: "center" });
  styleRange(tracker.getRange(`F${row}`), { fill: priorityFill(tasks[i][5]), horizontalAlignment: "center" });
  styleRange(tracker.getRange(`K${row}`), { fill: priorityFill(tasks[i][9] === "High" ? "High" : "Medium"), horizontalAlignment: "center" });
}

tracker.getRange("P2:Q7").values = [
  ["Status Legend", "Meaning"],
  ["Complete", "Closed and ready to hand off"],
  ["In Progress", "Actively moving this week"],
  ["Blocked", "Needs decision or dependency cleared"],
  ["Not Started", "Queued but not underway"],
  ["", ""],
];
styleRange(tracker.getRange("P2:Q2"), {
  fill: theme.subHeaderFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
});
applyGrid(tracker.getRange("P3:Q6"), theme.panelFill);

const weekStarts = [];
const timelineStart = new Date("2026-05-04");
for (let i = 0; i < 14; i += 1) {
  const next = new Date(timelineStart);
  next.setDate(timelineStart.getDate() + i * 7);
  weekStarts.push(next);
}

timeline.getRange("A1:T1").values = [["Launch Timeline", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]];
styleRange(timeline.getRange("A1:T1"), {
  fill: theme.titleFill,
  font: { name: "Aptos Display", size: 16, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
});
timeline.getRange("A2:F2").values = [["Task ID", "Task", "Owner", "Status", "Start", "Deadline"]];
timeline.getRange("G2:T2").values = [weekStarts.map((d) => weekLabel(d))];
styleRange(timeline.getRange("A2:T2"), {
  fill: theme.headerFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
  wrapText: true,
  borders: theme.border,
});

for (let i = 0; i < tasks.length; i += 1) {
  const row = i + 3;
  const task = tasks[i];
  timeline.getRange(`A${row}:F${row}`).values = [[task[0], task[2], task[3], task[4], task[6], task[7]]];
  styleRange(timeline.getRange(`A${row}:F${row}`), { fill: theme.neutralFill, borders: theme.border });
  timeline.getRange(`E${row}:F${row}`).format.numberFormat = "yyyy-mm-dd";
  styleRange(timeline.getRange(`D${row}`), { fill: statusFill(task[4]), horizontalAlignment: "center" });
  for (let w = 0; w < weekStarts.length; w += 1) {
    const col = String.fromCharCode("G".charCodeAt(0) + w);
    const weekStart = weekStarts[w];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const active = overlap(task[6], task[7], weekStart, weekEnd);
    const dueThisWeek = task[7] >= weekStart && task[7] <= weekEnd;
    timeline.getRange(`${col}${row}`).values = [[active ? (dueThisWeek ? "◆" : "") : ""]];
    styleRange(timeline.getRange(`${col}${row}`), {
      fill: active ? statusFill(task[4]) : { type: "solid", color: "#FFFFFF" },
      horizontalAlignment: "center",
      borders: { preset: "outside", style: "thin", color: "#E2E8F0" },
    });
  }
}

timeline.freezePanes.freezeRows(2);
timeline.freezePanes.freezeColumns(6);

dashboard.getRange("A1:N1").values = [["Launch Dashboard", "", "", "", "", "", "", "", "", "", "", "", "", ""]];
styleRange(dashboard.getRange("A1:N1"), {
  fill: theme.titleFill,
  font: { name: "Aptos Display", size: 16, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
});

dashboard.getRange("A3:C6").values = [
  ["Filter", "Selection", "How it works"],
  ["Owner", "All", "Choose one owner or keep All"],
  ["Status", "All", "Limit counts to a single stage"],
  ["Priority", "All", "Focus on urgent workstreams"],
];
styleRange(dashboard.getRange("A3:C3"), {
  fill: theme.headerFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
});
applyGrid(dashboard.getRange("A4:C6"), theme.panelFill);
dashboard.getRange("B4").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: owners } };
dashboard.getRange("B5").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: statuses } };
dashboard.getRange("B6").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: priorities } };

const trackerStart = 3;
const trackerEnd = tasks.length + 2;
const ownerFilter = "$B$4";
const statusFilter = "$B$5";
const priorityFilter = "$B$6";
const taskMask = `--(Tracker!$A$${trackerStart}:$A$${trackerEnd}<>\"\")`;
const ownerMatch = `--(((Tracker!$D$${trackerStart}:$D$${trackerEnd}=${ownerFilter})+(${ownerFilter}=\"All\"))>0)`;
const statusMatch = `--(((Tracker!$E$${trackerStart}:$E$${trackerEnd}=${statusFilter})+(${statusFilter}=\"All\"))>0)`;
const priorityMatch = `--(((Tracker!$F$${trackerStart}:$F$${trackerEnd}=${priorityFilter})+(${priorityFilter}=\"All\"))>0)`;
const baseFilter = `${taskMask}*${ownerMatch}*${statusMatch}*${priorityMatch}`;

dashboard.getRange("A8:H10").values = [
  ["Filtered Tasks", "", "Avg Completion", "", "Critical Items", "", "Blocked", ""],
  [`=SUMPRODUCT(${baseFilter})`, "", `=IF(A9=0,0,SUMPRODUCT(${baseFilter},Tracker!$M$${trackerStart}:$M$${trackerEnd})/A9)`, "", `=SUMPRODUCT(${baseFilter},--(Tracker!$F$${trackerStart}:$F$${trackerEnd}=\"Critical\"))`, "", `=SUMPRODUCT(${baseFilter},--(Tracker!$E$${trackerStart}:$E$${trackerEnd}=\"Blocked\"))`, ""],
  ["", "", "", "", "", "", "", ""],
];
styleRange(dashboard.getRange("A8:H8"), {
  fill: theme.subHeaderFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
});
styleRange(dashboard.getRange("A9:H9"), {
  fill: theme.panelFill,
  font: { name: "Aptos Display", size: 18, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
  borders: theme.border,
});
dashboard.getRange("C9").format.numberFormat = "0%";

dashboard.getRange("A13:F17").values = [
  ["Status", "Count", "", "Priority", "Count", ""],
  [statusLegend[0], `=SUMPRODUCT(${baseFilter},--(Tracker!$E$${trackerStart}:$E$${trackerEnd}=\"${statusLegend[0]}\"))`, "", "Medium", `=SUMPRODUCT(${baseFilter},--(Tracker!$F$${trackerStart}:$F$${trackerEnd}=\"Medium\"))`, ""],
  [statusLegend[1], `=SUMPRODUCT(${baseFilter},--(Tracker!$E$${trackerStart}:$E$${trackerEnd}=\"${statusLegend[1]}\"))`, "", "High", `=SUMPRODUCT(${baseFilter},--(Tracker!$F$${trackerStart}:$F$${trackerEnd}=\"High\"))`, ""],
  [statusLegend[2], `=SUMPRODUCT(${baseFilter},--(Tracker!$E$${trackerStart}:$E$${trackerEnd}=\"${statusLegend[2]}\"))`, "", "Critical", `=SUMPRODUCT(${baseFilter},--(Tracker!$F$${trackerStart}:$F$${trackerEnd}=\"Critical\"))`, ""],
  [statusLegend[3], `=SUMPRODUCT(${baseFilter},--(Tracker!$E$${trackerStart}:$E$${trackerEnd}=\"${statusLegend[3]}\"))`, "", "", "", ""],
];
styleRange(dashboard.getRange("A13:F13"), {
  fill: theme.headerFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
});
applyGrid(dashboard.getRange("A14:B17"), theme.neutralFill);
applyGrid(dashboard.getRange("D14:E16"), theme.neutralFill);

dashboard.getRange("H13:J21").values = [
  ["Week", "Due", "Signal"],
  ...weekStarts.slice(6).map((date, idx) => {
    const nextWeek = new Date(date);
    nextWeek.setDate(date.getDate() + 7);
    return [
      weekLabel(date),
      `=SUMPRODUCT(${baseFilter},--(Tracker!$H$${trackerStart}:$H$${trackerEnd}>=${excelDateLiteral(date)}),--(Tracker!$H$${trackerStart}:$H$${trackerEnd}<${excelDateLiteral(nextWeek)}))`,
      `=IF(I${idx + 14}>=2,\"Peak\",\"Watch\")`,
    ];
  }),
];
styleRange(dashboard.getRange("H13:J13"), {
  fill: theme.headerFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
});
applyGrid(dashboard.getRange("H14:J20"), theme.neutralFill);

dashboard.getRange("A22:F28").values = [
  ["Critical Path Tasks", "", "", "", "", ""],
  ["Task", "Owner", "Status", "Priority", "Deadline", "Completion"],
  [`=Tracker!C5`, `=Tracker!D5`, `=Tracker!E5`, `=Tracker!F5`, `=Tracker!H5`, `=Tracker!M5`],
  [`=Tracker!C8`, `=Tracker!D8`, `=Tracker!E8`, `=Tracker!F8`, `=Tracker!H8`, `=Tracker!M8`],
  [`=Tracker!C12`, `=Tracker!D12`, `=Tracker!E12`, `=Tracker!F12`, `=Tracker!H12`, `=Tracker!M12`],
  [`=Tracker!C16`, `=Tracker!D16`, `=Tracker!E16`, `=Tracker!F16`, `=Tracker!H16`, `=Tracker!M16`],
  [`=Tracker!C17`, `=Tracker!D17`, `=Tracker!E17`, `=Tracker!F17`, `=Tracker!H17`, `=Tracker!M17`],
];
styleRange(dashboard.getRange("A22:F22"), {
  fill: theme.subHeaderFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
});
styleRange(dashboard.getRange("A23:F23"), {
  fill: theme.headerFill,
  font: { name: "Aptos", size: 10, bold: true, color: "#0F172A" },
  horizontalAlignment: "center",
});
applyGrid(dashboard.getRange("A24:F28"), theme.neutralFill);
dashboard.getRange("E24:E28").format.numberFormat = "yyyy-mm-dd";
dashboard.getRange("F24:F28").format.numberFormat = "0%";

dashboard.freezePanes.freezeRows(3);

const statusChart = dashboard.charts.add("ColumnClustered", dashboard.getRange("A13:B17"), "Auto");
statusChart.title.text = "Tasks by Status";
statusChart.setPosition(dashboard.getRange("L3:T16"));
statusChart.width = 520;
statusChart.height = 280;

const ownerChart = dashboard.charts.add("BarClustered", dashboard.getRange("D13:E16"), "Auto");
ownerChart.title.text = "Tasks by Priority";
ownerChart.setPosition(dashboard.getRange("L17:T31"));
ownerChart.width = 520;
ownerChart.height = 300;

const dueChart = dashboard.charts.add("LineMarkers", dashboard.getRange("H13:I20"), "Auto");
dueChart.title.text = "Upcoming Deadlines";
dueChart.setPosition(dashboard.getRange("G22:L31"));
dueChart.width = 360;
dueChart.height = 220;

for (const sheet of [tracker, timeline, dashboard]) {
  sheet.getRange("A:Z").format.autofitColumns();
  sheet.getRange("1:40").format.autofitRows();
}

const trackerInspect = await workbook.inspect({
  kind: "table",
  range: `Tracker!A1:N${tasks.length + 2}`,
  include: "values,formulas",
  tableMaxRows: 18,
  tableMaxCols: 14,
});
console.log("TRACKER_INSPECT");
console.log(trackerInspect.ndjson);

const dashboardInspect = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A3:J20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 10,
});
console.log("DASHBOARD_INSPECT");
console.log(dashboardInspect.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log("ERROR_SCAN");
console.log(errorScan.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const dashboardPreview = await workbook.render({ sheetName: "Dashboard", range: "A1:T31", format: "png" });
await fs.writeFile(path.join(outputDir, "dashboard-preview.png"), Buffer.from(await dashboardPreview.arrayBuffer()));
const timelinePreview = await workbook.render({ sheetName: "Timeline", range: `A1:T${tasks.length + 2}`, format: "png" });
await fs.writeFile(path.join(outputDir, "timeline-preview.png"), Buffer.from(await timelinePreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(`SAVED:${outputPath}`);
