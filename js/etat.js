// =====================================================================
// ÉTAT DU ROMAN OUVERT
// Une copie en mémoire du roman en cours (chapitres, scènes, nombre de mots),
// partagée par le plan, l'éditeur et (plus tard) le panneau de consultation.
// =====================================================================

import * as db from "./db.js";
import { compterMots } from "./outils.js";

export const etat = {
  roman: null,     // le roman ouvert
  chapitres: [],   // ses chapitres
  scenes: [],      // toutes ses scènes
  sceneId: null,   // la scène affichée dans l'éditeur
};

// Nombre de mots (texte rédigé) de chaque scène, gardé en mémoire pour aller vite
const mots = new Map();

// Charge un roman et tout son contenu. Renvoie le roman, ou null s'il n'existe pas.
export async function chargerRoman(id) {
  const [roman, chapitres, scenes] = await Promise.all([
    db.lire("romans", id), db.lireDuRoman("chapitres", id), db.lireDuRoman("scenes", id),
  ]);
  if (!roman) return null;
  etat.roman = roman;
  etat.chapitres = chapitres;
  etat.scenes = scenes;
  etat.sceneId = null;
  mots.clear();
  for (const s of scenes) mots.set(s.id, compterMots(s.texte));
  return roman;
}

export function fermerRoman() {
  etat.roman = null;
  etat.chapitres = [];
  etat.scenes = [];
  etat.sceneId = null;
  mots.clear();
}

// Tri selon le champ « ordre »
export const parOrdre = (a, b) => a.ordre - b.ordre;

export function chapitresTries() {
  return [...etat.chapitres].sort(parOrdre);
}
export function scenesDe(chapitreId) {
  return etat.scenes.filter((s) => s.chapitreId === chapitreId).sort(parOrdre);
}
export function trouverScene(id) {
  return etat.scenes.find((s) => s.id === id) || null;
}
export function trouverChapitre(id) {
  return etat.chapitres.find((c) => c.id === id) || null;
}
// Toutes les scènes dans l'ordre de lecture (chapitre 1 scène 1, chapitre 1 scène 2…)
export function scenesDansLOrdre() {
  return chapitresTries().flatMap((c) => scenesDe(c.id));
}

// ---------- Compteurs de mots ----------

export function recompterScene(id) {
  const s = trouverScene(id);
  if (s) mots.set(id, compterMots(s.texte));
}
export function oublierScene(id) {
  mots.delete(id);
}
export function motsScene(id) {
  return mots.get(id) || 0;
}
export function motsChapitre(chapitreId) {
  return scenesDe(chapitreId).reduce((t, s) => t + motsScene(s.id), 0);
}
export function motsRoman() {
  let total = 0;
  for (const n of mots.values()) total += n;
  return total;
}

// ---------- Petit système d'annonces entre les parties de l'application ----------
// ex. le plan annonce « ouvrir-scene », l'éditeur l'écoute et affiche la scène.

const auditeurs = {};
export function ecouter(nom, fonction) {
  (auditeurs[nom] ||= []).push(fonction);
}
export async function annoncer(nom, detail) {
  for (const f of auditeurs[nom] || []) await f(detail);
}
