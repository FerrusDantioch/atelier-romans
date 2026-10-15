// =====================================================================
// CHEF D'ORCHESTRE DE L'APPLICATION
// Il relie les différentes parties (pages, données, éditeur…).
// =====================================================================

import * as db from "./db.js";
import { UNIVERS } from "./outils.js";
import { informer } from "./dialogues.js";
import { initialiserBibliotheque, afficherBibliotheque } from "./bibliotheque.js";
import { initialiserSauvegarde, mettreAJourEtat } from "./sauvegarde.js";
import { chargerRoman, fermerRoman, etat } from "./etat.js";
import { initialiserPlan, afficherPlan } from "./plan.js";
import {
  initialiserEditeur, preparerEditeur, fermerEditeur, recupererSecours, effacerTousLesSecours,
} from "./editeur.js";
import { initialiserPanneau, preparerPanneau, fermerPanneau } from "./panneau.js";
import { initialiserRecherche } from "./recherche.js";

// Numéro de version affiché dans « À propos »
export const VERSION = "0.5.0";

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
    const romanId = decodeURIComponent(id);
    if (etat.roman && etat.roman.id === romanId && !document.getElementById("vue-roman").hidden) return;
    await fermerPanneau();
    await fermerEditeur();
    const roman = await chargerRoman(romanId);
    if (!roman) {
      informer("Ce roman n'existe plus.", { erreur: true });
      location.hash = "bibliotheque";
      return;
    }
    colorerUnivers(roman.univers);
    document.title = roman.titre + " — L'Atelier";
    document.body.classList.add("mode-ecriture");
    montrer("roman");
    afficherPlan();
    await preparerEditeur();
    await preparerPanneau();
    await db.ecrireReglage("dernierRoman", roman.id);
    return;
  }

  // On quitte la page d'écriture : on enregistre tout avant
  await fermerPanneau();
  await fermerEditeur();
  fermerRoman();
  document.body.classList.remove("mode-ecriture");
  colorerUnivers("autre");
  document.title = "L'Atelier — Omni-système";
  if (page === "apropos") {
    montrer("apropos");
  } else {
    await afficherBibliotheque();
    montrer("bibliotheque");
    await mettreAJourEtat();
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

  // Récupère d'éventuelles frappes non enregistrées (onglet fermé en pleine phrase…)
  await recupererSecours();

  initialiserBibliotheque({ quandCaChange: mettreAJourEtat });
  initialiserSauvegarde({
    quandImporte: async () => {
      effacerTousLesSecours();
      fermerRoman();               // force le rechargement du roman affiché
      await suivreAdresse();
    },
  });
  initialiserPlan();
  initialiserEditeur();
  initialiserPanneau();
  initialiserRecherche();

  await suivreAdresse();
  await mettreAJourEtat();
}

demarrer();
