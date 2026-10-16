// =====================================================================
// HORS LIGNE ET INSTALLATION
// - active le service worker (sw.js) : l'application fonctionne sans connexion,
//   et même sans le petit serveur une fois qu'elle a été ouverte une première fois ;
// - propose d'installer l'Atelier comme une application (icône, fenêtre à part).
// =====================================================================

import { informer } from "./dialogues.js";
import { ecrireTexte } from "./outils.js";

let invitation = null; // la proposition d'installation du navigateur, gardée pour notre bouton

const $ = (id) => document.getElementById(id);

export function initialiserHorsLigne() {
  activer();

  // Le navigateur est prêt à installer l'application : on affiche notre bouton
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    invitation = e;
    majInstallation();
  });
  window.addEventListener("appinstalled", () => {
    invitation = null;
    majInstallation();
    informer("L'Atelier est installé : vous le retrouverez parmi vos applications.");
  });
  $("bouton-installer").addEventListener("click", installer);
  majInstallation();
}

// Active le mode hors ligne, rafraîchit la copie en réserve, et dit dans « À propos » où l'on en est
async function activer() {
  const ecrire = (texte) => ecrireTexte($("etat-hors-ligne"), texte); // (sans rien retirer de la page : voir outils.js)
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) {
    ecrire("Mode hors ligne indisponible ici.");
    return;
  }
  ecrire("Mise en réserve pour le mode hors ligne…");
  try {
    await navigator.serviceWorker.register("sw.js");
    const inscription = await sansTropAttendre(navigator.serviceWorker.ready, 30000);
    const { complete, erreur } = await sansTropAttendre(demander(inscription.active, "actualiser"), 60000);
    if (!complete) {
      const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
      ecrire("⚠ Pas encore prête à fonctionner sans connexion : " + erreur + (local
        ? ". Gardez le serveur lancé et rouvrez l'Atelier (voir LISEZ-MOI.md)."
        : ". Rouvrez l'Atelier avec une connexion à Internet pour terminer la mise en réserve."));
    } else if (erreur && erreur !== "le serveur ne répond pas") {
      ecrire("Prête à fonctionner sans connexion ✓ (avec la copie précédente : la nouvelle n'a pas pu être "
        + "mise en réserve, " + erreur + ")");
    } else {
      ecrire("Prête à fonctionner sans connexion ✓");
    }
  } catch (erreur) {
    ecrire("⚠ Le mode hors ligne n'a pas pu s'activer (" + erreur.message + "). Rouvrez l'Atelier pour réessayer.");
  }
}

// Envoie une demande au service worker et attend sa réponse
function demander(travailleur, message) {
  return new Promise((ok) => {
    const canal = new MessageChannel();
    canal.port1.onmessage = (e) => ok(e.data);
    travailleur.postMessage(message, [canal.port2]);
  });
}

function sansTropAttendre(promesse, ms) {
  return Promise.race([promesse, new Promise((_, echec) => setTimeout(() => echec(new Error("pas de réponse")), ms))]);
}

// Affiche le bouton « Installer » seulement si c'est possible (et pas déjà fait)
function majInstallation() {
  const dejaInstallee = window.matchMedia("(display-mode: standalone)").matches;
  $("encart-installation").hidden = !invitation || dejaInstallee;
}

async function installer() {
  if (!invitation) return;
  // Une proposition du navigateur ne sert qu'une fois : l'encart disparaît, et reviendra
  // de lui-même si le navigateur la propose à nouveau plus tard
  const proposition = invitation;
  invitation = null;
  majInstallation();
  try {
    await proposition.prompt();              // la fenêtre d'installation du navigateur
  } catch {
    informer("Utilisez plutôt le menu du navigateur (⋮) → « Installer L'Atelier ».");
  }
}
