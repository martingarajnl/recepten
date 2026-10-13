/* =====================================================================
   GARAJ beheer: recepten toevoegen en bewerken in de browser.
   Er wordt niets online opgeslagen. Het formulier maakt een zip met de
   bijgewerkte bestanden; die zet je zelf op GitHub. Tot die tijd blijft je
   werk als concept bewaard in deze browser.
   ===================================================================== */
(function () {
  "use strict";
  const B = window.GARAJ, esc = B.esc;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const LIVE = window.GARAJ_DATA;
  const SLEUTEL = "garaj-beheer-concept";
  const kloon = o => JSON.parse(JSON.stringify(o));
  const opslag = {
    get() { try { return JSON.parse(localStorage.getItem(SLEUTEL)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); return true; } catch (e) { toast("Let op: de browser kon het concept niet bewaren (te weinig ruimte). Download het pakket voordat je dit venster sluit."); return false; } },
    wis() { try { localStorage.removeItem(SLEUTEL); } catch (e) {} }
  };
  function toast(t) { const el = $("#toast"); el.hidden = true; void el.offsetWidth; el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3200); }

  /* ---------- Toestand ---------- */
  let data, fotos, wijzigingen, actief = null, concept = null, vies = false, slugHand = false;
  function begin(vanConcept) {
    if (vanConcept) { data = vanConcept.data; fotos = vanConcept.fotos || {}; wijzigingen = vanConcept.wijzigingen || []; }
    else { data = kloon(LIVE); fotos = {}; wijzigingen = []; }
    B.init(data);
  }
  const bewaarConcept = () => opslag.set({ data, fotos, wijzigingen, basis: LIVE.versie });

  const c = opslag.get();
  if (c && c.wijzigingen && c.wijzigingen.length && c.geexporteerd !== LIVE.versie) {
    begin(c);
    $("#melding").innerHTML = `<div class="melding">Je werkt verder aan een concept met ${c.wijzigingen.length} ${c.wijzigingen.length === 1 ? "wijziging" : "wijzigingen"} die nog niet online staan.<button type="button" id="opnieuw">Weggooien en opnieuw beginnen met de live versie</button></div>`;
    $("#opnieuw").onclick = () => { $("#opnieuw").textContent = "Weet je het zeker? Klik nog een keer."; $("#opnieuw").onclick = () => { opslag.wis(); begin(null); $("#melding").innerHTML = ""; actief = null; tekenLijst(); welkom(); status(); }; };
  } else { if (c) opslag.wis(); begin(null); }

  const fotoSrc = naam => naam ? (fotos[naam] || "/" + naam) : "";
  function status() {
    $("#status").textContent = wijzigingen.length ? `${wijzigingen.length} ${wijzigingen.length === 1 ? "wijziging" : "wijzigingen"} klaar om te publiceren: ${[...new Set(wijzigingen)].slice(-3).join(", ")}` : "Nog niets gewijzigd.";
    $("#pakket").disabled = !wijzigingen.length;
  }

  /* ---------- Lijst ---------- */
  function tekenLijst() {
    $("#lijst").innerHTML = `<button type="button" class="nieuw-knop" id="nieuw">+ Nieuw recept</button>` +
      B.volgorde().concat(data.RECEPTEN.filter(r => !B.volgorde().includes(r))).map(r => `<button type="button" data-slug="${esc(r.slug)}" aria-current="${actief === r.slug}"><img src="${esc(fotoSrc(r.foto))}" alt=""><span>${esc(r.titel)}<small>${esc(B.gangVan(r.gang).kort)}</small></span></button>`).join("");
    $("#nieuw").onclick = () => kies(null);
    $$("#lijst [data-slug]").forEach(b => b.onclick = () => kies(b.dataset.slug));
  }
  function kies(slug) {
    if (vies) { toast("Je hebt wijzigingen die nog niet bewaard zijn. Klik eerst op Recept bewaren of Annuleren."); return; }
    actief = slug;
    const r = slug ? B.bySlug(slug) : null;
    concept = r ? kloon(r) : {
      slug: "", titel: "", gang: "hoofdgerecht", labels: [], favoriet: false, foto: "", toegevoegd: new Date().toISOString().slice(0, 10),
      noot: "", intro: "", tijd: "", porties: 4, portieWoord: ["persoon", "personen"], benodigdheden: [],
      onderdelen: [{ kop: null, items: [[null, "", "", ""]] }], stappen: [{ kop: "", tekst: "" }], tip: "", lekkerBij: []
    };
    slugHand = !!r;
    tekenLijst(); tekenForm();
    $("#werk").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function welkom() {
    $("#werk").innerHTML = `<div class="fouten" style="background:var(--linnen);border:1px solid var(--lijn)"><strong>Kies links een recept</strong> om het te bewerken, of klik op <b>+ Nieuw recept</b>.<p class="uitleg" style="margin-top:6px">Alles wat je hier doet blijft in deze browser tot je het websitepakket downloadt en op GitHub zet.</p></div>`;
  }

  /* ---------- Hoeveelheden ---------- */
  const BREUK = { "½": .5, "¼": .25, "¾": .75, "⅓": 1 / 3, "⅔": 2 / 3 };
  function leesGetal(s) {
    s = s.trim().replace(",", ".");
    const m = s.match(/^(\d*)\s*([½¼¾⅓⅔])$/);
    if (m) return (m[1] ? +m[1] : 0) + BREUK[m[2]];
    if (/^\d+\/\d+$/.test(s)) { const [a, b] = s.split("/"); return +a / +b; }
    return s === "" ? NaN : Number(s);
  }
  function leesHoeveel(s) {
    s = String(s || "").trim();
    if (!s) return null;
    const delen = s.split(/\s*[-–]\s*/);
    if (delen.length === 2) { const a = leesGetal(delen[0]), b = leesGetal(delen[1]); return isNaN(a) || isNaN(b) ? undefined : [a, b]; }
    const n = leesGetal(s); return isNaN(n) ? undefined : n;
  }
  const toonGetal = n => String(Math.round(n * 1000) / 1000).replace(".", ",");
  const toonHoeveel = q => q === null || q === undefined ? "" : Array.isArray(q) ? `${toonGetal(q[0])}-${toonGetal(q[1])}` : toonGetal(q);

  /* ---------- Formulier ---------- */
  function tekenForm() {
    const r = concept, g = data.GANGEN;
    const andere = data.RECEPTEN.filter(x => x.slug !== actief);
    const bijVrij = (r.lekkerBij || []).filter(x => !B.bySlug(x)).join("\n");
    $("#werk").innerHTML = `<form id="form" novalidate>
      <div id="fouten"></div>
      <fieldset><legend>${actief ? "Recept bewerken" : "Nieuw recept"}</legend>
        <label class="veld"><span>Titel</span><input type="text" id="f-titel" value="${esc(r.titel)}" placeholder="Bijv. Griekse kiprijst uit de oven" required></label>
        <div class="rij2">
          <label class="veld"><span>Webadres</span><input type="text" id="f-slug" value="${esc(r.slug)}" placeholder="wordt automatisch gemaakt"><small>garaj.nl/recept/<b id="slugVoorbeeld">${esc(r.slug || "…")}</b>/</small></label>
          <label class="veld"><span>Gang</span><select id="f-gang">${g.map(x => `<option value="${esc(x.id)}" ${x.id === r.gang ? "selected" : ""}>${esc(x.naam)}</option>`).join("")}</select></label>
          <label class="veld"><span>Toegevoegd op</span><input type="date" id="f-toegevoegd" value="${esc(r.toegevoegd || "")}"><small>Label Nieuw staat er 60 dagen</small></label>
        </div>
        <div class="veld"><span>Collecties (labels)</span>
          <div class="vinkjes" id="labels">${Object.entries(data.LABELS).map(([k, v]) => `<label><input type="checkbox" name="label" value="${esc(k)}" ${(r.labels || []).includes(k) ? "checked" : ""}>${esc(v)}</label>`).join("")}</div>
          <div style="display:flex;gap:8px;margin-top:6px"><input type="text" id="f-nieuwlabel" placeholder="Nieuw label, bijv. snel klaar" style="max-width:280px"><button type="button" class="klein" id="labelPlus">+ Label</button></div>
        </div>
      </fieldset>

      <fieldset><legend>Foto</legend>
        <div class="foto-rij"><img id="fotoVoorbeeld" src="${esc(fotoSrc(r.foto))}" alt="">
          <div class="veld"><span>Foto uploaden</span><input type="file" id="f-fotobestand" accept="image/*"><small>Wordt automatisch vierkant bijgesneden en verkleind tot 900 × 900. Gebruik een foto van bovenaf, dan valt het ronde bord mooi.</small>
          <input type="hidden" id="f-foto" value="${esc(r.foto || "")}"></div></div>
      </fieldset>

      <fieldset><legend>Introductie</legend>
        <label class="veld"><span>Korte introductie</span><textarea id="f-intro" placeholder="Eén of twee zinnen: wat is het en waarom is het lekker?">${esc(r.intro)}</textarea><small>Staat ook in Google onder de titel.</small></label>
        <div class="rij2">
          <label class="veld"><span>Totale tijd</span><input type="text" id="f-tijd" value="${esc(r.tijd || "")}" placeholder="± 1 uur 20 min"><small>Gebruik uur, min of dagen; Google leest dit mee.</small></label>
          <label class="veld"><span>Porties</span><input type="number" id="f-porties" min="1" step="1" value="${esc(r.porties)}"></label>
          <label class="veld"><span>Woord voor 1 portie</span><input type="text" id="f-enk" value="${esc(r.portieWoord[0])}" placeholder="persoon"></label>
          <label class="veld"><span>Meervoud</span><input type="text" id="f-mv" value="${esc(r.portieWoord[1])}" placeholder="personen"></label>
        </div>
        <label class="veld"><span>Benodigdheden</span><input type="text" id="f-gerei" value="${esc((r.benodigdheden || []).join(", "))}" placeholder="Keukenmachine, ovenschaal"><small>Gescheiden door komma's. Mag leeg.</small></label>
        <div class="vinkjes"><label><input type="checkbox" id="f-favoriet" ${r.favoriet ? "checked" : ""}>Favoriet (kan recept van de week worden)</label></div>
        <label class="veld"><span>Noot bij favoriet</span><textarea id="f-noot" placeholder="Waarom maak je dit steeds weer?">${esc(r.noot || "")}</textarea></label>
      </fieldset>

      <fieldset><legend>Ingrediënten</legend>
        <p class="uitleg">Hoeveelheid leeg laten = “naar smaak”. Van-tot schrijf je als <b>1-2</b>. Breuken mogen: <b>0,5</b> of <b>½</b>.</p>
        <div id="groepen">${r.onderdelen.map((o, gi) => `
          <div class="groep" data-g="${gi}">
            <div style="display:flex;gap:8px;align-items:center"><input type="text" class="g-kop" value="${esc(o.kop || "")}" placeholder="${gi ? "Naam van dit onderdeel, bijv. Dip" : "Kopje (optioneel), bijv. Voor de saus"}">${r.onderdelen.length > 1 ? `<button type="button" class="mini" data-weggroep="${gi}" aria-label="Onderdeel verwijderen">✕</button>` : ""}</div>
            <div class="ingr-rij ingr-kop"><span>Hoeveel</span><span>Eenheid</span><span>Ingrediënt</span><span>Toelichting</span><span></span></div>
            ${o.items.map((it, ii) => `<div class="ingr-rij" data-i="${ii}">
              <input type="text" class="i-q" value="${esc(toonHoeveel(it[0]))}" aria-label="Hoeveelheid" inputmode="decimal">
              <input type="text" class="i-u" value="${esc(it[1] || "")}" list="eenheden" aria-label="Eenheid">
              <input type="text" class="i-n" value="${esc(it[2] || "")}" aria-label="Ingrediënt" placeholder="bijv. rode paprika's">
              <input type="text" class="i-x" value="${esc(it[3] || "")}" aria-label="Toelichting" placeholder="optioneel">
              <button type="button" class="mini" data-wegitem="${gi}-${ii}" aria-label="Ingrediënt verwijderen">✕</button></div>`).join("")}
            <button type="button" class="klein" data-plusitem="${gi}">+ Ingrediënt</button>
          </div>`).join("")}</div>
        <button type="button" class="klein" id="plusGroep">+ Onderdeel met eigen kopje</button>
      </fieldset>

      <fieldset><legend>Bereiding</legend>
        <div id="stappen" style="display:grid;gap:14px">${r.stappen.map((s, i) => `
          <div class="stapform" data-s="${i}"><span class="nr">${i + 1}</span>
            <div class="velden">
              <input type="text" class="s-kop" value="${esc(s.kop || "")}" placeholder="Korte kop, bijv. Groente aanbakken" aria-label="Kop van stap ${i + 1}">
              <textarea class="s-tekst" placeholder="Wat moet je doen?" aria-label="Tekst van stap ${i + 1}">${esc(s.tekst || "")}</textarea>
              <div class="rij2">
                <input type="text" class="s-tijd" value="${esc(s.tijd || "")}" placeholder="Tijd, bijv. ± 15 min (optioneel)" aria-label="Tijd">
                <input type="number" class="s-timer" min="0" value="${esc(s.timer || "")}" placeholder="Wekker in minuten" aria-label="Wekker in minuten">
                <input type="text" class="s-naam" value="${esc(s.timerNaam || "")}" placeholder="Naam van de wekker" aria-label="Naam van de wekker">
              </div>
            </div>
            <div class="knopjes"><button type="button" class="mini" data-op="${i}" aria-label="Omhoog" ${i ? "" : "disabled"}>↑</button><button type="button" class="mini" data-neer="${i}" aria-label="Omlaag" ${i < r.stappen.length - 1 ? "" : "disabled"}>↓</button>${r.stappen.length > 1 ? `<button type="button" class="mini" data-wegstap="${i}" aria-label="Stap verwijderen">✕</button>` : ""}</div>
          </div>`).join("")}</div>
        <button type="button" class="klein" id="plusStap">+ Stap</button>
      </fieldset>

      <fieldset><legend>Afronding</legend>
        <label class="veld"><span>Tip</span><textarea id="f-tip" placeholder="Optioneel">${esc(r.tip || "")}</textarea></label>
        <div class="veld"><span>Lekker bij: andere recepten</span><div class="vinkjes">${andere.map(x => `<label><input type="checkbox" name="bij" value="${esc(x.slug)}" ${(r.lekkerBij || []).includes(x.slug) ? "checked" : ""}>${esc(x.titel)}</label>`).join("") || '<span class="uitleg">Nog geen andere recepten.</span>'}</div></div>
        <label class="veld"><span>Lekker bij: vrije tekst</span><textarea id="f-bijtekst" placeholder="Eén per regel, bijv. Verse frieten">${esc(bijVrij)}</textarea></label>
      </fieldset>

      <div class="acties-bh">
        <button type="submit" class="knop vol">Recept bewaren</button>
        <button type="button" class="knop" id="voorbeeldKnop">Voorbeeld bekijken</button>
        <button type="button" class="knop" id="annuleer">Annuleren</button>
        ${actief ? `<button type="button" class="knop gevaar" id="verwijder">Recept verwijderen</button>` : ""}
      </div>
      <div id="voorbeeld"></div>
    </form>`;
    bindForm();
  }

  function leesForm() {
    const r = concept, v = id => $("#" + id).value;
    r.titel = v("f-titel").trim();
    r.slug = B.slugify(v("f-slug") || r.titel);
    r.gang = v("f-gang");
    r.toegevoegd = v("f-toegevoegd");
    r.labels = $$("[name=label]:checked").map(x => x.value);
    r.foto = v("f-foto");
    r.intro = v("f-intro").trim();
    r.tijd = v("f-tijd").trim();
    r.porties = Math.max(1, parseInt(v("f-porties"), 10) || 1);
    r.portieWoord = [v("f-enk").trim(), v("f-mv").trim()];
    r.benodigdheden = v("f-gerei").split(",").map(s => s.trim()).filter(Boolean);
    r.favoriet = $("#f-favoriet").checked;
    r.noot = v("f-noot").trim();
    r._fouteHoeveel = [];
    r.onderdelen = $$(".groep").map(gEl => ({
      kop: gEl.querySelector(".g-kop").value.trim() || null,
      items: [...gEl.querySelectorAll(".ingr-rij[data-i]")].map(rij => {
        const ruw = rij.querySelector(".i-q").value, q = leesHoeveel(ruw), naam = rij.querySelector(".i-n").value.trim();
        if (q === undefined) r._fouteHoeveel.push(`${naam || "ingrediënt"}: “${ruw}”`);
        const it = [q === undefined ? null : q, rij.querySelector(".i-u").value.trim(), naam];
        const x = rij.querySelector(".i-x").value.trim(); if (x) it.push(x);
        return it;
      })
    }));
    r.stappen = $$(".stapform").map(el => {
      const s = { kop: el.querySelector(".s-kop").value.trim(), tekst: el.querySelector(".s-tekst").value.trim() };
      const tijd = el.querySelector(".s-tijd").value.trim(), timer = parseInt(el.querySelector(".s-timer").value, 10), naam = el.querySelector(".s-naam").value.trim();
      if (tijd) s.tijd = tijd;
      if (timer > 0) { s.timer = timer; s.timerNaam = naam || s.kop; }
      return s;
    });
    r.tip = v("f-tip").trim();
    r.lekkerBij = $$("[name=bij]:checked").map(x => x.value).concat(v("f-bijtekst").split("\n").map(s => s.trim()).filter(Boolean));
    return r;
  }
  function schoon(r) {
    const o = kloon(r); delete o._fouteHoeveel;
    o.onderdelen = o.onderdelen.map(g => ({ kop: g.kop, items: g.items.filter(i => i[2]) })).filter(g => g.items.length);
    o.stappen = o.stappen.filter(s => s.tekst);
    ["noot", "tip"].forEach(k => { if (!o[k]) delete o[k]; });
    if (!o.benodigdheden.length) delete o.benodigdheden;
    return o;
  }
  function controleer(r) {
    const f = [];
    if (!r.titel) f.push("Geef het recept een titel.");
    if (!r.slug) f.push("Het webadres is leeg.");
    else if (data.RECEPTEN.some(x => x.slug === r.slug && x.slug !== actief)) f.push(`Er is al een recept met het webadres “${r.slug}”. Kies een andere titel of pas het webadres aan.`);
    if (!r.foto) f.push("Voeg een foto toe.");
    if (!r.intro) f.push("Schrijf een korte introductie.");
    if (!r.portieWoord[0] || !r.portieWoord[1]) f.push("Vul het woord voor een portie in, enkelvoud en meervoud (bijv. persoon / personen).");
    if (!r.onderdelen.some(g => g.items.some(i => i[2]))) f.push("Voeg minstens één ingrediënt toe.");
    if (!r.stappen.some(s => s.tekst)) f.push("Voeg minstens één bereidingsstap met tekst toe.");
    r._fouteHoeveel.forEach(x => f.push(`Deze hoeveelheid snap ik niet: ${x}. Gebruik bijv. 2, 0,5, ½ of 1-2.`));
    return f;
  }

  function bindForm() {
    const form = $("#form");
    form.addEventListener("input", () => { vies = true; });
    $("#f-titel").addEventListener("input", () => { if (!slugHand) { $("#f-slug").value = B.slugify($("#f-titel").value); } $("#slugVoorbeeld").textContent = B.slugify($("#f-slug").value) || "…"; });
    $("#f-slug").addEventListener("input", () => { slugHand = true; $("#slugVoorbeeld").textContent = B.slugify($("#f-slug").value) || "…"; });
    const herteken = fn => () => { leesForm(); fn(); tekenForm(); vies = true; };
    $("#labelPlus").onclick = () => {
      const naam = $("#f-nieuwlabel").value.trim().toLowerCase(), k = B.slugify(naam);
      if (!k) return;
      leesForm(); if (!data.LABELS[k]) data.LABELS[k] = naam; if (!concept.labels.includes(k)) concept.labels.push(k); tekenForm(); vies = true;
    };
    $$("[data-plusitem]").forEach(b => b.onclick = herteken(() => concept.onderdelen[+b.dataset.plusitem].items.push([null, "", "", ""])));
    $$("[data-wegitem]").forEach(b => b.onclick = herteken(() => { const [g, i] = b.dataset.wegitem.split("-").map(Number); concept.onderdelen[g].items.splice(i, 1); if (!concept.onderdelen[g].items.length) concept.onderdelen[g].items.push([null, "", "", ""]); }));
    $$("[data-weggroep]").forEach(b => b.onclick = herteken(() => concept.onderdelen.splice(+b.dataset.weggroep, 1)));
    $("#plusGroep").onclick = herteken(() => concept.onderdelen.push({ kop: "", items: [[null, "", "", ""]] }));
    $("#plusStap").onclick = herteken(() => concept.stappen.push({ kop: "", tekst: "" }));
    $$("[data-wegstap]").forEach(b => b.onclick = herteken(() => concept.stappen.splice(+b.dataset.wegstap, 1)));
    const wissel = (a, b) => { const s = concept.stappen; [s[a], s[b]] = [s[b], s[a]]; };
    $$("[data-op]").forEach(b => b.onclick = herteken(() => wissel(+b.dataset.op, +b.dataset.op - 1)));
    $$("[data-neer]").forEach(b => b.onclick = herteken(() => wissel(+b.dataset.neer, +b.dataset.neer + 1)));
    $("#f-fotobestand").onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const bmp = await createImageBitmap(f), z = Math.min(bmp.width, bmp.height);
        const cv = document.createElement("canvas"); cv.width = cv.height = 900;
        cv.getContext("2d").drawImage(bmp, (bmp.width - z) / 2, (bmp.height - z) / 2, z, z, 0, 0, 900, 900);
        const naam = (B.slugify($("#f-slug").value || $("#f-titel").value) || "foto-" + Date.now()) + ".jpg";
        fotos[naam] = cv.toDataURL("image/jpeg", 0.84);
        $("#f-foto").value = naam; $("#fotoVoorbeeld").src = fotos[naam]; vies = true;
        toast("Foto bijgesneden en klaargezet");
      } catch (err) { toast("Deze foto kon ik niet openen. Probeer een JPG of PNG."); }
    };
    $("#voorbeeldKnop").onclick = () => {
      const r = schoon(leesForm());
      if (!r.titel) { toast("Vul eerst een titel in"); return; }
      if (!r.portieWoord[0]) r.portieWoord = ["portie", "porties"];
      const tijdelijk = data.RECEPTEN.filter(x => x.slug !== actief).concat(r);
      const echte = data.RECEPTEN; data.RECEPTEN = tijdelijk;
      let html = ""; try { html = B.recept(r, B.toestand()); } finally { data.RECEPTEN = echte; }
      $("#voorbeeld").innerHTML = `<div class="voorbeeld"><div class="oog">Voorbeeld · zo ziet het eruit op de site</div>${html}</div>`;
      if (fotos[r.foto]) $$("#voorbeeld img").forEach(i => { if (i.getAttribute("src") === "/" + r.foto) i.src = fotos[r.foto]; });
      $("#voorbeeld").scrollIntoView({ behavior: "smooth" });
    };
    $("#annuleer").onclick = () => { vies = false; if (actief) kies(actief); else { actief = null; tekenLijst(); welkom(); } };
    if ($("#verwijder")) $("#verwijder").onclick = () => {
      const b = $("#verwijder");
      if (!b.dataset.zeker) { b.dataset.zeker = "1"; b.textContent = "Echt verwijderen? Klik nogmaals"; return; }
      const r = B.bySlug(actief);
      data.RECEPTEN = data.RECEPTEN.filter(x => x.slug !== actief);
      data.RECEPTEN.forEach(x => { x.lekkerBij = (x.lekkerBij || []).filter(s => s !== actief); });
      B.init(data); wijzigingen.push(`${r.titel} verwijderd`); vies = false; actief = null;
      bewaarConcept(); tekenLijst(); welkom(); status(); toast(`${r.titel} verwijderd`);
    };
    form.onsubmit = e => {
      e.preventDefault();
      const r = leesForm(), fouten = controleer(r);
      if (fouten.length) { $("#fouten").innerHTML = `<div class="fouten"><strong>Nog even aanvullen</strong><ul>${fouten.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>`; $("#fouten").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      const klaar = schoon(r), oud = actief;
      if (oud && oud !== klaar.slug) data.RECEPTEN.forEach(x => { x.lekkerBij = (x.lekkerBij || []).map(s => s === oud ? klaar.slug : s); });
      const i = data.RECEPTEN.findIndex(x => x.slug === oud);
      if (i >= 0) data.RECEPTEN[i] = klaar; else data.RECEPTEN.push(klaar);
      B.init(data); wijzigingen.push(klaar.titel); vies = false; actief = klaar.slug; slugHand = true;
      bewaarConcept(); tekenLijst(); tekenForm(); status();
      toast(`${klaar.titel} bewaard. Download het websitepakket om te publiceren.`);
    };
  }

  /* ---------- Websitepakket ---------- */
  $("#pakket").onclick = async () => {
    if (vies) { toast("Bewaar of annuleer eerst het recept dat open staat."); return; }
    if (!window.JSZip) { toast("De zip-functie kon niet laden. Controleer je internetverbinding en probeer opnieuw."); return; }
    const nu = new Date(), p = n => String(n).padStart(2, "0");
    data.versie = `${nu.getFullYear()}-${p(nu.getMonth() + 1)}-${p(nu.getDate())}.${p(nu.getHours())}${p(nu.getMinutes())}`;
    B.init(data);
    const zip = new JSZip(), bestanden = B.alleBestanden();
    Object.entries(bestanden).forEach(([pad, inhoud]) => zip.file(pad, inhoud));
    const gebruikt = new Set(data.RECEPTEN.map(r => r.foto));
    Object.entries(fotos).filter(([n]) => gebruikt.has(n)).forEach(([n, url]) => zip.file(n, url.split(",")[1], { base64: true }));
    const blob = await zip.generateAsync({ type: "blob" });
    const href = URL.createObjectURL(blob), naam = `garaj-update-${data.versie}.zip`;
    const a = document.createElement("a"); a.href = href; a.download = naam; document.body.appendChild(a); a.click(); a.remove();
    const c = { data, fotos, wijzigingen, basis: LIVE.versie, geexporteerd: data.versie }; opslag.set(c);
    $("#laag").innerHTML = `<div class="scherm" data-dicht></div><div class="dialoog klaar-paneel" role="dialog" aria-modal="true" aria-label="Pakket gedownload">
      <div class="lade-kop"><h2 style="font-size:28px">Pakket klaar</h2><button class="sluit" type="button" data-dicht aria-label="Sluiten">✕</button></div>
      <p style="color:var(--inkt)"><b>${esc(naam)}</b> staat in je Downloads. <a href="${href}" download="${esc(naam)}">Opnieuw downloaden</a></p>
      <ol>
        <li>Pak de zip uit (rechtsklik → <i>Alles uitpakken</i>).</li>
        <li>Open je repository op <b>github.com</b> en kies <b>Add file → Upload files</b>.</li>
        <li>Sleep de <b>inhoud</b> van de uitgepakte map (alle bestanden én de map <code>recept</code>) naar het uploadvak. Bestaande bestanden worden vervangen.</li>
        <li>Klik onderaan op <b>Commit changes</b>. Na een minuut of twee staat alles live op garaj.nl.</li>
      </ol>
      <p>Zodra de nieuwe versie live staat, ruimt dit formulier het concept vanzelf op.${wijzigingen.some(w => / verwijderd$/.test(w)) ? " Verwijderde recepten: haal op GitHub ook de bijbehorende map in <code>recept/</code> weg." : ""}</p></div>`;
    $$("[data-dicht]").forEach(e => e.onclick = () => { $("#laag").innerHTML = ""; });
  };

  addEventListener("beforeunload", e => { if (vies) { e.preventDefault(); e.returnValue = ""; } });
  tekenLijst(); welkom(); status();
})();
