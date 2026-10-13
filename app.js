/* =====================================================================
   GARAJ website: alles wat beweegt en reageert.
   De HTML komt uit bouw.js, de recepten uit recepten.js.
   ===================================================================== */
(function () {
  "use strict";
  const B = window.GARAJ.init(window.GARAJ_DATA);
  const D = B.data(), esc = B.esc;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const view = $("#view");
  const rustig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const opslag = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function toast(t) { const el = $("#toast"); el.hidden = true; void el.offsetWidth; el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2300); }

  const st = B.toestand({ voorraad: new Set(opslag.get("garaj-voorraad", ["Ui", "Knoflook", "Paprika"])) });
  let huidig = null, n = 1;

  /* ---------- Startpagina ---------- */
  function bindHome() {
    const z = $("#zoekveld");
    z.oninput = () => { st.filter.q = z.value; $("#raster").innerHTML = B.raster(st); };
    $$("[data-gang]").forEach(b => b.onclick = () => {
      st.filter.gang = b.dataset.gang || null; st.filter.label = null;
      $$("[data-gang]").forEach(x => x.setAttribute("aria-pressed", String((x.dataset.gang || null) === st.filter.gang)));
      $("[data-wis]")?.remove(); $("#raster").innerHTML = B.raster(st);
    });
    const wis = $("[data-wis]");
    if (wis) wis.onclick = () => { st.filter.label = null; wis.remove(); $("[data-gang='']").setAttribute("aria-pressed", "true"); $("#raster").innerHTML = B.raster(st); history.replaceState(null, "", "/#recepten"); };
    const voorraad = () => {
      $("#voorraad").innerHTML = B.voorraadHtml(st); $("#matches").innerHTML = B.matchesHtml(st);
      $$("[data-v]").forEach(b => b.onclick = () => { const v = b.dataset.v; st.voorraad.has(v) ? st.voorraad.delete(v) : st.voorraad.add(v); opslag.set("garaj-voorraad", [...st.voorraad]); voorraad(); $(`[data-v="${CSS.escape(v)}"]`)?.focus(); });
    };
    voorraad();
    $$("[data-maand]").forEach(b => b.onclick = () => { st.maand = +b.dataset.maand; $("#seizoenIn").innerHTML = B.seizoenHtml(st); $$("[data-maand]").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.maand === st.maand))); });
    $("#verras").onclick = () => {
      const opties = D.RECEPTEN.filter(r => r.slug !== st.laatsteSlug), r = opties[Math.floor(Math.random() * opties.length)];
      const img = $(".plateau .bord img");
      if (rustig || !img.animate) return naar(B.url(r));
      img.animate([{ transform: "rotate(0) scale(1.02)" }, { transform: "rotate(720deg) scale(.9)" }], { duration: 700, easing: "cubic-bezier(.5,0,.2,1)" })
        .onfinish = () => { wisNamen(); img.src = B.foto(r); img.style.viewTransitionName = "bord"; setTimeout(() => naar(B.url(r)), 120); };
    };
  }

  /* ---------- Receptpagina ---------- */
  function renderIngr(flits) {
    const aan = new Set($$("#ingr input:checked").map(i => i.id));
    $("#portie").textContent = B.portieTekst(huidig, n);
    $("#ingr").innerHTML = B.ingrHtml(huidig, n, aan, flits);
  }
  function bindRecept() {
    $("#portieSchuif").oninput = e => { n = +e.target.value; renderIngr(true); };
    $$(".stap").forEach((el, i) => {
      el.id = "stap-" + (i + 1);
      const t = e => { if (e.target.closest(".wekker")) return; el.classList.toggle("klaar"); };
      el.onclick = t; el.onkeydown = e => { if (e.target === el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); t(e); } };
    });
    $$("[data-wekker]").forEach(b => b.onclick = () => startWekker(huidig.stappen[+b.dataset.wekker]));
    $("#kookOpen").onclick = () => openKook(0);
    $("#naarLijst").onclick = $("#naarLijst2").onclick = () => voegToe(huidig, n);
    $("#deelKnop").onclick = () => deelkaart(huidig);
    $("#printKnop").onclick = () => window.print();
    $("[data-gangnaar]").onclick = () => { st.filter = { gang: $("[data-gangnaar]").dataset.gangnaar, label: null, q: "" }; };
  }

  /* ---------- Boodschappenlijst ---------- */
  let lijst = opslag.get("garaj-lijst", {}), afgevinkt = new Set(opslag.get("garaj-lijst-af", []));
  function bewaarLijst(pop) {
    opslag.set("garaj-lijst", lijst); opslag.set("garaj-lijst-af", [...afgevinkt]);
    const t = $("#tel"), k = Object.keys(lijst).filter(s => B.bySlug(s)).length;
    t.textContent = k; t.dataset.n = k;
    if (pop) { t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop"); }
  }
  function voegToe(r, aantal) { lijst[r.slug] = aantal; bewaarLijst(true); toast(`${r.titel} staat op je lijst`); }
  const regels = (r, aantal) => r.onderdelen.flatMap(o => o.items).map(i => B.ingrTekst(i, aantal / r.porties));
  function openLade() {
    const inhoud = Object.entries(lijst).filter(([s]) => B.bySlug(s));
    $("#laag").innerHTML = `<div class="scherm" data-dicht></div><aside class="lade" role="dialog" aria-modal="true" aria-label="Boodschappenlijst">
    <div class="lade-kop"><h2>Boodschappen</h2><button class="sluit" type="button" data-dicht aria-label="Sluiten">✕</button></div>
    <div class="lade-lijf">${inhoud.length ? inhoud.map(([s, a]) => { const r = B.bySlug(s); return `<div class="lade-groep"><header><img src="${esc(B.foto(r))}" alt=""><strong>${esc(r.titel)}<small>${esc(B.portieTekst(r, a))}</small></strong><button type="button" data-weg="${s}">Verwijder</button></header>
      ${regels(r, a).map((t, i) => { const id = `${s}-${i}`; return `<label><input type="checkbox" data-af="${id}" ${afgevinkt.has(id) ? "checked" : ""}><span>${esc(t)}</span></label>`; }).join("")}</div>`; }).join("")
      : `<div class="lade-leeg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1.3 11.1a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>Je lijst is nog leeg.<br>Open een recept en tik op <b>+ Boodschappenlijst</b>.</div>`}<div id="kopieValt"></div></div>
    <div class="lade-voet"><button class="knop vol" type="button" id="kopieer" ${inhoud.length ? "" : "disabled"}>${navigator.share ? "Delen" : "Kopieer lijst"}</button><button class="knop" type="button" id="leeg" ${inhoud.length ? "" : "disabled"}>Leegmaken</button></div></aside>`;
    $$("[data-dicht]").forEach(e => e.onclick = sluitLaag);
    $$("[data-weg]").forEach(b => b.onclick = () => { delete lijst[b.dataset.weg]; bewaarLijst(); openLade(); });
    $$("[data-af]").forEach(c => c.onchange = () => { c.checked ? afgevinkt.add(c.dataset.af) : afgevinkt.delete(c.dataset.af); bewaarLijst(); });
    $("#leeg").onclick = () => { lijst = {}; afgevinkt.clear(); bewaarLijst(); openLade(); };
    $("#kopieer").onclick = async () => {
      const tekst = inhoud.map(([s, a]) => { const r = B.bySlug(s); return `${r.titel} (${B.portieTekst(r, a)})\n` + regels(r, a).filter((x, i) => !afgevinkt.has(`${s}-${i}`)).map(x => "- " + x).join("\n"); }).join("\n\n");
      if (navigator.share) { try { await navigator.share({ title: "Boodschappen", text: tekst }); return; } catch (e) { if (e.name === "AbortError") return; } }
      const val = () => { $("#kopieValt").innerHTML = `<textarea class="kopievak" id="kopievak" readonly aria-label="Boodschappenlijst">${esc(tekst)}</textarea>`; $("#kopievak").select(); toast("Selecteer en kopieer de lijst"); };
      try { navigator.clipboard.writeText(tekst).then(() => toast("Lijst gekopieerd"), val); } catch (e) { val(); }
    };
    $(".lade .sluit").focus();
  }
  function sluitLaag() { $("#laag").innerHTML = ""; }

  /* ---------- Deelkaart ---------- */
  async function deelkaart(r) {
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1350; const x = c.getContext("2d");
    try { await Promise.all([document.fonts.load('600 84px "Fraunces"'), document.fonts.load('500 26px "DM Mono"'), document.fonts.load('700 30px "Instrument Sans"')]); } catch (e) {}
    const img = new Image(); img.src = B.foto(r); await img.decode().catch(() => {});
    x.fillStyle = "#F4EDE1"; x.fillRect(0, 0, 1080, 1350);
    x.strokeStyle = "#CC3A1C"; x.lineWidth = 6; x.beginPath(); x.moveTo(60, 1350); x.lineTo(60, 260); x.arc(260, 260, 200, Math.PI, 1.5 * Math.PI); x.lineTo(1080, 60); x.stroke();
    x.save(); x.beginPath(); x.arc(600, 560, 380, 0, Math.PI * 2); x.closePath(); x.shadowColor = "rgba(60,40,20,.35)"; x.shadowBlur = 50; x.shadowOffsetY = 20; x.fillStyle = "#fff"; x.fill(); x.clip(); try { x.drawImage(img, 220, 180, 760, 760); } catch (e) {} x.restore();
    x.fillStyle = "#75695C"; x.font = '500 26px "DM Mono", monospace'; x.fillText((B.gangVan(r.gang).kort + (r.tijd ? "  ·  " + B.korteTijd(r) : "")).toUpperCase(), 120, 1040);
    x.fillStyle = "#1E1915"; x.font = '600 84px "Fraunces", Georgia, serif';
    let regel = "", rr = [];
    r.titel.split(" ").forEach(w => { const t = regel ? regel + " " + w : w; if (x.measureText(t).width > 860 && regel) { rr.push(regel); regel = w; } else regel = t; }); rr.push(regel);
    if (rr.length > 2) { rr = rr.slice(0, 2); rr[1] += "…"; }
    rr.forEach((t, i) => x.fillText(t, 120, 1135 + i * 92));
    x.fillStyle = "#CC3A1C"; x.font = '700 30px "Instrument Sans", sans-serif'; x.fillText("G A R A J . N L", 120, 1300);
    const blob = await new Promise(res => c.toBlob(res, "image/jpeg", .9));
    const bestand = new File([blob], `garaj-${r.slug}.jpg`, { type: "image/jpeg" });
    const link = B.SITE + B.url(r), beeldUrl = URL.createObjectURL(blob);
    const kanDelen = navigator.canShare && navigator.canShare({ files: [bestand] });
    $("#laag").innerHTML = `<div class="scherm" data-dicht></div><div class="dialoog" role="dialog" aria-modal="true" aria-label="Delen">
    <div class="lade-kop"><h2 style="font-size:28px">Delen</h2><button class="sluit" type="button" data-dicht aria-label="Sluiten">✕</button></div>
    <img class="deel" src="${beeldUrl}" alt="Deelkaart van ${esc(r.titel)}">
    <div class="knoppen">${kanDelen ? `<button class="knop vol" type="button" id="deelNu">Delen via app</button>` : ""}
      <a class="knop${kanDelen ? "" : " vol"}" href="${beeldUrl}" download="garaj-${esc(r.slug)}.jpg">Afbeelding bewaren</a>
      <button class="knop" type="button" id="kopieLink">Link kopiëren</button></div></div>`;
    $$("[data-dicht]").forEach(e => e.onclick = () => { URL.revokeObjectURL(beeldUrl); sluitLaag(); });
    if (kanDelen) $("#deelNu").onclick = () => navigator.share({ files: [bestand], title: r.titel, text: `${r.titel} · ${link}` }).catch(() => {});
    $("#kopieLink").onclick = () => { try { navigator.clipboard.writeText(link).then(() => toast("Link gekopieerd"), () => toast(link)); } catch (e) { toast(link); } };
  }

  /* ---------- Kookwekkers ---------- */
  const wekkers = []; let tik = null, audio = null;
  function startWekker(s) {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch (e) {}
    wekkers.push({ id: String(Date.now() + Math.random()), naam: s.timerNaam || s.kop, duur: s.timer * 60000, eind: Date.now() + s.timer * 60000, af: false, stap: s });
    toast(`Wekker gezet: ${s.timer} min`); tekenDok();
    if (!tik) tik = setInterval(() => { tekenDok(); if (!$("#kook").hidden) tekenKlok(); }, 1000);
  }
  function piep() {
    if (audio) try { [0, .35, .7].forEach(t => { const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audio.destination); g.gain.setValueAtTime(.25, audio.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + t + .3); o.start(audio.currentTime + t); o.stop(audio.currentTime + t + .3); }); } catch (e) {}
    try { navigator.vibrate?.([300, 150, 300]); } catch (e) {}
  }
  const klokTekst = ms => { const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600); return `${h ? h + ":" : ""}${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  function tekenDok() {
    const nu = Date.now();
    wekkers.forEach(w => { if (!w.af && nu >= w.eind) { w.af = true; piep(); } });
    $("#dok").innerHTML = wekkers.map(w => { const p = Math.min(1, (nu - (w.eind - w.duur)) / w.duur), C = 2 * Math.PI * 12;
      return `<div class="tmr ${w.af ? "af" : ""}"><svg viewBox="0 0 30 30" aria-hidden="true"><circle class="bak" cx="15" cy="15" r="12"/><circle class="loop" cx="15" cy="15" r="12" stroke-dasharray="${C}" stroke-dashoffset="${C * p}"/></svg><span>${esc(w.naam)}</span><b>${w.af ? "Klaar!" : klokTekst(w.eind - nu)}</b><button type="button" data-stop="${w.id}" aria-label="Wekker ${esc(w.naam)} stoppen">✕</button></div>`; }).join("");
    $$("[data-stop]").forEach(b => b.onclick = () => { wekkers.splice(wekkers.findIndex(w => w.id === b.dataset.stop), 1); tekenDok(); if (!$("#kook").hidden) tekenKlok(); });
    if (!wekkers.length) { clearInterval(tik); tik = null; }
  }

  /* ---------- Kookmodus ---------- */
  let stap = 0, slot = null;
  async function openKook(i) {
    stap = i; $("#kook").hidden = false; document.body.style.overflow = "hidden"; $("#dok").style.bottom = "110px"; tekenKook(0);
    try { slot = await navigator.wakeLock?.request("screen"); } catch (e) { slot = null; }
    $("#kookVolgend").focus();
  }
  function sluitKook() { $("#kook").hidden = true; document.body.style.overflow = ""; $("#dok").style.bottom = ""; try { slot?.release(); } catch (e) {} slot = null; }
  document.addEventListener("visibilitychange", async () => { if (!$("#kook").hidden && document.visibilityState === "visible") { try { slot = await navigator.wakeLock?.request("screen"); } catch (e) {} } });
  function tekenKlok() {
    const s = huidig.stappen[stap], el = $("#kookKlok"); if (!el) return;
    const w = wekkers.find(x => x.stap === s), C = 2 * Math.PI * 46, p = w ? Math.min(1, (Date.now() - (w.eind - w.duur)) / w.duur) : 0;
    el.classList.toggle("af", !!(w && w.af));
    el.querySelector(".loop").setAttribute("stroke-dashoffset", String(C * p));
    el.querySelector("b").textContent = w ? (w.af ? "Klaar!" : klokTekst(w.eind - Date.now())) : `${s.timer}:00`;
    el.querySelector("small").textContent = w ? (w.af ? "tik om te stoppen" : "loopt") : "tik om te starten";
  }
  function tekenKook(richting) {
    const r = huidig, s = r.stappen[stap], C = 2 * Math.PI * 46;
    $("#kookTitel").textContent = r.titel;
    $("#kookBalk").style.setProperty("--w", `${((stap + 1) / r.stappen.length) * 100}%`);
    const namen = r.onderdelen.flatMap(o => o.items.map(i => i[2]));
    const gebruikt = namen.filter(nm => s.tekst.toLowerCase().includes(String(nm).split(" ").slice(-1)[0].toLowerCase().replace(/'s$/, "")));
    $("#kookMidden").innerHTML = `<div class="kook-stap ${richting > 0 ? "in" : richting < 0 ? "terug" : ""}" aria-live="polite">
      <div class="groot-nr">${stap + 1}<span style="font-size:.3em;color:var(--vlak-rook)">/${r.stappen.length}</span></div>
      <h2>${esc(s.kop)}</h2><p>${esc(s.tekst)}</p>${gebruikt.length ? `<p class="gebruik">Je gebruikt: ${gebruikt.map(esc).join(", ")}</p>` : ""}</div>
    ${s.timer ? `<button class="klok" type="button" id="kookKlok" aria-label="Wekker voor deze stap"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bak" cx="50" cy="50" r="46"/><circle class="loop" cx="50" cy="50" r="46" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><span><b></b><small></small></span></button>` : ""}`;
    if (s.timer) { tekenKlok(); $("#kookKlok").onclick = () => { const w = wekkers.find(x => x.stap === s); if (w) { wekkers.splice(wekkers.indexOf(w), 1); tekenDok(); } else startWekker(s); tekenKlok(); }; }
    $("#kookVorig").disabled = stap === 0;
    $("#kookVolgend").textContent = stap === r.stappen.length - 1 ? "Klaar, eet smakelijk" : "Volgende";
  }
  const volgendeStap = () => { if (stap < huidig.stappen.length - 1) { stap++; tekenKook(1); } else { sluitKook(); toast("Eet smakelijk!"); } };
  const vorigeStap = () => { if (stap > 0) { stap--; tekenKook(-1); } };
  $("#kookVolgend").onclick = volgendeStap; $("#kookVorig").onclick = vorigeStap; $("#kookSluit").onclick = sluitKook;
  (() => { let x0 = null; const k = $("#kook"); k.addEventListener("pointerdown", e => { x0 = e.clientX; }); k.addEventListener("pointerup", e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 70) dx < 0 ? volgendeStap() : vorigeStap(); }); })();
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (!$("#kook").hidden) sluitKook(); sluitLaag(); }
    if ($("#kook").hidden) return;
    if (e.key === "ArrowRight") volgendeStap();
    if (e.key === "ArrowLeft") vorigeStap();
  });

  /* ---------- Thema ---------- */
  $("#ladeKnop").onclick = openLade;
  $("#themaKnop").onclick = () => {
    const d = document.documentElement, donker = d.dataset.theme ? d.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    d.dataset.theme = donker ? "light" : "dark"; try { localStorage.setItem("garaj-thema", d.dataset.theme); } catch (e) {}
  };

  /* ---------- Beweging: lijn, draaiende borden, parallax, onthullen ---------- */
  let rafAan = false;
  function opScroll() {
    if (rafAan) return; rafAan = true;
    requestAnimationFrame(() => {
      rafAan = false; const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      $(".rug").style.setProperty("--p", h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
      if (rustig) return;
      $$("[data-draai]").forEach(el => el.style.setProperty("--draai", (y * +el.dataset.draai).toFixed(1) + "deg"));
      $$("[data-par]").forEach(el => { const b = el.parentElement.getBoundingClientRect(); el.style.setProperty("--par", ((b.top + b.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + "px"); });
    });
  }
  addEventListener("scroll", opScroll, { passive: true }); addEventListener("resize", opScroll);
  const kijker = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("toon"); e.target.classList.remove("voor"); kijker.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
  function onthul() { if (rustig || !kijker) return; $$(".reveal, .kaart, .collectie").forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("voor"); kijker.observe(el); } }); }

  /* ---------- Navigatie met echte adressen en vloeiende overgang ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const wisNamen = () => $$("[style*='view-transition-name']").forEach(el => el.style.viewTransitionName = "");
  function route() {
    const m = location.pathname.match(/^\/recept\/([^/]+)\/?/);
    const r = m && B.bySlug(decodeURIComponent(m[1]));
    return r ? { r } : { hash: decodeURIComponent(location.hash.slice(1)) };
  }
  function render(eerste) {
    const { r, hash } = route();
    if (!$("#kook").hidden) sluitKook();
    sluitLaag();
    if (r) {
      huidig = r; n = r.porties; st.laatsteSlug = r.slug;
      view.innerHTML = B.recept(r, st); bindRecept();
      document.title = `${r.titel} · GARAJ Recepten`;
      const doel = hash && document.getElementById(hash);
      if (doel) doel.scrollIntoView({ block: "center" }); else scrollTo(0, 0);
    } else {
      if (hash && hash.startsWith("label-") && D.LABELS[hash.slice(6)]) st.filter = { gang: null, label: hash.slice(6), q: "" };
      view.innerHTML = B.home(st); bindHome();
      document.title = "GARAJ Recepten";
      const doel = hash && (hash.startsWith("label-") ? $("#recepten") : document.getElementById(hash));
      const terug = !hash && !eerste && st.laatsteSlug && $(`.kaart[data-naar="${CSS.escape(st.laatsteSlug)}"]`);
      if (doel) doel.scrollIntoView(); else if (terug) terug.scrollIntoView({ block: "center" }); else scrollTo(0, 0);
    }
    onthul(); opScroll();
    if (!eerste) view.focus({ preventScroll: true });
  }
  function overgang(fn) { if (document.startViewTransition && !rustig) document.startViewTransition(fn); else fn(); }
  function naar(url) { overgang(() => { history.pushState(null, "", url); render(); }); }
  addEventListener("popstate", () => overgang(() => render()));
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute("download")) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !(u.pathname === "/" || /^\/recept\//.test(u.pathname))) return;
    e.preventDefault();
    const zelfdePagina = u.pathname === location.pathname || (u.pathname === "/" && !route().r);
    if (zelfdePagina && u.hash && !u.hash.startsWith("#label-")) {
      history.pushState(null, "", u.pathname + u.hash);
      document.getElementById(decodeURIComponent(u.hash.slice(1)))?.scrollIntoView({ behavior: rustig ? "auto" : "smooth" });
      if (u.hash === "#recepten" && a.id === "zoekKnop") setTimeout(() => $("#zoekveld")?.focus({ preventScroll: true }), 400);
      return;
    }
    if (zelfdePagina && u.hash.startsWith("#label-")) { history.pushState(null, "", u.pathname + u.hash); render(); return; }
    wisNamen();
    if (!route().r) { const img = a.querySelector("img") || a.closest(".uitgelicht")?.querySelector(".bord-groot img"); if (img) img.style.viewTransitionName = "bord"; }
    naar(u.pathname + u.hash);
  });

  render(true);
  bewaarLijst();

  /* ---------- Offline en installeren ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
  (() => {
    const balk = $("#installbalk");
    const geinstalleerd = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const mobiel = matchMedia("(max-width: 900px) and (pointer: coarse)").matches;
    const magTonen = !geinstalleerd && mobiel && Date.now() - Number(opslag.get("garaj-install-nee", 0)) > 14 * 864e5;
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    let uitgesteld = null;
    const toon = () => { if (magTonen) setTimeout(() => { balk.hidden = false; }, 4000); };
    $("#ibNee").onclick = () => { balk.hidden = true; opslag.set("garaj-install-nee", Date.now()); };
    addEventListener("beforeinstallprompt", e => { e.preventDefault(); uitgesteld = e; toon(); });
    $("#ibJa").onclick = async () => {
      if (!uitgesteld) return;
      balk.hidden = true; uitgesteld.prompt();
      const keuze = await uitgesteld.userChoice.catch(() => null);
      if (!keuze || keuze.outcome !== "accepted") opslag.set("garaj-install-nee", Date.now());
      uitgesteld = null;
    };
    addEventListener("appinstalled", () => { balk.hidden = true; toast("GARAJ staat op je beginscherm"); });
    if (ios) {
      balk.classList.add("ios");
      $("#ibUitleg").innerHTML = 'Tik onderin op <b>Deel</b> <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg> en kies <b>Zet op beginscherm</b>.';
      toon();
    }
  })();
})();
