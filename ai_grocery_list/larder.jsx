import React, { useState, useMemo, useCallback } from "react";
import {
  Plus, X, Sparkles, Package, ShoppingCart, ChefHat, TrendingDown,
  AlertTriangle, Loader2, Minus, Trash2, Flame, CheckCircle2,
  RefreshCw, Wand2, Circle, ArrowRight, Info
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
`;

/* ---------------------------------------------------------------------- */
/* Unit conversion helpers                                                */
/* ---------------------------------------------------------------------- */

const MASS = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
const VOLUME = { ml: 1, l: 1000, tsp: 4.92892, tbsp: 14.7868, cup: 236.588, fl_oz: 29.5735 };

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

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function genId(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

const UNIT_OPTIONS = ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "fl_oz", "oz", "lb", "each", "clove", "slice", "can"];

/* ---------------------------------------------------------------------- */
/* Seed data                                                              */
/* ---------------------------------------------------------------------- */

function seedRecipes() {
  return [
    {
      id: "r_bolognese", name: "Spaghetti Bolognese", servings: 4,
      ingredients: [
        { id: genId("i"), name: "ground beef", qty: 1, unit: "lb" },
        { id: genId("i"), name: "spaghetti", qty: 12, unit: "oz" },
        { id: genId("i"), name: "onion", qty: 1, unit: "each" },
        { id: genId("i"), name: "garlic", qty: 3, unit: "clove" },
        { id: genId("i"), name: "canned tomatoes", qty: 28, unit: "oz" },
        { id: genId("i"), name: "olive oil", qty: 2, unit: "tbsp" },
        { id: genId("i"), name: "parmesan", qty: 0.5, unit: "cup" },
      ],
    },
    {
      id: "r_stirfry", name: "Chicken Stir Fry", servings: 4,
      ingredients: [
        { id: genId("i"), name: "chicken breast", qty: 1.5, unit: "lb" },
        { id: genId("i"), name: "broccoli", qty: 2, unit: "cup" },
        { id: genId("i"), name: "soy sauce", qty: 3, unit: "tbsp" },
        { id: genId("i"), name: "garlic", qty: 2, unit: "clove" },
        { id: genId("i"), name: "rice", qty: 400, unit: "g" },
        { id: genId("i"), name: "vegetable oil", qty: 2, unit: "tbsp" },
      ],
    },
    {
      id: "r_omelette", name: "Veggie Omelette", servings: 2,
      ingredients: [
        { id: genId("i"), name: "eggs", qty: 4, unit: "each" },
        { id: genId("i"), name: "bell pepper", qty: 1, unit: "each" },
        { id: genId("i"), name: "onion", qty: 0.5, unit: "each" },
        { id: genId("i"), name: "cheese", qty: 0.5, unit: "cup" },
        { id: genId("i"), name: "butter", qty: 1, unit: "tbsp" },
        { id: genId("i"), name: "milk", qty: 2, unit: "tbsp" },
      ],
    },
    {
      id: "r_pancakes", name: "Weekend Pancakes", servings: 4,
      ingredients: [
        { id: genId("i"), name: "flour", qty: 250, unit: "g" },
        { id: genId("i"), name: "milk", qty: 350, unit: "ml" },
        { id: genId("i"), name: "eggs", qty: 2, unit: "each" },
        { id: genId("i"), name: "sugar", qty: 2, unit: "tbsp" },
        { id: genId("i"), name: "butter", qty: 3, unit: "tbsp" },
      ],
    },
  ];
}

function seedInventory() {
  const mk = (name, qty, unit, history, category) => ({
    id: genId("inv"), name, qty, unit, category, history,
  });
  return [
    mk("eggs", 6, "each", [
      { date: daysAgo(12), delta: 12 }, { date: daysAgo(9), delta: -2 },
      { date: daysAgo(6), delta: -2 }, { date: daysAgo(3), delta: -2 },
    ], "Dairy & eggs"),
    mk("milk", 0.4, "l", [
      { date: daysAgo(6), delta: 1 }, { date: daysAgo(4), delta: -0.3 },
      { date: daysAgo(2), delta: -0.3 },
    ], "Dairy & eggs"),
    mk("butter", 4, "tbsp", [
      { date: daysAgo(10), delta: 8 }, { date: daysAgo(5), delta: -2 }, { date: daysAgo(2), delta: -2 },
    ], "Dairy & eggs"),
    mk("cheese", 1, "cup", [{ date: daysAgo(8), delta: 1.5 }, { date: daysAgo(3), delta: -0.5 }], "Dairy & eggs"),
    mk("flour", 500, "g", [{ date: daysAgo(20), delta: 1000 }, { date: daysAgo(6), delta: -500 }], "Baking"),
    mk("sugar", 300, "g", [{ date: daysAgo(20), delta: 500 }, { date: daysAgo(8), delta: -200 }], "Baking"),
    mk("garlic", 10, "clove", [{ date: daysAgo(10), delta: 12 }, { date: daysAgo(4), delta: -2 }], "Produce"),
    mk("onion", 3, "each", [{ date: daysAgo(9), delta: 4 }, { date: daysAgo(4), delta: -1 }], "Produce"),
    mk("bell pepper", 0, "each", [{ date: daysAgo(9), delta: 2 }, { date: daysAgo(5), delta: -2 }], "Produce"),
    mk("broccoli", 1, "cup", [{ date: daysAgo(5), delta: 3 }, { date: daysAgo(2), delta: -2 }], "Produce"),
    mk("ground beef", 0, "lb", [{ date: daysAgo(11), delta: 1 }, { date: daysAgo(7), delta: -1 }], "Meat"),
    mk("chicken breast", 0.5, "lb", [{ date: daysAgo(9), delta: 2 }, { date: daysAgo(4), delta: -1.5 }], "Meat"),
    mk("spaghetti", 4, "oz", [{ date: daysAgo(14), delta: 16 }, { date: daysAgo(6), delta: -12 }], "Pantry"),
    mk("rice", 1200, "g", [{ date: daysAgo(15), delta: 2000 }, { date: daysAgo(5), delta: -400 }, { date: daysAgo(5), delta: -400 }], "Pantry"),
    mk("canned tomatoes", 0, "oz", [{ date: daysAgo(13), delta: 28 }, { date: daysAgo(6), delta: -28 }], "Pantry"),
    mk("parmesan", 0, "cup", [{ date: daysAgo(13), delta: 1 }, { date: daysAgo(6), delta: -1 }], "Dairy & eggs"),
    mk("soy sauce", 200, "ml", [{ date: daysAgo(30), delta: 250 }, { date: daysAgo(6), delta: -30 }], "Pantry"),
    mk("olive oil", 500, "ml", [{ date: daysAgo(40), delta: 750 }, { date: daysAgo(6), delta: -30 }], "Pantry"),
    mk("vegetable oil", 300, "ml", [{ date: daysAgo(40), delta: 500 }, { date: daysAgo(6), delta: -30 }], "Pantry"),
  ];
}

/* ---------------------------------------------------------------------- */
/* Usage-rate intelligence                                                */
/* ---------------------------------------------------------------------- */

function usageStats(item) {
  const now = Date.now();
  const windowDays = 21;
  const cutoff = now - windowDays * 86400000;
  const consumed = item.history
    .filter((h) => h.delta < 0 && new Date(h.date).getTime() >= cutoff)
    .reduce((s, h) => s + -h.delta, 0);
  const earliest = item.history.reduce(
    (min, h) => Math.min(min, new Date(h.date).getTime()), now
  );
  const spanDays = Math.max(1, Math.min(windowDays, (now - earliest) / 86400000));
  const dailyRate = consumed / spanDays;
  const daysLeft = dailyRate > 0 ? item.qty / dailyRate : null;
  let status = "steady";
  if (daysLeft === null) status = item.qty <= 0 ? "out" : "steady";
  else if (item.qty <= 0) status = "out";
  else if (daysLeft < 3) status = "critical";
  else if (daysLeft < 7) status = "low";
  return { dailyRate, daysLeft, status };
}

const STATUS_COLOR = {
  out: "var(--rust)", critical: "var(--rust)", low: "var(--gold-deep)",
  steady: "var(--pine)",
};

/* ---------------------------------------------------------------------- */
/* Claude API calls                                                       */
/* ---------------------------------------------------------------------- */

async function callClaude(system, userText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) throw new Error("Request failed (" + res.status + ")");
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || "").join("\n").trim();
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function parseRecipeAI(rawText) {
  const system = `Extract a recipe from the user's text into structured JSON. Respond with ONLY a JSON object, no markdown, no commentary:
{"name": string, "servings": number, "ingredients": [{"name": string, "qty": number, "unit": string}]}
unit must be one of: g, kg, ml, l, tsp, tbsp, cup, fl_oz, oz, lb, each, clove, slice, can. Use "each" for whole countable items with no clearer unit. Keep ingredient names short and singular (e.g. "onion" not "onions, diced"). If servings isn't stated, make a reasonable estimate.`;
  const json = await callClaude(system, rawText);
  const parsed = JSON.parse(json);
  return {
    id: genId("r"),
    name: parsed.name || "Untitled recipe",
    servings: Number(parsed.servings) || 4,
    ingredients: (parsed.ingredients || []).map((ing) => ({
      id: genId("i"), name: ing.name, qty: Number(ing.qty) || 1, unit: ing.unit || "each",
    })),
  };
}

async function getInsightsAI(summary) {
  const system = `You are the intelligence behind Larder, a household grocery and pantry app. Given a JSON summary of the user's inventory, usage rates, and this week's planned recipes, produce 4-6 short, specific, genuinely useful suggestions. Respond with ONLY a JSON array, no markdown, no commentary:
[{"type": "restock"|"bulk_buy"|"recipe_idea"|"waste_risk"|"tip", "message": string}]
Keep each message under 22 words, concrete, and grounded in the actual numbers given. Do not invent items not present in the data.`;
  const json = await callClaude(system, JSON.stringify(summary));
  return JSON.parse(json);
}

const INSIGHT_ICON = {
  restock: AlertTriangle, bulk_buy: Package, recipe_idea: ChefHat, waste_risk: TrendingDown, tip: Info,
};
const INSIGHT_COLOR = {
  restock: "var(--rust)", bulk_buy: "var(--gold-deep)", recipe_idea: "var(--pine)",
  waste_risk: "var(--plum)", tip: "var(--ink-soft)",
};

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
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 4, border: "1px solid var(--line)", background: "var(--paper-2)",
        color: danger ? "var(--rust)" : "var(--ink-soft)", cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Main App                                                               */
/* ---------------------------------------------------------------------- */

export default function LarderApp() {
  const [tab, setTab] = useState("recipes");
  const [recipes, setRecipes] = useState(seedRecipes);
  const [inventory, setInventory] = useState(seedInventory);
  const [selected, setSelected] = useState({ r_bolognese: 1, r_omelette: 1 });
  const [checkedOff, setCheckedOff] = useState({});
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showAddInv, setShowAddInv] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [toast, setToast] = useState(null);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  /* ---- inventory helpers ---- */

  function adjustInventory(id, deltaBase, group) {
    setInventory((inv) =>
      inv.map((item) => {
        if (item.id !== id) return item;
        const cur = toBase(item.qty, item.unit);
        const newBase = Math.max(0, cur.base + deltaBase);
        const conv = fromBase(newBase, cur.group);
        return {
          ...item, qty: conv.qty, unit: conv.unit,
          history: [...item.history, { date: new Date().toISOString(), delta: deltaBase >= 0 ? conv.qty && (deltaBase / (cur.base / (item.qty || 1) || 1)) : deltaBase }],
        };
      })
    );
  }

  function quickAdjust(id, sign) {
    setInventory((inv) =>
      inv.map((item) => {
        if (item.id !== id) return item;
        const step = item.unit === "each" || item.unit === "clove" || item.unit === "slice" || item.unit === "can" ? 1 : Math.max(1, round(item.qty * 0.1, 0) || 1);
        const newQty = Math.max(0, round(item.qty + sign * step, 2));
        return {
          ...item, qty: newQty,
          history: [...item.history, { date: new Date().toISOString(), delta: sign * step }],
        };
      })
    );
  }

  function removeInventory(id) {
    setInventory((inv) => inv.filter((i) => i.id !== id));
  }

  function addInventoryItem(name, qty, unit, category) {
    setInventory((inv) => [
      ...inv,
      { id: genId("inv"), name: normName(name) === name.toLowerCase() ? name : name, qty, unit, category: category || "Other", history: [{ date: new Date().toISOString(), delta: qty }] },
    ]);
  }

  /* ---- recipe helpers ---- */

  function toggleSelect(id) {
    setSelected((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }
  function setMultiplier(id, m) {
    setSelected((s) => ({ ...s, [id]: Math.max(0.5, round(m, 2)) }));
  }
  function removeRecipe(id) {
    setRecipes((r) => r.filter((x) => x.id !== id));
    setSelected((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  }

  function cookRecipe(recipe) {
    const mult = selected[recipe.id] || 1;
    setInventory((inv) =>
      inv.map((item) => {
        const match = recipe.ingredients.find((ing) => normName(ing.name) === normName(item.name));
        if (!match) return item;
        const needBase = toBase(match.qty * mult, match.unit);
        const curBase = toBase(item.qty, item.unit);
        if (needBase.group !== curBase.group) return item;
        const newBase = Math.max(0, curBase.base - needBase.base);
        const conv = fromBase(newBase, curBase.group);
        const consumedDisplay = fromBase(needBase.base, curBase.group);
        return {
          ...item, qty: conv.qty, unit: conv.unit,
          history: [...item.history, { date: new Date().toISOString(), delta: -consumedDisplay.qty }],
        };
      })
    );
    flash(`Logged "${recipe.name}" as cooked — inventory updated`);
  }

  /* ---- grocery list computation ---- */

  const groceryData = useMemo(() => {
    const needed = {};
    Object.entries(selected).forEach(([rid, mult]) => {
      const recipe = recipes.find((r) => r.id === rid);
      if (!recipe) return;
      recipe.ingredients.forEach((ing) => {
        const { group, base } = toBase(ing.qty * mult, ing.unit);
        const key = normName(ing.name) + "|" + group;
        if (!needed[key]) needed[key] = { name: ing.name, group, base: 0 };
        needed[key].base += base;
      });
    });

    const invMap = {};
    inventory.forEach((item) => {
      const { group, base } = toBase(item.qty, item.unit);
      const key = normName(item.name) + "|" + group;
      if (!invMap[key]) invMap[key] = 0;
      invMap[key] += base;
    });

    const shortfall = [];
    Object.entries(needed).forEach(([key, n]) => {
      const have = invMap[key] || 0;
      const shortBase = n.base - have;
      if (shortBase > 0.01) {
        const conv = fromBase(shortBase, n.group);
        shortfall.push({ key, name: n.name, qty: conv.qty, unit: conv.unit, reason: "recipe" });
      }
    });

    const shortfallKeys = new Set(shortfall.map((s) => s.key));
    const runningLow = inventory
      .map((item) => ({ item, stats: usageStats(item) }))
      .filter(({ item, stats }) => (stats.status === "low" || stats.status === "critical" || stats.status === "out"))
      .filter(({ item }) => !shortfallKeys.has(normName(item.name) + "|" + unitGroup(item.unit)))
      .map(({ item, stats }) => ({
        key: "low_" + item.id, name: item.name,
        qty: item.qty <= 0 ? "" : "", unit: item.unit, reason: "usage", stats,
      }));

    return { shortfall, runningLow };
  }, [selected, recipes, inventory]);

  function toggleChecked(key) {
    setCheckedOff((c) => ({ ...c, [key]: !c[key] }));
  }

  function addPurchasedToInventory() {
    const checkedItems = [...groceryData.shortfall, ...groceryData.runningLow].filter((g) => checkedOff[g.key]);
    if (checkedItems.length === 0) {
      flash("Check off items first");
      return;
    }
    setInventory((inv) => {
      let next = [...inv];
      checkedItems.forEach((g) => {
        const norm = normName(g.name);
        const idx = next.findIndex((i) => normName(i.name) === norm);
        const addQty = typeof g.qty === "number" ? g.qty : 1;
        if (idx >= 0) {
          const item = next[idx];
          const cur = toBase(item.qty, item.unit);
          const add = toBase(addQty, g.unit || item.unit);
          const merged = fromBase(cur.base + add.base, cur.group);
          next[idx] = {
            ...item, qty: merged.qty, unit: merged.unit,
            history: [...item.history, { date: new Date().toISOString(), delta: addQty }],
          };
        } else {
          next.push({
            id: genId("inv"), name: g.name, qty: addQty, unit: g.unit || "each", category: "Other",
            history: [{ date: new Date().toISOString(), delta: addQty }],
          });
        }
      });
      return next;
    });
    setCheckedOff({});
    flash(`Added ${checkedItems.length} item${checkedItems.length > 1 ? "s" : ""} to inventory`);
  }

  /* ---- AI insights ---- */

  async function runInsights() {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const summary = {
        selectedRecipes: Object.entries(selected).map(([id, mult]) => {
          const r = recipes.find((x) => x.id === id);
          return r ? { name: r.name, servingsMultiplier: mult } : null;
        }).filter(Boolean),
        inventory: inventory.map((item) => {
          const s = usageStats(item);
          return {
            name: item.name, qty: item.qty, unit: item.unit,
            dailyUsageRate: round(s.dailyRate, 3),
            daysUntilEmpty: s.daysLeft === null ? null : round(s.daysLeft, 1),
            status: s.status,
          };
        }),
        groceryShortfall: groceryData.shortfall.map((s) => ({ name: s.name, qty: s.qty, unit: s.unit })),
      };
      const result = await getInsightsAI(summary);
      setInsights(Array.isArray(result) ? result : []);
    } catch (e) {
      setInsightsError(e.message || "Something went wrong");
    } finally {
      setInsightsLoading(false);
    }
  }

  /* ---------------------------------------------------------------- */

  const totalGroceryCount = groceryData.shortfall.length + groceryData.runningLow.length;

  return (
    <div className="lrd-root lrd-fade-in" style={{ minHeight: 600, borderRadius: 10, overflow: "hidden", position: "relative" }}>
      <style>{TOKENS}</style>

      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 8 }}>
            <ChefHat size={22} color="var(--pine)" /> Larder
          </div>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
            recipes → what's needed → what's on hand → what to buy
          </div>
        </div>
        {totalGroceryCount > 0 && (
          <div
            onClick={() => setTab("grocery")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: "var(--rust)", color: "var(--paper-2)", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}
          >
            <ShoppingCart size={13} /> {totalGroceryCount} to buy
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "0 24px", borderBottom: "1px solid var(--line)", background: "var(--paper-3)" }}>
        {[
          ["recipes", "Recipes", ChefHat],
          ["inventory", "Inventory", Package],
          ["grocery", "Grocery list", ShoppingCart],
          ["insights", "Insights", Sparkles],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="lrd-tab"
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 13, fontWeight: 600,
              background: "transparent", border: "none", cursor: "pointer",
              color: tab === key ? "var(--pine-deep)" : "var(--ink-soft)",
              borderBottom: tab === key ? "2px solid var(--pine)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="lrd-scroll" style={{ padding: 24, maxHeight: 640, overflowY: "auto" }}>
        {tab === "recipes" && (
          <RecipesTab
            recipes={recipes} selected={selected} toggleSelect={toggleSelect}
            setMultiplier={setMultiplier} removeRecipe={removeRecipe} cookRecipe={cookRecipe}
            onAdd={() => setShowAddRecipe(true)}
          />
        )}
        {tab === "inventory" && (
          <InventoryTab
            inventory={inventory} quickAdjust={quickAdjust} removeInventory={removeInventory}
            onAdd={() => setShowAddInv(true)}
          />
        )}
        {tab === "grocery" && (
          <GroceryTab
            groceryData={groceryData} checkedOff={checkedOff} toggleChecked={toggleChecked}
            addPurchasedToInventory={addPurchasedToInventory}
          />
        )}
        {tab === "insights" && (
          <InsightsTab
            inventory={inventory} insights={insights} loading={insightsLoading}
            error={insightsError} onRun={runInsights}
          />
        )}
      </div>

      {showAddRecipe && (
        <AddRecipeModal
          onClose={() => setShowAddRecipe(false)}
          onSave={(r) => { setRecipes((rs) => [...rs, r]); setShowAddRecipe(false); flash(`Added "${r.name}"`); }}
        />
      )}
      {showAddInv && (
        <AddInventoryModal
          onClose={() => setShowAddInv(false)}
          onSave={(name, qty, unit, category) => { addInventoryItem(name, qty, unit, category); setShowAddInv(false); flash(`Added ${name} to inventory`); }}
        />
      )}

      {toast && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--paper-2)", padding: "9px 16px", borderRadius: 20,
          fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(0,0,0,.2)",
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

function RecipesTab({ recipes, selected, toggleSelect, setMultiplier, removeRecipe, cookRecipe, onAdd }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>This week's meals</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
            Select what you're cooking — the grocery list updates automatically.
          </div>
        </div>
        <button onClick={onAdd} className="lrd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={15} /> Add recipe
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {recipes.map((r) => {
          const isSelected = !!selected[r.id];
          const mult = selected[r.id] || 1;
          return (
            <div key={r.id} className="lrd-card" style={{
              padding: 14, borderColor: isSelected ? "var(--pine)" : "var(--line)",
              borderWidth: isSelected ? 2 : 1, position: "relative",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div onClick={() => toggleSelect(r.id)} style={{ cursor: "pointer", flex: 1 }}>
                  <div className="lrd-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{r.name}</div>
                  <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
                    {r.ingredients.length} ingredients · base {r.servings} servings
                  </div>
                </div>
                <div onClick={() => toggleSelect(r.id)} style={{ cursor: "pointer" }}>
                  {isSelected ? <CheckCircle2 size={20} color="var(--pine)" /> : <Circle size={20} color="var(--line)" />}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {r.ingredients.slice(0, 4).map((ing) => (
                  <span key={ing.id} className="lrd-mono" style={{ fontSize: 10.5, background: "var(--paper-3)", padding: "2px 6px", borderRadius: 3, color: "var(--ink-soft)" }}>
                    {ing.name}
                  </span>
                ))}
                {r.ingredients.length > 4 && (
                  <span className="lrd-mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", padding: "2px 4px" }}>
                    +{r.ingredients.length - 4} more
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                {isSelected ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Servings ×</span>
                    <IconBtn onClick={() => setMultiplier(r.id, mult - 0.5)} title="Fewer servings"><Minus size={12} /></IconBtn>
                    <span className="lrd-mono" style={{ fontSize: 12.5, width: 24, textAlign: "center" }}>{mult}</span>
                    <IconBtn onClick={() => setMultiplier(r.id, mult + 0.5)} title="More servings"><Plus size={12} /></IconBtn>
                  </div>
                ) : <span />}
                <div style={{ display: "flex", gap: 6 }}>
                  {isSelected && (
                    <button onClick={() => cookRecipe(r)} title="Log as cooked — deducts from inventory" style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "5px 9px",
                      borderRadius: 5, border: "1px solid var(--gold-deep)", background: "var(--paper-2)", color: "var(--gold-deep)", cursor: "pointer",
                    }}>
                      <Flame size={12} /> Cooked it
                    </button>
                  )}
                  <IconBtn onClick={() => removeRecipe(r.id)} title="Delete recipe" danger><Trash2 size={12} /></IconBtn>
                </div>
              </div>
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

function InventoryTab({ inventory, quickAdjust, removeInventory, onAdd }) {
  const byCategory = useMemo(() => {
    const map = {};
    inventory.forEach((item) => {
      const cat = item.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [inventory]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>On hand</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
            Gauges reflect stock relative to how fast you actually use each item.
          </div>
        </div>
        <button onClick={onAdd} className="lrd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={15} /> Add item
        </button>
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
                <div key={item.id} style={{
                  display: "grid", gridTemplateColumns: "1.3fr 90px 1fr auto auto", gap: 12, alignItems: "center",
                  padding: "10px 14px", borderTop: idx > 0 ? "1px solid var(--line)" : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, textTransform: "capitalize" }}>{item.name}</div>
                    <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>
                      {stats.daysLeft === null
                        ? (item.qty <= 0 ? "out of stock" : "no usage history yet")
                        : `~${Math.max(0, round(stats.daysLeft, 0))}d left at current pace`}
                    </div>
                  </div>
                  <div className="lrd-mono" style={{ fontSize: 13, textAlign: "right", color: item.qty <= 0 ? "var(--rust)" : "var(--ink)" }}>
                    {item.qty} {item.unit}
                  </div>
                  <GaugeBar pct={pct} color={color} />
                  <div style={{ display: "flex", gap: 4 }}>
                    <IconBtn onClick={() => quickAdjust(item.id, -1)} title="Log use"><Minus size={12} /></IconBtn>
                    <IconBtn onClick={() => quickAdjust(item.id, 1)} title="Restock"><Plus size={12} /></IconBtn>
                  </div>
                  <IconBtn onClick={() => removeInventory(item.id)} title="Remove" danger><Trash2 size={12} /></IconBtn>
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

function GroceryTab({ groceryData, checkedOff, toggleChecked, addPurchasedToInventory }) {
  const { shortfall, runningLow } = groceryData;
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

        {allEmpty && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-soft)", fontSize: 13 }}>
            Nothing needed right now — your inventory covers this week's meals.
          </div>
        )}

        {shortfall.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--pine-deep)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
              Needed for this week's meals
            </div>
            {shortfall.map((g) => (
              <GroceryRow key={g.key} g={g} checked={!!checkedOff[g.key]} onToggle={() => toggleChecked(g.key)} />
            ))}
          </div>
        )}

        {runningLow.length > 0 && (
          <div>
            <div className="lrd-mono" style={{ fontSize: 10.5, color: "var(--gold-deep)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
              Running low, based on your usage pace
            </div>
            {runningLow.map((g) => (
              <GroceryRow key={g.key} g={g} checked={!!checkedOff[g.key]} onToggle={() => toggleChecked(g.key)} low />
            ))}
          </div>
        )}

        {!allEmpty && (
          <>
            <div className="lrd-dash" style={{ margin: "14px 0 12px" }} />
            <button
              onClick={addPurchasedToInventory}
              className="lrd-btn-gold"
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <ShoppingCart size={14} /> Mark {checkedCount || ""} checked as bought
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function GroceryRow({ g, checked, onToggle, low }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 4px", cursor: "pointer",
      opacity: checked ? 0.45 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {checked ? <CheckCircle2 size={16} color="var(--pine)" /> : <Circle size={16} color="var(--line)" />}
        <span style={{ fontSize: 13.5, textDecoration: checked ? "line-through" : "none", textTransform: "capitalize" }}>{g.name}</span>
        {low && <AlertTriangle size={11} color="var(--gold-deep)" />}
      </div>
      <span className="lrd-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
        {g.qty ? `${g.qty} ${g.unit}` : (g.stats && g.stats.status === "out" ? "out" : "restock")}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Insights tab                                                           */
/* ---------------------------------------------------------------------- */

function InsightsTab({ inventory, insights, loading, error, onRun }) {
  const sorted = useMemo(() => {
    return inventory
      .map((item) => ({ item, stats: usageStats(item) }))
      .sort((a, b) => {
        const order = { out: 0, critical: 1, low: 2, steady: 3 };
        return order[a.stats.status] - order[b.stats.status];
      });
  }, [inventory]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div className="lrd-display" style={{ fontSize: 15, fontWeight: 600 }}>Consumption & suggestions</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
            Days-until-empty is calculated from your logged usage. Suggestions come from Claude.
          </div>
        </div>
        <button
          onClick={onRun} disabled={loading}
          className="lrd-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Loader2 size={15} className="lrd-spin" style={{ animation: "spin 1s linear infinite" }} /> : <Wand2 size={15} />}
          {loading ? "Thinking…" : "Get AI suggestions"}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
            Days until empty
          </div>
          <div className="lrd-card" style={{ padding: "6px 14px" }}>
            {sorted.map(({ item, stats }, idx) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: idx > 0 ? "1px solid var(--line)" : "none" }}>
                <span style={{ fontSize: 12.5, width: 108, textTransform: "capitalize", flexShrink: 0 }}>{item.name}</span>
                <div style={{ flex: 1 }}>
                  <GaugeBar pct={stats.daysLeft === null ? (item.qty > 0 ? 100 : 3) : Math.min(100, (stats.daysLeft / 21) * 100)} color={STATUS_COLOR[stats.status]} />
                </div>
                <span className="lrd-mono" style={{ fontSize: 11, color: STATUS_COLOR[stats.status], width: 64, textAlign: "right", flexShrink: 0 }}>
                  {stats.daysLeft === null ? (item.qty <= 0 ? "out" : "n/a") : `${round(stats.daysLeft, 0)}d`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="lrd-mono" style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
            Suggestions
          </div>
          {!insights && !loading && !error && (
            <div className="lrd-card" style={{ padding: 18, fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center" }}>
              Click "Get AI suggestions" for restock timing, bulk-buy tips, and recipe ideas based on what's about to run out.
            </div>
          )}
          {error && (
            <div className="lrd-card" style={{ padding: 14, fontSize: 12.5, color: "var(--rust)" }}>{error}</div>
          )}
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
    <div style={{
      position: "absolute", inset: 0, background: "rgba(35,46,40,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 20, padding: 20,
    }}>
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
    try {
      const r = await parseRecipeAI(pasteText);
      setDraft(r);
    } catch (e) {
      setError("Couldn't parse that — try pasting a clearer ingredient list, or add it manually.");
    } finally {
      setLoading(false);
    }
  }

  function updateDraftIngredient(id, field, value) {
    setDraft((d) => ({ ...d, ingredients: d.ingredients.map((ing) => ing.id === id ? { ...ing, [field]: value } : ing) }));
  }
  function removeDraftIngredient(id) {
    setDraft((d) => ({ ...d, ingredients: d.ingredients.filter((ing) => ing.id !== id) }));
  }

  function addManualRow() {
    setManualIngredients((m) => [...m, { id: genId("i"), name: "", qty: 1, unit: "each" }]);
  }
  function updateManualRow(id, field, value) {
    setManualIngredients((m) => m.map((r) => r.id === id ? { ...r, [field]: value } : r));
  }
  function removeManualRow(id) {
    setManualIngredients((m) => m.filter((r) => r.id !== id));
  }
  function saveManual() {
    if (!manualName.trim()) { setError("Give the recipe a name."); return; }
    const ingredients = manualIngredients.filter((r) => r.name.trim());
    if (ingredients.length === 0) { setError("Add at least one ingredient."); return; }
    onSave({ id: genId("r"), name: manualName.trim(), servings: Number(manualServings) || 1, ingredients });
  }

  return (
    <ModalShell title="Add a recipe" onClose={onClose} width={520}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button onClick={() => setMode("ai")} style={{
          flex: 1, padding: "7px", borderRadius: 5, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          border: "1px solid " + (mode === "ai" ? "var(--pine)" : "var(--line)"),
          background: mode === "ai" ? "var(--pine)" : "var(--paper-2)",
          color: mode === "ai" ? "var(--paper-2)" : "var(--ink-soft)",
        }}>
          <Sparkles size={12} style={{ marginRight: 5, verticalAlign: -2 }} />Paste & let AI parse
        </button>
        <button onClick={() => setMode("manual")} style={{
          flex: 1, padding: "7px", borderRadius: 5, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          border: "1px solid " + (mode === "manual" ? "var(--pine)" : "var(--line)"),
          background: mode === "manual" ? "var(--pine)" : "var(--paper-2)",
          color: mode === "manual" ? "var(--paper-2)" : "var(--ink-soft)",
        }}>
          Enter manually
        </button>
      </div>

      {mode === "ai" && !draft && (
        <div>
          <textarea
            className="lrd-input" rows={7} placeholder="Paste a recipe — ingredients, quantities, whatever you've got. e.g. &#10;Tacos (serves 4)&#10;1 lb ground beef&#10;8 small tortillas&#10;1 onion, diced&#10;1 cup shredded cheese..."
            value={pasteText} onChange={(e) => setPasteText(e.target.value)}
            style={{ resize: "vertical", fontFamily: "IBM Plex Mono, monospace", fontSize: 12.5 }}
          />
          {error && <div style={{ color: "var(--rust)", fontSize: 12, marginTop: 8 }}>{error}</div>}
          <button
            onClick={handleParse} disabled={loading || !pasteText.trim()}
            className="lrd-btn-primary"
            style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Wand2 size={15} />}
            {loading ? "Reading recipe…" : "Parse with AI"}
          </button>
        </div>
      )}

      {mode === "ai" && draft && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Name</label>
            <input className="lrd-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 10, width: 120 }}>
            <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Servings</label>
            <input type="number" className="lrd-input" value={draft.servings} onChange={(e) => setDraft((d) => ({ ...d, servings: e.target.value }))} />
          </div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Ingredients</label>
          {draft.ingredients.map((ing) => (
            <div key={ing.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px auto", gap: 6, marginBottom: 6 }}>
              <input className="lrd-input" value={ing.name} onChange={(e) => updateDraftIngredient(ing.id, "name", e.target.value)} />
              <input type="number" className="lrd-input" value={ing.qty} onChange={(e) => updateDraftIngredient(ing.id, "qty", Number(e.target.value))} />
              <select className="lrd-input" value={ing.unit} onChange={(e) => updateDraftIngredient(ing.id, "unit", e.target.value)}>
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
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
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Name</label>
            <input className="lrd-input" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. Sunday roast" />
          </div>
          <div style={{ marginBottom: 10, width: 120 }}>
            <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Servings</label>
            <input type="number" className="lrd-input" value={manualServings} onChange={(e) => setManualServings(e.target.value)} />
          </div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Ingredients</label>
          {manualIngredients.map((r) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px auto", gap: 6, marginBottom: 6 }}>
              <input className="lrd-input" placeholder="ingredient" value={r.name} onChange={(e) => updateManualRow(r.id, "name", e.target.value)} />
              <input type="number" className="lrd-input" value={r.qty} onChange={(e) => updateManualRow(r.id, "qty", Number(e.target.value))} />
              <select className="lrd-input" value={r.unit} onChange={(e) => updateManualRow(r.id, "unit", e.target.value)}>
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <IconBtn onClick={() => removeManualRow(r.id)} danger><Trash2 size={12} /></IconBtn>
            </div>
          ))}
          <button onClick={addManualRow} style={{ fontSize: 12, color: "var(--pine)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 4 }}>
            <Plus size={12} /> Add ingredient
          </button>
          {error && <div style={{ color: "var(--rust)", fontSize: 12, marginTop: 6 }}>{error}</div>}
          <button onClick={saveManual} className="lrd-btn-gold" style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Save recipe
          </button>
        </div>
      )}
    </ModalShell>
  );
}

function AddInventoryModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("each");
  const [category, setCategory] = useState("Pantry");
  const [error, setError] = useState(null);

  function handleSave() {
    if (!name.trim()) { setError("Give it a name."); return; }
    onSave(name.trim(), Number(qty) || 0, unit, category);
  }

  return (
    <ModalShell title="Add to inventory" onClose={onClose} width={380}>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Name</label>
        <input className="lrd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. black beans" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Quantity</label>
          <input type="number" className="lrd-input" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Unit</label>
          <select className="lrd-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>Category</label>
        <select className="lrd-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {["Produce", "Meat", "Dairy & eggs", "Pantry", "Baking", "Frozen", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {error && <div style={{ color: "var(--rust)", fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button onClick={handleSave} className="lrd-btn-gold" style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Add to inventory
      </button>
    </ModalShell>
  );
}
