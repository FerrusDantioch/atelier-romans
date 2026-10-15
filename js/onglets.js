// =====================================================================
// UNE SEULE PAGE À LA FOIS
// Si l'Atelier était ouvert dans deux onglets (ou dans l'application installée
// ET dans le navigateur), chaque page enregistrerait sa propre version du texte
// et effacerait le travail de l'autre, sans prévenir.
// Un « verrou » du navigateur l'empêche : la première page travaille, les
// suivantes attendent avec une explication, et démarrent d'elles-mêmes dès que
// la première se ferme. Le bouton « Utiliser plutôt cette page » demande à
// l'autre page de tout enregistrer et de céder sa place.
// =====================================================================

const NOM = "atelier-romans";
const canal = "BroadcastChannel" in window ? new BroadcastChannel(NOM) : null;
const DELAI_AVANT_FORCER = 3000; // l'autre page ne répond pas (endormie) : on prend la main d'office

let demarree = false;

// Lance « demarrer » dès que cette page est la seule active.
// « avantDeCeder » enregistre tout quand une autre page demande la main.
export function demarrerSeul(demarrer, avantDeCeder) {
  if (!navigator.locks) { demarrer(); return; } // navigateur ancien : pas de protection possible

  const travailler = async () => {
    if (demarree) return new Promise(() => {});
    demarree = true;
    montrerAttente(false);
    // Une autre page demande la main : on enregistre tout, puis on se recharge (et on attend à son tour)
    if (canal) {
      canal.onmessage = async (e) => {
        if (e.data !== "ceder") return;
        try { await avantDeCeder(); } finally { location.reload(); }
      };
    }
    await demarrer();
    return new Promise(() => {}); // garde le verrou jusqu'à la fermeture de la page
  };

  // Verrou perdu (une autre page l'a pris d'office) : on se recharge pour ne plus rien écrire
  const siPerdu = (erreur) => {
    if (erreur && erreur.name === "AbortError") location.reload();
    else if (!demarree) demarrer(); // problème inattendu avec le verrou : on démarre quand même
  };

  navigator.locks.request(NOM, { ifAvailable: true }, (verrou) => {
    if (verrou) return travailler();
    // Une autre page travaille : on attend notre tour (sans bloquer cette fonction)
    montrerAttente(true);
    navigator.locks.request(NOM, travailler).catch(siPerdu);
    document.getElementById("bouton-utiliser-ici").onclick = (e) => {
      e.currentTarget.disabled = true;
      if (canal) canal.postMessage("ceder");
      setTimeout(() => {
        if (!demarree) navigator.locks.request(NOM, { steal: true }, travailler).catch(siPerdu);
      }, canal ? DELAI_AVANT_FORCER : 0);
    };
    return null;
  }).catch(siPerdu);
}

// Affiche (ou cache) l'explication « déjà ouvert ailleurs », à la place de l'application
function montrerAttente(oui) {
  document.getElementById("alerte-onglet").hidden = !oui;
  document.querySelector("main").hidden = oui;
}
