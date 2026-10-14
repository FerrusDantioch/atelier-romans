// =====================================================================
// PETITS OUTILS PARTAGÉS par toutes les parties de l'application
// =====================================================================

// Les univers de l'Omni-système (la clé sert dans le code et dans theme.css)
export const UNIVERS = {
  cyber:   { nom: "Cyberpunk" },
  fantasy: { nom: "Fantasy" },
  space:   { nom: "Space opéra" },
  horreur: { nom: "Horreur / enquête" },
  autre:   { nom: "Autre" },
};

// Fabrique un identifiant unique (ex. « 3f2b…-… »)
export function nouvelId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Crée un élément HTML en une ligne.
// Exemple : el("p", { class: "discret" }, "Bonjour")
// Le texte est toujours inséré comme du texte (jamais comme du code) : c'est plus sûr.
export function el(balise, attributs = {}, ...enfants) {
  const e = document.createElement(balise);
  for (const [nom, valeur] of Object.entries(attributs)) {
    if (valeur === false || valeur == null) continue;
    if (nom.startsWith("on") && typeof valeur === "function") {
      e.addEventListener(nom.slice(2), valeur);           // ex. onclick
    } else if (nom === "style" && typeof valeur === "object") {
      for (const [k, v] of Object.entries(valeur)) e.style.setProperty(k, v);
    } else {
      e.setAttribute(nom, valeur === true ? "" : valeur);
    }
  }
  for (const enfant of enfants.flat()) {
    if (enfant == null || enfant === false) continue;
    e.append(enfant instanceof Node ? enfant : String(enfant));
  }
  return e;
}

// Compte les mots d'un texte (les symboles de mise en forme * ne comptent pas)
export function compterMots(texte) {
  if (!texte) return 0;
  const mots = texte
    .replace(/\*/g, " ")                 // retire les * de *italique* et **gras**
    .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu); // « aujourd'hui » = 1 mot
  return mots ? mots.length : 0;
}

// Écrit un nombre à la française : 12 345
export function nombre(n) {
  return n.toLocaleString("fr-FR");
}

// Accorde un mot au pluriel : pluriel(3, "scène") → « 3 scènes »
export function pluriel(n, mot, motPluriel = mot + "s") {
  return nombre(n) + " " + (n > 1 ? motPluriel : mot);
}

// Date lisible : « 14 oct. 2026 »
export function dateCourte(ms) {
  return new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

// Durée écoulée, en mots simples : « aujourd'hui », « hier », « il y a 5 jours »
export function ilYa(ms) {
  const jours = Math.floor((debutDuJour(Date.now()) - debutDuJour(ms)) / 86400000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  return "il y a " + jours + " jours";
}
function debutDuJour(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Date du jour pour un nom de fichier : 2026-10-14
export function dateFichier(ms = Date.now()) {
  const d = new Date(ms);
  const deux = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + deux(d.getMonth() + 1) + "-" + deux(d.getDate());
}
