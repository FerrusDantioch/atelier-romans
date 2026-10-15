// =====================================================================
// FICHES REPÉRÉES DANS LE TEXTE
// Pendant l'écriture, le panneau montre les personnages et les lieux des fiches
// qui sont nommés dans la scène ouverte (notes et texte rédigé), dans l'ordre où
// ils apparaissent. Un clic (ou un toucher) ouvre la fiche ; le curseur reste dans le texte.
//
// Une fiche est repérée par :
//   - son nom complet (« Mère Corbeau », « mère corbeau » : majuscules et accents ignorés) ;
//   - l'un de ses « Autres noms » (surnoms, séparés par des virgules) ;
//   - un mot de son nom écrit avec une majuscule (« Corbeau »), sauf les mots courants
//     comme « Mère », « Taverne » ou « Grand », que plusieurs fiches pourraient partager.
// Un nom d'un seul mot doit commencer par une majuscule dans le texte :
// « Corbeau » repère Mère Corbeau, « un corbeau » non.
// =====================================================================

import { el } from "./outils.js";
import { etat, ecouter } from "./etat.js";
import { CATEGORIES, ouvrirFiche } from "./panneau.js";

const CATEGORIES_REPEREES = ["principal", "pnj", "lieu"];
const DELAI = 500; // on relit le texte un instant après la dernière touche, pas à chaque touche
const SEPARATEURS = /[^\p{L}\p{N}]+/u; // ce qui sépare deux mots

// Mots qui ne suffisent pas à repérer une fiche (sans accents, en minuscules)
const MOTS_COMMUNS = new Set(`
  les des aux une sur sous dans pour par avec sans chez entre vers the
  mere pere frere soeur sœur oncle tante cousin cousine fils fille veuve dame sire sieur messire seigneur
  maitre maitresse docteur doc professeur capitaine commandant lieutenant sergent caporal colonel general
  amiral major agent inspecteur inspectrice commissaire detective juge roi reine prince princesse duc duchesse
  comte comtesse baron baronne marquis marquise chevalier lord lady sir saint sainte monsieur madame mademoiselle
  don dona dom pretre pretresse abbe eveque mage sorcier sorciere chef patron patronne
  ville cite rue place avenue boulevard quartier tour tours chateau palais temple eglise cathedrale chapelle
  taverne auberge bar club port station base vaisseau planete lune mont montagne montagnes lac foret bois
  riviere fleuve ile desert plaine vallee village hameau royaume empire republique maison manoir hotel hopital
  ecole academie universite prison marche pont porte jardin parc cimetiere mine mines grotte caverne
  bibliotheque musee bureau tribunal commissariat secteur zone niveau etage salle entrepot usine laboratoire
  grand grande petit petite vieux vieil vieille nouveau nouvel nouvelle ancien ancienne haut haute bas basse
  noir noire blanc blanche rouge bleu bleue vert verte gris grise dore doree sombre sacre sacree
`.trim().split(/\s+/));

let minuterie = null;
let dernierAffichage = "";       // pour ne pas redessiner quand rien n'a changé
const memoire = new Map();       // motifs déjà préparés : fiche.id → { cle, motifs }

const $ = (id) => document.getElementById(id);

export function initialiserReperage() {
  for (const id of ["texte-notes", "texte-redige"]) $(id).addEventListener("input", () => planifier(DELAI));
  // (juste après l'affichage de la scène, pour ne pas le retarder)
  ecouter("scene-affichee", () => planifier(30));
  ecouter("fiches-changees", () => planifier(30));

  const zone = $("reperees");
  // Un clic sur une pastille ne « vole » pas le curseur au texte
  zone.addEventListener("mousedown", (e) => { if (e.target.closest("button")) e.preventDefault(); });
  zone.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fiche]");
    if (!b) return;
    // Au clavier (la pastille a le focus), on suit la fiche ; à la souris ou au doigt, on reste dans le texte
    ouvrirFiche(b.dataset.fiche, { focus: document.activeElement === b });
  });
}

function planifier(delai) {
  clearTimeout(minuterie);
  minuterie = setTimeout(majReperage, delai);
}

// Met à jour la liste « Dans cette scène » (et le nombre sur le bouton « Fiches »)
export function majReperage() {
  clearTimeout(minuterie);
  const zone = $("reperees");
  const fiches = etat.roman ? etat.fiches.filter(estReperable) : [];
  if (!etat.sceneId || !fiches.length) {
    zone.hidden = true;
    dernierAffichage = "";
    majBouton(0);
    return;
  }
  const texte = $("texte-notes").value + "\n" + $("texte-redige").value;
  const trouvees = fichesNommees(texte, fiches);
  majBouton(trouvees.length);
  const affichage = trouvees.map((f) => f.id + "\u0001" + f.titre).join("\u0002") || "aucune";
  if (!zone.hidden && affichage === dernierAffichage) return;
  dernierAffichage = affichage;
  zone.hidden = false;
  zone.replaceChildren(
    el("p", { class: "etiquette" }, "Dans cette scène"),
    trouvees.length
      ? el("div", { class: "pastilles" }, trouvees.map((f) => el("button", {
          type: "button", class: "pastille", "data-fiche": f.id,
          title: CATEGORIES[f.categorie].nom + (f.type ? " · " + f.type : ""),
        }, f.titre)))
      : el("p", { class: "discret petit" }, "Aucun personnage ni lieu de vos fiches n'est nommé ici."),
  );
}

// Le bouton « Fiches » (écrans moyens et petits) indique combien de fiches sont nommées
function majBouton(nombre) {
  const b = $("bouton-fiches");
  b.textContent = nombre ? `Fiches (${nombre})` : "Fiches";
  b.setAttribute("aria-label", nombre ? `Fiches : ${nombre} nommée${nombre > 1 ? "s" : ""} dans cette scène` : "Fiches");
}

// Une fiche sans vrai nom (« Nouveau PNJ », pas encore renommée) n'est pas cherchée
function estReperable(f) {
  return CATEGORIES_REPEREES.includes(f.categorie) && (f.titre || "").trim() !== ""
    && f.titre.trim() !== CATEGORIES[f.categorie].nouveau;
}

// =====================================================================
// La recherche des noms (sans affichage : utilisable et testable seule)
// =====================================================================

// Les fiches nommées dans le texte, dans l'ordre de leur première apparition
export function fichesNommees(texte, fiches) {
  const t = sansAccents(texte);
  const mots = new Set(t.toLowerCase().split(SEPARATEURS)); // les mots du texte, pour écarter vite les noms absents
  return fiches
    .map((fiche) => ({ fiche, position: premierePosition(t, mots, motifsDe(fiche)) }))
    .filter((x) => x.position >= 0)
    .sort((a, b) => a.position - b.position)
    .map((x) => x.fiche);
}

// Les noms qui repèrent une fiche
export function nomsDe(fiche) {
  const titre = propre(fiche.titre);
  const autres = (fiche.champs?.autresNoms || "").split(/[,;\n]/).map(propre).filter(Boolean);
  const noms = new Set([titre, ...autres].filter(Boolean));
  // Les mots du nom (« Corbeau » pour « Mère Corbeau », « Archiviste » pour « L'Archiviste »),
  // sauf les mots courants
  if (/[\s']/.test(titre)) {
    for (const mot of titre.split(/[\s']+/)) {
      const simple = sansAccents(mot).toLowerCase();
      if (/^\p{Lu}/u.test(mot) && simple.length >= 3 && !MOTS_COMMUNS.has(simple)) noms.add(mot);
    }
  }
  return [...noms];
}

function motifsDe(fiche) {
  const cle = fiche.titre + "\n" + (fiche.champs?.autresNoms || "");
  const deja = memoire.get(fiche.id);
  if (deja && deja.cle === cle) return deja.motifs;
  // Pour chaque nom : son motif, et son mot le plus long (s'il manque au texte, inutile de chercher)
  const motifs = nomsDe(fiche).map((nom) => ({
    re: motif(nom),
    indice: sansAccents(nom).toLowerCase().split(SEPARATEURS).reduce((a, b) => (b.length > a.length ? b : a), ""),
  }));
  memoire.set(fiche.id, { cle, motifs });
  return motifs;
}

function premierePosition(texte, mots, motifs) {
  let premiere = -1;
  for (const m of motifs) {
    if (m.indice && !mots.has(m.indice)) continue;
    const position = motEntier(texte, m.re);
    if (position >= 0 && (premiere < 0 || position < premiere)) premiere = position;
  }
  return premiere;
}

// Première apparition en mot entier (« Elara » ne compte pas dans « Elaran »)
const LETTRE = /[\p{L}\p{N}]/u;
function motEntier(texte, re) {
  re.lastIndex = 0;
  for (let r; (r = re.exec(texte));) {
    const avant = texte[r.index - 1], apres = texte[r.index + r[0].length];
    if (!(avant && LETTRE.test(avant)) && !(apres && LETTRE.test(apres))) return r.index;
    re.lastIndex = r.index + 1;
  }
  return -1;
}

// Un nom → un motif de recherche : majuscules indifférentes,
// sauf la première lettre d'un nom d'un seul mot (qui doit être une majuscule).
// (Motif volontairement simple : il y en a plusieurs par fiche, il doit se préparer vite.)
function motif(nom) {
  const mots = sansAccents(nom).split(/\s+/);
  const seul = mots.length === 1;
  const corps = mots
    .map((mot) => [...mot].map((c, i) => (seul && i === 0 ? majuscule(c) : insensible(c))).join(""))
    .join("\\s+");
  return new RegExp(corps, "g");
}

function insensible(c) {
  const bas = c.toLowerCase(), haut = c.toUpperCase();
  return bas !== haut && bas.length === 1 && haut.length === 1 ? `[${bas}${haut}]` : echapper(c);
}

function majuscule(c) {
  const haut = c.toUpperCase();
  return haut.length === 1 ? echapper(haut) : echapper(c);
}

function echapper(c) {
  return c.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&");
}

// Sans accents (é → e), apostrophes unifiées
function sansAccents(t) {
  return (t || "").normalize("NFD").replace(/\p{M}/gu, "").replace(/[’‘ʼ]/g, "'");
}

function propre(t) {
  return (t || "").replace(/[’‘ʼ]/g, "'").replace(/\s+/g, " ").trim();
}
