// =====================================================================
// SAUVEGARDE DE SÉCURITÉ : export / import d'un fichier JSON + rappel doux
// Les données ne vivent que sur cet appareil : un export régulier permet
// de les retrouver si l'ordinateur ou le navigateur a un problème.
// =====================================================================

import * as db from "./db.js";
import { dateFichier, ilYa, dateCourte, pluriel, el } from "./outils.js";
import { ouvrirDialogue, informer } from "./dialogues.js";

// Le rappel apparaît quand des modifications n'ont pas été exportées depuis ce nombre de jours
const JOURS_AVANT_RAPPEL = 3;
// « Plus tard » cache le rappel pendant ce nombre de jours
const JOURS_DE_REPORT = 2;
const JOUR = 86400000;

let apresImport = async () => {};

export function initialiserSauvegarde({ quandImporte }) {
  apresImport = quandImporte;
  document.querySelectorAll("[data-action=exporter]").forEach((b) => b.addEventListener("click", exporter));
  document.getElementById("bouton-importer").addEventListener("click", () => document.getElementById("fichier-import").click());
  document.getElementById("fichier-import").addEventListener("change", (e) => {
    const fichier = e.target.files[0];
    e.target.value = ""; // permet de choisir à nouveau le même fichier plus tard
    if (fichier) importer(fichier);
  });
  document.getElementById("bouton-plus-tard").addEventListener("click", async () => {
    await db.ecrireReglage("rappelReporteJusqua", Date.now() + JOURS_DE_REPORT * JOUR);
    mettreAJourEtat();
  });
}

// ---------- Export ----------

export async function exporter() {
  try {
    const sauvegarde = await db.exporterTout();
    const texte = JSON.stringify(sauvegarde, null, 2); // indenté : lisible si on l'ouvre
    const fichier = new Blob([texte], { type: "application/json" });
    const lien = el("a", { href: URL.createObjectURL(fichier), download: `atelier-romans-sauvegarde-${dateFichier()}.json` });
    document.body.append(lien);
    lien.click();      // déclenche le téléchargement
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
    informer("Sauvegarde exportée. Rangez le fichier en lieu sûr (clé USB, cloud…).");
  } catch (erreur) {
    informer("L'export a échoué : " + erreur.message, { erreur: true });
  }
  mettreAJourEtat();
}

// ---------- Import ----------

export async function importer(fichier) {
  // 1. Lire le fichier
  let sauvegarde;
  try {
    sauvegarde = JSON.parse(await fichier.text());
  } catch {
    informer("Ce fichier est illisible : ce n'est pas une sauvegarde de l'Atelier.", { erreur: true });
    return;
  }
  const erreur = db.verifierSauvegarde(sauvegarde);
  if (erreur) {
    informer(erreur, { erreur: true });
    return;
  }

  // 2. Demander confirmation, en montrant ce que contient le fichier
  const r = db.resumerSauvegarde(sauvegarde);
  const date = Date.parse(sauvegarde.exporteLe);
  const ok = await ouvrirDialogue({
    titre: "Importer cette sauvegarde ?",
    corps: [
      el("p", {}, `Fichier « ${fichier.name} »` + (isNaN(date) ? "" : `, exporté le ${dateCourte(date)}`) + " :"),
      el("ul", { class: "losanges" },
        el("li", {}, pluriel(r.romans, "roman")),
        el("li", {}, pluriel(r.chapitres, "chapitre") + ", " + pluriel(r.scenes, "scène")),
        el("li", {}, pluriel(r.fiches, "fiche")),
      ),
      el("p", { class: "avertissement" }, "Toutes les données actuelles de l'Atelier seront remplacées par celles de ce fichier."),
      el("p", { class: "discret" }, "Conseil : exportez d'abord vos données actuelles si vous voulez pouvoir revenir en arrière."),
    ],
    ok: "Remplacer mes données",
    danger: true,
  });
  if (!ok) return;

  // 3. Remplacer les données
  try {
    await db.importerTout(sauvegarde);
    informer("Sauvegarde importée : vos données ont été restaurées.");
    await apresImport();
  } catch (e) {
    informer("L'import a échoué, rien n'a été modifié : " + e.message, { erreur: true });
  }
  mettreAJourEtat();
}

// ---------- État de la sauvegarde et rappel doux ----------

export async function mettreAJourEtat() {
  const [derniereExport, nonExporteDepuis, reporteJusqua, protege] = await Promise.all([
    db.lireReglage("derniereExport"),
    db.lireReglage("nonExporteDepuis"),
    db.lireReglage("rappelReporteJusqua", 0),
    navigator.storage && navigator.storage.persisted ? navigator.storage.persisted() : false,
  ]);

  // Texte de la carte « Sauvegarde de sécurité »
  const etat = document.getElementById("etat-sauvegarde");
  if (etat) {
    etat.replaceChildren(
      el("li", {}, derniereExport ? `Dernier export : ${ilYa(derniereExport)} (${dateCourte(derniereExport)})` : "Aucun export pour l'instant."),
      el("li", {}, nonExporteDepuis ? "Des modifications n'ont pas encore été exportées." : "Tout est exporté."),
      el("li", {}, protege
        ? "Le navigateur s'est engagé à ne pas effacer ces données."
        : "Le navigateur pourrait effacer ces données s'il manque de place : exportez régulièrement."),
    );
  }

  // Bandeau de rappel en haut de l'écran
  const maintenant = Date.now();
  const afficher = !!nonExporteDepuis
    && maintenant - nonExporteDepuis >= JOURS_AVANT_RAPPEL * JOUR
    && maintenant >= reporteJusqua;
  const bandeau = document.getElementById("rappel-export");
  bandeau.hidden = !afficher;
  if (afficher) {
    document.getElementById("rappel-texte").textContent = derniereExport
      ? `Vos textes ne sont enregistrés que sur cet appareil. Dernier export : ${ilYa(derniereExport)}.`
      : "Vos textes ne sont enregistrés que sur cet appareil, et vous ne les avez jamais exportés.";
  }
}
