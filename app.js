/* Freedom Fighters Dashboard (GitHub Pages ready)
   - Notes + Events + Checklist + KPIs saved to localStorage
   - Links configurable below
*/

const LINKS = {
  tiktok: "https://www.tiktok.com/",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  facebook: "https://www.facebook.com/"
};

const LS = {
  notes: "ff_notes_v1",
  events: "ff_events_v1",
  checklist: "ff_checklist_v1",
  kpi: "ff_kpi_v1"
};

const checklistItems = [
  "Post 3 hooks",
  "Reply to comments",
  "DM follow-ups",
  "Book 1 call",
  "Recruit outreach",
  "Build 1 product/asset"
];

function $(id){ return document.getElementById(id); }

function fmt(dt){
  try{
    return new Date(dt).toLocaleString("en-US", { dateStyle:"medium", timeStyle:"short" });
  }catch{ return dt; }
}

/* CLOCK */
function startClock(){
  const el = $("clock");
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleString("en-US", {
      weekday: "long", month: "short", day: "numeric", year:"numeric",
      hour: "numeric", minute:"2-digit"
    });
  };
  tick();
  setInterval(tick, 1000 * 30);
}

/* LINKS */
function wireLinks(){
  $("tiktokLink").href = LINKS.tiktok;
  $("igLink").href = LINKS.instagram;
  $("ytLink").href = LINKS.youtube;
  $("fbLink").href = LINKS.facebook;
}

/* NOTES */
function loadNotes(){
  const saved = localStorage.getItem(LS.notes) || "";
  $("notes").value = saved;
}
function saveNotes(text){
  localStorage.setItem(LS.notes, text);
  $("notesStatus").textContent = "Saved.";
  setTimeout(()=> $("notesStatus").textContent = "Autosave enabled.", 900);
}
function wireNotes(){
  const el = $("notes");
  let t = null;
  el.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => saveNotes(el.value), 400);
  });

  $("btnCopyNotes").addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(el.value);
      $("notesStatus").textContent = "Copied!";
      setTimeout(()=> $("notesStatus").textContent = "Autosave enabled.", 900);
    }catch{
      $("notesStatus").textContent = "Copy failed (browser blocked).";
    }
  });
}

/* CHECKLIST */
function loadChecklist(){
  const state = JSON.parse(localStorage.getItem(LS.checklist) || "{}");
  const wrap = $("postingChecklist");
  wrap.innerHTML = "";
  checklistItems.forEach((label, i) => {
    const row = document.createElement("label");
    row.className = "checkItem";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!state[i];
    cb.addEventListener("change", () => {
      state[i] = cb.checked;
      localStorage.setItem(LS.checklist, JSON.stringify(state));
    });

    const text = document.createElement("span");
    text.textContent = label;

    row.appendChild(cb);
    row.appendChild(text);
    wrap.appendChild(row);
  });
}

/* KPI */
function loadKPI(){
  const kpi = JSON.parse(localStorage.getItem(LS.kpi) || "{}");
  $("kpiPosts").value = kpi.posts ?? 0;
  $("kpiLeads").value = kpi.leads ?? 0;
  $("kpiRevenue").value = kpi.revenue ?? 0;
}
function wireKPI(){
  $("btnSaveKPI").addEventListener("click", () => {
    const kpi = {
      posts: Number($("kpiPosts").value || 0),
      leads: Number($("kpiLeads").value || 0),
      revenue: Number($("kpiRevenue").value || 0),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(LS.kpi, JSON.stringify(kpi));
    $("kpiSavedMsg").textContent = `Saved ${fmt(kpi.savedAt)}`;
    setTimeout(()=> $("kpiSavedMsg").textContent = "", 3000);
  });
}

/* EVENTS */
function getEvents(){
  return JSON.parse(localStorage.getItem(LS.events) || "[]");
}
function setEvents(events){
  localStorage.setItem(LS.events, JSON.stringify(events));
}
function renderEvents(){
  const events = getEvents().sort((a,b) => new Date(a.when) - new Date(b.when));
  const wrap = $("eventsList");
  wrap.innerHTML = "";

  if(!events.length){
    wrap.innerHTML = `<div class="muted small">No events yet. Add your next call, training, or meeting.</div>`;
    return;
  }

  const now = Date.now();

  events.forEach((e) => {
    const item = document.createElement("div");
    item.className = "event";

    const top = document.createElement("div");
    top.className = "eventTop";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "eventTitle";
    title.textContent = e.title;

    const meta = document.createElement("div");
    meta.className = "eventMeta";
    const whenTxt = fmt(e.when);
    const whereTxt = e.where ? ` • ${e.where}` : "";
    const soon = (new Date(e.when).getTime() - now) < (1000*60*60*24) && (new Date(e.when).getTime() - now) > 0;
    meta.textContent = `${whenTxt}${whereTxt}${soon ? " • (within 24h)" : ""}`;

    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement("div");
    const del = document.createElement("button");
    del.className = "btn";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const next = getEvents().filter(x => x.id !== e.id);
      setEvents(next);
      renderEvents();
    });

    const remind = document.createElement("button");
    remind.className = "btn btnGold";
    remind.textContent = "Notify (10m)";
    remind.addEventListener("click", async () => {
      // Browser notifications
      if (!("Notification" in window)) return alert("Notifications not supported.");
      let perm = Notification.permission;
      if (perm !== "granted") perm = await Notification.requestPermission();
      if (perm !== "granted") return alert("Notification permission not granted.");

      const eventTime = new Date(e.when).getTime();
      const fireAt = eventTime - (10 * 60 * 1000);
      const delay = fireAt - Date.now();

      if (delay <= 0) {
        new Notification("Event Reminder", { body: `${e.title} — ${fmt(e.when)}` });
        return;
      }

      setTimeout(() => {
        new Notification("Event Reminder (10 min)", { body: `${e.title} — ${fmt(e.when)}` });
      }, delay);

      alert("Reminder scheduled (will work as long as this tab stays open).");
    });

    right.appendChild(remind);
    right.appendChild(del);

    top.appendChild(left);
    top.appendChild(right);

    item.appendChild(top);
    wrap.appendChild(item);
  });
}

function wireEvents(){
  $("eventForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const title = $("eventTitle").value.trim();
    const when = $("eventWhen").value;
    const where = $("eventWhere").value.trim();

    if(!title || !when) return;

    const events = getEvents();
    events.push({ id: crypto.randomUUID(), title, when, where });
    setEvents(events);

    $("eventTitle").value = "";
    $("eventWhen").value = "";
    $("eventWhere").value = "";

    renderEvents();
  });
}

/* EXPORT + CLEAR */
function wireTopActions(){
  $("btnExport").addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      notes: localStorage.getItem(LS.notes) || "",
      kpi: JSON.parse(localStorage.getItem(LS.kpi) || "{}"),
      events: getEvents()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "freedom-fighters-dashboard-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("btnClear").addEventListener("click", () => {
    const ok = confirm("Clear notes, events, checklist, and KPIs saved in this browser?");
    if(!ok) return;
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    loadNotes(); loadChecklist(); loadKPI(); renderEvents();
    alert("Local data cleared.");
  });
}

function init(){
  startClock();
  wireLinks();
  loadNotes(); wireNotes();
  loadChecklist();
  loadKPI(); wireKPI();
  renderEvents(); wireEvents();
  wireTopActions();
}
init();
