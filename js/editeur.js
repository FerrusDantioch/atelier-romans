// =====================================================================
// ÉDITEUR : la zone d'écriture d'une scène
// - deux modes : Notes (fragments, puces) et Rédigé (le texte du roman)
// - mise en forme légère : *italique*, **gras**, séparateur * * *
// - sauvegarde automatique + copie de secours instantanée
// - compteurs de mots, objectif de session, mode concentration
//
// Pourquoi une simple zone de texte (<textarea>) ? C'est l'outil le plus
// fiable pour un long texte : le navigateur gère seul le curseur, le
// copier-coller, le correcteur et l'annulation (Ctrl+Z).
// =====================================================================

import * as db from "./db.js";
import { el, nombre, pluriel, dateFichier } from "./outils.js";
import { ouvrirDialogue, informer } from "./dialogues.js";
import {
  etat, trouverScene, scenesDansLOrdre, recompterScene, motsScene, motsChapitre, motsRoman, ecouter,
} from "./etat.js";
import { afficherPlan, majComptes, marquerActive, ajouterChapitre } from "./plan.js";

// Les deux zones de texte : une par mode (chacune garde son curseur et son « Ctrl+Z »)
const zones = {};
// Nom du champ enregistré pour chaque mode
const CHAMP = { notes: "notes", redige: "texte" };
// Préfixe des copies de secours (dans le « localStorage » du navigateur)
const PREFIXE_SECOURS = "atelier-secours:";
// Délai avant l'enregistrement dans la base (en millisecondes)
const DELAI_SAUVEGARDE = 500;
// Délai maximal avant la copie de secours (en millisecondes)
const DELAI_SECOURS = 300;
const OBJECTIF_PAR_DEFAUT = 500;

let scene = null;          // la scène ouverte
let modifiee = false;      // true = des changements ne sont pas encore dans la base
let minuterieSauvegarde = null;
let minuterieCompteurs = null;
let minuterieSecours = null;
const aRelire = new Set();  // modes dont le texte a changé depuis la dernière relecture
let session = null;        // { jour, motsDepart }
const curseurs = new Map(); // position du curseur de chaque scène déjà ouverte

const $ = (id) => document.getElementById(id);

// =====================================================================
// Mise en place
// =====================================================================

export function initialiserEditeur() {
  zones.notes = $("texte-notes");
  zones.redige = $("texte-redige");

  for (const [mode, zone] of Object.entries(zones)) {
    zone.addEventListener("input", () => {
      if (!scene) return;
      aRelire.add(mode);   // le texte sera relu plus tard (relire un long texte à chaque touche ralentirait)
      marquerModifiee();
    });
    zone.addEventListener("keydown", (e) => raccourcisDansLeTexte(e, mode));
  }

  // Les boutons de la barre d'outils ne « volent » pas le curseur au texte
  $("barre-outils").addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) e.preventDefault();
  });
  document.querySelectorAll("#barre-outils [data-mode]").forEach((b) =>
    b.addEventListener("click", () => changerMode(b.dataset.mode)));
  document.querySelectorAll("#barre-outils [data-format]").forEach((b) =>
    b.addEventListener("click", () => formater(b.dataset.format)));
  $("bouton-concentration").addEventListener("click", () => basculerConcentration());
  $("sortie-concentration").addEventListener("click", () => basculerConcentration(false));

  // Titre de la scène, modifiable directement
  const titre = $("titre-scene");
  titre.addEventListener("input", () => {
    if (!scene) return;
    scene.titre = titre.value;
    const etiquette = document.querySelector(`.plan-scene[data-id="${CSS.escape(scene.id)}"] .plan-titre`);
    if (etiquette) etiquette.textContent = titre.value || "Sans titre";
    marquerModifiee();
  });
  titre.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); zoneActive().focus(); }
  });

  // Session d'écriture
  $("bouton-objectif").addEventListener("click", changerObjectif);
  $("bouton-nouvelle-session").addEventListener("click", () => demarrerSession({ forcer: true }));
  $("bouton-premier-chapitre").addEventListener("click", ajouterChapitre);

  // Raccourcis clavier valables partout dans la page d'écriture
  document.addEventListener("keydown", raccourcisGeneraux);

  // Annonces venant du plan
  ecouter("ouvrir-scene", ouvrirScene);
  ecouter("scene-creee", () => { $("titre-scene").focus(); $("titre-scene").select(); });
  ecouter("scene-renommee", (id) => { if (scene && scene.id === id) $("titre-scene").value = scene.titre; });
  ecouter("scene-supprimee", surSuppression);
  ecouter("plan-change", majCompteurs);

  // Filet de sécurité : on enregistre dès que la page est cachée ou fermée
  // (la copie de secours est écrite immédiatement : elle survit même si l'onglet se ferme)
  const filetDeSecurite = () => { ecrireSecoursMaintenant(); sauverMaintenant(); };
  document.addEventListener("visibilitychange", () => { if (document.hidden) filetDeSecurite(); });
  window.addEventListener("pagehide", filetDeSecurite);
}

// Prépare l'éditeur pour le roman qui vient d'être chargé
export async function preparerEditeur() {
  scene = null;
  modifiee = false;
  curseurs.clear();
  await demarrerSession();
  const derniere = await db.lireReglage("derniereScene:" + etat.roman.id);
  const cible = trouverScene(derniere) ? derniere : scenesDansLOrdre()[0]?.id;
  if (cible) await ouvrirScene(cible);
  else afficherAucuneScene();
}

// Quand on quitte la page d'écriture
export async function fermerEditeur() {
  await sauverMaintenant();
  basculerConcentration(false);
  scene = null;
}

// Remet le curseur dans le texte, exactement où il était (utilisé par le panneau et la recherche)
export function revenirAuTexte() {
  if (scene && !$("vue-roman").hidden) zoneActive().focus({ preventScroll: true });
}

function zoneActive() {
  return scene && scene.mode === "redige" ? zones.redige : zones.notes;
}

// =====================================================================
// Ouvrir une scène
// =====================================================================

async function ouvrirScene(id) {
  await sauverMaintenant();       // on enregistre d'abord la scène précédente
  memoriserCurseur();
  const cible = trouverScene(id);
  if (!cible) { afficherAucuneScene(); return; }

  scene = cible;
  etat.sceneId = id;
  modifiee = false;
  zones.notes.value = scene.notes || "";
  zones.redige.value = scene.texte || "";
  $("titre-scene").value = scene.titre || "";
  $("editeur-vide").hidden = true;
  $("editeur-plein").hidden = false;
  appliquerMode(scene.mode === "redige" ? "redige" : "notes");
  restaurerCurseur();
  majCompteurs();
  marquerActive(id);
  indiquerEnregistrement("enregistre");
  db.ecrireReglage("derniereScene:" + etat.roman.id, id);
}

function afficherAucuneScene() {
  scene = null;
  etat.sceneId = null;
  $("editeur-vide").hidden = false;
  $("editeur-plein").hidden = true;
  majCompteurs();
}

// Une scène vient d'être supprimée : si c'était la scène ouverte, on en ouvre une autre
async function surSuppression() {
  if (scene && !trouverScene(scene.id)) {
    effacerSecours(scene.id);
    scene = null;
    modifiee = false;
    const premiere = scenesDansLOrdre()[0];
    if (premiere) await ouvrirScene(premiere.id);
    else afficherAucuneScene();
  }
  majCompteurs();
}

// Retient où était le curseur dans chaque mode, pour y revenir plus tard
function memoriserCurseur() {
  if (!scene) return;
  const position = (z) => ({ debut: z.selectionStart, fin: z.selectionEnd, defilement: z.scrollTop });
  curseurs.set(scene.id, { notes: position(zones.notes), redige: position(zones.redige) });
}
function restaurerCurseur() {
  const memo = curseurs.get(scene.id);
  for (const [mode, zone] of Object.entries(zones)) {
    if (memo) {
      zone.setSelectionRange(memo[mode].debut, memo[mode].fin);
      zone.scrollTop = memo[mode].defilement;
    } else {
      // Première ouverture : curseur à la fin, là où l'on reprend l'écriture
      zone.setSelectionRange(zone.value.length, zone.value.length);
      zone.scrollTop = zone.scrollHeight;
    }
  }
  zoneActive().focus({ preventScroll: true });
}

// =====================================================================
// Modes Notes / Rédigé
// =====================================================================

function changerMode(mode) {
  if (!scene || scene.mode === mode) { if (scene) zoneActive().focus(); return; }
  scene.mode = mode;
  marquerModifiee();
  appliquerMode(mode);
  zoneActive().focus();
  afficherPlan(); // met à jour la petite mention « notes » dans le plan
}

function appliquerMode(mode) {
  zones.notes.hidden = mode !== "notes";
  zones.redige.hidden = mode !== "redige";
  document.querySelectorAll("#barre-outils [data-mode]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  $("vue-roman").dataset.mode = mode; // sert au style (ex. bouton « puce » visible en mode Notes)
}

// =====================================================================
// Mise en forme (*italique*, **gras**, séparateur, puces)
// =====================================================================

// Insère du texte à la place de la sélection, en gardant l'historique « Ctrl+Z »
function inserer(zone, texte) {
  zone.focus();
  const ok = texte === ""
    ? document.execCommand("delete")
    : document.execCommand("insertText", false, texte);
  if (!ok) {
    // Solution de repli pour les navigateurs qui refusent execCommand
    zone.setRangeText(texte, zone.selectionStart, zone.selectionEnd, "end");
    zone.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Compte les étoiles collées juste avant et juste après la sélection
function etoilesAutour(zone) {
  const v = zone.value;
  let avant = 0, apres = 0;
  while (v[zone.selectionStart - 1 - avant] === "*") avant++;
  while (v[zone.selectionEnd + apres] === "*") apres++;
  return Math.min(avant, apres);
}

// Entoure la sélection de symboles (ou les retire s'ils y sont déjà)
function entourer(zone, symbole) {
  const debut = zone.selectionStart, fin = zone.selectionEnd;
  const choisi = zone.value.slice(debut, fin);
  const n = etoilesAutour(zone);
  const dejaLa = symbole === "*" ? (n === 1 || n === 3) : n >= 2;
  const L = symbole.length;
  if (dejaLa) {
    zone.setSelectionRange(debut - L, fin + L);
    inserer(zone, choisi);
    zone.setSelectionRange(debut - L, fin - L);
  } else {
    inserer(zone, symbole + choisi + symbole);
    zone.setSelectionRange(debut + L, fin + L); // garde le mot sélectionné (ou le curseur entre les symboles)
  }
}

// Insère le séparateur de scène « * * * » sur sa propre ligne, entouré de lignes vides
function insererSeparateur(zone) {
  const avant = zone.value.slice(0, zone.selectionStart);
  const prefixe = avant === "" || avant.endsWith("\n\n") ? "" : avant.endsWith("\n") ? "\n" : "\n\n";
  inserer(zone, prefixe + "* * *\n\n");
}

// Ajoute (ou retire) une puce « - » au début de la ligne du curseur
function basculerPuce(zone) {
  const debutLigne = zone.value.lastIndexOf("\n", zone.selectionStart - 1) + 1;
  const curseur = zone.selectionStart;
  if (zone.value.startsWith("- ", debutLigne)) {
    zone.setSelectionRange(debutLigne, debutLigne + 2);
    inserer(zone, "");
    zone.setSelectionRange(Math.max(debutLigne, curseur - 2), Math.max(debutLigne, curseur - 2));
  } else {
    zone.setSelectionRange(debutLigne, debutLigne);
    inserer(zone, "- ");
    zone.setSelectionRange(curseur + 2, curseur + 2);
  }
}

function formater(type) {
  if (!scene) return;
  const zone = zoneActive();
  zone.focus();
  if (type === "italique") entourer(zone, "*");
  else if (type === "gras") entourer(zone, "**");
  else if (type === "separateur") insererSeparateur(zone);
  else if (type === "puce") basculerPuce(zone);
}

// Raccourcis à l'intérieur de la zone de texte
function raccourcisDansLeTexte(e, mode) {
  const zone = zones[mode];
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && !e.shiftKey && !e.altKey) {
    const touche = e.key.toLowerCase();
    if (touche === "i") { e.preventDefault(); entourer(zone, "*"); return; }
    if (touche === "b") { e.preventDefault(); entourer(zone, "**"); return; }
  }
  // Mode Notes : « Entrée » sur une ligne à puce crée une nouvelle puce
  if (mode === "notes" && e.key === "Enter" && !ctrl && !e.shiftKey && !e.altKey && !e.isComposing
      && zone.selectionStart === zone.selectionEnd) {
    const debutLigne = zone.value.lastIndexOf("\n", zone.selectionStart - 1) + 1;
    const ligne = zone.value.slice(debutLigne, zone.selectionStart);
    const puce = ligne.match(/^(\s*)([-•])\s(.*)$/);
    if (!puce) return;
    e.preventDefault();
    if (puce[3].trim() === "") {
      // Puce vide + Entrée : on retire la puce (fin de la liste)
      zone.setSelectionRange(debutLigne, zone.selectionStart);
      inserer(zone, "");
    } else {
      inserer(zone, "\n" + puce[1] + puce[2] + " ");
    }
  }
}

// Raccourcis valables dans toute la page d'écriture
function raccourcisGeneraux(e) {
  if ($("vue-roman").hidden) return;
  const ctrl = e.ctrlKey || e.metaKey;
  const dialogueOuvert = !!document.querySelector("dialog[open]");
  // Ctrl+Maj+F : mode concentration
  if (ctrl && e.shiftKey && e.key.toLowerCase() === "f" && !dialogueOuvert) {
    e.preventDefault();
    basculerConcentration();
  // Échap : quitter la concentration
  } else if (e.key === "Escape" && document.body.classList.contains("concentration") && !dialogueOuvert) {
    e.preventDefault();
    basculerConcentration(false);
  // Ctrl+S : par habitude… on enregistre (c'est déjà automatique)
  } else if (ctrl && !e.shiftKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    sauverMaintenant().then(() => informer("Enregistré. (L'enregistrement est automatique : pas besoin de Ctrl+S.)"));
  }
}

// =====================================================================
// Mode concentration : seul le texte reste visible
// =====================================================================

function basculerConcentration(forcer) {
  const actif = document.body.classList.toggle("concentration", forcer);
  if (scene) zoneActive().focus({ preventScroll: true });
  $("bouton-concentration").setAttribute("aria-pressed", String(actif));
}

// =====================================================================
// Enregistrement automatique
// =====================================================================

// Recopie le contenu des zones de texte modifiées dans la scène
function relire() {
  if (!scene) return;
  for (const mode of aRelire) scene[CHAMP[mode]] = zones[mode].value;
  aRelire.clear();
}

function marquerModifiee() {
  scene.modifie = Date.now();
  modifiee = true;
  // Copie de secours au plus toutes les 0,3 s (et tout de suite si l'onglet se ferme)
  if (!minuterieSecours) minuterieSecours = setTimeout(ecrireSecoursMaintenant, DELAI_SECOURS);
  indiquerEnregistrement("en-cours");
  clearTimeout(minuterieSauvegarde);
  minuterieSauvegarde = setTimeout(sauverMaintenant, DELAI_SAUVEGARDE);
  clearTimeout(minuterieCompteurs);
  minuterieCompteurs = setTimeout(majCompteurs, 250);
}

// Enregistre tout de suite dans la base (si quelque chose a changé)
export async function sauverMaintenant() {
  clearTimeout(minuterieSauvegarde);
  if (!scene || !modifiee) return;
  const objet = scene;
  if (!trouverScene(objet.id)) { modifiee = false; return; } // scène supprimée entre-temps
  modifiee = false;
  relire();
  const copie = { ...objet };
  etat.roman.modifie = copie.modifie;
  try {
    await db.lot({ ecrire: { scenes: [copie], romans: [etat.roman] } });
    // Plus besoin de la copie de secours… sauf si l'on a retapé quelque chose entre-temps
    if (!(scene === objet && modifiee)) {
      clearTimeout(minuterieSecours);
      minuterieSecours = null;
      effacerSecours(copie.id);
      indiquerEnregistrement("enregistre");
    }
  } catch (erreur) {
    if (scene === objet) modifiee = true;
    indiquerEnregistrement("erreur");
    informer("L'enregistrement a échoué : " + erreur.message + ". Votre texte est gardé en secours.", { erreur: true });
  }
}

function indiquerEnregistrement(etatEnr) {
  const zone = $("etat-enregistrement");
  if (zone.dataset.etat === etatEnr) return; // rien à changer : on évite de redessiner à chaque touche
  zone.dataset.etat = etatEnr;
  zone.textContent = { "en-cours": "Enregistrement…", enregistre: "Enregistré ✓", erreur: "Non enregistré !" }[etatEnr];
}

// ---------- Copie de secours (localStorage : une écriture instantanée, qui survit à la fermeture) ----------

function ecrireSecoursMaintenant() {
  clearTimeout(minuterieSecours);
  minuterieSecours = null;
  if (!scene || !modifiee) return;
  relire();
  try {
    localStorage.setItem(PREFIXE_SECOURS + scene.id, JSON.stringify({
      sceneId: scene.id, titre: scene.titre, notes: scene.notes, texte: scene.texte, mode: scene.mode, t: scene.modifie,
    }));
  } catch {
    // Mémoire de secours pleine ou indisponible : l'enregistrement normal continue
  }
}
function effacerSecours(id) {
  try { localStorage.removeItem(PREFIXE_SECOURS + id); } catch { /* rien */ }
}
function clesSecours() {
  const cles = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.startsWith(PREFIXE_SECOURS)) cles.push(cle);
    }
  } catch { /* localStorage indisponible */ }
  return cles;
}

// Au démarrage : récupère les frappes qui n'avaient pas eu le temps d'être enregistrées
// (onglet fermé en pleine phrase, panne de courant…)
export async function recupererSecours() {
  let recuperees = 0;
  for (const cle of clesSecours()) {
    try {
      const secours = JSON.parse(localStorage.getItem(cle));
      const enBase = await db.lire("scenes", secours.sceneId);
      const differente = enBase && (enBase.texte !== secours.texte || enBase.notes !== secours.notes
        || enBase.titre !== secours.titre || enBase.mode !== secours.mode);
      // On ne récupère que si la copie de secours est plus récente que la base
      if (differente && (enBase.modifie || 0) <= secours.t) {
        await db.ecrire("scenes", {
          ...enBase, titre: secours.titre, notes: secours.notes, texte: secours.texte, mode: secours.mode, modifie: secours.t,
        });
        recuperees++;
      }
    } catch { /* copie illisible : ignorée */ }
    try { localStorage.removeItem(cle); } catch { /* rien */ }
  }
  if (recuperees) informer(`Texte récupéré : ${pluriel(recuperees, "scène")} n'avai${recuperees > 1 ? "en" : ""}t pas fini d'être enregistrée${recuperees > 1 ? "s" : ""}.`);
}

// Après un import, les anciennes copies de secours n'ont plus de sens
export function effacerTousLesSecours() {
  for (const cle of clesSecours()) {
    try { localStorage.removeItem(cle); } catch { /* rien */ }
  }
}

// =====================================================================
// Compteurs de mots et objectif de session
// =====================================================================

function majCompteurs() {
  if (!etat.roman) return;
  relire();
  if (scene) {
    recompterScene(scene.id);
    $("mots-scene").textContent = nombre(motsScene(scene.id));
    $("mots-chapitre").textContent = nombre(motsChapitre(scene.chapitreId));
    majComptes(scene.id);
  }
  $("mots-roman").textContent = pluriel(motsRoman(), "mot");
  majSession();
}

// La session redémarre chaque jour (ou à la demande).
// Elle compte les mots ajoutés au roman depuis son début.
async function demarrerSession({ forcer = false } = {}) {
  const cle = "session:" + etat.roman.id;
  const jour = dateFichier();
  let s = await db.lireReglage(cle);
  if (forcer || !s || s.jour !== jour) {
    s = { jour, motsDepart: motsRoman() };
    await db.ecrireReglage(cle, s);
    if (forcer) informer("Nouvelle session : le compteur repart de zéro.");
  }
  session = s;
  majSession();
}

function majSession() {
  if (!session || !etat.roman) return;
  const objectif = etat.roman.objectifSession || OBJECTIF_PAR_DEFAUT;
  const ecrits = Math.max(0, motsRoman() - session.motsDepart);
  const pourcentage = Math.min(100, Math.round((ecrits / objectif) * 100));
  $("mots-session").textContent = nombre(ecrits);
  $("objectif-session").textContent = nombre(objectif);
  const barre = $("barre-session");
  barre.setAttribute("aria-valuenow", pourcentage);
  barre.style.setProperty("--progression", pourcentage + "%");
  barre.classList.toggle("atteint", ecrits >= objectif);
}

async function changerObjectif() {
  const actuel = etat.roman.objectifSession || OBJECTIF_PAR_DEFAUT;
  const valeur = await ouvrirDialogue({
    titre: "Objectif de la session",
    corps: [
      el("label", { class: "champ" },
        el("span", { class: "etiquette" }, "Nombre de mots à écrire par session"),
        el("input", { type: "number", name: "objectif", value: actuel, min: 1, max: 100000, step: 1 }),
      ),
      el("p", { class: "discret petit" }, "La session redémarre chaque jour, ou quand vous cliquez sur « Nouvelle session »."),
    ],
    ok: "Enregistrer",
    lireFormulaire: (form) => {
      const n = Math.round(Number(form.elements.objectif.value));
      return n >= 1 && n <= 100000 ? n : "Indiquez un nombre entre 1 et 100 000.";
    },
  });
  if (!valeur) return;
  etat.roman.objectifSession = valeur;
  await db.ecrire("romans", etat.roman);
  majSession();
}
