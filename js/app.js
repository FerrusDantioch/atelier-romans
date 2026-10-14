// =====================================================================
// CHEF D'ORCHESTRE DE L'APPLICATION
// Il relie les différentes parties (pages, données, éditeur…).
// =====================================================================

import * as db from "./db.js";
import { UNIVERS } from "./outils.js";
import { informer } from "./dialogues.js";
import { initialiserBibliotheque, afficherBibliotheque } from "./bibliotheque.js";
import { initialiserSauvegarde, mettreAJourEtat } from "./sauvegarde.js";

// Numéro de version affiché dans « À propos »
export const VERSION = "0.2.0";

// Liste des pages (« vues ») de l'application
const VUES = ["bibliotheque", "roman", "apropos"];

// Affiche une page et cache les autres
function montrer(nom) {
  for (const v of VUES) {
    document.getElementById("vue-" + v).hidden = v !== nom;
  }
  // Souligne le bon bouton du menu
  document.querySelectorAll(".nav [data-aller]").forEach((bouton) => {
    if (bouton.dataset.aller === nom) bouton.setAttribute("aria-current", "page");
    else bouton.removeAttribute("aria-current");
  });
}

// Change la couleur d'accent de toute l'interface (liseré, étiquettes, puces)
function colorerUnivers(univers) {
  document.documentElement.dataset.univers = UNIVERS[univers] ? univers : "autre";
}

// Lit l'adresse (#bibliotheque, #apropos, #roman/identifiant) et affiche la bonne page
async function suivreAdresse() {
  const [page, id] = location.hash.slice(1).split("/");

  if (page === "roman" && id) {
    const roman = await db.lire("romans", decodeURIComponent(id));
    if (!roman) {
      informer("Ce roman n'existe plus.", { erreur: true });
      location.hash = "bibliotheque";
      return;
    }
    colorerUnivers(roman.univers);
    document.getElementById("titre-roman").textContent = roman.titre;
    document.getElementById("univers-roman").textContent = UNIVERS[roman.univers]?.nom || "Autre";
    document.title = roman.titre + " — L'Atelier";
    await db.ecrireReglage("dernierRoman", roman.id);
    montrer("roman");
    return;
  }

  colorerUnivers("autre");
  document.title = "L'Atelier — Omni-système";
  if (page === "apropos") {
    montrer("apropos");
  } else {
    await afficherBibliotheque();
    montrer("bibliotheque");
  }
}

// Démarrage
async function demarrer() {
  document.getElementById("numero-version").textContent = VERSION;

  // Tous les boutons qui portent data-aller="..." changent de page
  document.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-aller]");
    // On change l'adresse (#apropos…) : le bouton « retour » du navigateur fonctionne
    if (bouton) location.hash = bouton.dataset.aller;
  });
  window.addEventListener("hashchange", suivreAdresse);

  try {
    await db.ouvrirBase();
  } catch (erreur) {
    informer("Impossible d'ouvrir le stockage : " + erreur.message, { erreur: true, duree: 30000 });
    return;
  }
  // Demande au navigateur de protéger nos données (sans bloquer le démarrage)
  db.protegerStockage().then(mettreAJourEtat);

  initialiserBibliotheque({ quandCaChange: mettreAJourEtat });
  initialiserSauvegarde({ quandImporte: suivreAdresse });

  await suivreAdresse();
  await mettreAJourEtat();
}

demarrer();
