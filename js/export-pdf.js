// =====================================================================
// EXPORT PDF : une scène, un chapitre ou le roman entier, mis en page comme un livre
//
// On passe par l'impression du navigateur (choix « Enregistrer au format PDF ») :
// aucune dépendance, et cela fonctionne hors ligne. Le livre est construit dans
// un bloc invisible à l'écran (#impression) ; la mise en page est dans css/impression.css.
//
// Ce qui est exporté : uniquement le texte RÉDIGÉ (ni les notes, ni les fiches).
// Le seul nom qui apparaît est celui de SIGNATURE, ci-dessous.
// =====================================================================

import { el } from "./outils.js";
import * as db from "./db.js";
import { etat, chapitresTries, scenesDe, trouverScene, trouverChapitre } from "./etat.js";
import { ouvrirDialogue, informer } from "./dialogues.js";
import { relireMaintenant, revenirAuTexte } from "./editeur.js";

// La mention imprimée sur la page de titre et en pied de chaque page (le seul nom du PDF)
const SIGNATURE = "Réalisé par Ferrus Dantioch";

// Formats de page. « hauteurUtile » = hauteur de la page moins les marges (pour centrer la page de titre).
const FORMATS = {
  A5: { nom: "Livre (A5)", taille: "A5", marges: "20mm 18mm 22mm", hauteurUtile: "166mm", police: "10.5pt", hautChapitre: "28mm" },
  A4: { nom: "Page A4", taille: "A4", marges: "25mm 25mm 27mm", hauteurUtile: "243mm", police: "12pt", hautChapitre: "45mm" },
};

let pret = false;       // un livre est prêt à être imprimé
let fenetreOuverte = false; // la fenêtre « Exporter en PDF » est en train de s'ouvrir (évite d'en ouvrir deux)
let titreAvant = "";    // titre de l'onglet, remis après l'impression

const $ = (id) => document.getElementById(id);

// =====================================================================
// Mise en place
// =====================================================================

export function initialiserExportPdf() {
  $("bouton-pdf").addEventListener("click", ouvrirExport);

  // Ctrl+P dans la page d'écriture : notre export (au lieu d'imprimer l'écran tel quel)
  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== "p") return;
    if ($("vue-roman").hidden || !etat.roman) return;
    e.preventDefault();
    if (!document.querySelector("dialog[open]")) ouvrirExport();
  }, true);

  // Impression lancée par le menu du navigateur : on imprime le roman entier, au format livre
  window.addEventListener("beforeprint", () => {
    if (!pret && etat.roman && !$("vue-roman").hidden) preparer({ portee: "roman", format: "A5", pageDeTitre: true });
  });
  window.addEventListener("afterprint", nettoyer);
}

// =====================================================================
// La fenêtre « Exporter en PDF »
// =====================================================================

export async function ouvrirExport() {
  if (!etat.roman || fenetreOuverte) return;
  fenetreOuverte = true;
  try {
    await choisirEtExporter();
  } finally {
    fenetreOuverte = false;
  }
}

async function choisirEtExporter() {
  relireMaintenant(); // les toutes dernières frappes comptent
  const chapitres = chapitresTries();
  if (!chapitres.length) {
    informer("Rien à exporter : ce roman n'a pas encore de chapitre.");
    return;
  }
  const scene = trouverScene(etat.sceneId);
  const chapitreOuvert = scene ? scene.chapitreId : chapitres[0].id;
  const memo = (await db.lireReglage("export-pdf", {}).catch(() => null)) || {};
  const formatMemo = FORMATS[memo.format] ? memo.format : "A5";

  const radio = (nom, valeur, coche, ...libelle) =>
    el("label", { class: "option-export" },
      el("input", { type: "radio", name: nom, value: valeur, checked: coche }), el("span", {}, ...libelle));

  const choixChapitre = el("select", { name: "chapitre", "aria-label": "Chapitre à exporter",
    onchange: (e) => { e.target.form.elements.portee.value = "chapitre"; } },
  chapitres.map((c) => el("option", { value: c.id, selected: c.id === chapitreOuvert }, c.titre)));

  const choix = await ouvrirDialogue({
    titre: "Exporter en PDF",
    corps: [
      el("fieldset", { class: "groupe-export" },
        el("legend", { class: "etiquette" }, "Que faut-il exporter ?"),
        radio("portee", "roman", true, "Le roman entier"),
        el("div", { class: "option-export-chapitre" }, radio("portee", "chapitre", false, "Un chapitre :"), choixChapitre),
        scene ? radio("portee", "scene", false, "La scène ouverte : ", el("em", {}, scene.titre || "Sans titre")) : null,
      ),
      el("fieldset", { class: "groupe-export" },
        el("legend", { class: "etiquette" }, "Format"),
        Object.entries(FORMATS).map(([cle, f]) => radio("format", cle, cle === formatMemo, f.nom)),
      ),
      el("label", { class: "option-export" },
        el("input", { type: "checkbox", name: "pageDeTitre", checked: memo.pageDeTitre !== false }),
        el("span", {}, "Page de titre")),
      el("p", { class: "discret petit" },
        "Seul le texte rédigé est exporté (ni les notes, ni les fiches). Dans la fenêtre d'impression qui va s'ouvrir, "
        + "choisissez la destination « Enregistrer au format PDF »."),
    ],
    ok: "Préparer le PDF",
    lireFormulaire: (form) => ({
      portee: form.elements.portee.value,
      chapitreId: form.elements.chapitre.value,
      format: form.elements.format.value,
      pageDeTitre: form.elements.pageDeTitre.checked,
    }),
  });
  if (!choix) return;
  db.ecrireReglage("export-pdf", { format: choix.format, pageDeTitre: choix.pageDeTitre }).catch(() => {});
  if (!preparer(choix)) return;
  await imprimer();
}

// =====================================================================
// Construction du livre
// =====================================================================

// Prépare le livre dans #impression. Renvoie false s'il n'y a rien à exporter.
export function preparer({ portee, chapitreId, format = "A5", pageDeTitre = true }) {
  relireMaintenant();
  const f = FORMATS[format] || FORMATS.A5;

  // 1. Ce qu'on exporte : des chapitres, chacun avec ses scènes
  let parties, sousTitre = null;
  if (portee === "scene") {
    const s = trouverScene(etat.sceneId);
    const c = s && trouverChapitre(s.chapitreId);
    if (!s || !c) return false;
    parties = [{ chapitre: c, scenes: [s] }];
    sousTitre = `${c.titre} — ${s.titre || "Sans titre"}`;
  } else if (portee === "chapitre") {
    const c = trouverChapitre(chapitreId);
    if (!c) return false;
    parties = [{ chapitre: c, scenes: scenesDe(c.id) }];
    sousTitre = c.titre;
  } else {
    parties = chapitresTries().map((c) => ({ chapitre: c, scenes: scenesDe(c.id) }));
  }

  // 2. Chaque chapitre devient une suite de paragraphes ; les scènes vides sont ignorées
  const chapitres = parties
    .map(({ chapitre, scenes }) => ({ chapitre, blocs: blocsDuChapitre(scenes) }))
    .filter((c) => c.blocs.length);
  if (!chapitres.length) {
    informer("Rien à exporter : le texte rédigé est vide (les notes ne sont jamais exportées).");
    return false;
  }

  // 3. Le livre
  const livre = chapitres.map(({ chapitre, blocs }) =>
    el("section", { class: "livre-chapitre" },
      el("h2", { class: "livre-titre-chapitre" }, typographie(chapitre.titre)),
      blocs));
  if (pageDeTitre) livre.unshift(pageTitre(sousTitre));
  $("impression").replaceChildren(...livre);
  styleDePage(f, pageDeTitre);
  document.documentElement.classList.add("impression-livre");
  // Le titre de l'onglet devient le nom proposé pour le fichier PDF
  if (!pret) titreAvant = document.title;
  document.title = etat.roman.titre + (sousTitre ? " — " + sousTitre : "");
  pret = true;
  return true;
}

// Lance l'impression, une fois les polices (italique, gras) bien chargées
async function imprimer() {
  try {
    await Promise.all(["400 1em Literata", "italic 400 1em Literata", "600 1em Literata", "italic 700 1em Literata"]
      .map((p) => document.fonts.load(p)));
    await document.fonts.ready;
  } catch { /* tant pis : le navigateur utilisera une police de remplacement */ }
  window.print();
}

// Après l'impression : on vide le livre et tout redevient comme avant
function nettoyer() {
  if (!pret) return;
  pret = false;
  $("impression").replaceChildren();
  const style = $("style-page-livre");
  if (style) style.remove(); // une impression ordinaire, plus tard, ne garde pas le format du livre
  document.documentElement.classList.remove("impression-livre");
  document.title = titreAvant;
  revenirAuTexte();
}

function pageTitre(sousTitre) {
  return el("section", { class: "livre-page-titre" },
    el("h1", { class: "livre-titre" }, typographie(etat.roman.titre)),
    sousTitre ? el("p", { class: "livre-sous-titre" }, typographie(sousTitre)) : null,
    el("hr", { class: "livre-filet" }),
    el("p", { class: "livre-signature" }, SIGNATURE),
  );
}

// Règles de page (format, marges, numéro de page, mention en pied de page)
function styleDePage(f, pageDeTitre) {
  let style = $("style-page-livre");
  if (!style) {
    style = el("style", { id: "style-page-livre" });
    document.head.append(style);
  }
  const pied = `font: italic 7pt "Literata", Georgia, serif; color: #555;`;
  style.textContent = `
@media print {
  @page {
    size: ${f.taille};
    margin: ${f.marges};
    @bottom-center { content: counter(page); font: 9pt "Literata", Georgia, serif; color: #000; }
    @bottom-right { content: "${SIGNATURE}"; ${pied} }
  }
  ${pageDeTitre ? "@page :first { @bottom-center { content: none; } @bottom-right { content: none; } }" : ""}
  html.impression-livre {
    --livre-police: ${f.police};
    --livre-hauteur: ${f.hauteurUtile};
    --livre-haut-chapitre: ${f.hautChapitre};
  }
}`;
}

// =====================================================================
// Du texte de l'éditeur aux paragraphes du livre
// =====================================================================

// Une ligne « * * * » (ou « *** », « ⁂ ») = séparateur de scène
function estSeparateur(ligne) {
  return /^(\*\s*){3}$/.test(ligne) || ligne === "⁂";
}

// Les paragraphes d'un chapitre. Entre deux scènes, un séparateur « * * * »
// (sauf si le texte en a déjà un à cet endroit). Jamais de séparateur au début ou à la fin.
function blocsDuChapitre(scenes) {
  const lignes = [];
  for (const s of scenes) {
    const texte = (s.texte || "").trim();
    if (!texte) continue;
    if (lignes.length) lignes.push("* * *");
    lignes.push(...texte.split("\n"));
  }
  const blocs = [];
  let separateurEnAttente = false;
  for (const brute of lignes) {
    const ligne = brute.trim();
    if (!ligne) continue; // les lignes vides ne servent qu'à aérer l'écriture
    if (estSeparateur(ligne)) { separateurEnAttente = blocs.length > 0; continue; }
    if (separateurEnAttente) blocs.push(el("p", { class: "livre-separateur", "aria-label": "Changement de scène" }, "*\u2003*\u2003*"));
    separateurEnAttente = false;
    blocs.push(el("p", {}, enLigne(typographie(ligne))));
  }
  return blocs;
}

// Espaces insécables de la typographie française (le texte enregistré, lui, n'est pas modifié) :
// pas de « ? » ou de « » » seul en début de ligne.
// Et l'apostrophe droite entre deux lettres devient typographique (l'homme → l’homme).
function typographie(t) {
  return t
    .replace(/(\p{L})'(?=\p{L})/gu, "$1\u2019")
    .replace(/ +([:;!?»])/g, "\u00A0$1")
    .replace(/« +/g, "«\u00A0")
    .replace(/^([—–]) +/, "$1\u00A0")
    .replace(/ +([—–]) /g, "\u00A0$1 ");
}

// *italique*, **gras**, ***les deux*** → mise en forme. Une étoile isolée reste telle quelle.
function enLigne(texte) {
  const motif = /\*\*\*(?=\S)(.+?)(?<=\S)\*\*\*|\*\*(?=\S)(.+?)(?<=\S)\*\*|\*(?=[^\s*])((?:\*\*.+?\*\*|[^*])+?)(?<=\S)\*/;
  const r = motif.exec(texte);
  if (!r) return texte ? [texte] : [];
  const avant = texte.slice(0, r.index);
  const apres = texte.slice(r.index + r[0].length);
  let forme;
  if (r[1] !== undefined) forme = el("strong", {}, el("em", {}, enLigne(r[1])));
  else if (r[2] !== undefined) forme = el("strong", {}, enLigne(r[2]));
  else forme = el("em", {}, enLigne(r[3]));
  return [...(avant ? [avant] : []), forme, ...enLigne(apres)];
}
