const STORAGE_KEY = "commentarium.customBooks.v1";
const ANNOTATION_KEY = "commentarium.annotations.v1";

const seedBooks = [
  {
    id: "pride",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    chapters: [
      {
        title: "The Bennets meet Bingley",
        summary:
          "Netherfield is let at last, and the Bennet household immediately turns a rumor into strategy. Mrs. Bennet sees Mr. Bingley as a possible rescue from the family's uncertain future, while Elizabeth watches the social machinery with amusement.",
        beats: ["Bingley arrives", "Marriage stakes are established", "Elizabeth's wit is foregrounded"],
      },
      {
        title: "First impressions harden",
        summary:
          "At the assembly, Bingley is open and admired, but Darcy seems proud and withholding. Elizabeth hears Darcy slight her, turning a passing insult into a durable first impression.",
        beats: ["Darcy refuses a dance", "Jane and Bingley connect", "Elizabeth chooses laughter over injury"],
      },
      {
        title: "Jane at Netherfield",
        summary:
          "Jane's visit to Netherfield becomes an illness and an invitation for Elizabeth to enter Bingley's circle. The house becomes a testing ground for class performance, sisterly loyalty, and Darcy's unsettled attention.",
        beats: ["Jane falls ill", "Elizabeth walks to Netherfield", "Darcy notices Elizabeth's independence"],
      },
      {
        title: "Collins arrives",
        summary:
          "Mr. Collins brings the entail into the room as a person: pompous, dutiful, and absurdly self-important. His visit turns the Bennets' inheritance problem into comic pressure.",
        beats: ["The entail becomes immediate", "Lady Catherine's influence appears", "Collins studies the Bennet daughters"],
      },
      {
        title: "Wickham's story",
        summary:
          "Wickham charms Meryton and gives Elizabeth a persuasive account of Darcy's cruelty. The story confirms what Elizabeth already wants to believe.",
        beats: ["Wickham enters", "Darcy's reputation darkens", "Elizabeth's judgment feels certain"],
      },
      {
        title: "The Netherfield ball",
        summary:
          "The ball exposes mismatched manners, private hopes, and public embarrassment. Elizabeth dances with Darcy, but the Bennet family's behavior threatens Jane's prospects.",
        beats: ["Elizabeth and Darcy dance", "Collins behaves badly", "Jane's match feels fragile"],
      },
      {
        title: "Collins proposes",
        summary:
          "Collins offers Elizabeth security without respect. Her refusal asserts personal judgment against practical family pressure.",
        beats: ["Elizabeth refuses Collins", "Mrs. Bennet panics", "Charlotte sees another path"],
      },
      {
        title: "Charlotte chooses Collins",
        summary:
          "Charlotte accepts Collins, not out of romance but survival. Elizabeth is startled into seeing how limited women's choices can be.",
        beats: ["Charlotte accepts", "Elizabeth feels betrayed", "Marriage becomes a moral question"],
      },
      {
        title: "Bingley leaves",
        summary:
          "Bingley's removal from Netherfield wounds Jane and confirms Elizabeth's suspicion that social influence has overruled feeling.",
        beats: ["Jane is disappointed", "Caroline's coldness sharpens", "Darcy is suspected"],
      },
      {
        title: "Hunsford",
        summary:
          "Elizabeth visits Charlotte and sees the life her friend chose. Lady Catherine dominates the neighborhood, while Darcy's unexpected presence changes the emotional weather.",
        beats: ["Elizabeth observes Charlotte's marriage", "Lady Catherine interrogates", "Darcy appears at Rosings"],
      },
      {
        title: "Darcy proposes",
        summary:
          "Darcy declares love while insulting Elizabeth's family and station. Elizabeth rejects him and names the injuries she believes he has caused.",
        beats: ["Proposal and refusal", "Jane and Wickham accusations surface", "Pride meets prejudice directly"],
      },
      {
        title: "The letter",
        summary:
          "Darcy's letter forces Elizabeth to revisit the evidence. She begins to see that Wickham's charm and her own certainty have misled her.",
        beats: ["Darcy explains", "Wickham's story collapses", "Elizabeth reconsiders herself"],
      },
    ],
    whole:
      "A comedy of manners in which first impressions, family pressure, wealth, gender, and moral self-knowledge collide. Elizabeth Bennet and Fitzwilliam Darcy move from mutual misreading to respect by learning how pride and prejudice have shaped their judgments.",
    themes: [
      "Judgment improves only when wit is joined to humility.",
      "Marriage is both an emotional desire and an economic institution.",
      "Class manners can reveal character, but they can also disguise it.",
      "Family behavior has public consequences in a marriage market.",
    ],
    characters: [
      { name: "Elizabeth Bennet", role: "Sharp observer whose confidence in her judgment is tested.", chapter: 1 },
      { name: "Jane Bennet", role: "Generous eldest sister whose restraint makes her feelings easy to underestimate.", chapter: 1 },
      { name: "Mr. Darcy", role: "Reserved gentleman whose pride hides both flaws and principles.", chapter: 2 },
      { name: "Mr. Bingley", role: "Affable newcomer whose openness makes him socially vulnerable.", chapter: 1 },
      { name: "Charlotte Lucas", role: "Practical friend who treats marriage as security.", chapter: 3 },
      { name: "Mr. Wickham", role: "Charming officer whose account of Darcy shapes Elizabeth's judgment.", chapter: 5 },
      { name: "Mr. Collins", role: "Entailed heir whose absurdity carries real economic power.", chapter: 4 },
    ],
    relationships: [
      { a: "Elizabeth Bennet", b: "Mr. Darcy", label: "misreading, then scrutiny", chapter: 2, tone: "blue" },
      { a: "Jane Bennet", b: "Mr. Bingley", label: "mutual attachment", chapter: 2, tone: "gold" },
      { a: "Elizabeth Bennet", b: "Mr. Wickham", label: "trust built on charm", chapter: 5, tone: "clay" },
      { a: "Charlotte Lucas", b: "Mr. Collins", label: "practical marriage", chapter: 8, tone: "blue" },
    ],
    sources: [
      { title: "Project Gutenberg text", type: "Primary text", url: "https://www.gutenberg.org/ebooks/1342" },
      { title: "The Jane Austen Society", type: "Context", url: "https://janeaustensociety.org/" },
      { title: "Open Yale Courses: The English Novel", type: "Lecture series", url: "https://oyc.yale.edu/english/engl-291" },
    ],
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    chapters: [
      {
        title: "Walton writes north",
        summary:
          "Walton's letters frame the novel with ambition, loneliness, and hunger for discovery. His polar voyage creates a mirror for the stranger he will soon rescue.",
        beats: ["Arctic frame begins", "Walton seeks glory", "Isolation is introduced"],
      },
      {
        title: "Victor's childhood",
        summary:
          "Victor recalls a privileged youth shaped by affection, curiosity, and possessive ideas about family. Elizabeth enters his life through language that already raises questions about love and ownership.",
        beats: ["Victor narrates origins", "Elizabeth joins the family", "Curiosity gathers force"],
      },
      {
        title: "Education and obsession",
        summary:
          "Victor moves from outdated natural philosophy toward modern science. Grief and ambition fuse, making knowledge feel like conquest over mortality.",
        beats: ["Caroline dies", "Victor leaves for Ingolstadt", "Science becomes vocation"],
      },
      {
        title: "The creature awakens",
        summary:
          "Victor succeeds and immediately recoils from what he has made. The horror is not only the creature's appearance, but Victor's failure to imagine responsibility after creation.",
        beats: ["Creation succeeds", "Victor abandons the creature", "Nightmare replaces triumph"],
      },
      {
        title: "Return and accusation",
        summary:
          "Victor returns home after William's death and sees the creature near the scene. Justine is accused, and Victor's silence becomes a second abandonment.",
        beats: ["William is murdered", "Justine is blamed", "Victor withholds knowledge"],
      },
      {
        title: "The creature speaks",
        summary:
          "The creature confronts Victor and demands to be heard. The novel shifts from spectacle to testimony, complicating the reader's moral alignment.",
        beats: ["Creature finds Victor", "A demand for listening", "Responsibility returns"],
      },
      {
        title: "Learning from the De Laceys",
        summary:
          "The creature secretly observes a family and learns language, emotion, history, and exclusion. Human culture educates him while denying him entrance.",
        beats: ["Language develops", "Sympathy deepens", "Exclusion intensifies"],
      },
      {
        title: "Rejection and rage",
        summary:
          "The creature's hope for acceptance collapses after he reveals himself. Rejection turns pain into revenge, and Victor's private act becomes a social disaster.",
        beats: ["The De Laceys reject him", "The creature burns the cottage", "Revenge takes shape"],
      },
    ],
    whole:
      "A nested tale of creation, ambition, abandonment, and revenge. Shelley asks what a maker owes the made, what society owes the excluded, and how quickly noble dreams curdle when separated from care.",
    themes: [
      "Ambition without responsibility becomes destructive.",
      "Monstrosity is produced by rejection as much as by appearance.",
      "Storytelling is a struggle for moral recognition.",
      "Education can awaken sympathy and suffering at the same time.",
    ],
    characters: [
      { name: "Victor Frankenstein", role: "Creator whose ambition outruns his responsibility.", chapter: 1 },
      { name: "The Creature", role: "Abandoned being seeking recognition, language, and justice.", chapter: 4 },
      { name: "Robert Walton", role: "Explorer whose ambition frames and echoes Victor's.", chapter: 1 },
      { name: "Elizabeth Lavenza", role: "Beloved family member whose role exposes domestic ideals and limits.", chapter: 2 },
      { name: "Justine Moritz", role: "Innocent servant made vulnerable by class and circumstance.", chapter: 5 },
      { name: "De Lacey Family", role: "Unknowing teachers of language, affection, and exclusion.", chapter: 7 },
    ],
    relationships: [
      { a: "Victor Frankenstein", b: "The Creature", label: "creator and abandoned creation", chapter: 4, tone: "clay" },
      { a: "Robert Walton", b: "Victor Frankenstein", label: "mirrored ambition", chapter: 1, tone: "blue" },
      { a: "The Creature", b: "De Lacey Family", label: "distant education", chapter: 7, tone: "gold" },
      { a: "Victor Frankenstein", b: "Elizabeth Lavenza", label: "domestic attachment", chapter: 2, tone: "blue" },
    ],
    sources: [
      { title: "Project Gutenberg text", type: "Primary text", url: "https://www.gutenberg.org/ebooks/84" },
      { title: "British Library: Discovering Literature", type: "Context", url: "https://www.bl.uk/romantics-and-victorians" },
      { title: "Open Yale Courses: Milton", type: "Background for Paradise Lost echoes", url: "https://oyc.yale.edu/english/engl-220" },
    ],
  },
];

let books = applyAnnotations([...seedBooks, ...loadCustomBooks()]);

const modeInfo = {
  chapters: ["Chapter by chapter", "Chapter notes at your current reading point"],
  checkpoint: ["Summary so far", "Everything that matters up to where you are"],
  whole: ["Whole book", "A locked overview for after finishing"],
  themes: ["Plot & themes", "Patterns visible without crossing your chapter line"],
  characters: ["Characters", "People and relationships revealed so far"],
  diagrams: ["Diagrams", "Visual maps that stop at your current chapter"],
  forum: ["Forum", "Spoiler-safe discussion rooms"],
  sources: ["Sources", "Scholarly paths and watchable context"],
  passage: ["Passage lens", "Close reading without future spoilers"],
  quotes: ["Quote bank", "Evidence, favorite lines, and essay-ready passages"],
  study: ["Study mode", "Practice questions and class preparation"],
  essay: ["Essay workspace", "Thesis, outline, evidence, and counterarguments"],
  journal: ["Reading journal", "Private reflection alongside analysis"],
  ai: ["AI companion", "Spoiler-bounded guidance built from your reading point"],
};

let state = {
  bookId: books[0].id,
  chapter: 1,
  mode: "chapters",
  wholeUnlocked: false,
};

const els = {
  bookSelect: document.querySelector("#bookSelect"),
  newBookButton: document.querySelector("#newBookButton"),
  deleteBookButton: document.querySelector("#deleteBookButton"),
  bookDialog: document.querySelector("#bookDialog"),
  bookForm: document.querySelector("#bookForm"),
  closeDialog: document.querySelector("#closeDialog"),
  cancelDialog: document.querySelector("#cancelDialog"),
  customTitle: document.querySelector("#customTitle"),
  customAuthor: document.querySelector("#customAuthor"),
  customChapters: document.querySelector("#customChapters"),
  chapterRange: document.querySelector("#chapterRange"),
  chapterOutput: document.querySelector("#chapterOutput"),
  chapterTitle: document.querySelector("#chapterTitle"),
  guardMeter: document.querySelector("#guardMeter"),
  guardState: document.querySelector("#guardState"),
  spoilerBadge: document.querySelector("#spoilerBadge"),
  modeKicker: document.querySelector("#modeKicker"),
  modeTitle: document.querySelector("#modeTitle"),
  content: document.querySelector("#content"),
  buttons: [...document.querySelectorAll(".mode-button")],
};

function loadCustomBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCustomBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books.filter((book) => book.custom)));
}

function loadAnnotations() {
  try {
    return JSON.parse(localStorage.getItem(ANNOTATION_KEY) || "{}");
  } catch {
    return {};
  }
}

function applyAnnotations(bookList) {
  const annotations = loadAnnotations();
  return bookList.map((book) => ({ ...book, ...(annotations[book.id] || {}) }));
}

function saveAnnotations() {
  const annotations = {};
  books.forEach((book) => {
    annotations[book.id] = {
      quotes: book.quotes || [],
      journal: book.journal || [],
      essay: book.essay || { thesis: "", outline: "", counterargument: "" },
      aiEndpoint: book.aiEndpoint || "",
    };
  });
  localStorage.setItem(ANNOTATION_KEY, JSON.stringify(annotations));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitList(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createCustomBook(title, author, chapterCount) {
  const safeCount = Math.max(1, Math.min(120, Number(chapterCount) || 1));
  return {
    id: `custom-${Date.now()}`,
    custom: true,
    title: title.trim(),
    author: author.trim(),
    chapters: Array.from({ length: safeCount }, (_, index) => ({
      title: `Chapter ${index + 1}`,
      summary: "",
      beats: [],
    })),
    whole: "",
    themes: [],
    characters: [],
    relationships: [],
    sources: [],
    quotes: [],
    journal: [],
    essay: { thesis: "", outline: "", counterargument: "" },
    aiEndpoint: "",
  };
}

function currentBook() {
  const book = books.find((item) => item.id === state.bookId) || books[0];
  return normalizeBook(book);
}

function normalizeBook(book) {
  book.chapters ||= [];
  book.themes ||= [];
  book.characters ||= [];
  book.relationships ||= [];
  book.sources ||= [];
  book.quotes ||= [];
  book.journal ||= [];
  book.essay ||= { thesis: "", outline: "", counterargument: "" };
  book.aiEndpoint ||= "";
  return book;
}

function visibleChapters(book = currentBook()) {
  return book.chapters.slice(0, state.chapter);
}

function card(className = "") {
  const element = document.createElement("article");
  element.className = `card ${className}`.trim();
  return element;
}

function tagList(items) {
  if (!items.length) return "";
  return `<div class="meta">${items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderBookOptions() {
  const shelf = books
    .map((book) => {
      const prefix = book.custom ? "Your shelf" : "Guided";
      return `<option value="${escapeHtml(book.id)}">${prefix} - ${escapeHtml(book.title)} · ${escapeHtml(book.author)}</option>`;
    })
    .join("");
  els.bookSelect.innerHTML = shelf;
  els.bookSelect.value = state.bookId;
}

function renderShell() {
  const book = currentBook();
  if (els.bookSelect.value !== book.id) els.bookSelect.value = book.id;
  state.chapter = Math.min(state.chapter, book.chapters.length);
  els.chapterRange.max = book.chapters.length;
  els.chapterRange.value = state.chapter;
  els.chapterOutput.value = `Chapter ${state.chapter}`;
  els.chapterTitle.textContent = book.chapters[state.chapter - 1].title;
  els.deleteBookButton.hidden = !book.custom;
  els.guardMeter.style.width = `${(state.chapter / book.chapters.length) * 100}%`;
  els.guardState.textContent = state.wholeUnlocked && state.mode === "whole" ? "Bypassed" : "On";
  els.spoilerBadge.textContent =
    state.mode === "whole" && state.wholeUnlocked
      ? "Full-book spoilers visible"
      : `No spoilers past chapter ${state.chapter}`;
  els.modeKicker.textContent = modeInfo[state.mode][0];
  els.modeTitle.textContent = modeInfo[state.mode][1];
  els.buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === state.mode));
}

function renderChapters() {
  const book = currentBook();
  const current = book.chapters[state.chapter - 1];
  const cards = [];

  if (book.custom) {
    const editor = card("full");
    editor.innerHTML = `
      <h3>Current chapter notebook</h3>
      <div class="editor-grid">
        <div>
          <label for="chapterEditTitle">Chapter title</label>
          <input id="chapterEditTitle" value="${escapeHtml(current.title)}" />
        </div>
        <div>
          <label for="chapterEditBeats">Key beats</label>
          <input id="chapterEditBeats" value="${escapeHtml(current.beats.join(", "))}" placeholder="One beat, another beat" />
        </div>
      </div>
      <label for="chapterEditSummary">Summary through this chapter</label>
      <textarea id="chapterEditSummary" placeholder="Add only what the reader has reached.">${escapeHtml(current.summary)}</textarea>
      <div class="inline-actions">
        <button class="primary-action" id="saveChapterNotes" type="button">Save chapter notes</button>
      </div>
    `;
    cards.push(editor);
    setTimeout(() => {
      document.querySelector("#saveChapterNotes")?.addEventListener("click", () => {
        current.title = document.querySelector("#chapterEditTitle").value.trim() || `Chapter ${state.chapter}`;
        current.summary = document.querySelector("#chapterEditSummary").value.trim();
        current.beats = splitList(document.querySelector("#chapterEditBeats").value);
        saveCustomBooks();
        render();
      });
    });
  }

  const wrapper = card("full");
  wrapper.innerHTML = `<h3>${escapeHtml(book.title)}: chapter trail</h3><div class="chapter-list"></div>`;
  const list = wrapper.querySelector(".chapter-list");

  book.chapters.forEach((chapter, index) => {
    const chapterNumber = index + 1;
    const locked = chapterNumber > state.chapter;
    const row = document.createElement("section");
    row.className = `chapter-row ${chapterNumber === state.chapter ? "is-current" : ""} ${locked ? "is-locked" : ""}`;
    const summary = chapter.summary || "No notes yet. Add them when you reach this chapter.";
    const beats = chapter.beats.length ? chapter.beats : ["reader note pending"];
    row.innerHTML = locked
      ? `<div class="chapter-num">${chapterNumber}</div><div><strong>Locked</strong><p>Set your current point here when you reach this chapter.</p></div>`
      : `<div class="chapter-num">${chapterNumber}</div><div><strong>${escapeHtml(chapter.title)}</strong><p>${escapeHtml(summary)}</p>${tagList(beats)}</div>`;
    list.append(row);
  });

  cards.push(wrapper);
  return cards;
}

function renderCheckpoint() {
  const book = currentBook();
  const chapters = visibleChapters(book);
  const beatCount = chapters.flatMap((chapter) => chapter.beats).length;
  const notes = chapters.map((chapter) => chapter.summary).filter(Boolean);
  const main = card("wide");
  main.innerHTML = `
    <h3>${escapeHtml(book.title)} so far</h3>
    <p>${escapeHtml(notes.join(" ") || "Your spoiler-safe summary will build here as you add chapter notes.")}</p>
  `;

  const stats = card();
  stats.innerHTML = `
    <h3>Reading checkpoint</h3>
    <p>You have crossed ${state.chapter} of ${book.chapters.length} chapters. The companion is tracking ${beatCount} plot beats and ${safeCharacters(book).length} introduced characters.</p>
    ${tagList(["spoiler-safe", `${Math.round((state.chapter / book.chapters.length) * 100)}% sampled`, book.author])}
  `;

  const next = card("full");
  const latest = chapters[chapters.length - 1];
  const beats = latest.beats.length ? latest.beats : ["Add one or two moments worth watching before moving ahead."];
  next.innerHTML = `
    <h3>What to watch now</h3>
    <ul class="list">${beats.map((beat) => `<li>${escapeHtml(beat)}</li>`).join("")}</ul>
  `;
  return [main, stats, next];
}

function renderWhole() {
  const book = currentBook();
  if (!state.wholeUnlocked) {
    const locked = card("full warning");
    locked.innerHTML = `
      <h3>Full-book summary locked</h3>
      <p>This mode contains end-of-book framing and should wait until the reader has finished. The rest of the app remains chapter-safe.</p>
      <button class="danger-action" type="button" id="unlockWhole">Reveal full-book summary</button>
    `;
    setTimeout(() => {
      document.querySelector("#unlockWhole")?.addEventListener("click", () => {
        state.wholeUnlocked = true;
        render();
      });
    });
    return [locked];
  }

  const overview = card("wide");
  overview.innerHTML = `<h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(book.whole || "Add a full-book summary after finishing.")}</p>`;
  const finish = card();
  finish.innerHTML = `<h3>After-reading lens</h3><p>Use this mode to connect the ending back to earlier choices, not to replace the chapters themselves.</p>${tagList(["finished-reader mode", "spoilers visible"])}`;
  if (!book.custom) return [overview, finish];

  const editor = card("full");
  editor.innerHTML = `
    <h3>Whole-book notebook</h3>
    <textarea id="wholeEdit" placeholder="Write this only when the book is complete.">${escapeHtml(book.whole)}</textarea>
    <div class="inline-actions">
      <button class="primary-action" id="saveWhole" type="button">Save whole-book summary</button>
    </div>
  `;
  setTimeout(() => {
    document.querySelector("#saveWhole")?.addEventListener("click", () => {
      book.whole = document.querySelector("#wholeEdit").value.trim();
      saveCustomBooks();
      render();
    });
  });
  return [overview, finish, editor];
}

function renderThemes() {
  const book = currentBook();
  const chapters = visibleChapters(book);
  const plot = card("wide");
  plot.innerHTML = `
    <h3>Plot line so far</h3>
    <ul class="list">${chapters
      .map((chapter, index) => `<li><strong>Chapter ${index + 1}:</strong> ${escapeHtml(chapter.beats[0] || chapter.title)}</li>`)
      .join("")}</ul>
  `;

  const visibleThemes = book.themes.length
    ? book.themes.slice(0, Math.max(2, Math.ceil(state.chapter / 3)))
    : ["Track a recurring question, image, conflict, or idea as it becomes visible."];
  const themeCards = visibleThemes.map((theme, index) => {
    const item = card();
    item.innerHTML = `<h3>Theme ${index + 1}</h3><p>${escapeHtml(theme)}</p>`;
    return item;
  });
  if (!book.custom) return [plot, ...themeCards];

  const editor = card("full");
  editor.innerHTML = `
    <h3>Theme notebook</h3>
    <textarea id="themeEdit" placeholder="Add one theme per line.">${escapeHtml(book.themes.join("\n"))}</textarea>
    <div class="inline-actions">
      <button class="primary-action" id="saveThemes" type="button">Save themes</button>
    </div>
  `;
  setTimeout(() => {
    document.querySelector("#saveThemes")?.addEventListener("click", () => {
      book.themes = splitList(document.querySelector("#themeEdit").value);
      saveCustomBooks();
      render();
    });
  });
  return [plot, ...themeCards, editor];
}

function safeCharacters(book = currentBook()) {
  return book.characters.filter((character) => character.chapter <= state.chapter);
}

function safeRelationships(book = currentBook()) {
  return book.relationships.filter((relationship) => relationship.chapter <= state.chapter);
}

function renderCharacters() {
  const book = currentBook();
  const people = safeCharacters(book).map((character) => {
    const item = card();
    item.innerHTML = `<h3>${escapeHtml(character.name)}</h3><p>${escapeHtml(character.role)}</p>${tagList([`introduced chapter ${character.chapter}`])}`;
    return item;
  });

  const relationships = card("full");
  relationships.innerHTML = `
    <h3>Relationships visible so far</h3>
    <ul class="list">${
      safeRelationships(book)
        .map(
          (relationship) =>
            `<li><strong>${escapeHtml(relationship.a)} ↔ ${escapeHtml(relationship.b)}:</strong> ${escapeHtml(relationship.label)}</li>`,
        )
        .join("") || "<li>No major relationship map has opened yet.</li>"
    }</ul>
  `;
  if (!book.custom) return [...people, relationships];

  const editor = card("full");
  editor.innerHTML = `
    <h3>Character notebook</h3>
    <div class="editor-grid">
      <div>
        <label for="characterName">Character</label>
        <input id="characterName" autocomplete="off" />
      </div>
      <div>
        <label for="characterRole">Role or note</label>
        <input id="characterRole" autocomplete="off" />
      </div>
    </div>
    <div class="editor-grid">
      <div>
        <label for="relationshipPair">Relationship</label>
        <input id="relationshipPair" placeholder="Name A / Name B" autocomplete="off" />
      </div>
      <div>
        <label for="relationshipNote">Relationship note</label>
        <input id="relationshipNote" autocomplete="off" />
      </div>
    </div>
    <div class="inline-actions">
      <button class="primary-action" id="addCharacter" type="button">Add character</button>
      <button class="secondary-action" id="addRelationship" type="button">Add relationship</button>
    </div>
  `;
  setTimeout(() => {
    document.querySelector("#addCharacter")?.addEventListener("click", () => {
      const name = document.querySelector("#characterName").value.trim();
      if (!name) return;
      book.characters.push({
        name,
        role: document.querySelector("#characterRole").value.trim() || "Reader note",
        chapter: state.chapter,
      });
      saveCustomBooks();
      render();
    });
    document.querySelector("#addRelationship")?.addEventListener("click", () => {
      const pair = document.querySelector("#relationshipPair").value.split("/").map((item) => item.trim());
      const label = document.querySelector("#relationshipNote").value.trim();
      if (pair.length < 2 || !pair[0] || !pair[1]) return;
      book.relationships.push({ a: pair[0], b: pair[1], label: label || "Reader-tracked relationship", chapter: state.chapter, tone: "blue" });
      saveCustomBooks();
      render();
    });
  });
  return [...people, relationships, editor];
}

function renderRelationshipMap() {
  const book = currentBook();
  const map = card("full relationship-map");
  const people = safeCharacters(book).slice(0, 6);
  if (!people.length) {
    map.innerHTML = "<h3>Relationship map</h3><p>Add characters as they appear, then this map will form around your current chapter.</p>";
    return map;
  }
  const compact = window.matchMedia("(max-width: 620px)").matches;
  const positions = compact
    ? [
        [20, 24],
        [20, 104],
        [20, 184],
        [20, 264],
        [20, 344],
        [20, 424],
      ]
    : [
        [42, 38],
        [430, 44],
        [224, 148],
        [60, 258],
        [430, 252],
        [246, 278],
      ];
  people.forEach((person, index) => {
    const node = document.createElement("div");
    node.className = `node ${index === 0 ? "primary" : ""}`;
    node.style.left = `${positions[index][0]}px`;
    node.style.top = `${positions[index][1]}px`;
    node.textContent = person.name;
    map.append(node);
  });

  safeRelationships(book).forEach((relationship) => {
    const from = people.findIndex((person) => person.name === relationship.a);
    const to = people.findIndex((person) => person.name === relationship.b);
    if (from < 0 || to < 0) return;
    const [x1, y1] = positions[from];
    const [x2, y2] = positions[to];
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (!compact) {
      const connector = document.createElement("div");
      connector.className = `connector ${relationship.tone}`;
      connector.style.left = `${x1 + 62}px`;
      connector.style.top = `${y1 + 30}px`;
      connector.style.width = `${Math.hypot(dx, dy)}px`;
      connector.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      map.prepend(connector);
    }
  });

  return map;
}

function renderDiagrams() {
  const book = currentBook();
  const map = renderRelationshipMap();
  const bars = card("full");
  const themes = ["Tension", "Social pressure", "Self-knowledge", "Isolation"];
  bars.innerHTML = `
    <h3>Theme intensity by checkpoint</h3>
    <div class="diagram-bars">
      ${themes
        .map((theme, index) => {
          const width = Math.min(96, 18 + state.chapter * (7 + index));
          const colors = ["var(--clay)", "var(--gold)", "var(--accent)", "var(--blue)"];
          return `<div class="bar-row"><span class="bar-label">${theme}</span><div class="bar-track"><span style="width:${width}%;background:${colors[index]}"></span></div></div>`;
        })
        .join("")}
    </div>
  `;
  const flow = card("full");
  flow.innerHTML = `
    <h3>Cause and effect chain</h3>
    <ul class="list">${visibleChapters(book)
      .map((chapter) => {
        const first = chapter.beats[0] || chapter.title;
        const last = chapter.beats[chapter.beats.length - 1] || "reader note pending";
        return `<li>${escapeHtml(first)} → ${escapeHtml(last)}</li>`;
      })
      .join("")}</ul>
  `;
  return [map, bars, flow];
}

function renderForum() {
  const book = currentBook();
  const threads = [
    ["Question", `What did chapter ${state.chapter} change about your read on ${safeCharacters(book)[0]?.name || "the protagonist"}?`, "Spoiler-safe replies only"],
    ["Close reading", "A sentence or scene worth slowing down for", `Visible through chapter ${state.chapter}`],
    ["Theory", "Predictions without future evidence", "Locked to current checkpoint"],
  ];
  const panel = card("wide");
  panel.innerHTML = `<h3>${escapeHtml(book.title)} forum</h3>${threads
    .map(
      ([type, title, footer]) =>
        `<section class="thread"><span class="tag">${escapeHtml(type)}</span><h3>${escapeHtml(title)}</h3><div class="thread-footer">${escapeHtml(footer)}</div></section>`,
    )
    .join("")}`;
  const norms = card();
  norms.innerHTML = `<h3>Room rules</h3><p>Thread visibility is tied to chapter progress. Readers can speculate, cite prior passages, and ask questions without seeing later revelations.</p>${tagList(["chapter-gated", "reader-first", "moderated"])}`;
  return [panel, norms];
}

function renderSources() {
  const book = currentBook();
  const sourceCards = book.sources.length
    ? book.sources.map((source) => {
        const item = card();
        item.innerHTML = `<h3>${escapeHtml(source.title)}</h3><p>${escapeHtml(source.type)}</p><div class="meta"><a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open source</a></div>`;
        return item;
      })
    : [
        (() => {
          const item = card();
          item.innerHTML = `<h3>Source queue</h3><p>Add essays, lectures, interviews, reviews, or reference links as you find them.</p>${tagList(["reader curated", "context"])}`;
          return item;
        })(),
      ];
  const video = card("full");
  video.innerHTML = `
    <h3>Video and lecture queue</h3>
    <p>Best used after a chapter session: lectures for historical context, author background, adaptation comparison, and theme review. The app keeps these separate from chapter notes so reading stays primary.</p>
    ${tagList(["lectures", "context", "after-reading friendly"])}
  `;
  if (!book.custom) return [...sourceCards, video];

  const editor = card("full");
  editor.innerHTML = `
    <h3>Add source</h3>
    <div class="editor-grid">
      <div>
        <label for="sourceTitle">Title</label>
        <input id="sourceTitle" autocomplete="off" />
      </div>
      <div>
        <label for="sourceType">Type</label>
        <input id="sourceType" placeholder="Essay, lecture, video" autocomplete="off" />
      </div>
    </div>
    <label for="sourceUrl">URL</label>
    <input id="sourceUrl" type="url" autocomplete="off" />
    <div class="inline-actions">
      <button class="primary-action" id="addSource" type="button">Add source</button>
    </div>
  `;
  setTimeout(() => {
    document.querySelector("#addSource")?.addEventListener("click", () => {
      const title = document.querySelector("#sourceTitle").value.trim();
      const url = document.querySelector("#sourceUrl").value.trim();
      if (!title || !url) return;
      book.sources.push({
        title,
        type: document.querySelector("#sourceType").value.trim() || "Reader source",
        url,
      });
      saveCustomBooks();
      render();
    });
  });
  return [...sourceCards, video, editor];
}

function safeQuotes(book = currentBook()) {
  return book.quotes.filter((quote) => quote.chapter <= state.chapter);
}

function safeJournal(book = currentBook()) {
  return book.journal.filter((entry) => entry.chapter <= state.chapter);
}

function contextPacket(book = currentBook()) {
  const chapters = visibleChapters(book);
  return {
    title: book.title,
    author: book.author,
    chapter: state.chapter,
    summaries: chapters.map((chapter, index) => `Chapter ${index + 1}: ${chapter.summary || chapter.title}`),
    beats: chapters.flatMap((chapter) => chapter.beats),
    characters: safeCharacters(book).map((character) => `${character.name}: ${character.role}`),
    themes: book.themes,
    quotes: safeQuotes(book).map((quote) => quote.text),
  };
}

function buildAiPrompt(task, passage = "") {
  const packet = contextPacket();
  return `You are Commentarium, a reading companion for students and avid readers.
Book: ${packet.title} by ${packet.author}
Reader progress: chapter ${packet.chapter}
Hard rule: do not mention, imply, or use information after chapter ${packet.chapter}.
Goal: help the reader enjoy and understand the book, not replace reading.

Known chapter context:
${packet.summaries.join("\n")}

Visible characters:
${packet.characters.join("\n") || "No character notes yet."}

Visible themes:
${packet.themes.join("\n") || "No theme notes yet."}

Reader task: ${task}
${passage ? `Passage:\n${passage}` : ""}

Respond with:
1. A plain-language explanation.
2. 3 things to notice.
3. 2 discussion questions.
4. 1 warning about what not to overclaim yet.`;
}

function localAiResponse(task, passage = "") {
  const packet = contextPacket();
  const focus = packet.beats.slice(-3);
  const characters = packet.characters.slice(0, 3);
  const themes = packet.themes.slice(0, 3);
  const passageLine = passage
    ? "The passage is worth reading for diction, tone, repeated images, and what the narrator chooses to leave unsaid."
    : "Use the notes so far to ask what changed, what repeated, and what still feels unresolved.";

  return [
    `Plain-language help: ${passageLine}`,
    `Things to notice: ${[...focus, ...themes].slice(0, 3).join("; ") || "recurring language, conflict, and point of view"}.`,
    `Characters in view: ${characters.join("; ") || "add character notes as they appear so this gets sharper"}.`,
    "Discussion questions: What changed in this section? Which detail feels more important now than it did at first?",
    `Spoiler guard: this answer is constrained to chapter ${packet.chapter}, so it will avoid future events and only work from your notes so far.`,
    `Prompt for a real model:\n${buildAiPrompt(task, passage)}`,
  ].join("\n\n");
}

function renderPassageLens() {
  const book = currentBook();
  const panel = card("wide");
  panel.innerHTML = `
    <h3>Close-reading lens</h3>
    <label for="passageText">Passage</label>
    <textarea id="passageText" placeholder="Paste a sentence, paragraph, or quote from chapter ${state.chapter} or earlier."></textarea>
    <div class="inline-actions">
      <button class="primary-action" id="analyzePassage" type="button">Analyze passage</button>
      <button class="secondary-action" id="savePassageQuote" type="button">Save as quote</button>
    </div>
  `;
  const result = card();
  result.innerHTML = `<h3>What this lens checks</h3><ul class="list"><li>Plain meaning</li><li>Tone and diction</li><li>Symbols or motifs</li><li>Class discussion questions</li><li>What not to assume yet</li></ul>`;
  setTimeout(() => {
    document.querySelector("#analyzePassage")?.addEventListener("click", () => {
      const text = document.querySelector("#passageText").value.trim();
      result.innerHTML = `<h3>Passage guidance</h3><p>${escapeHtml(localAiResponse("Analyze this passage", text)).replaceAll("\n", "<br />")}</p>`;
    });
    document.querySelector("#savePassageQuote")?.addEventListener("click", () => {
      const text = document.querySelector("#passageText").value.trim();
      if (!text) return;
      book.quotes.push({ text, note: "Saved from passage lens", chapter: state.chapter, tags: ["passage"] });
      saveAnnotations();
      render();
    });
  });
  return [panel, result];
}

function renderQuotes() {
  const book = currentBook();
  const quoteCards = safeQuotes(book).map((quote) => {
    const item = card();
    item.innerHTML = `<h3>Chapter ${quote.chapter}</h3><p>${escapeHtml(quote.text)}</p><p>${escapeHtml(quote.note || "")}</p>${tagList(quote.tags || [])}`;
    return item;
  });
  const editor = card("full");
  editor.innerHTML = `
    <h3>Add quote</h3>
    <label for="quoteText">Quote</label>
    <textarea id="quoteText" placeholder="Save a line with chapter context."></textarea>
    <div class="editor-grid">
      <div>
        <label for="quoteNote">Why it matters</label>
        <input id="quoteNote" autocomplete="off" />
      </div>
      <div>
        <label for="quoteTags">Tags</label>
        <input id="quoteTags" placeholder="theme, character, essay" autocomplete="off" />
      </div>
    </div>
    <div class="inline-actions">
      <button class="primary-action" id="addQuote" type="button">Save quote</button>
    </div>
  `;
  setTimeout(() => {
    document.querySelector("#addQuote")?.addEventListener("click", () => {
      const text = document.querySelector("#quoteText").value.trim();
      if (!text) return;
      book.quotes.push({
        text,
        note: document.querySelector("#quoteNote").value.trim(),
        tags: splitList(document.querySelector("#quoteTags").value),
        chapter: state.chapter,
      });
      saveAnnotations();
      render();
    });
  });
  return quoteCards.length ? [...quoteCards, editor] : [editor];
}

function renderStudy() {
  const packet = contextPacket();
  const latest = visibleChapters()[state.chapter - 1];
  const quiz = card("wide");
  quiz.innerHTML = `
    <h3>Prepare for class</h3>
    <ul class="list">
      <li>What changed in chapter ${state.chapter}, and why does it matter?</li>
      <li>Which detail from this chapter might become important later?</li>
      <li>How would you explain ${escapeHtml(latest.title)} to someone who read it but felt lost?</li>
      <li>Which character has the most unclear motive right now?</li>
    </ul>
  `;
  const flashcards = card();
  flashcards.innerHTML = `
    <h3>Flashcards</h3>
    <ul class="list">
      ${(packet.beats.slice(-4).length ? packet.beats.slice(-4) : ["Add chapter beats to generate sharper cards."])
        .map((beat) => `<li>${escapeHtml(beat)}</li>`)
        .join("")}
    </ul>
  `;
  const shortAnswer = card("full");
  shortAnswer.innerHTML = `
    <h3>Short-answer practice</h3>
    <p>In 4-6 sentences, explain one tension visible so far. Use one quote or chapter beat, and do not use events beyond chapter ${state.chapter}.</p>
  `;
  return [quiz, flashcards, shortAnswer];
}

function renderEssay() {
  const book = currentBook();
  const quotes = safeQuotes(book);
  const panel = card("wide");
  panel.innerHTML = `
    <h3>Essay builder</h3>
    <label for="essayThesis">Working thesis</label>
    <textarea id="essayThesis" placeholder="A debatable claim about the book so far.">${escapeHtml(book.essay.thesis || "")}</textarea>
    <label for="essayOutline">Outline</label>
    <textarea id="essayOutline" placeholder="Claim, evidence, analysis.">${escapeHtml(book.essay.outline || "")}</textarea>
    <label for="essayCounter">Counterargument</label>
    <textarea id="essayCounter" placeholder="What would a thoughtful reader push back on?">${escapeHtml(book.essay.counterargument || "")}</textarea>
    <div class="inline-actions">
      <button class="primary-action" id="saveEssay" type="button">Save essay work</button>
    </div>
  `;
  const evidence = card();
  evidence.innerHTML = `
    <h3>Evidence ready</h3>
    <ul class="list">${
      quotes.length
        ? quotes.slice(-5).map((quote) => `<li>${escapeHtml(quote.text)}</li>`).join("")
        : "<li>Save quotes to build an evidence bank.</li>"
    }</ul>
  `;
  setTimeout(() => {
    document.querySelector("#saveEssay")?.addEventListener("click", () => {
      book.essay = {
        thesis: document.querySelector("#essayThesis").value.trim(),
        outline: document.querySelector("#essayOutline").value.trim(),
        counterargument: document.querySelector("#essayCounter").value.trim(),
      };
      saveAnnotations();
      render();
    });
  });
  return [panel, evidence];
}

function renderJournal() {
  const book = currentBook();
  const entries = safeJournal(book).map((entry) => {
    const item = card();
    item.innerHTML = `<h3>Chapter ${entry.chapter}</h3><p>${escapeHtml(entry.text)}</p>${tagList([entry.mood || "reflection"])}`;
    return item;
  });
  const editor = card("full");
  editor.innerHTML = `
    <h3>Private reading journal</h3>
    <div class="editor-grid">
      <div>
        <label for="journalMood">Mood</label>
        <input id="journalMood" placeholder="curious, confused, moved" autocomplete="off" />
      </div>
      <div>
        <label for="journalPrompt">Prompt</label>
        <input id="journalPrompt" value="What did this section make you notice or feel?" />
      </div>
    </div>
    <textarea id="journalText" placeholder="Write a personal note separate from formal analysis."></textarea>
    <div class="inline-actions">
      <button class="primary-action" id="saveJournal" type="button">Save journal entry</button>
    </div>
  `;
  setTimeout(() => {
    document.querySelector("#saveJournal")?.addEventListener("click", () => {
      const text = document.querySelector("#journalText").value.trim();
      if (!text) return;
      book.journal.push({
        text,
        mood: document.querySelector("#journalMood").value.trim(),
        chapter: state.chapter,
      });
      saveAnnotations();
      render();
    });
  });
  return entries.length ? [...entries, editor] : [editor];
}

async function requestAi(endpoint, prompt) {
  if (!endpoint) return localAiResponse("Guide my reading from my current notes");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, chapter: state.chapter, book: currentBook().title }),
    });
    if (!response.ok) throw new Error("AI endpoint failed");
    const data = await response.json();
    return data.text || data.response || localAiResponse("Guide my reading from my current notes");
  } catch {
    return localAiResponse("Guide my reading from my current notes");
  }
}

function renderAi() {
  const book = currentBook();
  const prompt = buildAiPrompt("Help me understand what I have read so far");
  const panel = card("wide");
  panel.innerHTML = `
    <h3>AI companion</h3>
    <p>This assistant is bounded to chapter ${state.chapter}. It uses your chapter notes, quotes, characters, and themes as its source of truth.</p>
    <label for="aiTask">Ask</label>
    <textarea id="aiTask">Help me understand what I should notice at this point.</textarea>
    <label for="aiEndpoint">Optional private AI endpoint</label>
    <input id="aiEndpoint" placeholder="/api/ai" value="${escapeHtml(book.aiEndpoint)}" />
    <div class="inline-actions">
      <button class="primary-action" id="runAi" type="button">Generate guidance</button>
      <button class="secondary-action" id="saveAiEndpoint" type="button">Save endpoint</button>
    </div>
  `;
  const output = card();
  output.innerHTML = `<h3>Prompt contract</h3><p>${escapeHtml(prompt).replaceAll("\n", "<br />")}</p>`;
  setTimeout(() => {
    document.querySelector("#saveAiEndpoint")?.addEventListener("click", () => {
      book.aiEndpoint = document.querySelector("#aiEndpoint").value.trim();
      saveAnnotations();
      render();
    });
    document.querySelector("#runAi")?.addEventListener("click", async () => {
      const task = document.querySelector("#aiTask").value.trim();
      const endpoint = document.querySelector("#aiEndpoint").value.trim();
      output.innerHTML = "<h3>AI guidance</h3><p>Thinking with your spoiler boundary...</p>";
      const answer = await requestAi(endpoint, buildAiPrompt(task));
      output.innerHTML = `<h3>AI guidance</h3><p>${escapeHtml(answer).replaceAll("\n", "<br />")}</p>`;
    });
  });
  return [panel, output];
}

function renderContent() {
  const renderers = {
    chapters: renderChapters,
    checkpoint: renderCheckpoint,
    whole: renderWhole,
    themes: renderThemes,
    characters: renderCharacters,
    diagrams: renderDiagrams,
    forum: renderForum,
    sources: renderSources,
    passage: renderPassageLens,
    quotes: renderQuotes,
    study: renderStudy,
    essay: renderEssay,
    journal: renderJournal,
    ai: renderAi,
  };
  els.content.replaceChildren(...renderers[state.mode]());
}

function render() {
  renderShell();
  renderContent();
}

function init() {
  renderBookOptions();

  els.bookSelect.addEventListener("change", (event) => {
    state.bookId = event.target.value;
    state.chapter = 1;
    state.wholeUnlocked = false;
    render();
  });

  els.chapterRange.addEventListener("input", (event) => {
    state.chapter = Number(event.target.value);
    state.wholeUnlocked = false;
    render();
  });

  els.buttons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      render();
    });
  });

  els.newBookButton.addEventListener("click", () => {
    els.bookForm.reset();
    els.customChapters.value = 12;
    els.bookDialog.showModal();
    els.customTitle.focus();
  });

  els.deleteBookButton.addEventListener("click", () => {
    const book = currentBook();
    if (!book.custom) return;
    books = books.filter((item) => item.id !== book.id);
    saveCustomBooks();
    saveAnnotations();
    state.bookId = books[0].id;
    state.chapter = 1;
    state.mode = "chapters";
    state.wholeUnlocked = false;
    renderBookOptions();
    render();
  });

  [els.closeDialog, els.cancelDialog].forEach((button) => {
    button.addEventListener("click", () => els.bookDialog.close());
  });

  els.bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const book = createCustomBook(els.customTitle.value, els.customAuthor.value, els.customChapters.value);
    books.push(book);
    state.bookId = book.id;
    state.chapter = 1;
    state.mode = "chapters";
    state.wholeUnlocked = false;
    saveCustomBooks();
    renderBookOptions();
    els.bookDialog.close();
    render();
  });

  render();
}

init();
