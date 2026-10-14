// =====================================================================
// STOCKAGE DES DONNÉES (IndexedDB = la base de données du navigateur)
// Tout reste sur cet appareil. Chaque écriture est enregistrée tout de suite.
//
// Les « tiroirs » (magasins) de la base :
//   romans     : { id, titre, univers, cree, modifie, ... }
//   chapitres  : { id, romanId, titre, ordre }
//   scenes     : { id, romanId, chapitreId, titre, ordre, notes, texte, mode }
//   fiches     : { id, romanId, categorie, titre, type, champs, notes }
//   reglages   : { cle, valeur }   (préférences et suivi des sauvegardes)
// =====================================================================

const NOM_BASE = "atelier-romans";
const VERSION_BASE = 1;
export const MAGASINS = ["romans", "chapitres", "scenes", "fiches", "reglages"];
const MAGASINS_DE_ROMAN = ["chapitres", "scenes", "fiches"]; // ceux qui appartiennent à un roman

// Format du fichier de sauvegarde (pour le reconnaître à l'import)
export const FORMAT_EXPORT = "atelier-romans";
export const VERSION_EXPORT = 1;

let base = null; // la base ouverte (gardée pour ne l'ouvrir qu'une fois)

// Transforme une demande IndexedDB en promesse (plus simple à utiliser avec await)
function attendre(demande) {
  return new Promise((ok, echec) => {
    demande.onsuccess = () => ok(demande.result);
    demande.onerror = () => echec(demande.error);
  });
}
// Attend la fin d'une transaction (= toutes les écritures sont bien sur le disque)
function finTransaction(tx) {
  return new Promise((ok, echec) => {
    tx.oncomplete = () => ok();
    tx.onerror = () => echec(tx.error);
    tx.onabort = () => echec(tx.error || new Error("Écriture annulée"));
  });
}

// Ouvre la base (et la crée la toute première fois)
export function ouvrirBase() {
  if (base) return Promise.resolve(base);
  return new Promise((ok, echec) => {
    if (!("indexedDB" in window)) {
      echec(new Error("Ce navigateur ne permet pas d'enregistrer des données."));
      return;
    }
    const demande = indexedDB.open(NOM_BASE, VERSION_BASE);
    demande.onupgradeneeded = () => {
      const db = demande.result;
      // Création des tiroirs et de leurs « index » (pour retrouver vite les éléments d'un roman)
      if (!db.objectStoreNames.contains("romans")) db.createObjectStore("romans", { keyPath: "id" });
      for (const nom of MAGASINS_DE_ROMAN) {
        if (!db.objectStoreNames.contains(nom)) {
          const magasin = db.createObjectStore(nom, { keyPath: "id" });
          magasin.createIndex("romanId", "romanId");
        }
      }
      if (!db.objectStoreNames.contains("reglages")) db.createObjectStore("reglages", { keyPath: "cle" });
    };
    demande.onsuccess = () => {
      base = demande.result;
      // Si une autre version de l'application s'ouvre dans un autre onglet, on se retire proprement
      base.onversionchange = () => { base.close(); base = null; };
      ok(base);
    };
    demande.onerror = () => echec(demande.error);
    demande.onblocked = () => echec(new Error("Fermez les autres onglets de l'Atelier, puis rechargez la page."));
  });
}

// Demande au navigateur de ne jamais effacer nos données de lui-même
// (sinon il peut le faire s'il manque de place). Renvoie true si c'est accordé.
export async function protegerStockage() {
  if (!navigator.storage || !navigator.storage.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}

// ---------- Lecture ----------

export async function lireTout(magasin) {
  const db = await ouvrirBase();
  return attendre(db.transaction(magasin).objectStore(magasin).getAll());
}

export async function lire(magasin, id) {
  const db = await ouvrirBase();
  return attendre(db.transaction(magasin).objectStore(magasin).get(id));
}

// Tous les éléments d'un roman (ex. lireDuRoman("scenes", idDuRoman))
export async function lireDuRoman(magasin, romanId) {
  const db = await ouvrirBase();
  return attendre(db.transaction(magasin).objectStore(magasin).index("romanId").getAll(romanId));
}

// ---------- Écriture ----------

// Note dans les réglages qu'il y a du nouveau à exporter (dans la même transaction)
function noterModification(tx) {
  const reglages = tx.objectStore("reglages");
  const demande = reglages.get("nonExporteDepuis");
  demande.onsuccess = () => {
    if (!demande.result || !demande.result.valeur) {
      reglages.put({ cle: "nonExporteDepuis", valeur: Date.now() });
    }
  };
}

// Enregistre (crée ou remplace) un ou plusieurs éléments d'un tiroir
export async function ecrire(magasin, ...elements) {
  const db = await ouvrirBase();
  const tx = db.transaction([magasin, "reglages"], "readwrite");
  for (const e of elements) tx.objectStore(magasin).put(e);
  noterModification(tx);
  return finTransaction(tx);
}

export async function supprimer(magasin, id) {
  const db = await ouvrirBase();
  const tx = db.transaction([magasin, "reglages"], "readwrite");
  tx.objectStore(magasin).delete(id);
  noterModification(tx);
  return finTransaction(tx);
}

// Supprime un roman ET tout ce qu'il contient (chapitres, scènes, fiches), d'un seul coup :
// soit tout est supprimé, soit rien (jamais à moitié).
export async function supprimerRoman(romanId) {
  const db = await ouvrirBase();
  const tx = db.transaction(["romans", ...MAGASINS_DE_ROMAN, "reglages"], "readwrite");
  tx.objectStore("romans").delete(romanId);
  for (const nom of MAGASINS_DE_ROMAN) {
    const index = tx.objectStore(nom).index("romanId");
    const demande = index.getAllKeys(romanId);
    demande.onsuccess = () => {
      for (const cle of demande.result) tx.objectStore(nom).delete(cle);
    };
  }
  noterModification(tx);
  return finTransaction(tx);
}

// ---------- Réglages (petites valeurs nommées) ----------

export async function lireReglage(cle, parDefaut = null) {
  const r = await lire("reglages", cle);
  return r ? r.valeur : parDefaut;
}

// Les réglages ne comptent pas comme « du nouveau à exporter »
export async function ecrireReglage(cle, valeur) {
  const db = await ouvrirBase();
  const tx = db.transaction("reglages", "readwrite");
  tx.objectStore("reglages").put({ cle, valeur });
  return finTransaction(tx);
}

// ---------- Export / import (sauvegarde de sécurité) ----------

// Rassemble TOUTES les données dans un seul objet, prêt à devenir un fichier JSON.
// On note d'abord la date de l'export, pour qu'un fichier réimporté plus tard
// ne déclenche pas de rappel inutile.
export async function exporterTout() {
  const maintenant = Date.now();
  await ecrireReglage("derniereExport", maintenant);
  await ecrireReglage("nonExporteDepuis", null);

  const db = await ouvrirBase();
  const tx = db.transaction(MAGASINS);
  const donnees = {};
  await Promise.all(MAGASINS.map(async (nom) => {
    donnees[nom] = await attendre(tx.objectStore(nom).getAll());
  }));
  return {
    format: FORMAT_EXPORT,
    version: VERSION_EXPORT,
    exporteLe: new Date(maintenant).toISOString(),
    donnees,
  };
}

// Vérifie qu'un objet lu dans un fichier est bien une sauvegarde de l'Atelier.
// Renvoie un message d'erreur clair, ou null si tout va bien.
export function verifierSauvegarde(objet) {
  if (!objet || typeof objet !== "object") return "Ce fichier ne contient pas de données lisibles.";
  if (objet.format !== FORMAT_EXPORT) return "Ce fichier n'est pas une sauvegarde de l'Atelier.";
  if (typeof objet.version !== "number" || objet.version > VERSION_EXPORT) {
    return "Cette sauvegarde vient d'une version plus récente de l'Atelier. Mettez l'application à jour.";
  }
  const d = objet.donnees;
  if (!d || typeof d !== "object") return "La sauvegarde est incomplète (aucune donnée).";
  for (const nom of MAGASINS) {
    if (d[nom] === undefined) continue; // un tiroir absent = vide
    if (!Array.isArray(d[nom])) return `La sauvegarde est abîmée (partie « ${nom} »).`;
    const cle = nom === "reglages" ? "cle" : "id";
    if (d[nom].some((e) => !e || typeof e !== "object" || e[cle] == null)) {
      return `La sauvegarde est abîmée (un élément de « ${nom} » n'a pas d'identifiant).`;
    }
  }
  return null;
}

// Remplace TOUTES les données par celles de la sauvegarde.
// Tout se fait en une seule transaction : en cas de problème, rien n'est modifié.
export async function importerTout(objet) {
  const erreur = verifierSauvegarde(objet);
  if (erreur) throw new Error(erreur);
  const db = await ouvrirBase();
  const tx = db.transaction(MAGASINS, "readwrite");
  for (const nom of MAGASINS) {
    const magasin = tx.objectStore(nom);
    magasin.clear();
    for (const e of objet.donnees[nom] || []) magasin.put(e);
  }
  return finTransaction(tx);
}

// Nombre d'éléments, pour afficher un résumé avant import
export function resumerSauvegarde(objet) {
  const d = objet.donnees || {};
  const n = (nom) => (Array.isArray(d[nom]) ? d[nom].length : 0);
  return { romans: n("romans"), chapitres: n("chapitres"), scenes: n("scenes"), fiches: n("fiches") };
}
