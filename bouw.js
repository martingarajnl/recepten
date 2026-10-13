/* =====================================================================
   GARAJ bouwstenen
   Eén bron voor alle HTML: de website (app.js), het beheerformulier
   (/beheer) en het bouwscript (tools/bouw.js) gebruiken deze functies.
   Hier hoef je normaal niets aan te veranderen.
   ===================================================================== */
(function (root) {
  "use strict";
  const B = {};
  B.SITE = "https://garaj.nl";

  /* Bezoekersteller zonder cookies (GoatCounter). Vul hier je eigen code in,
     bijvoorbeeld "garaj" als je dashboard garaj.goatcounter.com is.
     Leeg laten = geen teller. */
  B.TELLER = "garaj";
  let D = null;
  B.init = data => { D = data; return B; };
  B.data = () => D;

  /* ---------- Hulpjes ---------- */
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  B.esc = esc;
  B.KLOK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>`;
  const PIJL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const ZOEK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>`;
  const TAS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.3 11.1a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`;
  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 36 V20 A16 16 0 0 1 20 4 H36" fill="none" stroke="var(--tomaat)" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="6" fill="var(--inkt)"/></svg>`;

  B.slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/'s\b/g, "s").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  B.gangVan = id => D.GANGEN.find(g => g.id === id) || { id, naam: id, kort: id };
  B.actieveGangen = () => D.GANGEN.filter(g => D.RECEPTEN.some(r => r.gang === g.id));
  B.volgorde = () => B.actieveGangen().flatMap(g => D.RECEPTEN.filter(r => r.gang === g.id));
  B.bySlug = s => D.RECEPTEN.find(r => r.slug === s);
  B.isNieuw = (r, nu = Date.now()) => !!r.toegevoegd && (nu - new Date(r.toegevoegd)) / 864e5 <= 60 && (nu - new Date(r.toegevoegd)) >= -864e5;
  B.korteTijd = r => (r.tijd || "").replace(/^±\s*/, "").replace(/,.*$/, "");
  B.url = r => `/recept/${r.slug}/`;
  B.foto = r => "/" + (r.foto || "snijplank.jpg");
  B.fmt = n => {
    const frac = [[0.25, "¼"], [0.5, "½"], [0.75, "¾"], [1 / 3, "⅓"], [2 / 3, "⅔"]];
    const heel = Math.floor(n + 1e-9), rest = n - heel;
    if (rest < 0.05) return String(heel);
    if (heel < 10) for (const [v, s] of frac) if (Math.abs(rest - v) < 0.05) return (heel || "") + s;
    return (Math.round(n * 10) / 10).toLocaleString("nl-NL");
  };
  B.qty = (q, f) => Array.isArray(q) ? `${B.fmt(q[0] * f)}–${B.fmt(q[1] * f)}` : B.fmt(q * f);
  B.isSmaak = it => it[0] === null && !it[1];
  B.portieTekst = (r, n) => `${B.fmt(n)} ${n === 1 ? r.portieWoord[0] : r.portieWoord[1]}`;
  B.ingrTekst = ([q, u, naam], f = 1) => q === null ? `${naam}${u === "naar wens" ? " (naar wens)" : " (naar smaak)"}` : `${B.qty(q, f)}${u ? " " + u : ""} ${naam}`;
  B.tekstVan = r => [r.titel, r.intro, ...(r.labels || []).map(l => D.LABELS[l]), ...r.onderdelen.flatMap(o => o.items.map(i => i[2]))].join(" ").toLowerCase();

  /* ---------- Gegevens voor "In huis" en het seizoen ---------- */
  B.KERN = [
    ["Kip", /^kip(filet|dij|poot|fil)/], ["Gehakt", /gehakt/], ["Witte kool", /witte kool/], ["Paprika", /\bpaprika('s)?\b/],
    ["Ui", /\b(ui|uien)\b/], ["Knoflook", /knoflook/], ["Feta", /\bfeta\b/], ["Griekse yoghurt", /yoghurt/],
    ["Tomaat", /tomat/], ["Champignons", /champignon/], ["Boursin", /boursin/], ["Witte bonen", /bonen/],
    ["Worst", /worst/], ["Prei", /prei/], ["Wortel", /wortel/], ["Aardappel", /aardappel/], ["Selderij", /selderij/],
    ["Rode wijn", /rode wijn/], ["Ciabatta", /ciabatta/], ["Kookroom", /kookroom/], ["Roomboter", /roomboter/], ["Peterselie", /peterselie/]
  ];
  B.kernVan = r => B.KERN.filter(([, re]) => r.onderdelen.some(o => o.items.some(i => re.test(String(i[2]).toLowerCase())))).map(k => k[0]);
  B.MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  B.MAANDNAMEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  B.SEIZOEN = [
    ["witte kool", "rode kool", "boerenkool", "prei", "knolselderij", "pastinaak", "spruitjes", "wortel"],
    ["witte kool", "boerenkool", "prei", "knolselderij", "pastinaak", "spruitjes", "witlof", "wortel"],
    ["prei", "witlof", "winterpeen", "spinazie", "paprika", "wortel"],
    ["asperges", "spinazie", "radijs", "paprika", "rabarber"],
    ["asperges", "spinazie", "radijs", "rabarber", "paprika", "ui"],
    ["asperges", "courgette", "doperwten", "aardbeien", "paprika", "ui"],
    ["courgette", "tomaat", "komkommer", "sperziebonen", "paprika", "ui", "bladselderij"],
    ["tomaat", "courgette", "komkommer", "paprika", "maïs", "ui", "bladselderij"],
    ["tomaat", "paprika", "pompoen", "prei", "witte kool", "ui", "bladselderij"],
    ["pompoen", "witte kool", "prei", "paprika", "champignons", "wortel", "ui"],
    ["boerenkool", "witte kool", "prei", "pompoen", "knolselderij", "pastinaak", "wortel"],
    ["boerenkool", "rode kool", "witte kool", "prei", "spruitjes", "knolselderij", "wortel"]
  ];
  B.COLLECTIE_TEKST = {
    "laag-traag": "Zet het vuur laag en laat de pan het werk doen.",
    "comfortfood": "Voor koude avonden en een volle tafel.",
    "vegetarisch": "Geen vlees, wel smaak.",
    "pittig": "Met chili, paprikapoeder en een beetje lef.",
    "vooraf": "Vandaag maken, morgen nog lekkerder.",
    "barbecue": "Wat je ernaast zet als de barbecue aan staat."
  };
  B.uitgelicht = (nu = Date.now()) => {
    const favs = D.RECEPTEN.filter(r => r.favoriet), lijst = favs.length ? favs : D.RECEPTEN;
    const week = Math.floor(nu / 6048e5);
    return lijst[week % lijst.length];
  };
  const hoofd = s => s ? s[0].toUpperCase() + s.slice(1) : s;

  /* ---------- Standaardtoestand ---------- */
  B.toestand = (o = {}) => Object.assign({
    filter: { gang: null, label: null, q: "" },
    voorraad: new Set(["Ui", "Knoflook", "Paprika"]),
    maand: new Date().getMonth(), laatsteSlug: null, nu: Date.now()
  }, o);

  /* ---------- Startpagina ---------- */
  B.home = st => {
    const u = B.uitgelicht(st.nu), R = D.RECEPTEN;
    const woorden = [...new Set(R.flatMap(r => r.onderdelen.flatMap(o => o.items.map(i => String(i[2]).toLowerCase()))))]
      .filter(w => w.length < 22 && !/,|olie|om te/.test(w)).slice(0, 26);
    const band = woorden.map(w => `<span>${esc(w)}</span><i></i>`).join("");
    const labels = Object.keys(D.LABELS).filter(l => R.some(r => (r.labels || []).includes(l)));
    return `
  <section class="wrap hero">
    <div class="laad">
      <div class="oog"><b>●</b> Zelf gekookt · steeds weer gemaakt</div>
      <h1><span class="r"><span>Weinig recepten.</span></span><span class="r"><span>Allemaal <em class="t">goed.</em></span></span></h1>
      <p class="lead">Geen eindeloze lijst, maar gerechten die ik zelf heb uitgeprobeerd en waar ik echt van geniet.</p>
      <div class="knoppen">
        <a class="knop vol" href="/#recepten">Bekijk de recepten ${PIJL}</a>
        <button class="knop dobbel" id="verras" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/></svg>Verras me</button>
      </div>
    </div>
    <div class="plateau" aria-hidden="true">
      <svg class="ring" viewBox="0 0 400 400"><defs><path id="cirkel" d="M200 200 m-188 0 a188 188 0 1 1 376 0 a188 188 0 1 1 -376 0"/></defs>
        <text><textPath href="#cirkel">Laag vuur · veel geduld · ${R.length} recepten · allemaal zelf gekookt · laag vuur · veel geduld ·</textPath></text></svg>
      <div class="bord"><img src="/hero.jpg" alt="" data-draai="0.06" width="900" height="900"></div>
      <div class="sticker"><span><b>${R.length}</b>recepten,<br>0 nonsens</span></div>
    </div>
  </section>

  <div class="band" aria-hidden="true"><div class="band-in">${band}${band}</div></div>

  <section class="wrap sectie" id="uitgelicht">
    <div class="uitgelicht reveal">
      <div>
        <div class="oog">Recept van de week · ${esc(B.gangVan(u.gang).kort)}</div>
        <h2>${esc(u.titel)}</h2>
        ${u.noot ? `<p class="noot">${esc(u.noot)}</p>` : `<p class="noot">${esc(u.intro)}</p>`}
        <div class="bon"><div><small>Tijd</small><strong>${esc(B.korteTijd(u))}</strong></div><div><small>Porties</small><strong>${esc(B.portieTekst(u, u.porties))}</strong></div><div><small>Stappen</small><strong>${u.stappen.length}</strong></div></div>
        <a class="knop" href="${B.url(u)}" data-naar="${u.slug}">Naar het recept →</a>
      </div>
      <div class="bord-groot"><img src="${esc(B.foto(u))}" alt="${esc(u.titel)}" data-draai="-0.05" loading="lazy" width="900" height="900"></div>
    </div>
  </section>

  <section class="wrap sectie" id="collecties">
    <div class="sectie-kop reveal"><div><div class="oog">Collecties</div><h2>Waar heb je <em class="t">zin</em> in?</h2></div><p>Dezelfde recepten, gebundeld naar moment en stemming.</p></div>
    <div class="rail">
      ${labels.map(l => {
        const rs = R.filter(r => (r.labels || []).includes(l));
        return `<a class="collectie reveal" href="/#label-${l}">
          <div class="stapel">${rs.slice(0, 3).map(r => `<img src="${esc(B.foto(r))}" alt="" loading="lazy" width="92" height="92">`).join("")}</div>
          <div><span class="tal">${rs.length} ${rs.length === 1 ? "recept" : "recepten"}</span><h3>${esc(hoofd(D.LABELS[l]))}</h3></div>
          <p>${esc(B.COLLECTIE_TEKST[l] || "")}</p></a>`;
      }).join("")}
    </div>
  </section>

  <section class="wrap sectie" id="recepten">
    <div class="sectie-kop reveal"><div><div class="oog">Alle recepten</div><h2>Uit mijn <em class="t">keuken</em></h2></div><p>Zoek op gerecht of ingrediënt, of kies een gang.</p></div>
    <div class="filters">
      <label class="zoek" for="zoekveld">${ZOEK}
        <input id="zoekveld" type="search" placeholder="Bijv. paprika of feta" value="${esc(st.filter.q)}" autocomplete="off" aria-label="Zoek een recept"></label>
      <button class="chip" type="button" data-gang="" aria-pressed="${!st.filter.gang && !st.filter.label}">Alles</button>
      ${B.actieveGangen().map(g => `<button class="chip" type="button" data-gang="${g.id}" aria-pressed="${st.filter.gang === g.id}">${esc(g.kort)}</button>`).join("")}
      ${st.filter.label && D.LABELS[st.filter.label] ? `<button class="chip" type="button" data-wis aria-pressed="true">#${esc(D.LABELS[st.filter.label])} ✕</button>` : ""}
    </div>
    <div class="raster" id="raster">${B.raster(st)}</div>
  </section>

  <section class="wrap sectie" id="inhuis">
    <div class="inhuis reveal">
      <div>
        <div class="oog">Wat heb ik in huis?</div>
        <h2>Kijk eerst in je <em class="t">koelkast</em></h2>
        <p>Tik aan wat je al hebt. Je ziet direct welk recept het dichtstbij is en wat je nog mist.</p>
        <div class="voorraad" id="voorraad">${B.voorraadHtml(st)}</div>
      </div>
      <div class="matches" id="matches">${B.matchesHtml(st)}</div>
    </div>
  </section>

  <section class="wrap sectie" id="seizoen">
    <div class="sectie-kop reveal"><div><div class="oog">Seizoenskalender</div><h2>Wat is er <em class="t">nu</em> lekker?</h2></div><p>Groente uit Nederlandse grond en kas, per maand, met de recepten die erbij passen.</p></div>
    <div class="maanden" role="group" aria-label="Maand">${B.MAANDEN.map((m, i) => `<button class="maand" type="button" data-maand="${i}" aria-pressed="${i === st.maand}" aria-label="${B.MAANDNAMEN[i]}">${m}${i === new Date(st.nu).getMonth() ? '<span class="nu" title="Deze maand"></span>' : ""}</button>`).join("")}</div>
    <div class="seizoen-in" id="seizoenIn">${B.seizoenHtml(st)}</div>
  </section>

  <figure class="tafel"><img src="/tafel.jpg" alt="Gedekte tafel vol Griekse en mediterrane gerechten, dips en brood" loading="lazy" data-par="1" width="1295" height="768"><p>Allemaal zelf <em>gekookt.</em></p></figure>`;
  };

  B.kaart = (r, st) => {
    const vt = st && r.slug === st.laatsteSlug ? ' style="view-transition-name:bord"' : "";
    return `<a class="kaart" href="${B.url(r)}" data-naar="${r.slug}">
    <div class="doek"><img src="${esc(B.foto(r))}" alt="${esc(r.titel)}" loading="lazy" width="900" height="900"${vt}>
      ${B.isNieuw(r, st && st.nu) ? '<span class="nieuw">Nieuw</span>' : ""}${r.tijd ? `<span class="tijd">${B.KLOK}${esc(B.korteTijd(r))}</span>` : ""}</div>
    <div class="oog">${esc(B.gangVan(r.gang).kort)}</div>
    <h3>${esc(r.titel)}</h3><p>${esc(r.intro)}</p></a>`;
  };
  B.raster = st => {
    const f = st.filter, q = (f.q || "").trim().toLowerCase();
    const lijst = B.volgorde().filter(r => (!f.gang || r.gang === f.gang) && (!f.label || (r.labels || []).includes(f.label)) && (!q || q.split(/\s+/).every(w => B.tekstVan(r).includes(w))));
    return lijst.length ? lijst.map(r => B.kaart(r, st)).join("") : `<p class="leeg">Geen recept gevonden. Probeer een ander woord of kies “Alles”.</p>`;
  };
  B.voorraadHtml = st => B.KERN.map(([n]) => `<button class="chip" type="button" data-v="${esc(n)}" aria-pressed="${st.voorraad.has(n)}">${esc(n)}</button>`).join("");
  B.matchesHtml = st => D.RECEPTEN.map(r => { const k = B.kernVan(r), heb = k.filter(x => st.voorraad.has(x)); return { r, k, heb, p: k.length ? heb.length / k.length : 0 }; })
    .sort((a, b) => b.p - a.p || b.heb.length - a.heb.length).map(({ r, k, heb, p }) => {
      const mis = k.filter(x => !st.voorraad.has(x));
      return `<a class="match" href="${B.url(r)}" data-naar="${r.slug}"><img src="${esc(B.foto(r))}" alt="" loading="lazy" width="64" height="64">
      <div><strong>${esc(r.titel)}</strong><small>${mis.length ? "Je mist nog: " + esc(mis.slice(0, 3).join(", ").toLowerCase()) + (mis.length > 3 ? ` en ${mis.length - 3} meer` : "") : "Je hebt alles in huis"}</small>
      <div class="meter"><i style="--w:${Math.round(p * 100)}%"></i></div></div><span class="pct">${heb.length}/${k.length}</span></a>`;
    }).join("");
  B.seizoenHtml = st => {
    const groente = B.SEIZOEN[st.maand];
    const passend = D.RECEPTEN.filter(r => { const t = r.onderdelen.flatMap(o => o.items.map(i => String(i[2]).toLowerCase())).join(" | "); return groente.some(g => t.includes(g.replace(/s$/, "").replace(/en$/, ""))); });
    return `<div><div class="oog" style="margin-bottom:10px">In ${B.MAANDNAMEN[st.maand]}</div><div class="groenten">${groente.map(g => `<span>${esc(g)}</span>`).join("")}</div></div>
    <div class="seizoen-recepten">${passend.length ? passend.map(r => `<a class="match" href="${B.url(r)}" data-naar="${r.slug}"><img src="${esc(B.foto(r))}" alt="" loading="lazy" width="52" height="52"><div><strong>${esc(r.titel)}</strong><small>${esc(B.korteTijd(r))}</small></div></a>`).join("") : '<p class="leeg">Nog geen recept voor deze maand. Ruimte voor iets nieuws.</p>'}</div>`;
  };

  /* ---------- Receptpagina ---------- */
  B.ingrHtml = (r, n, aan = new Set(), flits = false) => {
    const f = n / r.porties;
    return r.onderdelen.map((o, oi) => {
      const vast = o.items.filter(it => !B.isSmaak(it)), smaak = o.items.filter(B.isSmaak);
      return `${o.kop ? `<h3>${esc(o.kop)}</h3>` : ""}<ul>${vast.map(([q, u, naam, x], ii) => {
        const id = `i-${oi}-${ii}`, hoeveel = q === null ? u : `${B.qty(q, f)}${u ? " " + u : ""}`;
        return `<li><label for="${id}"><input type="checkbox" id="${id}" ${aan.has(id) ? "checked" : ""}><span class="q${flits && q !== null ? " flits" : ""}">${esc(hoeveel)}</span><span>${esc(naam)}${x ? `<span class="x">${esc(x)}</span>` : ""}</span></label></li>`;
      }).join("")}${smaak.length ? `<li class="smaak"><label for="s-${oi}"><input type="checkbox" id="s-${oi}" ${aan.has("s-" + oi) ? "checked" : ""}><span><span class="k">Naar smaak</span>${smaak.map(i => esc(i[2])).join(" · ")}</span></label></li>` : ""}</ul>`;
    }).join("");
  };
  B.recept = (r, st) => {
    const g = B.gangVan(r.gang), alle = B.volgorde(), i = alle.indexOf(r), vorig = alle[i - 1], volgend = alle[i + 1];
    const bij = (r.lekkerBij || []).map(x => B.bySlug(x) || x);
    const nu = st ? st.nu : Date.now();
    return `
  <div class="wrap">
    <p class="kruimel"><a href="/#recepten" data-gangnaar="${esc(g.id)}">← ${esc(g.naam)}</a></p>
    <article>
    <section class="r-kop">
      <div class="laad">
        <div class="oog">${esc(g.kort)}${B.isNieuw(r, nu) ? " · <b>Nieuw</b>" : ""}</div>
        <h1>${esc(r.titel)}</h1>
        <p class="intro">${esc(r.intro)}</p>
        <div class="bon">${r.tijd ? `<div><small>Tijd</small><strong>${esc(B.korteTijd(r))}</strong></div>` : ""}<div><small>Stappen</small><strong>${r.stappen.length}</strong></div><div><small>Wekkers</small><strong>${r.stappen.filter(s => s.timer).length}</strong></div></div>
        ${(r.labels || []).length ? `<div class="labels">${r.labels.filter(l => D.LABELS[l]).map(l => `<a href="/#label-${l}">${esc(D.LABELS[l])}</a>`).join("")}</div>` : ""}
        <div class="acties">
          <button class="knop vol" type="button" id="kookOpen">Start kookmodus</button>
          <button class="knop" type="button" id="naarLijst">+ Boodschappenlijst</button>
          <button class="knop" type="button" id="deelKnop">Delen</button>
          <button class="knop" type="button" id="printKnop">Printen</button>
        </div>
      </div>
      <figure class="r-beeld"><div class="bord"><img src="${esc(B.foto(r))}" alt="${esc(r.titel)}" data-draai="0.05" width="900" height="900"></div><figcaption>Sfeerbeeld, gemaakt met AI</figcaption></figure>
    </section>
    <section class="r-lijf">
      <aside class="ingr-paneel" aria-labelledby="ingr-kop">
        <h2 id="ingr-kop">Ingrediënten</h2>
        <div class="porties">
          <div class="porties-rij"><output id="portie">${esc(B.portieTekst(r, r.porties))}</output><small>schuif om te rekenen</small></div>
          <input type="range" id="portieSchuif" min="${r.porties === 1 ? 0.5 : 1}" max="${Math.max(4, r.porties * 3)}" step="${r.porties === 1 ? 0.5 : 1}" value="${r.porties}" aria-label="Aantal porties">
        </div>
        <div class="ingr" id="ingr">${B.ingrHtml(r, r.porties)}</div>
        ${r.benodigdheden && r.benodigdheden.length ? `<p class="gerei"><b>Benodigdheden:</b> ${r.benodigdheden.map(esc).join(", ")}</p>` : ""}
        <button class="knop paneel-knop" type="button" id="naarLijst2">+ Op de boodschappenlijst</button>
      </aside>
      <div>
        <div class="stappen-kop"><h2>Bereiding</h2></div>
        <ol class="stappen">${r.stappen.map((s, i) => `
          <li class="stap" data-i="${i}" tabindex="0"><span class="nr">${i + 1}</span>
            <div class="tekst"><h3>${esc(s.kop)}${s.tijd ? `<span class="t">${esc(s.tijd)}</span>` : ""}</h3><p>${esc(s.tekst)}</p>
            ${s.timer ? `<button class="wekker" type="button" data-wekker="${i}">${B.KLOK} Wekker ${s.timer} min</button>` : ""}</div></li>`).join("")}
        </ol>
        <p class="hint">Tik op een stap om hem af te vinken.</p>
        ${r.tip ? `<div class="tip"><strong>Tip</strong>${esc(r.tip)}</div>` : ""}
      </div>
    </section>
    </article>
    <section class="daarna">
      ${bij.length ? `<h2>Lekker bij</h2><div class="bij">${bij.map(b => typeof b === "string" ? `<span>${esc(b)}</span>` : `<a href="${B.url(b)}" data-naar="${b.slug}"><img src="${esc(B.foto(b))}" alt="" width="40" height="40">${esc(b.titel)}</a>`).join("")}</div>` : ""}
      ${vorig ? `<a class="blad" href="${B.url(vorig)}"><small>← Vorig recept</small><strong>${esc(vorig.titel)}</strong></a>` : "<span></span>"}
      ${volgend ? `<a class="blad volgend" href="${B.url(volgend)}"><small>Volgend recept →</small><strong>${esc(volgend.titel)}</strong></a>` : "<span></span>"}
    </section>
  </div>`;
  };

  /* ---------- Gestructureerde gegevens voor Google ---------- */
  B.isoDuur = t => {
    t = String(t || "").toLowerCase().split(",")[0];
    const getal = s => parseFloat(s.replace(",", "."));
    let x, min = 0;
    if ((x = t.match(/(\d+(?:[.,]\d+)?)\s*dag/))) min += getal(x[1]) * 1440;
    if ((x = t.match(/(\d+(?:[.,]\d+)?)\s*uur/))) min += getal(x[1]) * 60;
    if ((x = t.match(/(\d+)\s*min/))) min += +x[1];
    if (!min) return null;
    min = Math.round(min);
    return "PT" + (Math.floor(min / 60) ? Math.floor(min / 60) + "H" : "") + (min % 60 ? (min % 60) + "M" : "");
  };
  B.jsonld = r => {
    const o = {
      "@context": "https://schema.org", "@type": "Recipe",
      name: r.titel, description: r.intro, image: [B.SITE + B.foto(r)], url: B.SITE + B.url(r),
      author: { "@type": "Organization", name: "GARAJ", url: B.SITE + "/" },
      recipeCategory: B.gangVan(r.gang).kort, recipeCuisine: undefined,
      keywords: (r.labels || []).map(l => D.LABELS[l]).filter(Boolean).join(", ") || undefined,
      recipeYield: B.portieTekst(r, r.porties),
      totalTime: B.isoDuur(r.tijd) || undefined,
      datePublished: r.toegevoegd || undefined,
      recipeIngredient: r.onderdelen.flatMap(o => o.items.map(i => B.ingrTekst(i))),
      recipeInstructions: r.stappen.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.kop, text: s.tekst, url: B.SITE + B.url(r) + "#stap-" + (i + 1) }))
    };
    return JSON.stringify(o).replace(/</g, "\\u003c");
  };
  B.jsonldHome = () => JSON.stringify({
    "@context": "https://schema.org", "@graph": [
      { "@type": "WebSite", name: "GARAJ Recepten", url: B.SITE + "/", inLanguage: "nl-NL", description: "Recepten die ik zelf kook en steeds weer maak." },
      { "@type": "ItemList", itemListElement: B.volgorde().map((r, i) => ({ "@type": "ListItem", position: i + 1, url: B.SITE + B.url(r), name: r.titel })) }
    ]
  }).replace(/</g, "\\u003c");

  /* ---------- Volledige pagina ---------- */
  B.pagina = o => {
    const v = esc(D.versie || "1");
    const titel = esc(o.titel), besch = esc(o.beschrijving);
    return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${titel}</title>
<meta name="description" content="${besch}">
${o.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${B.SITE}${o.pad}">`}
<meta property="og:site_name" content="GARAJ Recepten">
<meta property="og:locale" content="nl_NL">
<meta property="og:type" content="${o.ogType || "website"}">
<meta property="og:title" content="${titel}">
<meta property="og:description" content="${besch}">
<meta property="og:url" content="${B.SITE}${o.pad}">
<meta property="og:image" content="${B.SITE}${o.beeld || "/tafel.jpg"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#F4EDE1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15110E" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="GARAJ">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/style.css?v=${v}">
<script>try{var t=localStorage.getItem("garaj-thema");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
${o.jsonld ? `<script type="application/ld+json">${o.jsonld}</script>` : ""}
</head>
<body>
<a class="naar-inhoud" href="#view">Naar de inhoud</a>
<header class="kop">
  <div class="wrap">
    <a class="merk" href="/" aria-label="GARAJ, naar de startpagina">${LOGO}GARAJ</a>
    <nav class="nav" aria-label="Hoofdmenu"><a href="/#recepten">Recepten</a><a href="/#collecties">Collecties</a><a href="/#inhuis">In huis</a><a href="/#seizoen">Seizoen</a></nav>
    <button class="thema-knop" type="button" id="themaKnop" aria-label="Wissel tussen dag en nacht">
      <span class="thema-baan" aria-hidden="true"><span class="thema-bol"><svg class="zon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg><svg class="maan" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg></span></span>
      <span class="thema-tekst"><span class="t-dag">Dag</span><span class="t-nacht">Nacht</span></span>
    </button>
    <a class="ikoon-knop" href="/#recepten" id="zoekKnop" aria-label="Zoek een recept">${ZOEK}</a>
    <button class="ikoon-knop" type="button" id="ladeKnop" aria-label="Boodschappenlijst openen">${TAS}<span class="tel" id="tel" data-n="0">0</span></button>
  </div>
</header>
<main id="app"><div class="rug" aria-hidden="true"><i></i><b></b></div><div id="view" tabindex="-1">${o.inhoud}</div></main>
<footer>
  <div class="wrap">
    <span>GARAJ · Allemaal zelf gekookt · garaj.nl<br><small class="privacy">Geen cookies. Bezoek wordt alleen anoniem geteld.</small></span>
    <nav aria-label="Voettekst"><a href="/#recepten">Recepten</a><a href="/#collecties">Collecties</a><a href="/#inhuis">In huis</a><a href="/#seizoen">Seizoen</a></nav>
  </div>
</footer>
<div class="kook" id="kook" hidden role="dialog" aria-modal="true" aria-label="Kookmodus">
  <div>
    <div class="kook-top"><span class="oog" id="kookTitel"></span><button type="button" id="kookSluit">Sluiten</button></div>
    <div class="voortgang"><i id="kookBalk"></i></div>
  </div>
  <div class="kook-midden" id="kookMidden"></div>
  <div><p class="veeg">Veeg of gebruik ← → · je scherm blijft aan</p>
    <div class="kook-onder"><button type="button" id="kookVorig">Vorige</button><button type="button" id="kookVolgend" class="vol">Volgende</button></div>
  </div>
</div>
<div id="laag"></div>
<div class="dok" id="dok" aria-live="polite"></div>
<div class="toast" id="toast" hidden role="status"></div>
<aside class="installbalk" id="installbalk" hidden aria-label="GARAJ als app installeren">
  <img src="/icon-192.png" alt="" width="48" height="48">
  <div class="ib-tekst"><strong>GARAJ op je beginscherm</strong><span id="ibUitleg">Open de recepten met één tik en kook ook zonder internet.</span></div>
  <button class="ib-ja" id="ibJa" type="button">Installeren</button>
  <button class="ib-nee" id="ibNee" type="button" aria-label="Niet nu">✕</button>
</aside>
<script src="/recepten.js?v=${v}"></script>
<script src="/bouw.js?v=${v}"></script>
<script src="/app.js?v=${v}"></script>
</body>
</html>
`;
  };

  B.homePagina = () => B.pagina({
    titel: "GARAJ Recepten", pad: "/", beschrijving: "Recepten die ik zelf kook en steeds weer maak. Weinig recepten, allemaal goed.",
    inhoud: B.home(B.toestand()), jsonld: B.jsonldHome(), beeld: "/tafel.jpg"
  });
  B.receptPagina = r => B.pagina({
    titel: `${r.titel} · GARAJ Recepten`, pad: B.url(r), beschrijving: r.intro, ogType: "article",
    inhoud: B.recept(r, B.toestand()), jsonld: B.jsonld(r), beeld: B.foto(r)
  });
  B.pagina404 = () => B.pagina({
    titel: "GARAJ Recepten", pad: "/404.html", noindex: true, beschrijving: "Recepten die ik zelf kook en steeds weer maak.",
    inhoud: B.home(B.toestand())
  });
  B.sitemap = () => {
    const vandaag = new Date().toISOString().slice(0, 10);
    const regels = [`  <url><loc>${B.SITE}/</loc><lastmod>${vandaag}</lastmod></url>`]
      .concat(D.RECEPTEN.map(r => `  <url><loc>${B.SITE}${B.url(r)}</loc><lastmod>${r.toegevoegd || vandaag}</lastmod></url>`));
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${regels.join("\n")}\n</urlset>\n`;
  };

  /* ---------- Het receptenbestand ---------- */
  B.dataNaarJs = () => {
    const kop = `/* =====================================================================
   GARAJ RECEPTEN
   Dit bestand wordt gemaakt door het beheerformulier op garaj.nl/beheer.
   Liever met de hand aanpassen? Dat kan; let op de komma's en aanhalingstekens.

   ingredienten (items): [hoeveelheid, eenheid, naam, toelichting]
     hoeveelheid null + eenheid ""           = komt in de regel "Naar smaak"
     hoeveelheid null + eenheid "naar wens"  = eigen regel zonder getal
     hoeveelheid [1, 2]                      = van-tot
   stappen: timer = minuten voor de kookwekker
   foto: bestandsnaam van de foto, vierkant (bijv. "bolognesesaus.jpg")
   toegevoegd: datum "JJJJ-MM-DD"; het label Nieuw staat er 60 dagen
   lekkerBij: slug van een ander recept, of vrije tekst
   ===================================================================== */
`;
    return kop + "var GARAJ_DATA = " + JSON.stringify({ versie: D.versie, GANGEN: D.GANGEN, LABELS: D.LABELS, RECEPTEN: D.RECEPTEN }, null, 2) + ";\n";
  };

  /* Alle bestanden die uit de recepten volgen: { "pad": "inhoud" } */
  B.alleBestanden = () => {
    const uit = {
      "recepten.js": B.dataNaarJs(),
      "index.html": B.homePagina(),
      "404.html": B.pagina404(),
      "sitemap.xml": B.sitemap()
    };
    D.RECEPTEN.forEach(r => { uit[`recept/${r.slug}/index.html`] = B.receptPagina(r); });
    return uit;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = B;
  else root.GARAJ = B;
})(typeof window !== "undefined" ? window : globalThis);
