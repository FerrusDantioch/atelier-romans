// =====================================================================
// ANNULER (Ctrl+Z) EN TOUTE SÉCURITÉ
// Chrome et Edge tiennent UN SEUL historique d'annulation pour toute la page.
// Sans précaution, Ctrl+Z dans le texte pourrait défaire, sans qu'on le voie,
// une modification faite ailleurs (une fiche, la recherche, le titre…).
//
// Deux règles :
//  1. une annulation ne modifie jamais un champ qui n'a pas le clavier ;
//  2. Ctrl+Z dans un champ oublie d'abord l'historique des AUTRES champs
//     modifiés, pour que l'annulation porte bien sur celui où l'on écrit.
//     (Exception : l'historique du texte du roman n'est jamais oublié à cause
//     d'un Ctrl+Z fait dans une fiche : c'est le plus précieux.)
// =====================================================================

const modifies = new Set();       // champs modifiés dont l'historique traîne encore
let estTexteDuRoman = () => false; // dit si un champ est une des zones d'écriture

export function initialiserAnnulation(estTexte) {
  estTexteDuRoman = estTexte;

  // On retient les champs dans lesquels on a écrit
  document.addEventListener("input", (e) => {
    if (estChamp(e.target)) modifies.add(e.target);
  }, true);

  // Règle 2 : juste avant que le navigateur annule (Ctrl+Z) ou rétablisse (Ctrl+Y, Ctrl+Maj+Z)
  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const touche = e.key.toLowerCase();
    if ((touche === "z" || touche === "y") && estChamp(document.activeElement)) {
      oublierLesAutres(document.activeElement);
    }
  }, true);

  // Règle 1 : le navigateur s'apprête à annuler dans un champ qui n'a pas le clavier → refusé
  document.addEventListener("beforeinput", (e) => {
    if (e.inputType !== "historyUndo" && e.inputType !== "historyRedo") return;
    if (e.target === document.activeElement) return;
    e.preventDefault();
    // (annulation lancée par le menu du clic droit : le prochain essai portera sur le bon champ)
    if (estChamp(document.activeElement)) oublierLesAutres(document.activeElement);
  }, true);
}

// Champ où l'on tape du texte (pas une case à cocher)
function estChamp(x) {
  return !!x && (x.tagName === "TEXTAREA" || (x.tagName === "INPUT" && (x.type === "text" || x.type === "search")));
}

// Oublie l'historique d'annulation d'un champ. Le navigateur efface les étapes
// d'annulation d'un champ retiré de la page : on le retire donc et on le remet
// aussitôt à sa place. Son texte, son curseur et son défilement ne bougent pas.
export function oublierHistorique(champ) {
  modifies.delete(champ);
  if (!champ.isConnected) return;
  const avaitLeClavier = document.activeElement === champ;
  const { selectionStart: debut, selectionEnd: fin, selectionDirection: sens, scrollTop } = champ;
  const parent = champ.parentNode, suivant = champ.nextSibling;
  champ.remove();
  parent.insertBefore(champ, suivant);
  if (debut != null) champ.setSelectionRange(debut, fin, sens || "none");
  champ.scrollTop = scrollTop;
  if (avaitLeClavier) champ.focus({ preventScroll: true });
}

function oublierLesAutres(garde) {
  for (const champ of [...modifies]) {
    if (champ === garde) continue;
    if (estTexteDuRoman(champ) && !estTexteDuRoman(garde)) continue; // on protège le texte du roman
    oublierHistorique(champ);
  }
}
