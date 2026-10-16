// =====================================================================
// NOMS EN COULEUR DANS LE TEXTE
// Les personnages et les lieux des fiches nommés dans la scène sont soulignés en couleur,
// directement dans le texte (mêmes règles que « Dans cette scène » : voir reperage.js).
// Les lieux ont un soulignement en pointillés.
// Toucher (ou cliquer) un nom coloré fait apparaître une petite bulle qui ouvre sa fiche ;
// Ctrl+clic (Cmd+clic sur Mac) l'ouvre directement. Le curseur reste dans le texte.
//
// Comment ça marche : une zone de texte (textarea) ne sait pas colorer une partie de son texte.
// On place donc derrière elle un « calque » qui contient exactement le même texte, à la même
// place (même police, mêmes marges, même défilement), invisible sauf les noms soulignés.
// Le texte que l'on voit et que l'on tape reste celui de la zone de texte : si le calque
// était un jour décalé, seul le soulignement serait mal placé, jamais le texte.
// Pour rester rapide dans une longue scène, le calque a une ligne par paragraphe,
// et à chaque frappe on ne refait que les lignes qui ont changé (sans jamais rien retirer de la page :
// voir majCalque, c'est ce qui garde Ctrl+Z intact).
// =====================================================================

import { el } from "./outils.js";
import { etat, ecouter, trouverFiche } from "./etat.js";
import { CATEGORIES, ouvrirFiche, basculerVolet } from "./panneau.js";
import { estReperable, preparerNoms, nomsDansLeTexte } from "./reperage.js";

// Le choix « noms en couleur », propre à cet appareil (gardé dans le navigateur)
const CLE_CHOIX = "atelier-surlignage";
// Ce qui doit être identique dans le calque et dans la zone de texte pour que les lignes tombent pareil
const STYLES_COPIES = [
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontStretch", "fontVariant", "fontKerning",
  "fontFeatureSettings", "fontVariationSettings", "lineHeight", "letterSpacing", "wordSpacing", "tabSize",
  "textIndent", "textTransform", "textRendering", "whiteSpace", "overflowWrap", "wordBreak", "hyphens",
  "direction", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
];

let actif = true;
let noms = [];             // les noms à chercher (ceux des fiches repérables du roman)
let signature = "";        // les noms ont-ils changé ? (sinon, inutile de tout refaire)
let lignes = [];           // le texte de chaque ligne du calque, tel qu'il est affiché
let elements = [];         // l'élément de chaque ligne (dans l'ordre ; les lignes cachées n'y sont plus)
let aNettoyer = false;     // des lignes cachées ou des noms vidés attendent le ménage
let zoneSuivie = null;     // la zone de texte (Notes ou Rédigé) dont le calque est la copie
let derniersStyles = "";
let demande = 0, toutRefaire = false;
let bulleSur = null;       // { marque, ligne } : le nom sous lequel la bulle est affichée

const $ = (id) => document.getElementById(id);

// =====================================================================
// Mise en place
// =====================================================================

export function initialiserSurlignage() {
  try { actif = localStorage.getItem(CLE_CHOIX) !== "non"; } catch { /* stockage indisponible : on colore */ }
  $("surligner").checked = actif;
  $("surligner").addEventListener("change", (e) => {
    actif = e.target.checked;
    try { localStorage.setItem(CLE_CHOIX, actif ? "oui" : "non"); } catch { /* tant pis : le choix vaut pour cette fois */ }
    cacherBulle();
    planifier(true);
  });

  for (const id of ["texte-notes", "texte-redige"]) {
    const zone = $(id);
    zone.addEventListener("input", () => { cacherBulle(); planifier(); });
    zone.addEventListener("scroll", suivreDefilement);
    zone.addEventListener("click", (e) => surClic(e, zone));
    zone.addEventListener("keydown", (e) => { if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) cacherBulle(); });
    // On ne tape plus dans ce texte : le moment de faire le ménage du calque, sans gêner Ctrl+Z
    zone.addEventListener("blur", () => { if (aNettoyer) planifier(true); });
    // Largeur changée (fenêtre, volets, concentration, barre de défilement…) : les lignes se recoupent
    new ResizeObserver(() => planifier()).observe(zone);
  }
  ecouter("scene-affichee", () => { cacherBulle(); planifier(true); });
  ecouter("mode-affiche", () => { cacherBulle(); planifier(true); });
  ecouter("fiches-changees", () => planifier()); // (tout est refait seulement si un nom a changé)

  const bulle = $("bulle-noms");
  bulle.addEventListener("mousedown", (e) => e.preventDefault()); // toucher la bulle ne retire pas le curseur du texte
  bulle.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fiche]");
    if (b) ouvrir(b.dataset.fiche);
  });
  // Toucher ailleurs que dans le texte ou la bulle : elle disparaît
  document.addEventListener("pointerdown", (e) => {
    if (!bulle.hidden && !bulle.contains(e.target) && !e.target.closest?.(".texte")) cacherBulle();
  });
}

function planifier(tout = false) {
  if (tout) toutRefaire = true;
  if (demande) return;
  // Juste avant le prochain affichage (plusieurs frappes très rapprochées ne font qu'une mise à jour)
  demande = requestAnimationFrame(() => {
    demande = 0;
    const t = toutRefaire;
    toutRefaire = false;
    majCalque(t);
  });
}

// =====================================================================
// Le calque
// =====================================================================

function majCalque(tout) {
  const calque = $("calque"), interieur = $("calque-texte");
  const zone = [$("texte-notes"), $("texte-redige")].find((z) => !z.hidden);
  const fiches = etat.roman ? etat.fiches.filter(estReperable) : [];
  const visible = actif && !!etat.sceneId && !$("editeur-plein").hidden && !!zone && fiches.length > 0;
  calque.hidden = !visible;
  if (!visible) {
    if (lignes.length) interieur.replaceChildren();
    lignes = [];
    elements = [];
    zoneSuivie = null;
    cacherBulle();
    return;
  }
  if (zone !== zoneSuivie) { zoneSuivie = zone; tout = true; }
  // Les noms à chercher : refaits seulement si une fiche a changé de nom (ou de catégorie)
  const sig = fiches.map((f) => [f.id, f.categorie, f.titre, f.champs?.autresNoms || ""].join("\u0001")).join("\u0002");
  if (sig !== signature) { signature = sig; noms = preparerNoms(fiches); tout = true; }
  copierStyles(zone);
  const nouvelles = zone.value.split("\n");

  // Tout refaire (autre scène, autre mode, autres noms…) : on cherche dans tout le texte d'un coup
  // (plus rapide), puis on donne à chaque ligne ses noms. (Un nom coupé par un retour à la ligne n'est pas souligné.)
  if (tout) {
    const parLigne = repartir(nomsDansLeTexte(zone.value, noms), nouvelles);
    const morceau = document.createDocumentFragment();
    elements = nouvelles.map((texte, i) => morceau.appendChild(remplirLigne(document.createElement("div"), texte, parLigne[i])));
    interieur.replaceChildren(morceau);
    lignes = nouvelles;
    aNettoyer = false;
    suivreDefilement();
    return;
  }

  // Pendant l'écriture : seulement les lignes qui ont changé (entre le début et la fin restés identiques).
  // ATTENTION : rien n'est retiré de la page pendant que l'on tape. Chrome couperait sinon ce que l'on
  // tape en petits morceaux, et Ctrl+Z n'annulerait plus qu'une lettre à la fois. On réécrit donc le texte
  // des lignes existantes, on en ajoute au besoin, et une ligne en trop est seulement cachée
  // (le ménage se fait au prochain « tout refaire »).
  const max = Math.min(lignes.length, nouvelles.length);
  let debut = 0, fin = 0;
  while (debut < max && lignes[debut] === nouvelles[debut]) debut++;
  while (fin < max - debut && lignes[lignes.length - 1 - fin] === nouvelles[nouvelles.length - 1 - fin]) fin++;
  const finAncien = lignes.length - fin, finNouveau = nouvelles.length - fin;
  const communes = Math.min(finAncien, finNouveau) - debut;
  for (let i = debut; i < debut + communes; i++) remplirLigne(elements[i], nouvelles[i], nomsDansLeTexte(nouvelles[i], noms));
  if (finNouveau > finAncien) {
    // Des lignes en plus : ajoutées juste avant la première ligne restée identique à la fin
    const suivante = elements[finAncien] || null;
    const ajout = [];
    for (let i = debut + communes; i < finNouveau; i++) {
      const ligne = remplirLigne(document.createElement("div"), nouvelles[i], nomsDansLeTexte(nouvelles[i], noms));
      interieur.insertBefore(ligne, suivante);
      ajout.push(ligne);
    }
    elements.splice(debut + communes, 0, ...ajout);
  } else if (finAncien > finNouveau) {
    // Des lignes en moins : cachées
    for (const ligne of elements.splice(debut + communes, finAncien - finNouveau)) ligne.hidden = true;
    aNettoyer = true;
  }
  lignes = nouvelles;
  suivreDefilement();
}

// Les noms trouvés dans tout le texte, rangés par ligne (positions comptées depuis le début de leur ligne)
function repartir(trouves, lignesDuTexte) {
  const parLigne = lignesDuTexte.map(() => []);
  let k = 0, debutLigne = 0;
  lignesDuTexte.forEach((texte, i) => {
    const finLigne = debutLigne + texte.length;
    for (; k < trouves.length && trouves[k].debut < finLigne; k++) {
      const n = trouves[k];
      if (n.debut >= debutLigne && n.fin <= finLigne) parLigne[i].push({ ...n, debut: n.debut - debutLigne, fin: n.fin - debutLigne });
    }
    debutLigne = finLigne + 1; // (+1 : le retour à la ligne)
  });
  return parLigne;
}

// Écrit une ligne (un paragraphe) du calque, avec ses noms soulignés.
// Une ligne est toujours faite ainsi : texte, nom, texte, nom, …, texte. On réutilise ce qui existe
// (on change seulement les textes) ; un nom en trop devient vide, il resservira plus tard.
function remplirLigne(ligne, texte, trouves) {
  const noeuds = ligne.childNodes;
  if (!noeuds.length) ligne.append(document.createTextNode(""));
  for (let n = (noeuds.length - 1) / 2; n < trouves.length; n++) {
    const marque = document.createElement("mark");
    marque.append(document.createTextNode(""));
    ligne.append(marque, document.createTextNode(""));
  }
  const ecrire = (noeud, valeur) => { if (noeud.data !== valeur) noeud.data = valeur; };
  // (une ligne vide garde sa hauteur grâce à un caractère invisible)
  ecrire(noeuds[0], texte ? texte.slice(0, trouves.length ? trouves[0].debut : texte.length) : "\u200b");
  for (let j = 0; 2 * j + 1 < noeuds.length; j++) {
    const marque = noeuds[2 * j + 1], n = trouves[j];
    if (n) {
      ecrire(marque.firstChild, texte.slice(n.debut, n.fin));
      const classe = n.fiches.every((f) => f.categorie === "lieu") ? "lieu" : "";
      if (marque.className !== classe) marque.className = classe;
      const ids = n.fiches.map((f) => f.id).join(" ");
      if (marque.dataset.fiches !== ids) marque.dataset.fiches = ids;
      ecrire(noeuds[2 * j + 2], texte.slice(n.fin, trouves[j + 1] ? trouves[j + 1].debut : texte.length));
    } else {
      ecrire(marque.firstChild, "");
      if (marque.className !== "vide") { marque.className = "vide"; delete marque.dataset.fiches; aNettoyer = true; }
      ecrire(noeuds[2 * j + 2], "");
    }
  }
  return ligne;
}

// Le calque prend exactement la place, la police et les marges de la zone de texte
// (sans sa barre de défilement : sinon les lignes ne seraient pas coupées au même endroit)
function copierStyles(zone) {
  const cs = getComputedStyle(zone);
  const place = [zone.offsetLeft + zone.clientLeft, zone.offsetTop + zone.clientTop, zone.clientWidth, zone.clientHeight];
  const styles = STYLES_COPIES.map((p) => cs[p]).join("|") + "|" + place.join("|");
  if (styles === derniersStyles) return;
  derniersStyles = styles;
  const calque = $("calque"), interieur = $("calque-texte");
  calque.style.left = place[0] + "px";
  calque.style.top = place[1] + "px";
  calque.style.width = place[2] + "px";
  calque.style.height = place[3] + "px";
  for (const p of STYLES_COPIES) interieur.style[p] = cs[p];
}

// Le calque défile avec le texte (et la bulle suit son nom)
function suivreDefilement() {
  if (!zoneSuivie) return;
  const calque = $("calque");
  calque.scrollTop = zoneSuivie.scrollTop;
  calque.scrollLeft = zoneSuivie.scrollLeft;
  if (bulleSur) placerBulle();
}

// =====================================================================
// La bulle : toucher un nom coloré propose d'ouvrir sa fiche
// =====================================================================

function surClic(e, zone) {
  cacherBulle();
  if (!actif || zone !== zoneSuivie || $("calque").hidden || zone.selectionStart !== zone.selectionEnd) return;
  const trouve = marqueSous(zone, e.clientX, e.clientY);
  if (!trouve) return;
  const ids = trouve.marque.dataset.fiches.split(" ").filter((id) => trouverFiche(id));
  if (!ids.length) return;
  if (e.ctrlKey || e.metaKey) { ouvrir(ids[0]); return; } // Ctrl+clic : la fiche s'ouvre tout de suite
  const bulle = $("bulle-noms");
  bulle.replaceChildren(...ids.map((id) => {
    const f = trouverFiche(id);
    return el("button", { type: "button", class: "bulle-fiche", "data-fiche": id, title: "Ouvrir la fiche" },
      el("span", { class: "bulle-categorie" }, CATEGORIES[f.categorie].nom),
      el("span", { class: "bulle-nom" }, f.titre || "Sans nom"),
      el("span", { "aria-hidden": "true" }, "›"),
    );
  }));
  bulle.hidden = false;
  bulleSur = trouve;
  placerBulle();
}

// Le nom coloré qui se trouve sous le point touché (dans la ligne où le curseur vient d'arriver)
function marqueSous(zone, x, y) {
  let numero = 0;
  for (let i = zone.value.indexOf("\n"); i >= 0 && i < zone.selectionStart; i = zone.value.indexOf("\n", i + 1)) numero++;
  const ligne = elements[numero];
  if (!ligne) return null;
  for (const marque of ligne.querySelectorAll("mark:not(.vide)")) {
    const rects = [...marque.getClientRects()];
    const r = rects.findIndex((b) => x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 2 && y <= b.bottom + 2);
    if (r >= 0) return { marque, morceau: r };
  }
  return null;
}

// La bulle se place juste sous le nom (ou au-dessus, s'il est tout en bas)
function placerBulle() {
  const bulle = $("bulle-noms");
  const { marque, morceau } = bulleSur;
  const rects = marque.isConnected ? [...marque.getClientRects()] : [];
  const r = rects[morceau] || rects[0];
  const boite = $("zone-ecriture").getBoundingClientRect();
  // Le nom est sorti de la zone visible (texte qui défile) : la bulle disparaît
  if (!r || r.bottom < boite.top || r.top > boite.bottom) { cacherBulle(); return; }
  const largeur = bulle.offsetWidth, hauteur = bulle.offsetHeight;
  let haut = r.bottom - boite.top + 6;
  if (haut + hauteur > boite.height - 8) haut = r.top - boite.top - hauteur - 6;
  bulle.style.top = Math.max(4, haut) + "px";
  bulle.style.left = Math.max(8, Math.min(r.left - boite.left, boite.width - largeur - 8)) + "px";
}

export function cacherBulle() {
  bulleSur = null;
  $("bulle-noms").hidden = true;
}

function ouvrir(id) {
  cacherBulle();
  // Écran moyen ou petit : le panneau est un volet, on l'ouvre
  if (getComputedStyle($("panneau")).position === "fixed") basculerVolet(true);
  ouvrirFiche(id, { focus: false });
}
