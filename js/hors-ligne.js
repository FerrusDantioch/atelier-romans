// =====================================================================
// HORS LIGNE ET INSTALLATION
// - active le service worker (sw.js) : l'application fonctionne sans connexion,
//   et même sans le petit serveur une fois qu'elle a été ouverte une première fois ;
// - propose d'installer l'Atelier comme une application (icône, fenêtre à part).
// =====================================================================

import { informer } from "./dialogues.js";

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

// Active le mode hors ligne et l'indique dans « À propos »
async function activer() {
  const ecrire = (texte) => { $("etat-hors-ligne").textContent = texte; };
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) {
    ecrire("Mode hors ligne indisponible ici.");
    return;
  }
  try {
    await navigator.serviceWorker.register("sw.js");
    await navigator.serviceWorker.ready;
    ecrire("Prête à fonctionner sans connexion ✓");
  } catch (erreur) {
    ecrire("Le mode hors ligne n'a pas pu s'activer : " + erreur.message);
  }
}

// Affiche le bouton « Installer » seulement si c'est possible (et pas déjà fait)
function majInstallation() {
  const dejaInstallee = window.matchMedia("(display-mode: standalone)").matches;
  $("encart-installation").hidden = !invitation || dejaInstallee;
}

async function installer() {
  if (!invitation) return;
  invitation.prompt();                       // la fenêtre d'installation du navigateur
  const { outcome } = await invitation.userChoice;
  if (outcome !== "accepted") return;        // « Annuler » : le bouton reste là pour plus tard
  invitation = null;
  majInstallation();
}
