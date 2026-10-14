// =====================================================================
// CHEF D'ORCHESTRE DE L'APPLICATION
// Il relie les différentes parties (pages, données, éditeur…).
// =====================================================================

// Numéro de version affiché dans « À propos »
export const VERSION = "0.1.0";

// Liste des pages (« vues ») de l'application
const VUES = ["bibliotheque", "apropos"];

// Affiche une page et cache les autres
function afficherVue(nom) {
  if (!VUES.includes(nom)) nom = "bibliotheque";
  for (const v of VUES) {
    document.getElementById("vue-" + v).hidden = v !== nom;
  }
  // Souligne le bon bouton du menu
  document.querySelectorAll(".nav [data-aller]").forEach((bouton) => {
    if (bouton.dataset.aller === nom) bouton.setAttribute("aria-current", "page");
    else bouton.removeAttribute("aria-current");
  });
}

// Démarrage
function demarrer() {
  document.getElementById("numero-version").textContent = VERSION;

  // Tous les boutons qui portent data-aller="..." changent de page
  document.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-aller]");
    // On change l'adresse (#apropos…) : le bouton « retour » du navigateur fonctionne
    if (bouton) location.hash = bouton.dataset.aller;
  });
  window.addEventListener("hashchange", () => afficherVue(location.hash.slice(1)));

  afficherVue(location.hash.slice(1));
}

demarrer();
