/* Freedom Fighters — Money OS (GitHub Pages ready)
   Saves everything in localStorage:
   - targets, money actions, revenue
   - lead pipeline + recruit pipeline
   - scripts + notes
*/

const LINKS = {
  tiktok: "https://www.tiktok.com/@frantzyfrancois2?_r=1&_t=ZP-93wA7v02anX",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  facebook: "https://www.facebook.com/"
};

const CALENDLY = "https://calendly.com/myfiancialfreedom";

const LS = {
  notes: "ff_notes_v2",
  targets: "ff_targets_v1",
  revenue: "ff_revenue_v1",
  moneyChecklist: "ff_money_checklist_v1",
  leads: "ff_leads_v1",
  recruits: "ff_recruits_v1",
  scripts: "ff_scripts_v1"
};

const moneyActions = [
  "20 outbound DMs (new conversations)",
  "10 follow-ups (pipeline)",
  "Push booking link to 5 warm leads",
  "Post 3 short videos (hooks)",
  "Recruit outreach (5 prospects)",
  "1 sales call / presentation",
  "Update lead pipeline + next steps",
  "Ask for 1 referral"
];

const defaultScripts = {
  dm: `Hey! Appreciate you reaching out. Quick question — are you trying to (1) protect your family with life insurance or (2) build income in financial services?
Either way, here’s my booking link so we can lock it in: ${CALENDLY}`,
  call: `CALL OPENER (2–5 min):
1) “What made you reach out today?”
2) “Who are we protecting and what would happen financially if something happened to you?”
3) “What’s your monthly budget range to get protected?”
4) “If I can show you a plan that fits, are you ready to move forward today?”
CLOSE:
“Based on what you told me, the smart move is to get protected now. Let’s submit the app and lock in coverage.”`
};

function $(id){ return document.getElementById(id); }

function todayKey(){
  const d = new Date();
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}
function fmtDate(dt){
  if(!dt) return "";
  try { return new Date(dt).toLocaleDateString("en-US", { month:"short", day:"numeric" }); }
  catch { return dt; }
}
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
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
function wireTopButtons(){
  $("btnBookNow").addEventListener("click", () => window.open(CALENDLY, "_blank", "noreferrer"));
  $("btnOpenCalendly").addEventListener("click", () => window.open(CALENDLY, "_blank", "noreferrer"));
  $("btnOpenCalendly2").addEventListener("click", () => window.open(CALENDLY, "_blank", "noreferrer"));
  $("btnOpenTikTok").addEventListener("click", () => window.open(LINKS.tiktok, "_blank", "noreferrer"));

  $("btnQuickAddLead").addEventListener("click", () => {
    $("leadName").focus();
    window.location.hash = "#leadSection";
  });
  $("btnQuickAddRecruit").addEventListener("click", () => {
    $("recruitName").focus();
    window.location.hash = "#recruitSection";
  });

  $("btnCopyDM").addEventListener("click", () => copyText($("dmScript").value, "planMsg", "DM copied."));
  $("btnCopyDM2").addEventListener("click", () => copyText($("dmScript").value, "planMsg", "DM copied."));
  $("btnCopyCall").addEventListener("click", () => copyText($("callScript").value, "planMsg", "Call script copied."));

  $("btnGeneratePlan").addEventListener("click", generatePlan);
}

/* NOTES */
function loadNotes(){
  $("notes").value = localStorage.getItem(LS.notes) || "";
}
function wireNotes(){
  const el = $("notes");
  let t = null;
  el.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      localStorage.setItem(LS.notes, el.value);
      $("notesStatus").textContent = "Saved.";
      setTimeout(()=> $("notesStatus").textContent = "Autosave enabled.", 900);
    }, 350);
  });

  $("btnCopyNotes").addEventListener("click", async () => {
    await copyText(el.value, "notesStatus", "Copied!");
    setTimeout(()=> $("notesStatus").textContent = "Autosave enabled.", 900);
  });
}

/* TARGETS */
function loadTargets(){
  const t = JSON.parse(localStorage.getItem(LS.targets) || "{}");
  $("tRevenue").value = t.revenue ?? 0;
  $("tCalls").value = t.calls ?? 0;
  $("tRecruits").value = t.recruits ?? 0;
  $("tPosts").value = t.posts ?? 0;
}
function wireTargets(){
  $("btnSaveTargets").addEventListener("click", () => {
    const t = {
      revenue: Number($("tRevenue").value || 0),
      calls: Number($("tCalls").value || 0),
      recruits: Number($("tRecruits").value || 0),
      posts: Number($("tPosts").value || 0),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(LS.targets, JSON.stringify(t));
    $("targetsSavedMsg").textContent = `Saved ${t.savedAt.slice(0,10)}`;
    setTimeout(()=> $("targetsSavedMsg").textContent = "", 3000);
  });
}

/* MONEY CHECKLIST (daily reset by date) */
function loadMoneyChecklist(){
  const all = JSON.parse(localStorage.getItem(LS.moneyChecklist) || "{}");
  const key = todayKey();
  const state = all[key] || {};
  const wrap = $("moneyChecklist");
  wrap.innerHTML = "";

  moneyActions.forEach((label, i) => {
    const row = document.createElement("label");
    row.className = "checkItem";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!state[i];
    cb.addEventListener("change", () => {
      state[i] = cb.checked;
      all[key] = state;
      localStorage.setItem(LS.moneyChecklist, JSON.stringify(all));
    });
    const text = document.createElement("span");
    text.textContent = label;
    row.appendChild(cb);
    row.appendChild(text);
    wrap.appendChild(row);
  });
}

/* REVENUE */
function loadRevenue(){
  const r = JSON.parse(localStorage.getItem(LS.revenue) || "{}");
  $("rPolicies").value = r.policies ?? 0;
  $("rDigital").value = r.digital ?? 0;
  $("rPipeline").value = r.pipeline ?? 0;
}
function wireRevenue(){
  $("btnSaveRevenue").addEventListener("click", () => {
    const r = {
      policies: Number($("rPolicies").value || 0),
      digital: Number($("rDigital").value || 0),
      pipeline: Number($("rPipeline").value || 0),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(LS.revenue, JSON.stringify(r));
    $("revenueSavedMsg").textContent = `Saved ${r.savedAt.slice(0,10)}`;
    setTimeout(()=> $("revenueSavedMsg").textContent = "", 3000);
  });
}

/* SCRIPTS */
function loadScripts(){
  const s = JSON.parse(localStorage.getItem(LS.scripts) || "null") || defaultScripts;
  $("dmScript").value = s.dm || defaultScripts.dm;
  $("callScript").value = s.call || defaultScripts.call;

  // autosave scripts
  const save = () => {
    localStorage.setItem(LS.scripts, JSON.stringify({
      dm: $("dmScript").value,
      call: $("callScript").value
    }));
  };
  $("dmScript").addEventListener("input", debounce(save, 300));
  $("callScript").addEventListener("input", debounce(save, 300));
}

/* LEADS */
function getLeads(){ return JSON.parse(localStorage.getItem(LS.leads) || "[]"); }
function setLeads(leads){ localStorage.setItem(LS.leads, JSON.stringify(leads)); }
function addLead(lead){
  const leads = getLeads();
  leads.push(lead);
  setLeads(leads);
}
function deleteLead(id){
  setLeads(getLeads().filter(l => l.id !== id));
}
function updateLead(id, patch){
  const leads = getLeads().map(l => l.id === id ? { ...l, ...patch } : l);
  setLeads(leads);
}
function renderLeads(){
  const q = ($("leadSearch").value || "").toLowerCase();
  const stageFilter = $("leadFilterStage").value;

  const leads = getLeads()
    .filter(l => {
      const hit = (l.name + " " + l.source + " " + l.stage + " " + (l.next||"")).toLowerCase().includes(q);
      const stageOk = (stageFilter === "All") ? true : l.stage === stageFilter;
      return hit && stageOk;
    })
    .sort((a,b) => {
      // followups due first
      const ad = a.followUp || "9999-12-31";
      const bd = b.followUp || "9999-12-31";
      if(ad !== bd) return ad.localeCompare(bd);
      return b.createdAt.localeCompare(a.createdAt);
    });

  const tbody = $("leadRows");
  tbody.innerHTML = "";

  if(!leads.length){
    tbody.innerHTML = `<tr><td colspan="7" class="muted">No leads found. Add one above.</td></tr>`;
    return;
  }

  const today = todayKey();

  leads.forEach(l => {
    const due = l.followUp && l.followUp <= today;
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(l.name)}</td>
      <td><span class="badge">${escapeHtml(l.source)}</span></td>
      <td>${escapeHtml(l.stage)}${due ? " ✅" : ""}</td>
      <td>${escapeHtml(l.next || "")}</td>
      <td>${l.followUp ? escapeHtml(fmtDate(l.followUp)) : ""}</td>
      <td>${l.value ? "$" + escapeHtml(l.value) : ""}</td>
      <td>
        <button class="btn" data-act="advance" data-id="${l.id}">Advance</button>
        <button class="btn btnGold" data-act="follow" data-id="${l.id}">Follow +1d</button>
        <button class="btn" data-act="del" data-id="${l.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // actions
  tbody.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const act = btn.getAttribute("data-act");
      if(act === "del"){
        deleteLead(id);
        renderLeads();
        return;
      }
      if(act === "follow"){
        const leads = getLeads();
        const l = leads.find(x => x.id === id);
        const d = new Date((l.followUp || todayKey()) + "T00:00:00");
        d.setDate(d.getDate() + 1);
        updateLead(id, { followUp: d.toISOString().slice(0,10) });
        renderLeads();
        return;
      }
      if(act === "advance"){
        const order = ["New","Contacted","Booked","Presented","Closed","Nurture"];
        const leads = getLeads();
        const l = leads.find(x => x.id === id);
        const idx = Math.max(0, order.indexOf(l.stage));
        const nextStage = order[Math.min(order.length-1, idx+1)];
        updateLead(id, { stage: nextStage });
        renderLeads();
        return;
      }
    });
  });
}
function wireLeads(){
  $("leadForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const lead = {
      id: crypto.randomUUID(),
      name: $("leadName").value.trim(),
      source: $("leadSource").value,
      stage: $("leadStage").value,
      next: $("leadNext").value.trim(),
      followUp: $("leadFollowUp").value || "",
      value: $("leadValue").value ? String(Number($("leadValue").value)) : "",
      createdAt: new Date().toISOString()
    };
    if(!lead.name) return;

    addLead(lead);

    $("leadName").value = "";
    $("leadNext").value = "";
    $("leadFollowUp").value = "";
    $("leadValue").value = "";
    $("leadStage").value = "New";
    $("leadSource").value = "TikTok";

    renderLeads();
  });

  $("leadSearch").addEventListener("input", debounce(renderLeads, 150));
  $("leadFilterStage").addEventListener("change", renderLeads);
}

/* RECRUITS */
function getRecruits(){ return JSON.parse(localStorage.getItem(LS.recruits) || "[]"); }
function setRecruits(items){ localStorage.setItem(LS.recruits, JSON.stringify(items)); }

function renderRecruits(){
  const items = getRecruits()
    .sort((a,b) => (a.followUp || "9999-12-31").localeCompare(b.followUp || "9999-12-31"));

  const tbody = $("recruitRows");
  tbody.innerHTML = "";

  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="5" class="muted">No recruits yet. Add one above.</td></tr>`;
    return;
  }

  const today = todayKey();

  items.forEach(r => {
    const due = r.followUp && r.followUp <= today;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.stage)}${due ? " ✅" : ""}</td>
      <td>${escapeHtml(r.next || "")}</td>
      <td>${r.followUp ? escapeHtml(fmtDate(r.followUp)) : ""}</td>
      <td>
        <button class="btn" data-act="advance" data-id="${r.id}">Advance</button>
        <button class="btn btnGold" data-act="follow" data-id="${r.id}">Follow +2d</button>
        <button class="btn" data-act="del" data-id="${r.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const act = btn.getAttribute("data-act");
      if(act === "del"){
        setRecruits(getRecruits().filter(x => x.id !== id));
        renderRecruits();
        return;
      }
      if(act === "follow"){
        const items = getRecruits();
        const r = items.find(x => x.id === id);
        const base = r.followUp || todayKey();
        const d = new Date(base + "T00:00:00");
        d.setDate(d.getDate() + 2);
        setRecruits(items.map(x => x.id === id ? { ...x, followUp: d.toISOString().slice(0,10) } : x));
        renderRecruits();
        return;
      }
      if(act === "advance"){
        const order = ["Prospect","Contacted","Interview","Onboarding","Licensed","Active"];
        const items = getRecruits();
        const r = items.find(x => x.id === id);
        const idx = Math.max(0, order.indexOf(r.stage));
        const nextStage = order[Math.min(order.length-1, idx+1)];
        setRecruits(items.map(x => x.id === id ? { ...x, stage: nextStage } : x));
        renderRecruits();
        return;
      }
    });
  });
}

function wireRecruits(){
  $("recruitForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const item = {
      id: crypto.randomUUID(),
      name: $("recruitName").value.trim(),
      stage: $("recruitStage").value,
      next: $("recruitNext").value.trim(),
      followUp: $("recruitFollowUp").value || "",
      createdAt: new Date().toISOString()
    };
    if(!item.name) return;

    const items = getRecruits();
    items.push(item);
    setRecruits(items);

    $("recruitName").value = "";
    $("recruitNext").value = "";
    $("recruitFollowUp").value = "";
    $("recruitStage").value = "Prospect";

    renderRecruits();
  });
}

/* PLAN GENERATOR (simple but effective) */
function generatePlan(){
  const leads = getLeads();
  const recruits = getRecruits();
  const today = todayKey();

  const dueLeads = leads.filter(l => l.followUp && l.followUp <= today && l.stage !== "Closed");
  const dueRecruits = recruits.filter(r => r.followUp && r.followUp <= today && r.stage !== "Active");

  const plan = [
    `1) Follow-ups due: ${dueLeads.length} leads, ${dueRecruits.length} recruits`,
    `2) Bookings push: send booking link to 5 warm leads`,
    `3) New outreach: 20 DMs (use DM Script)`,
    `4) Content: post 3 hooks → CTA: “DM ‘PAPABEAR’”`,
    `5) Update pipeline + set next steps`
  ].join("\n");

  // write plan into notes top
  const notes = localStorage.getItem(LS.notes) || "";
  const header = `TODAY’S PLAN (${today})\n${plan}\n\n---\n\n`;
  localStorage.setItem(LS.notes, header + notes);
  loadNotes();
  $("planMsg").textContent = "Plan generated → added to Notes.";
  setTimeout(()=> $("planMsg").textContent = "", 3500);

  // jump to leads if followups exist
  if(dueLeads.length) window.location.hash = "#leadSection";
}

/* EXPORT + CLEAR */
function wireExportClear(){
  $("btnExport").addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      targets: JSON.parse(localStorage.getItem(LS.targets) || "{}"),
      revenue: JSON.parse(localStorage.getItem(LS.revenue) || "{}"),
      notes: localStorage.getItem(LS.notes) || "",
      moneyChecklist: JSON.parse(localStorage.getItem(LS.moneyChecklist) || "{}"),
      leads: getLeads(),
      recruits: getRecruits(),
      scripts: JSON.parse(localStorage.getItem(LS.scripts) || "{}")
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "freedom-fighters-moneyos-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("btnClear").addEventListener("click", () => {
    const ok = confirm("Clear Money OS local data (targets, leads, recruits, notes, scripts)?");
    if(!ok) return;
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    location.reload();
  });
}

async function copyText(text, msgElId, msg){
  try{
    await navigator.clipboard.writeText(text);
    if(msgElId && $(msgElId)) $(msgElId).textContent = msg;
    return true;
  }catch{
    if(msgElId && $(msgElId)) $(msgElId).textContent = "Copy failed (browser blocked).";
    return false;
  }
}

function debounce(fn, ms){
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* INIT */
function init(){
  startClock();
  wireLinks();
  wireTopButtons();
  wireNotes(); loadNotes();

  wireTargets(); loadTargets();
  loadMoneyChecklist();

  wireRevenue(); loadRevenue();

  loadScripts();

  wireLeads(); renderLeads();
  wireRecruits(); renderRecruits();

  wireExportClear();
}
init();
