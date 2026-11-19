import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Plus, X, Sparkles, Package, ShoppingCart, ChefHat, TrendingDown,
  AlertTriangle, Loader2, Minus, Trash2, Flame, CheckCircle2,
  Wand2, Circle, Info, Camera, Users, Pencil, Clock, DollarSign,
  CalendarDays, ChevronLeft, ChevronRight
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */

const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
  .lrd-root {
    --ink: #232E28;
    --ink-soft: #4A564E;
    --paper: #E9E5D6;
    --paper-2: #F4F1E6;
    --paper-3: #DEDAC7;
    --line: #C9C4AC;
    --gold: #C0932E;
    --gold-deep: #8E6A1E;
    --plum: #6E3548;
    --plum-deep: #4E2333;
    --pine: #3C6B4F;
    --pine-deep: #274A36;
    --rust: #A3432B;
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    background: var(--paper);
  }
  .lrd-display { font-family: 'Space Grotesk', sans-serif; }
  .lrd-mono { font-family: 'IBM Plex Mono', monospace; }
  .lrd-root ::selection { background: var(--gold); color: var(--paper-2); }
  .lrd-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .lrd-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
  .lrd-tab { transition: color .15s ease, background .15s ease; }
  .lrd-fade-in { animation: lrdFadeIn .25s ease both; }
  @keyframes lrdFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes lrdSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .lrd-spin { animation: lrdSpin 1s linear infinite; }
  .lrd-gauge-fill { transition: width .5s cubic-bezier(.4,0,.2,1); }
  .lrd-btn-primary { background: var(--pine); color: var(--paper-2); }
  .lrd-btn-primary:hover { background: var(--pine-deep); }
  .lrd-btn-gold { background: var(--gold); color: #2A1E06; }
  .lrd-btn-gold:hover { background: var(--gold-deep); color: var(--paper-2); }
  .lrd-input {
    background: var(--paper-2); border: 1px solid var(--line); color: var(--ink);
    border-radius: 4px; padding: 7px 10px; font-size: 13px; width: 100%;
  }
  .lrd-input:focus { outline: none; border-color: var(--pine); }
  .lrd-card { background: var(--paper-2); border: 1px solid var(--line); border-radius: 6px; }
  .lrd-dash { border-top: 1.5px dashed var(--line); }
  .lrd-chip { font-size: 10.5px; padding: 2px 7px; border-radius: 10px; font-weight: 600; white-space: nowrap; }
`;

/* ---------------------------------------------------------------------- */
/* Unit conversion + generic helpers                                      */
/* ---------------------------------------------------------------------- */

const MASS = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
const VOLUME = { ml: 1, l: 1000, tsp: 4.92892, tbsp: 14.7868, cup: 236.588, fl_oz: 29.5735 };
const UNIT_OPTIONS = ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "fl_oz", "oz", "lb", "each", "clove", "slice", "can"];
const CATEGORIES = ["Produce", "Meat", "Dairy & eggs", "Pantry", "Baking", "Frozen", "Other"];

function normName(s) {
  let n = (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (n.length > 3 && n.endsWith("es")) n = n.slice(0, -2);
  else if (n.length > 3 && n.endsWith("s") && !n.endsWith("ss")) n = n.slice(0, -1);
  return n;
}
function unitGroup(unit) {
  const u = (unit || "").toLowerCase();
  if (MASS[u]) return "mass";
  if (VOLUME[u]) return "volume";
  return "count:" + (u || "each");
}
function toBase(qty, unit) {
  const u = (unit || "").toLowerCase();
  const grp = unitGroup(u);
  if (grp === "mass") return { group: grp, base: qty * MASS[u] };
  if (grp === "volume") return { group: grp, base: qty * VOLUME[u] };
  return { group: grp, base: qty };
}
function fromBase(base, group) {
  if (group === "mass") {
    if (base >= 1000) return { qty: round(base / 1000, 2), unit: "kg" };
    return { qty: round(base, 0), unit: "g" };
  }
  if (group === "volume") {
    if (base >= 1000) return { qty: round(base / 1000, 2), unit: "l" };
    return { qty: round(base, 0), unit: "ml" };
  }
  return { qty: round(base, 2), unit: group.startsWith("count:") ? group.slice(6) : "each" };
}
function round(n, d) {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
}
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
function daysFromNow(n) { return new Date(Date.now() + n * 86400000).toISOString(); }
function genId(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 10); }
function money(n) { return "$" + n.toFixed(2); }

/* ---------------------------------------------------------------------- */
/* Shelf-life table (for expiration tracking)                             */
/* ---------------------------------------------------------------------- */

const SHELF_LIFE_BY_NAME = {
  milk: 7, eggs: 21, butter: 60, cheese: 14, "ground beef": 2, "chicken breast": 3,
  onion: 30, garlic: 60, "bell pepper": 7, broccoli: 5, spaghetti: 365, rice: 365,
  "canned tomato": 540, parmesan: 30, "soy sauce": 730, "olive oil": 365, "vegetable oil": 365,
  flour: 180, sugar: 365,
};
const SHELF_LIFE_BY_CATEGORY = { Produce: 7, Meat: 3, "Dairy & eggs": 14, Pantry: 270, Baking: 180, Frozen: 120, Other: 14 };

function shelfLifeDays(name, category) {
  const key = normName(name);
  if (SHELF_LIFE_BY_NAME[key] != null) return SHELF_LIFE_BY_NAME[key];
  return SHELF_LIFE_BY_CATEGORY[category] || 14;
}
function computeExpiresOn(name, category, fromISO) {
  const days = shelfLifeDays(name, category);
  const fromMs = fromISO ? new Date(fromISO).getTime() : Date.now();
  return new Date(fromMs + days * 86400000).toISOString();
}
function daysUntil(iso) {
  if (!iso) return null;
  return (new Date(iso).getTime() - Date.now()) / 86400000;
}

/* ---------------------------------------------------------------------- */
/* Seed data                                                              */
/* ---------------------------------------------------------------------- */

function seedRecipes() {
  return [
    { id: "r_bolognese", name: "Spaghetti Bolognese", servings: 4, ingredients: [
      { id: genId("i"), name: "ground beef", qty: 1, unit: "lb" },
      { id: genId("i"), name: "spaghetti", qty: 12, unit: "oz" },
      { id: genId("i"), name: "onion", qty: 1, unit: "each" },
      { id: genId("i"), name: "garlic", qty: 3, unit: "clove" },
      { id: genId("i"), name: "canned tomatoes", qty: 28, unit: "oz" },
      { id: genId("i"), name: "olive oil", qty: 2, unit: "tbsp" },
      { id: genId("i"), name: "parmesan", qty: 0.5, unit: "cup" },
    ]},
    { id: "r_stirfry", name: "Chicken Stir Fry", servings: 4, ingredients: [
      { id: genId("i"), name: "chicken breast", qty: 1.5, unit: "lb" },
      { id: genId("i"), name: "broccoli", qty: 2, unit: "cup" },
      { id: genId("i"), name: "soy sauce", qty: 3, unit: "tbsp" },
      { id: genId("i"), name: "garlic", qty: 2, unit: "clove" },
      { id: genId("i"), name: "rice", qty: 400, unit: "g" },
      { id: genId("i"), name: "vegetable oil", qty: 2, unit: "tbsp" },
    ]},
    { id: "r_omelette", name: "Veggie Omelette", servings: 2, ingredients: [
      { id: genId("i"), name: "eggs", qty: 4, unit: "each" },
      { id: genId("i"), name: "bell pepper", qty: 1, unit: "each" },
      { id: genId("i"), name: "onion", qty: 0.5, unit: "each" },
      { id: genId("i"), name: "cheese", qty: 0.5, unit: "cup" },
      { id: genId("i"), name: "butter", qty: 1, unit: "tbsp" },
      { id: genId("i"), name: "milk", qty: 2, unit: "tbsp" },
    ]},
    { id: "r_pancakes", name: "Weekend Pancakes", servings: 4, ingredients: [
      { id: genId("i"), name: "flour", qty: 250, unit: "g" },
      { id: genId("i"), name: "milk", qty: 350, unit: "ml" },
      { id: genId("i"), name: "eggs", qty: 2, unit: "each" },
      { id: genId("i"), name: "sugar", qty: 2, unit: "tbsp" },
      { id: genId("i"), name: "butter", qty: 3, unit: "tbsp" },
    ]},
  ];
}

function seedInventory() {
  const mk = (name, qty, unit, history, category, minQty, unitPrice) => {
    const lastRestock = history.filter((h) => h.delta > 0).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const anchor = lastRestock ? lastRestock.date : history[0].date;
    return {
      id: genId("inv"), name, qty, unit, category,
      minQty: minQty || 0, unitPrice: unitPrice != null ? unitPrice : null,
      expiresOn: computeExpiresOn(name, category, anchor),
      history: history.map((h) => ({ ...h, by: "You" })),
    };
  };
  return [
    mk("eggs", 6, "each", [{ date: daysAgo(12), delta: 12 }, { date: daysAgo(9), delta: -2 }, { date: daysAgo(6), delta: -2 }, { date: daysAgo(3), delta: -2 }], "Dairy & eggs", 4, 0.35),
    mk("milk", 0.4, "l", [{ date: daysAgo(6), delta: 1 }, { date: daysAgo(4), delta: -0.3 }, { date: daysAgo(2), delta: -0.3 }], "Dairy & eggs", 0.3, 2.9),
    mk("butter", 4, "tbsp", [{ date: daysAgo(10), delta: 8 }, { date: daysAgo(5), delta: -2 }, { date: daysAgo(2), delta: -2 }], "Dairy & eggs", 2, 0.35),
    mk("cheese", 1, "cup", [{ date: daysAgo(8), delta: 1.5 }, { date: daysAgo(3), delta: -0.5 }], "Dairy & eggs", 0, 3.2),
    mk("flour", 500, "g", [{ date: daysAgo(20), delta: 1000 }, { date: daysAgo(6), delta: -500 }], "Baking", 0, 0.003),
    mk("sugar", 300, "g", [{ date: daysAgo(20), delta: 500 }, { date: daysAgo(8), delta: -200 }], "Baking", 0, 0.0025),
    mk("garlic", 10, "clove", [{ date: daysAgo(10), delta: 12 }, { date: daysAgo(4), delta: -2 }], "Produce", 4, 0.18),
    mk("onion", 3, "each", [{ date: daysAgo(9), delta: 4 }, { date: daysAgo(4), delta: -1 }], "Produce", 2, 0.6),
    mk("bell pepper", 0, "each", [{ date: daysAgo(9), delta: 2 }, { date: daysAgo(5), delta: -2 }], "Produce", 0, 1.2),
    mk("broccoli", 1, "cup", [{ date: daysAgo(5), delta: 3 }, { date: daysAgo(2), delta: -2 }], "Produce", 0, 1.5),
    mk("ground beef", 0, "lb", [{ date: daysAgo(11), delta: 1 }, { date: daysAgo(7), delta: -1 }], "Meat", 0, 6.5),
    mk("chicken breast", 0.5, "lb", [{ date: daysAgo(9), delta: 2 }, { date: daysAgo(4), delta: -1.5 }], "Meat", 1, 4.2),
    mk("spaghetti", 4, "oz", [{ date: daysAgo(14), delta: 16 }, { date: daysAgo(6), delta: -12 }], "Pantry", 0, 0.12),
    mk("rice", 1200, "g", [{ date: daysAgo(15), delta: 2000 }, { date: daysAgo(5), delta: -400 }, { date: daysAgo(5), delta: -400 }], "Pantry", 300, 0.004),
    mk("canned tomatoes", 0, "oz", [{ date: daysAgo(13), delta: 28 }, { date: daysAgo(6), delta: -28 }], "Pantry", 0, 0.06),
    mk("parmesan", 0, "cup", [{ date: daysAgo(13), delta: 1 }, { date: daysAgo(6), delta: -1 }], "Dairy & eggs", 0, 4.5),
    mk("soy sauce", 200, "ml", [{ date: daysAgo(30), delta: 250 }, { date: daysAgo(6), delta: -30 }], "Pantry", 50, 0.02),
    mk("olive oil", 500, "ml", [{ date: daysAgo(40), delta: 750 }, { date: daysAgo(6), delta: -30 }], "Pantry", 100, 0.018),
    mk("vegetable oil", 300, "ml", [{ date: daysAgo(40), delta: 500 }, { date: daysAgo(6), delta: -30 }], "Pantry", 0, 0.01),
  ];
}

function seedMealPlan() {
  const days = weekDates();
  const plan = {};
  plan[days[0].key] = [{ id: genId("mp"), recipeId: "r_bolognese", multiplier: 1, cooked: false }];
  plan[days[1].key] = [{ id: genId("mp"), recipeId: "r_omelette", multiplier: 1, cooked: false }];
  plan[days[3].key] = [{ id: genId("mp"), recipeId: "r_stirfry", multiplier: 1, cooked: false }];
  return plan;
}

function weekDates() {
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      key, date: d,
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }
  return out;
}

/* ---------------------------------------------------------------------- */
/* Usage-rate intelligence                                                */
/* ---------------------------------------------------------------------- */

function usageStats(item) {
  const now = Date.now();
  const windowDays = 21;
  const cutoff = now - windowDays * 86400000;
  const consumed = item.history.filter((h) => h.delta < 0 && new Date(h.date).getTime() >= cutoff).reduce((s, h) => s + -h.delta, 0);
  const earliest = item.history.reduce((min, h) => Math.min(min, new Date(h.date).getTime()), now);
  const spanDays = Math.max(1, Math.min(windowDays, (now - earliest) / 86400000));
  const dailyRate = consumed / spanDays;
  const daysLeft = dailyRate > 0 ? item.qty / dailyRate : null;
  let status = "steady";
  if (item.qty <= 0) status = "out";
  else if (item.minQty > 0 && item.qty < item.minQty) status = "critical";
  else if (daysLeft !== null && daysLeft < 3) status = "critical";
  else if (daysLeft !== null && daysLeft < 7) status = "low";
  return { dailyRate, daysLeft, status };
}

const STATUS_COLOR = { out: "var(--rust)", critical: "var(--rust)", low: "var(--gold-deep)", steady: "var(--pine)" };

/* ---------------------------------------------------------------------- */
/* Claude API calls (text + vision)                                       */
/* ---------------------------------------------------------------------- */

async function callClaude(system, content) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1200, system, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) throw new Error("Request failed (" + res.status + ")");
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || "").join("\n").trim();
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function parseRecipeAI(rawText) {
  const system = `Extract a recipe from the user's text into structured JSON. Respond with ONLY a JSON object, no markdown, no commentary:
{"name": string, "servings": number, "ingredients": [{"name": string, "qty": number, "unit": string}]}
unit must be one of: g, kg, ml, l, tsp, tbsp, cup, fl_oz, oz, lb, each, clove, slice, can. Use "each" for whole countable items with no clearer unit. Keep ingredient names short and singular. If servings isn't stated, estimate reasonably.`;
  const json = await callClaude(system, rawText);
  const parsed = JSON.parse(json);
  return {
    id: genId("r"), name: parsed.name || "Untitled recipe", servings: Number(parsed.servings) || 4,
    ingredients: (parsed.ingredients || []).map((ing) => ({ id: genId("i"), name: ing.name, qty: Number(ing.qty) || 1, unit: ing.unit || "each" })),
  };
}

async function getInsightsAI(summary) {
  const system = `You are the intelligence behind Well Stocked, a household grocery and pantry app. Given a JSON summary of inventory, usage rates, expiration risk, par-level rules, prices, and the upcoming meal plan, produce 4-7 short, specific, genuinely useful suggestions. Respond with ONLY a JSON array, no markdown:
[{"type": "restock"|"bulk_buy"|"recipe_idea"|"waste_risk"|"tip", "message": string}]
Prioritize items expiring before they'll be used, and items below their set minimum. Keep each message under 22 words, concrete, grounded only in the given numbers. Do not invent items not present in the data.`;
  const json = await callClaude(system, JSON.stringify(summary));
  return JSON.parse(json);
}

async function scanReceiptAI(base64, mediaType) {
  const system = `Extract purchased grocery items from this receipt photo. Respond with ONLY a JSON array, no markdown, no commentary:
[{"name": string, "qty": number, "unit": string, "price": number|null}]
unit must be one of: g, kg, ml, l, tsp, tbsp, cup, fl_oz, oz, lb, each, clove, slice, can — use "each" when the receipt just shows a count. price is the line total in dollars if legible, otherwise null. Skip non-grocery lines like tax, subtotal, and loyalty discounts. Keep names short and generic (e.g. "milk" not "2% Milk 1gal Store Brand").`;
  const content = [
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    { type: "text", text: "Extract the grocery line items from this receipt." },
  ];
  const json = await callClaude(system, content);
  return JSON.parse(json);
}

const INSIGHT_ICON = { restock: AlertTriangle, bulk_buy: Package, recipe_idea: ChefHat, waste_risk: TrendingDown, tip: Info };
const INSIGHT_COLOR = { restock: "var(--rust)", bulk_buy: "var(--gold-deep)", recipe_idea: "var(--pine)", waste_risk: "var(--plum)", tip: "var(--ink-soft)" };

/* ---------------------------------------------------------------------- */
/* Small UI atoms                                                         */
/* ---------------------------------------------------------------------- */

function GaugeBar({ pct, color }) {
  return (
    <div style={{ background: "var(--paper-3)", height: 6, borderRadius: 3, overflow: "hidden" }}>
      <div className="lrd-gauge-fill" style={{ width: `${Math.max(2, Math.min(100, pct))}%`, height: "100%", background: color }} />
    </div>
  );
}
function IconBtn({ onClick, children, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 4, border: "1px solid var(--line)", background: "var(--paper-2)",
      color: danger ? "var(--rust)" : "var(--ink-soft)", cursor: "pointer", flexShrink: 0,
    }}>{children}</button>
  );
}
function ExpiryChip({ item }) {
  const d = daysUntil(item.expiresOn);
  if (d === null || item.qty <= 0) return null;
  let bg = "var(--paper-3)", fg = "var(--ink-soft)", label = `use by ${new Date(item.expiresOn).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  if (d <= 1.5) { bg = "#F0DAD3"; fg = "var(--rust)"; label = d <= 0 ? "expired" : "expires today"; }
  else if (d <= 4) { bg = "#F2E6C9"; fg = "var(--gold-deep)"; label = `expires in ${Math.round(d)}d`; }
  return <span className="lrd-chip lrd-mono" style={{ background: bg, color: fg }}>{label}</span>;
}
function ParChip({ item }) {
  if (!item.minQty || item.qty >= item.minQty) return null;
  return <span className="lrd-chip lrd-mono" style={{ background: "#F0DAD3", color: "var(--rust)" }}>below min ({item.minQty} {item.unit})</span>;
}

/* ---------------------------------------------------------------------- */
/* Main App                                                               */
/* ---------------------------------------------------------------------- */

export default function WellStockedApp() {
  const [tab, setTab] = useState("recipes");
  const [recipes, setRecipes] = useState(seedRecipes);
  const [inventory, setInventory] = useState(seedInventory);
  const [mealPlan, setMealPlan] = useState(seedMealPlan);
  const [checkedOff, setCheckedOff] = useState({});
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showInvModal, setShowInvModal] = useState(null); // null | 'add' | item object for edit
  const [showScan, setShowScan] = useState(false);
  const [showHousehold, setShowHousehold] = useState(false);
  const [members, setMembers] = useState(["You"]);
  const [activeMember, setActiveMember] = useState("You");
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [toast, setToast] = useState(null);

  const days = useMemo(() => weekDates(), []);
  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); }, []);

  function logHistory(item, delta) {
    return { ...item, history: [...item.history, { date: new Date().toISOString(), delta, by: activeMember }] };
  }

  /* ---- inventory actions ---- */

  function quickAdjust(id, sign) {
    setInventory((inv) => inv.map((item) => {
      if (item.id !== id) return item;
      const step = ["each", "clove", "slice", "can"].includes(item.unit) ? 1 : Math.max(1, round(item.qty * 0.1, 0) || 1);
      const delta = sign * step;
      const newQty = Math.max(0, round(item.qty + delta, 2));
      let next = { ...item, qty: newQty };
      if (delta > 0) next.expiresOn = computeExpiresOn(item.name, item.category, new Date().toISOString());
      next = logHistory(next, delta);
      return next;
    }));
  }
  function removeInventory(id) { setInventory((inv) => inv.filter((i) => i.id !== id)); }

  function saveInventoryItem(data, editingId) {
    if (editingId) {
      setInventory((inv) => inv.map((item) => item.id === editingId ? { ...item, ...data } : item));
      flash(`Updated ${data.name}`);
    } else {
      const newItem = {
        id: genId("inv"), ...data,
        expiresOn: computeExpiresOn(data.name, data.category, new Date().toISOString()),
        history: [{ date: new Date().toISOString(), delta: data.qty, by: activeMember }],
      };
      setInventory((inv) => [...inv, newItem]);
      flash(`Added ${data.name} to inventory`);
    }
    setShowInvModal(null);
  }

  function mergeIntoInventory(items) {
    setInventory((inv) => {
      let next = [...inv];
      items.forEach((g) => {
        const norm = normName(g.name);
        const idx = next.findIndex((i) => normName(i.name) === norm);
        const addQty = typeof g.qty === "number" && g.qty > 0 ? g.qty : 1;
        if (idx >= 0) {
          const item = next[idx];
          const cur = toBase(item.qty, item.unit);
          const add = toBase(addQty, g.unit || item.unit);
          const merged = fromBase(cur.base + add.base, cur.group);
          next[idx] = {
            ...item, qty: merged.qty, unit: merged.unit,
            unitPrice: g.price != null ? round(g.price / addQty, 3) : item.unitPrice,
            expiresOn: computeExpiresOn(item.name, item.category, new Date().toISOString()),
            history: [...item.history, { date: new Date().toISOString(), delta: addQty, by: activeMember }],
          };
        } else {
          next.push({
            id: genId("inv"), name: g.name, qty: addQty, unit: g.unit || "each", category: g.category || "Other",
            minQty: 0, unitPrice: g.price != null ? round(g.price / addQty, 3) : null,
            expiresOn: computeExpiresOn(g.name, g.category || "Other", new Date().toISOString()),
            history: [{ date: new Date().toISOString(), delta: addQty, by: activeMember }],
          });
        }
      });
      return next;
    });
  }

  /* ---- recipes ---- */

  function removeRecipe(id) {
    setRecipes((r) => r.filter((x) => x.id !== id));
    setMealPlan((mp) => {
      const next = {};
      Object.entries(mp).forEach(([k, list]) => { next[k] = list.filter((e) => e.recipeId !== id); });
      return next;
    });
  }

  function addToPlan(recipeId, dayKey) {
    setMealPlan((mp) => ({ ...mp, [dayKey]: [...(mp[dayKey] || []), { id: genId("mp"), recipeId, multiplier: 1, cooked: false }] }));
    flash("Added to " + (dayKey === days[0].key ? "today" : new Date(dayKey).toLocaleDateString(undefined, { weekday: "long" })));
  }

  function cookAdHoc(recipe) { deductForRecipe(recipe, 1); flash(`Logged "${recipe.name}" as cooked — inventory updated`); }

  function deductForRecipe(recipe, multiplier) {
    setInventory((inv) => inv.map((item) => {
      const match = recipe.ingredients.find((ing) => normName(ing.name) === normName(item.name));
      if (!match) return item;
      const needBase = toBase(match.qty * multiplier, match.unit);
      const curBase = toBase(item.qty, item.unit);
      if (needBase.group !== curBase.group) return item;
      const newBase = Math.max(0, curBase.base - needBase.base);
      const conv = fromBase(newBase, curBase.group);
      const consumedDisplay = fromBase(needBase.base, curBase.group);
      return logHistory({ ...item, qty: conv.qty, unit: conv.unit }, -consumedDisplay.qty);
    }));
  }

  /* ---- meal plan actions ---- */

  function setPlanMultiplier(dayKey, entryId, mult) {
    setMealPlan((mp) => ({ ...mp, [dayKey]: mp[dayKey].map((e) => e.id === entryId ? { ...e, multiplier: Math.max(0.5, round(mult, 2)) } : e) }));
  }
  function removePlanEntry(dayKey, entryId) {
    setMealPlan((mp) => ({ ...mp, [dayKey]: mp[dayKey].filter((e) => e.id !== entryId) }));
  }
  function cookPlanEntry(dayKey, entry, recipe) {
    deductForRecipe(recipe, entry.multiplier);
    setMealPlan((mp) => ({ ...mp, [dayKey]: mp[dayKey].map((e) => e.id === entry.id ? { ...e, cooked: true } : e) }));
    flash(`Logged "${recipe.name}" as cooked`);
  }

  /* ---- grocery list computation ---- */

  const groceryData = useMemo(() => {
    const needed = {};
    Object.entries(mealPlan).forEach(([dayKey, entries]) => {
      entries.forEach((entry) => {
        if (entry.cooked) return;
        const recipe = recipes.find((r) => r.id === entry.recipeId);
        if (!recipe) return;
        recipe.ingredients.forEach((ing) => {
          const { group, base } = toBase(ing.qty * entry.multiplier, ing.unit);
          const key = normName(ing.name) + "|" + group;
          if (!needed[key]) needed[key] = { name: ing.name, group, base: 0 };
          needed[key].base += base;
        });
      });
    });

    const invMap = {};
    inventory.forEach((item) => {
      const { group, base } = toBase(item.qty, item.unit);
      const key = normName(item.name) + "|" + group;
      invMap[key] = (invMap[key] || 0) + base;
    });

    const shortfall = [];
    Object.entries(needed).forEach(([key, n]) => {
      const have = invMap[key] || 0;
      const shortBase = n.base - have;
      if (shortBase > 0.01) {
        const conv = fromBase(shortBase, n.group);
        const invItem = inventory.find((i) => normName(i.name) + "|" + unitGroup(i.unit) === key);
        const cost = invItem && invItem.unitPrice != null ? conv.qty * invItem.unitPrice : null;
        shortfall.push({ key, name: n.name, qty: conv.qty, unit: conv.unit, reason: "recipe", cost });
      }
    });

    const shortfallKeys = new Set(shortfall.map((s) => s.key));
    const runningLow = inventory
      .map((item) => ({ item, stats: usageStats(item) }))
      .filter(({ item, stats }) => stats.status === "low" || stats.status === "critical" || stats.status === "out")
      .filter(({ item }) => !shortfallKeys.has(normName(item.name) + "|" + unitGroup(item.unit)))
      .map(({ item, stats }) => ({
        key: "low_" + item.id, name: item.name, qty: "", unit: item.unit, reason: item.minQty > 0 && item.qty < item.minQty ? "par" : "usage",
        stats, cost: null,
      }));

    const estTotal = [...shortfall, ...runningLow].reduce((s, g) => s + (g.cost || 0), 0);
    return { shortfall, runningLow, estTotal };
  }, [mealPlan, recipes, inventory]);

  function toggleChecked(key) { setCheckedOff((c) => ({ ...c, [key]: !c[key] })); }

  function addPurchasedToInventory() {
    const checkedItems = [...groceryData.shortfall, ...groceryData.runningLow].filter((g) => checkedOff[g.key]);
    if (checkedItems.length === 0) { flash("Check off items first"); return; }
    mergeIntoInventory(checkedItems.map((g) => ({ name: g.name, qty: typeof g.qty === "number" ? g.qty : 1, unit: g.unit, price: g.cost })));
    setCheckedOff({});
    flash(`Added ${checkedItems.length} item${checkedItems.length > 1 ? "s" : ""} to inventory`);
  }

  /* ---- AI insights ---- */

  async function runInsights() {
    setInsightsLoading(true); setInsightsError(null);
    try {
      const weeklySpendEstimate = inventory.reduce((s, item) => {
        const stats = usageStats(item);
        return s + (item.unitPrice ? stats.dailyRate * 7 * item.unitPrice : 0);
      }, 0);
      const summary = {
        upcomingMeals: days.map((d) => ({
          day: d.weekday, meals: (mealPlan[d.key] || []).filter((e) => !e.cooked).map((e) => {
            const r = recipes.find((x) => x.id === e.recipeId);
            return r ? r.name : null;
          }).filter(Boolean),
        })).filter((d) => d.meals.length),
        inventory: inventory.map((item) => {
          const s = usageStats(item);
          return {
            name: item.name, qty: item.qty, unit: item.unit, minQty: item.minQty || null,
            unitPrice: item.unitPrice, dailyUsageRate: round(s.dailyRate, 3),
            daysUntilEmpty: s.daysLeft === null ? null : round(s.daysLeft, 1),
            daysUntilExpiry: item.expiresOn ? round(daysUntil(item.expiresOn), 1) : null,
            status: s.status,
          };
        }),
        groceryShortfall: groceryData.shortfall.map((s) => ({ name: s.name, qty: s.qty, unit: s.unit })),
        estimatedWeeklySpend: round(weeklySpendEstimate, 2),
      };
      const result = await getInsightsAI(summary);
      setInsights(Array.isArray(result) ? result : []);
    } catch (e) {
      setInsightsError(e.message || "Something went wrong");
    } finally {
      setInsightsLoading(false);
    }
  }

  const totalGroceryCount = groceryData.shortfall.length + groceryData.runningLow.length;

  return (
    <div className="lrd-root lrd-fade-in" style={{ minHeight: 600, borderRadius: 10, overflow: "hidden", position: "relative" }}>
      <style>{TOKENS}</style>

      {/* Header */}
      <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 8 }}>
            <ChefHat size={22} color="var(--pine)" /> Well Stocked
          </div>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
            recipes → calendar → what's needed → what to buy
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowHousehold(true)} title="Household" style={{
            display: "flex", alignItems: "center", gap: 6, background: "var(--paper-2)", border: "1px solid var(--line)",
            borderRadius: 20, padding: "5px 10px 5px 5px", cursor: "pointer",
          }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--pine)", color: "var(--paper-2)", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {activeMember.slice(0, 2).toUpperCase()}
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{activeMember}</span>
          </button>
          {totalGroceryCount > 0 && (
            <div onClick={() => setTab("grocery")} style={{
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: "var(--rust)",
              color: "var(--paper-2)", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}>
              <ShoppingCart size={13} /> {totalGroceryCount} to buy
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "0 24px", borderBottom: "1px solid var(--line)", background: "var(--paper-3)" }}>
        {[["recipes", "Recipes", ChefHat], ["calendar", "Calendar", CalendarDays], ["inventory", "Inventory", Package], ["grocery", "Grocery list", ShoppingCart], ["insights", "Insights", Sparkles]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className="lrd-tab" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 13, fontWeight: 600,
            background: "transparent", border: "none", cursor: "pointer",
            color: tab === key ? "var(--pine-deep)" : "var(--ink-soft)",
            borderBottom: tab === key ? "2px solid var(--pine)" : "2px solid transparent", marginBottom: -1,
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="lrd-scroll" style={{ padding: 24, maxHeight: 660, overflowY: "auto" }}>
        {tab === "recipes" && (
          <RecipesTab recipes={recipes} days={days} removeRecipe={removeRecipe} cookAdHoc={cookAdHoc}
            addToPlan={addToPlan} onAdd={() => setShowAddRecipe(true)} />
        )}
        {tab === "calendar" && (
          <CalendarTab days={days} mealPlan={mealPlan} recipes={recipes}
            setPlanMultiplier={setPlanMultiplier} removePlanEntry={removePlanEntry} cookPlanEntry={cookPlanEntry} />
        )}
        {tab === "inventory" && (
          <InventoryTab inventory={inventory} quickAdjust={quickAdjust} removeInventory={removeInventory}
            onAdd={() => setShowInvModal("add")} onEdit={(item) => setShowInvModal(item)} onScan={() => setShowScan(true)} />
        )}
        {tab === "grocery" && (
          <GroceryTab groceryData={groceryData} checkedOff={checkedOff} toggleChecked={toggleChecked}
            addPurchasedToInventory={addPurchasedToInventory} onScan={() => setShowScan(true)} />
        )}
        {tab === "insights" && (
          <InsightsTab inventory={inventory} insights={insights} loading={insightsLoading} error={insightsError} onRun={runInsights} />
        )}
      </div>

      {showAddRecipe && (
        <AddRecipeModal onClose={() => setShowAddRecipe(false)}
          onSave={(r) => { setRecipes((rs) => [...rs, r]); setShowAddRecipe(false); flash(`Added "${r.name}"`); }} />
      )}
      {showInvModal && (
        <InventoryModal
          initial={showInvModal === "add" ? null : showInvModal}
          onClose={() => setShowInvModal(null)}
          onSave={(data) => saveInventoryItem(data, showInvModal === "add" ? null : showInvModal.id)}
        />
      )}
      {showScan && (
        <ReceiptScanModal onClose={() => setShowScan(false)}
          onSave={(items) => { mergeIntoInventory(items); setShowScan(false); flash(`Added ${items.length} item${items.length > 1 ? "s" : ""} from receipt`); }} />
      )}
      {showHousehold && (
        <HouseholdModal members={members} setMembers={setMembers} activeMember={activeMember}
          setActiveMember={setActiveMember} onClose={() => setShowHousehold(false)} />
      )}

      {toast && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--paper-2)", padding: "9px 16px", borderRadius: 20,
          fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(0,0,0,.2)", zIndex: 30,
        }}>
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Recipes tab                                                            */
/* ---------------------------------------------------------------------- */

function RecipesTab({ recipes, days, removeRecipe, cookAdHoc, addToPlan, onAdd }) {
  const [pickerFor, setPickerFor] = useState(null);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>Recipe library</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>Add recipes to your calendar, or cook one right now.</div>
        </div>
        <button onClick={onAdd} className="lrd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={15} /> Add recipe
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {recipes.map((r) => (
          <div key={r.id} className="lrd-card" style={{ padding: 14, position: "relative" }}>
            <div className="lrd-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{r.name}</div>
            <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
              {r.ingredients.length} ingredients · base {r.servings} servings
            </div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {r.ingredients.slice(0, 4).map((ing) => (
                <span key={ing.id} className="lrd-mono" style={{ fontSize: 10.5, background: "var(--paper-3)", padding: "2px 6px", borderRadius: 3, color: "var(--ink-soft)" }}>{ing.name}</span>
              ))}
              {r.ingredients.length > 4 && <span className="lrd-mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", padding: "2px 4px" }}>+{r.ingredients.length - 4} more</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
              <button onClick={() => setPickerFor(pickerFor === r.id ? null : r.id)} style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "5px 9px",
                borderRadius: 5, border: "1px solid var(--pine)", background: "var(--paper-2)", color: "var(--pine-deep)", cursor: "pointer",
              }}>
                <CalendarDays size={12} /> Add to calendar
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => cookAdHoc(r)} title="Cook now — deducts from inventory immediately" style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "5px 9px",
                  borderRadius: 5, border: "1px solid var(--gold-deep)", background: "var(--paper-2)", color: "var(--gold-deep)", cursor: "pointer",
                }}>
                  <Flame size={12} /> Cook now
                </button>
                <IconBtn onClick={() => removeRecipe(r.id)} title="Delete recipe" danger><Trash2 size={12} /></IconBtn>
              </div>
            </div>

            {pickerFor === r.id && (
              <div className="lrd-fade-in" style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line)", display: "flex", flexWrap: "wrap", gap: 5 }}>
                {days.map((d) => (
                  <button key={d.key} onClick={() => { addToPlan(r.id, d.key); setPickerFor(null); }} style={{
                    fontSize: 11, padding: "5px 8px", borderRadius: 5, border: "1px solid var(--line)",
                    background: d.isToday ? "var(--pine)" : "var(--paper-2)", color: d.isToday ? "var(--paper-2)" : "var(--ink)", cursor: "pointer",
                  }}>
                    {d.weekday} {d.dayNum}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Calendar tab                                                           */
/* ---------------------------------------------------------------------- */

function CalendarTab({ days, mealPlan, recipes, setPlanMultiplier, removePlanEntry, cookPlanEntry }) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>Next 7 days</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
          Everything planned here (not yet cooked) feeds the grocery list. Add meals from the Recipes tab.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {days.map((d) => {
          const entries = mealPlan[d.key] || [];
          return (
            <div key={d.key} className="lrd-card" style={{ padding: 8, minHeight: 140, borderColor: d.isToday ? "var(--pine)" : "var(--line)", borderWidth: d.isToday ? 2 : 1 }}>
              <div className="lrd-mono" style={{ fontSize: 10.5, color: d.isToday ? "var(--pine-deep)" : "var(--ink-soft)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>
                {d.isToday ? "Today" : d.weekday} · {d.dayNum}
              </div>
              {entries.length === 0 && <div style={{ fontSize: 11, color: "var(--line)", padding: "8px 0" }}>—</div>}
              {entries.map((e) => {
                const r = recipes.find((x) => x.id === e.recipeId);
                if (!r) return null;
                return (
                  <div key={e.id} style={{
                    background: e.cooked ? "var(--paper-3)" : "var(--paper)", border: "1px solid var(--line)", borderRadius: 5,
                    padding: "6px 7px", marginBottom: 5, opacity: e.cooked ? 0.6 : 1,
                  }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.3 }}>{r.name}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      {!e.cooked ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <button onClick={() => setPlanMultiplier(d.key, e.id, e.multiplier - 0.5)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 0 }}><Minus size={10} /></button>
                          <span className="lrd-mono" style={{ fontSize: 10, width: 18, textAlign: "center" }}>{e.multiplier}×</span>
                          <button onClick={() => setPlanMultiplier(d.key, e.id, e.multiplier + 0.5)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 0 }}><Plus size={10} /></button>
                        </div>
                      ) : <span className="lrd-mono" style={{ fontSize: 10, color: "var(--pine)" }}>cooked</span>}
                      <div style={{ display: "flex", gap: 3 }}>
                        {!e.cooked && (
                          <button onClick={() => cookPlanEntry(d.key, e, r)} title="Cooked it" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gold-deep)", padding: 0 }}><Flame size={12} /></button>
                        )}
                        <button onClick={() => removePlanEntry(d.key, e.id)} title="Remove" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--rust)", padding: 0 }}><X size={12} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Inventory tab                                                          */
/* ---------------------------------------------------------------------- */

function InventoryTab({ inventory, quickAdjust, removeInventory, onAdd, onEdit, onScan }) {
  const byCategory = useMemo(() => {
    const map = {};
    inventory.forEach((item) => { const cat = item.category || "Other"; if (!map[cat]) map[cat] = []; map[cat].push(item); });
    return map;
  }, [inventory]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>On hand</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>Gauges reflect stock relative to your actual usage pace.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onScan} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper-2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Camera size={15} /> Scan receipt
          </button>
          <button onClick={onAdd} className="lrd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={15} /> Add item
          </button>
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>{cat}</div>
          <div className="lrd-card" style={{ overflow: "hidden" }}>
            {items.map((item, idx) => {
              const stats = usageStats(item);
              const color = STATUS_COLOR[stats.status];
              const maxRef = Math.max(item.qty, item.history.reduce((m, h) => Math.max(m, h.delta > 0 ? h.delta : 0), 0), 1);
              const pct = (item.qty / maxRef) * 100;
              return (
                <div key={item.id} style={{ padding: "10px 14px", borderTop: idx > 0 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 80px 1fr auto auto auto", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, textTransform: "capitalize" }}>{item.name}</div>
                      <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>
                        {stats.daysLeft === null ? (item.qty <= 0 ? "out of stock" : "no usage history yet") : `~${Math.max(0, round(stats.daysLeft, 0))}d left at current pace`}
                      </div>
                    </div>
                    <div className="lrd-mono" style={{ fontSize: 13, textAlign: "right", color: item.qty <= 0 ? "var(--rust)" : "var(--ink)" }}>{item.qty} {item.unit}</div>
                    <GaugeBar pct={pct} color={color} />
                    <div style={{ display: "flex", gap: 4 }}>
                      <IconBtn onClick={() => quickAdjust(item.id, -1)} title="Log use"><Minus size={12} /></IconBtn>
                      <IconBtn onClick={() => quickAdjust(item.id, 1)} title="Restock"><Plus size={12} /></IconBtn>
                    </div>
                    <IconBtn onClick={() => onEdit(item)} title="Edit"><Pencil size={12} /></IconBtn>
                    <IconBtn onClick={() => removeInventory(item.id)} title="Remove" danger><Trash2 size={12} /></IconBtn>
                  </div>
                  {(item.minQty > 0 || item.expiresOn || item.unitPrice != null) && (
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      <ExpiryChip item={item} />
                      <ParChip item={item} />
                      {item.unitPrice != null && (
                        <span className="lrd-chip lrd-mono" style={{ background: "var(--paper-3)", color: "var(--ink-soft)" }}>~{money(item.unitPrice)}/{item.unit}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Grocery list tab                                                       */
/* ---------------------------------------------------------------------- */

function GroceryTab({ groceryData, checkedOff, toggleChecked, addPurchasedToInventory, onScan }) {
  const { shortfall, runningLow, estTotal } = groceryData;
  const allEmpty = shortfall.length === 0 && runningLow.length === 0;
  const checkedCount = [...shortfall, ...runningLow].filter((g) => checkedOff[g.key]).length;

  return (
    <div>
      <div className="lrd-card" style={{ maxWidth: 460, margin: "0 auto", padding: "20px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div className="lrd-display" style={{ fontSize: 16, fontWeight: 700 }}>Grocery list</div>
          <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 2 }}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="lrd-dash" style={{ marginBottom: 12 }} />

        {allEmpty && <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-soft)", fontSize: 13 }}>Nothing needed right now — your inventory covers the plan.</div>}

        {shortfall.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--pine-deep)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Needed for the plan</div>
            {shortfall.map((g) => <GroceryRow key={g.key} g={g} checked={!!checkedOff[g.key]} onToggle={() => toggleChecked(g.key)} />)}
          </div>
        )}

        {runningLow.length > 0 && (
          <div>
            <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--gold-deep)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Running low</div>
            {runningLow.map((g) => <GroceryRow key={g.key} g={g} checked={!!checkedOff[g.key]} onToggle={() => toggleChecked(g.key)} low />)}
          </div>
        )}

        {!allEmpty && estTotal > 0 && (
          <div className="lrd-mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-soft)", marginTop: 12, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <span>Estimated total</span><span>{money(estTotal)}</span>
          </div>
        )}

        {!allEmpty && (
          <>
            <div className="lrd-dash" style={{ margin: "14px 0 12px" }} />
            <button onClick={addPurchasedToInventory} className="lrd-btn-gold" style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <ShoppingCart size={14} /> Mark {checkedCount || ""} checked as bought
            </button>
          </>
        )}
        <button onClick={onScan} style={{ width: "100%", marginTop: 8, padding: "9px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper-2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--ink-soft)" }}>
          <Camera size={13} /> Or scan a receipt after shopping
        </button>
      </div>
    </div>
  );
}

function GroceryRow({ g, checked, onToggle, low }) {
  return (
    <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 4px", cursor: "pointer", opacity: checked ? 0.45 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {checked ? <CheckCircle2 size={16} color="var(--pine)" /> : <Circle size={16} color="var(--line)" />}
        <span style={{ fontSize: 13.5, textDecoration: checked ? "line-through" : "none", textTransform: "capitalize" }}>{g.name}</span>
        {low && g.reason === "par" && <span className="lrd-chip" style={{ background: "#F0DAD3", color: "var(--rust)" }}>below min</span>}
        {low && g.reason === "usage" && <AlertTriangle size={11} color="var(--gold-deep)" />}
      </div>
      <span className="lrd-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
        {g.qty ? `${g.qty} ${g.unit}${g.cost ? ` · ${money(g.cost)}` : ""}` : (g.stats && g.stats.status === "out" ? "out" : "restock")}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Insights tab                                                           */
/* ---------------------------------------------------------------------- */

function InsightsTab({ inventory, insights, loading, error, onRun }) {
  const sorted = useMemo(() => inventory.map((item) => ({ item, stats: usageStats(item) })).sort((a, b) => {
    const order = { out: 0, critical: 1, low: 2, steady: 3 };
    return order[a.stats.status] - order[b.stats.status];
  }), [inventory]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>Consumption & suggestions</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>Days-until-empty comes from your logged usage. Suggestions come from Claude.</div>
        </div>
        <button onClick={onRun} disabled={loading} className="lrd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? <Loader2 size={15} className="lrd-spin" /> : <Wand2 size={15} />}
          {loading ? "Thinking…" : "Get AI suggestions"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Days until empty / expiry</div>
          <div className="lrd-card" style={{ padding: "6px 14px" }}>
            {sorted.map(({ item, stats }, idx) => {
              const exp = daysUntil(item.expiresOn);
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: idx > 0 ? "1px solid var(--line)" : "none" }}>
                  <span style={{ fontSize: 12.5, width: 100, textTransform: "capitalize", flexShrink: 0 }}>{item.name}</span>
                  <div style={{ flex: 1 }}>
                    <GaugeBar pct={stats.daysLeft === null ? (item.qty > 0 ? 100 : 3) : Math.min(100, (stats.daysLeft / 21) * 100)} color={STATUS_COLOR[stats.status]} />
                  </div>
                  <span className="lrd-mono" style={{ fontSize: 10.5, color: STATUS_COLOR[stats.status], width: 42, textAlign: "right", flexShrink: 0 }}>
                    {stats.daysLeft === null ? (item.qty <= 0 ? "out" : "n/a") : `${round(stats.daysLeft, 0)}d`}
                  </span>
                  <span className="lrd-mono" style={{ fontSize: 10.5, color: exp !== null && exp < 4 ? "var(--rust)" : "var(--ink-soft)", width: 46, textAlign: "right", flexShrink: 0 }}>
                    {exp === null ? "—" : `⏱${Math.max(0, Math.round(exp))}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Suggestions</div>
          {!insights && !loading && !error && (
            <div className="lrd-card" style={{ padding: 18, fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center" }}>
              Click "Get AI suggestions" for restock timing, bulk-buy tips, waste-risk warnings, and recipe ideas.
            </div>
          )}
          {error && <div className="lrd-card" style={{ padding: 14, fontSize: 12.5, color: "var(--rust)" }}>{error}</div>}
          {insights && insights.map((ins, idx) => {
            const Icon = INSIGHT_ICON[ins.type] || Info;
            const color = INSIGHT_COLOR[ins.type] || "var(--ink-soft)";
            return (
              <div key={idx} className="lrd-card lrd-fade-in" style={{ padding: "10px 12px", display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <Icon size={15} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>{ins.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Modals                                                                 */
/* ---------------------------------------------------------------------- */

function ModalShell({ title, onClose, children, width = 460 }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(35,46,40,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: 20 }}>
      <div className="lrd-card lrd-fade-in" style={{ width, maxWidth: "100%", maxHeight: "85%", overflowY: "auto", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          <IconBtn onClick={onClose} title="Close"><X size={13} /></IconBtn>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddRecipeModal({ onClose, onSave }) {
  const [mode, setMode] = useState("ai");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualServings, setManualServings] = useState(4);
  const [manualIngredients, setManualIngredients] = useState([{ id: genId("i"), name: "", qty: 1, unit: "each" }]);

  async function handleParse() {
    if (!pasteText.trim()) return;
    setLoading(true); setError(null);
    try { setDraft(await parseRecipeAI(pasteText)); }
    catch { setError("Couldn't parse that — try a clearer ingredient list, or add it manually."); }
    finally { setLoading(false); }
  }
  function updateDraftIngredient(id, field, value) { setDraft((d) => ({ ...d, ingredients: d.ingredients.map((ing) => ing.id === id ? { ...ing, [field]: value } : ing) })); }
  function removeDraftIngredient(id) { setDraft((d) => ({ ...d, ingredients: d.ingredients.filter((ing) => ing.id !== id) })); }
  function addManualRow() { setManualIngredients((m) => [...m, { id: genId("i"), name: "", qty: 1, unit: "each" }]); }
  function updateManualRow(id, field, value) { setManualIngredients((m) => m.map((r) => r.id === id ? { ...r, [field]: value } : r)); }
  function removeManualRow(id) { setManualIngredients((m) => m.filter((r) => r.id !== id)); }
  function saveManual() {
    if (!manualName.trim()) { setError("Give the recipe a name."); return; }
    const ingredients = manualIngredients.filter((r) => r.name.trim());
    if (ingredients.length === 0) { setError("Add at least one ingredient."); return; }
    onSave({ id: genId("r"), name: manualName.trim(), servings: Number(manualServings) || 1, ingredients });
  }

  return (
    <ModalShell title="Add a recipe" onClose={onClose} width={520}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button onClick={() => setMode("ai")} style={{ flex: 1, padding: "7px", borderRadius: 5, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (mode === "ai" ? "var(--pine)" : "var(--line)"), background: mode === "ai" ? "var(--pine)" : "var(--paper-2)", color: mode === "ai" ? "var(--paper-2)" : "var(--ink-soft)" }}>
          <Sparkles size={12} style={{ marginRight: 5, verticalAlign: -2 }} />Paste & let AI parse
        </button>
        <button onClick={() => setMode("manual")} style={{ flex: 1, padding: "7px", borderRadius: 5, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (mode === "manual" ? "var(--pine)" : "var(--line)"), background: mode === "manual" ? "var(--pine)" : "var(--paper-2)", color: mode === "manual" ? "var(--paper-2)" : "var(--ink-soft)" }}>
          Enter manually
        </button>
      </div>

      {mode === "ai" && !draft && (
        <div>
          <textarea className="lrd-input" rows={7} placeholder="Paste a recipe — ingredients, quantities, whatever you've got." value={pasteText} onChange={(e) => setPasteText(e.target.value)} style={{ resize: "vertical", fontFamily: "IBM Plex Mono, monospace", fontSize: 12.5 }} />
          {error && <div style={{ color: "var(--rust)", fontSize: 12, marginTop: 8 }}>{error}</div>}
          <button onClick={handleParse} disabled={loading || !pasteText.trim()} className="lrd-btn-primary" style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {loading ? <Loader2 size={15} className="lrd-spin" /> : <Wand2 size={15} />} {loading ? "Reading recipe…" : "Parse with AI"}
          </button>
        </div>
      )}

      {mode === "ai" && draft && (
        <div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Name</label><input className="lrd-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></div>
          <div style={{ marginBottom: 10, width: 120 }}><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Servings</label><input type="number" className="lrd-input" value={draft.servings} onChange={(e) => setDraft((d) => ({ ...d, servings: e.target.value }))} /></div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Ingredients</label>
          {draft.ingredients.map((ing) => (
            <div key={ing.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px auto", gap: 6, marginBottom: 6 }}>
              <input className="lrd-input" value={ing.name} onChange={(e) => updateDraftIngredient(ing.id, "name", e.target.value)} />
              <input type="number" className="lrd-input" value={ing.qty} onChange={(e) => updateDraftIngredient(ing.id, "qty", Number(e.target.value))} />
              <select className="lrd-input" value={ing.unit} onChange={(e) => updateDraftIngredient(ing.id, "unit", e.target.value)}>{UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
              <IconBtn onClick={() => removeDraftIngredient(ing.id)} danger><Trash2 size={12} /></IconBtn>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setDraft(null)} style={{ flex: 1, padding: "9px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper-2)", fontSize: 12.5, cursor: "pointer" }}>Back</button>
            <button onClick={() => onSave(draft)} className="lrd-btn-gold" style={{ flex: 2, padding: "9px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save recipe</button>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Name</label><input className="lrd-input" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. Sunday roast" /></div>
          <div style={{ marginBottom: 10, width: 120 }}><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Servings</label><input type="number" className="lrd-input" value={manualServings} onChange={(e) => setManualServings(e.target.value)} /></div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Ingredients</label>
          {manualIngredients.map((r) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px auto", gap: 6, marginBottom: 6 }}>
              <input className="lrd-input" placeholder="ingredient" value={r.name} onChange={(e) => updateManualRow(r.id, "name", e.target.value)} />
              <input type="number" className="lrd-input" value={r.qty} onChange={(e) => updateManualRow(r.id, "qty", Number(e.target.value))} />
              <select className="lrd-input" value={r.unit} onChange={(e) => updateManualRow(r.id, "unit", e.target.value)}>{UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
              <IconBtn onClick={() => removeManualRow(r.id)} danger><Trash2 size={12} /></IconBtn>
            </div>
          ))}
          <button onClick={addManualRow} style={{ fontSize: 12, color: "var(--pine)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 4 }}><Plus size={12} /> Add ingredient</button>
          {error && <div style={{ color: "var(--rust)", fontSize: 12, marginTop: 6 }}>{error}</div>}
          <button onClick={saveManual} className="lrd-btn-gold" style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save recipe</button>
        </div>
      )}
    </ModalShell>
  );
}

function InventoryModal({ initial, onClose, onSave }) {
  const editing = !!initial;
  const [name, setName] = useState(initial ? initial.name : "");
  const [qty, setQty] = useState(initial ? initial.qty : 1);
  const [unit, setUnit] = useState(initial ? initial.unit : "each");
  const [category, setCategory] = useState(initial ? initial.category : "Pantry");
  const [minQty, setMinQty] = useState(initial ? initial.minQty || 0 : 0);
  const [unitPrice, setUnitPrice] = useState(initial && initial.unitPrice != null ? initial.unitPrice : "");
  const [error, setError] = useState(null);

  function handleSave() {
    if (!name.trim()) { setError("Give it a name."); return; }
    onSave({ name: name.trim(), qty: Number(qty) || 0, unit, category, minQty: Number(minQty) || 0, unitPrice: unitPrice === "" ? null : Number(unitPrice) });
  }

  return (
    <ModalShell title={editing ? "Edit item" : "Add to inventory"} onClose={onClose} width={400}>
      <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Name</label><input className="lrd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. black beans" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Quantity</label><input type="number" className="lrd-input" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
        <div><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Unit</label><select className="lrd-input" value={unit} onChange={(e) => setUnit(e.target.value)}>{UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
      </div>
      <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Category</label><select className="lrd-input" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Minimum to keep on hand</label>
          <input type="number" className="lrd-input" value={minQty} onChange={(e) => setMinQty(e.target.value)} placeholder="0 = no rule" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Approx. price per {unit}</label>
          <input type="number" step="0.01" className="lrd-input" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="optional" />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 12 }}>Setting a minimum keeps this on the grocery list automatically once stock drops below it, regardless of usage history.</div>
      {error && <div style={{ color: "var(--rust)", fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button onClick={handleSave} className="lrd-btn-gold" style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{editing ? "Save changes" : "Add to inventory"}</button>
    </ModalShell>
  );
}

function ReceiptScanModal({ onClose, onSave }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error | review
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});
  const fileRef = useRef(null);

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(",")[1]);
      r.onerror = () => reject(new Error("Couldn't read that file"));
      r.readAsDataURL(file);
    });
  }

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setStatus("loading"); setError(null);
    try {
      const base64 = await fileToBase64(file);
      const parsed = await scanReceiptAI(base64, file.type || "image/jpeg");
      const withIds = (parsed || []).map((p) => ({ id: genId("rc"), name: p.name, qty: Number(p.qty) || 1, unit: p.unit || "each", price: p.price != null ? Number(p.price) : null }));
      setItems(withIds);
      setChecked(Object.fromEntries(withIds.map((it) => [it.id, true])));
      setStatus("review");
    } catch (e2) {
      setError("Couldn't read that receipt clearly — try a straighter, well-lit photo, or add items manually in Inventory.");
      setStatus("error");
    }
  }

  function updateItem(id, field, value) { setItems((its) => its.map((it) => it.id === id ? { ...it, [field]: value } : it)); }

  function handleSave() {
    const toAdd = items.filter((it) => checked[it.id]);
    if (toAdd.length === 0) { setError("Check off at least one item."); return; }
    onSave(toAdd);
  }

  return (
    <ModalShell title="Scan a receipt" onClose={onClose} width={480}>
      {status === "idle" && (
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          <Camera size={28} color="var(--ink-soft)" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>Upload a photo of your receipt — Claude will read the line items and you can review before adding them to inventory.</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current.click()} className="lrd-btn-primary" style={{ padding: "10px 18px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Choose photo</button>
        </div>
      )}
      {status === "loading" && (
        <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--ink-soft)" }}>
          <Loader2 size={24} className="lrd-spin" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13 }}>Reading your receipt…</div>
        </div>
      )}
      {status === "error" && (
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          <div style={{ color: "var(--rust)", fontSize: 13, marginBottom: 14 }}>{error}</div>
          <button onClick={() => { setStatus("idle"); setError(null); }} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper-2)", fontSize: 12.5, cursor: "pointer" }}>Try again</button>
        </div>
      )}
      {status === "review" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>Found {items.length} item{items.length !== 1 ? "s" : ""}. Uncheck anything that's wrong, or edit it.</div>
          {items.map((it) => (
            <div key={it.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr 55px 80px 70px", gap: 6, alignItems: "center", marginBottom: 6 }}>
              <input type="checkbox" checked={!!checked[it.id]} onChange={(e) => setChecked((c) => ({ ...c, [it.id]: e.target.checked }))} />
              <input className="lrd-input" value={it.name} onChange={(e) => updateItem(it.id, "name", e.target.value)} />
              <input type="number" className="lrd-input" value={it.qty} onChange={(e) => updateItem(it.id, "qty", Number(e.target.value))} />
              <select className="lrd-input" value={it.unit} onChange={(e) => updateItem(it.id, "unit", e.target.value)}>{UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
              <input type="number" step="0.01" className="lrd-input" placeholder="$" value={it.price != null ? it.price : ""} onChange={(e) => updateItem(it.id, "price", e.target.value === "" ? null : Number(e.target.value))} />
            </div>
          ))}
          {error && <div style={{ color: "var(--rust)", fontSize: 12, marginTop: 6 }}>{error}</div>}
          <button onClick={handleSave} className="lrd-btn-gold" style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add checked items to inventory</button>
        </div>
      )}
    </ModalShell>
  );
}

function HouseholdModal({ members, setMembers, activeMember, setActiveMember, onClose }) {
  const [newName, setNewName] = useState("");
  function addMember() {
    const n = newName.trim();
    if (!n || members.includes(n)) return;
    setMembers((m) => [...m, n]);
    setNewName("");
  }
  function removeMember(n) {
    if (members.length <= 1) return;
    setMembers((m) => m.filter((x) => x !== n));
    if (activeMember === n) setActiveMember(members.find((x) => x !== n) || "You");
  }
  return (
    <ModalShell title="Household" onClose={onClose} width={360}>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
        Every restock or "cooked it" gets tagged with whoever's active — useful for seeing who's using what. This is a shared inventory: switch who's acting before you log something.
      </div>
      {members.map((m) => (
        <div key={m} onClick={() => setActiveMember(m)} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6, cursor: "pointer",
          background: m === activeMember ? "var(--paper-3)" : "transparent", marginBottom: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: m === activeMember ? "var(--pine)" : "var(--line)", color: "var(--paper-2)", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.slice(0, 2).toUpperCase()}</span>
            <span style={{ fontSize: 13 }}>{m}</span>
          </div>
          {m === activeMember ? <CheckCircle2 size={15} color="var(--pine)" /> : members.length > 1 && <IconBtn onClick={(e) => { e.stopPropagation(); removeMember(m); }} danger><Trash2 size={11} /></IconBtn>}
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <input className="lrd-input" placeholder="Add a household member" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMember()} />
        <button onClick={addMember} className="lrd-btn-primary" style={{ padding: "0 14px", borderRadius: 6, border: "none", cursor: "pointer" }}><Plus size={14} /></button>
      </div>
    </ModalShell>
  );
}
