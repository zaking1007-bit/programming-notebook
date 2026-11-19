const storageKey = "kitchen-run-groceries-v3";

const categoryOrder = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Drinks",
  "Household",
  "Personal Care",
  "Other",
];

const categoryIcons = {
  Produce: "●",
  "Meat & Seafood": "◖",
  "Dairy & Eggs": "◌",
  Bakery: "◒",
  Pantry: "▦",
  Frozen: "✧",
  Drinks: "◍",
  Household: "□",
  "Personal Care": "◇",
  Other: "＋",
};

const categoryRules = {
  Produce: [
    "apple",
    "avocado",
    "banana",
    "berry",
    "berries",
    "broccoli",
    "carrot",
    "cilantro",
    "cucumber",
    "garlic",
    "grape",
    "lettuce",
    "lime",
    "lemon",
    "mushroom",
    "onion",
    "orange",
    "pepper",
    "potato",
    "salad",
    "spinach",
    "strawberry",
    "tomato",
    "zucchini",
  ],
  "Meat & Seafood": [
    "bacon",
    "beef",
    "chicken",
    "fish",
    "pork",
    "salmon",
    "sausage",
    "shrimp",
    "steak",
    "turkey",
  ],
  "Dairy & Eggs": [
    "butter",
    "cheese",
    "cream",
    "egg",
    "eggs",
    "half and half",
    "milk",
    "sour cream",
    "yogurt",
  ],
  Bakery: ["bagel", "bread", "buns", "croissant", "muffin", "roll", "tortilla"],
  Pantry: [
    "beans",
    "cereal",
    "chips",
    "flour",
    "honey",
    "oil",
    "pasta",
    "peanut butter",
    "rice",
    "salsa",
    "sauce",
    "soup",
    "spice",
    "sugar",
    "tuna",
  ],
  Frozen: ["frozen", "ice cream", "pizza", "popsicle", "waffle"],
  Drinks: ["beer", "coffee", "juice", "soda", "sparkling water", "tea", "water", "wine"],
  Household: [
    "detergent",
    "foil",
    "laundry",
    "napkin",
    "paper towel",
    "paper towels",
    "soap",
    "trash bag",
    "trash bags",
    "ziplock",
  ],
  "Personal Care": ["conditioner", "deodorant", "lotion", "shampoo", "toothpaste"],
};

const priceBook = {
  apple: 3.49,
  avocado: 1.25,
  bananas: 1.39,
  banana: 1.39,
  berries: 4.99,
  bread: 3.49,
  broccoli: 2.49,
  butter: 4.49,
  carrots: 2.29,
  cereal: 4.79,
  cheese: 4.29,
  chicken: 9.99,
  "chicken breast": 10.99,
  chips: 4.49,
  coffee: 8.99,
  cucumber: 1.29,
  eggs: 3.79,
  fish: 10.99,
  garlic: 0.89,
  grapes: 4.99,
  "ground beef": 7.99,
  "ice cream": 5.49,
  juice: 4.29,
  lettuce: 2.49,
  milk: 3.69,
  onion: 1.49,
  pasta: 2.29,
  pizza: 6.99,
  potatoes: 4.49,
  rice: 3.99,
  salmon: 12.99,
  shrimp: 11.99,
  spinach: 3.49,
  steak: 14.99,
  strawberries: 4.49,
  tomato: 2.49,
  tortillas: 3.29,
  turkey: 7.99,
  water: 4.99,
  yogurt: 4.99,
  "paper towels": 8.99,
  "trash bags": 9.99,
  detergent: 12.99,
  toothpaste: 4.49,
};

const fallbackPrices = {
  Produce: 3.25,
  "Meat & Seafood": 9.75,
  "Dairy & Eggs": 4.25,
  Bakery: 3.75,
  Pantry: 4.5,
  Frozen: 5.75,
  Drinks: 5.25,
  Household: 8.5,
  "Personal Care": 5.75,
  Other: 4.99,
};

const state = {
  groceries: loadGroceries(),
  search: "",
};

const addForm = document.querySelector("#addForm");
const itemInput = document.querySelector("#itemInput");
const searchInput = document.querySelector("#searchInput");
const categoryBoard = document.querySelector("#categoryBoard");
const emptyState = document.querySelector("#emptyState");
const categoryTemplate = document.querySelector("#categoryTemplate");
const itemTemplate = document.querySelector("#itemTemplate");
const totalCost = document.querySelector("#totalCost");
const averageCost = document.querySelector("#averageCost");
const remainingCount = document.querySelector("#remainingCount");
const itemCount = document.querySelector("#itemCount");
const todayLabel = document.querySelector("#todayLabel");
const clearDoneBtn = document.querySelector("#clearDoneBtn");
const resetBtn = document.querySelector("#resetBtn");

todayLabel.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addItem(itemInput.value);
  itemInput.value = "";
  itemInput.focus();
});

document.querySelectorAll("[data-quick]").forEach((button) => {
  button.addEventListener("click", () => addItem(button.dataset.quick));
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value.trim().toLowerCase();
  render();
});

clearDoneBtn.addEventListener("click", () => {
  state.groceries = state.groceries.filter((item) => !item.done);
  saveAndRender();
});

resetBtn.addEventListener("click", () => {
  if (state.groceries.length === 0) return;
  const shouldReset = window.confirm("Reset the whole grocery list?");
  if (!shouldReset) return;
  state.groceries = [];
  saveAndRender();
});

function addItem(rawName) {
  const parsed = parseItem(rawName);
  if (!parsed.name) return;

  const category = detectCategory(parsed.name);
  const price = estimatePrice(parsed.name, category, parsed.quantity);

  state.groceries.unshift({
    id: crypto.randomUUID(),
    name: parsed.name,
    quantity: parsed.quantity,
    category,
    price,
    done: false,
    addedAt: Date.now(),
  });

  saveAndRender();
}

function parseItem(rawName) {
  const value = rawName.trim().replace(/\s+/g, " ");
  const quantityMatch = value.match(/^(\d+(?:\.\d+)?)\s+(.+)/);

  if (!quantityMatch) {
    return { name: titleCase(value), quantity: 1 };
  }

  return {
    name: titleCase(quantityMatch[2]),
    quantity: Number(quantityMatch[1]),
  };
}

function detectCategory(name) {
  const normalized = normalize(name);

  for (const category of categoryOrder) {
    const rules = categoryRules[category] || [];
    if (rules.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return "Other";
}

function estimatePrice(name, category, quantity = 1) {
  const normalized = normalize(name);
  const match = Object.keys(priceBook)
    .sort((a, b) => b.length - a.length)
    .find((keyword) => normalized.includes(keyword));
  const basePrice = match ? priceBook[match] : fallbackPrices[category];
  return roundCurrency(basePrice * quantity);
}

function render() {
  categoryBoard.innerHTML = "";

  const filtered = state.groceries.filter((item) =>
    item.name.toLowerCase().includes(state.search)
  );
  const grouped = groupByCategory(filtered);

  categoryOrder.forEach((category) => {
    const items = grouped[category] || [];
    if (items.length === 0) return;

    const categoryNode = categoryTemplate.content.firstElementChild.cloneNode(true);
    categoryNode.querySelector(".category-icon").textContent = categoryIcons[category];
    categoryNode.querySelector("h2").textContent = category;
    categoryNode.querySelector(".category-total").textContent = formatCurrency(
      sum(items.map((item) => item.price))
    );

    const list = categoryNode.querySelector("ul");
    items.forEach((item) => list.appendChild(renderItem(item)));
    categoryBoard.appendChild(categoryNode);
  });

  updateDashboard();
  emptyState.classList.toggle("is-visible", state.groceries.length === 0);
}

function renderItem(item) {
  const itemNode = itemTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = itemNode.querySelector("input[type='checkbox']");
  const nameInput = itemNode.querySelector(".item-name");
  const priceInput = itemNode.querySelector(".price-input");
  const meta = itemNode.querySelector(".item-meta");
  const deleteBtn = itemNode.querySelector(".delete-btn");

  itemNode.classList.toggle("is-done", item.done);
  checkbox.checked = item.done;
  nameInput.value = item.name;
  priceInput.value = item.price.toFixed(2);
  meta.textContent = item.quantity > 1 ? `${item.quantity} added · ${item.category}` : item.category;

  checkbox.addEventListener("change", () => {
    updateItem(item.id, { done: checkbox.checked });
  });

  nameInput.addEventListener("change", () => {
    const name = titleCase(nameInput.value.trim());
    if (!name) {
      deleteItem(item.id);
      return;
    }
    const category = detectCategory(name);
    updateItem(item.id, {
      name,
      category,
      price: estimatePrice(name, category, item.quantity),
    });
  });

  priceInput.addEventListener("change", () => {
    updateItem(item.id, { price: roundCurrency(Number(priceInput.value) || 0) });
  });

  deleteBtn.addEventListener("click", () => deleteItem(item.id));

  return itemNode;
}

function updateDashboard() {
  const total = sum(state.groceries.map((item) => item.price));
  const remaining = state.groceries.filter((item) => !item.done).length;
  const average = state.groceries.length ? total / state.groceries.length : 0;

  totalCost.textContent = formatCurrency(total);
  averageCost.textContent = formatCurrency(average);
  remainingCount.textContent = String(remaining);
  itemCount.textContent = `${state.groceries.length} ${state.groceries.length === 1 ? "item" : "items"}`;
}

function updateItem(id, patch) {
  state.groceries = state.groceries.map((item) =>
    item.id === id ? { ...item, ...patch } : item
  );
  saveAndRender();
}

function deleteItem(id) {
  state.groceries = state.groceries.filter((item) => item.id !== id);
  saveAndRender();
}

function groupByCategory(items) {
  return items.reduce((groups, item) => {
    groups[item.category] ||= [];
    groups[item.category].push(item);
    return groups;
  }, {});
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => {
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function loadGroceries() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveAndRender() {
  localStorage.setItem(storageKey, JSON.stringify(state.groceries));
  render();
}

render();
