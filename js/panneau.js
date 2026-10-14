// =====================================================================
// PANNEAU DE CONSULTATION (colonne de droite)
// 4 onglets : Personnage principal, PNJ, Lieux, Événements.
// On lit et on modifie les fiches sans quitter l'écriture.
// Une fiche peut être épinglée : elle reste affichée en haut du panneau.
// =====================================================================

import * as db from "./db.js";
import { el, nouvelId } from "./outils.js";
import { confirmer, informer } from "./dialogues.js";
import { etat, trouverFiche, fichesDe } from "./etat.js";
import { revenirAuTexte } from "./editeur.js";

// Les catégories de fiches et leurs champs (clé du champ, libellé)
export const CATEGORIES = {
  principal: {
    onglet: "Principal", nom: "Personnage principal", nouveau: "Nouveau personnage principal",
    exempleType: "Héroïne, mercenaire, enquêteur…",
    champs: [["apparence", "Apparence"], ["caractere", "Caractère"], ["background", "Background de départ"], ["relations", "Relations"]],
  },
  pnj: {
    onglet: "PNJ", nom: "PNJ", nouveau: "Nouveau PNJ",
    exempleType: "Allié, rival, marchand…",
    champs: [["apparence", "Apparence"], ["caractere", "Caractère"], ["background", "Background"], ["relations", "Relations"]],
  },
  lieu: {
    onglet: "Lieux", nom: "Lieu", nouveau: "Nouveau lieu",
    exempleType: "Ville, taverne, vaisseau…",
    champs: [["description", "Description"], ["ambiance", "Ambiance"]],
  },
  evenement: {
    onglet: "Événements", nom: "Événement", nouveau: "Nouvel événement",
    exempleType: "Combat, rencontre, révélation…",
    champs: [["quand", "Date ou moment"], ["resume", "Résumé"]],
  },
};
// Les champs d'une ligne (courts) ; les autres sont des zones de texte
const CHAMPS_COURTS = ["quand"];
const DELAI_SAUVEGARDE = 400;

// Ce que montre le panneau en ce moment
const vue = {
  onglet: "principal",   // onglet ouvert
  ficheId: null,         // fiche ouverte (null = la liste)
  edition: false,        // true = formulaire de modification
  epingleeRepliee: false,
};

let ficheModifiee = null;   // fiche en attente d'enregistrement
let minuterie = null;

const $ = (id) => document.getElementById(id);

// =====================================================================
// Mise en place
// =====================================================================

export function initialiserPanneau() {
  const panneau = $("panneau");

  // Onglets : clic, et flèches ← → au clavier
  const onglets = [...document.querySelectorAll("[data-onglet]")];
  onglets.forEach((b, i) => {
    b.addEventListener("click", () => changerOnglet(b.dataset.onglet));
    b.addEventListener("keydown", (e) => {
      const sens = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!sens) return;
      e.preventDefault();
      const suivant = onglets[(i + sens + onglets.length) % onglets.length];
      changerOnglet(suivant.dataset.onglet);
      suivant.focus();
    });
  });

  // Tous les boutons du panneau (data-action="...")
  panneau.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b || !panneau.contains(b)) return;
    const { action, id } = b.dataset;
    if (action === "ouvrir-fiche") ouvrirFiche(id);
    else if (action === "liste") retourListe();
    else if (action === "nouvelle") creerFiche(vue.onglet);
    else if (action === "modifier") ouvrirFiche(id, { edition: true });
    else if (action === "termine") terminerEdition();
    else if (action === "supprimer-fiche") supprimerFiche(id);
    else if (action === "epingler") epingler(id);
    else if (action === "desepingler") epingler(null);
    else if (action === "replier") replierEpinglee();
    else if (action === "monter") deplacerEvenement(id, -1);
    else if (action === "descendre") deplacerEvenement(id, +1);
  });

  // Échap dans le panneau : retour au texte, curseur à sa place
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || $("vue-roman").hidden || document.querySelector("dialog[open]")) return;
    const dansPanneau = panneau.contains(document.activeElement);
    const voletOuvert = $("vue-roman").classList.contains("panneau-ouvert");
    if (!dansPanneau && !voletOuvert) return;
    e.preventDefault();
    sauverFiche();
    $("vue-roman").classList.remove("panneau-ouvert");
    revenirAuTexte();
  });

  // Écran moyen ou petit : le panneau devient un volet
  $("bouton-fiches").addEventListener("click", () => basculerVolet());
  $("fermer-panneau").addEventListener("click", () => { basculerVolet(false); revenirAuTexte(); });

  // Filet de sécurité : enregistrer la fiche si la page se cache ou se ferme
  document.addEventListener("visibilitychange", () => { if (document.hidden) sauverFiche(); });
  window.addEventListener("pagehide", () => sauverFiche());
}

// Ouvre ou ferme le volet (écrans moyens et petits)
export function basculerVolet(forcer) {
  const v = $("vue-roman");
  const ouvert = v.classList.toggle("panneau-ouvert", forcer);
  if (ouvert) v.classList.remove("plan-ouvert"); // un seul volet à la fois
  $("bouton-fiches").setAttribute("aria-expanded", String(ouvert));
  return ouvert;
}

// Après le chargement d'un roman : on retrouve l'état du panneau laissé la dernière fois
export async function preparerPanneau() {
  ficheModifiee = null;
  const memo = await db.lireReglage("panneau:" + etat.roman.id, {});
  vue.onglet = CATEGORIES[memo.onglet] ? memo.onglet : "principal";
  vue.ficheId = trouverFiche(memo.ficheId) ? memo.ficheId : null;
  vue.edition = false;
  vue.epingleeRepliee = !!memo.epingleeRepliee;
  afficherPanneau();
}

export async function fermerPanneau() {
  await sauverFiche();
  $("vue-roman").classList.remove("panneau-ouvert");
}

function memoriserVue() {
  if (!etat.roman) return;
  db.ecrireReglage("panneau:" + etat.roman.id, {
    onglet: vue.onglet, ficheId: vue.ficheId, epingleeRepliee: vue.epingleeRepliee,
  });
}

// =====================================================================
// Navigation dans le panneau
// =====================================================================

function changerOnglet(onglet) {
  if (vue.onglet === onglet && !vue.ficheId) return;
  sauverFiche();
  vue.onglet = onglet;
  vue.ficheId = null;
  vue.edition = false;
  afficherPanneau();
  $("contenu-panneau").scrollTop = 0;
}

// Ouvre une fiche dans le panneau (utilisé aussi par la recherche Ctrl+K)
export function ouvrirFiche(id, { edition = false, focus = true } = {}) {
  const fiche = trouverFiche(id);
  if (!fiche) return;
  sauverFiche();
  vue.onglet = fiche.categorie;
  vue.ficheId = id;
  vue.edition = edition;
  afficherPanneau();
  $("contenu-panneau").scrollTop = 0; // on commence la lecture en haut de la fiche
  if (focus) {
    // En lecture : le titre de la fiche ; en modification : le premier champ
    const cible = edition ? $("contenu-panneau").querySelector("input, textarea") : $("contenu-panneau").querySelector(".fiche-titre");
    if (cible) cible.focus({ preventScroll: true });
    if (edition && cible && cible.select) cible.select();
  }
}

function retourListe() {
  sauverFiche();
  const ancienne = vue.ficheId;
  vue.ficheId = null;
  vue.edition = false;
  afficherPanneau();
  // Le clavier revient sur la fiche qu'on vient de quitter, dans la liste
  const b = $("contenu-panneau").querySelector(`[data-action="ouvrir-fiche"][data-id="${CSS.escape(ancienne || "")}"]`);
  if (b) b.focus({ preventScroll: true });
}

async function terminerEdition() {
  await sauverFiche();
  vue.edition = false;
  afficherPanneau();
  const titre = $("contenu-panneau").querySelector(".fiche-titre");
  if (titre) titre.focus({ preventScroll: true });
}

function replierEpinglee() {
  vue.epingleeRepliee = !vue.epingleeRepliee;
  afficherEpinglee();
  memoriserVue();
  const b = $("epinglee").querySelector('[data-action="replier"]');
  if (b) b.focus();
}

// =====================================================================
// Affichage
// =====================================================================

export function afficherPanneau() {
  if (!etat.roman) return;
  document.querySelectorAll("[data-onglet]").forEach((b) => {
    const actif = b.dataset.onglet === vue.onglet;
    b.setAttribute("aria-selected", String(actif));
    b.tabIndex = actif ? 0 : -1;
  });
  $("contenu-panneau").setAttribute("aria-labelledby", "onglet-" + vue.onglet);
  afficherEpinglee();
  afficherContenu();
  memoriserVue();
}

// La fiche épinglée, toujours visible en haut du panneau
function afficherEpinglee() {
  const zone = $("epinglee");
  const fiche = trouverFiche(etat.roman.ficheEpinglee);
  zone.replaceChildren();
  zone.hidden = !fiche;
  if (!fiche) return;
  zone.append(
    el("div", { class: "epinglee-tete" },
      el("span", { class: "etiquette" }, "📌 Épinglé"),
      el("button", { type: "button", class: "lien-discret", "data-action": "replier", "aria-expanded": String(!vue.epingleeRepliee) },
        vue.epingleeRepliee ? "Déplier" : "Replier"),
    ),
    vue.epingleeRepliee
      ? el("button", { type: "button", class: "epinglee-titre-seul", "data-action": "ouvrir-fiche", "data-id": fiche.id }, fiche.titre || "Sans nom")
      : vueLecture(fiche, { compacte: true }),
  );
}

function afficherContenu() {
  const zone = $("contenu-panneau");
  zone.replaceChildren();
  const fiche = vue.ficheId ? trouverFiche(vue.ficheId) : null;
  if (fiche && vue.edition) zone.append(vueEdition(fiche));
  else if (fiche) zone.append(vueLecture(fiche, { compacte: false }));
  else zone.append(vueListe(vue.onglet));
}

// ---------- La liste d'un onglet ----------

function vueListe(categorie) {
  const cat = CATEGORIES[categorie];
  const fiches = fichesDe(categorie);
  const bouton = el("button", { type: "button", class: "petit-bouton nouvelle-fiche", "data-action": "nouvelle" }, "+ " + cat.nouveau);
  if (fiches.length === 0) {
    return el("div", { class: "liste-vide" },
      el("p", { class: "discret petit" }, messageVide(categorie)),
      bouton,
    );
  }
  if (categorie === "evenement") {
    return el("div", { class: "liste-fiches" },
      bouton,
      el("ol", { class: "frise", "aria-label": "Événements dans l'ordre" },
        fiches.map((f, i) => el("li", { class: "frise-item" },
          el("button", { type: "button", class: "frise-ouvrir", "data-action": "ouvrir-fiche", "data-id": f.id },
            f.champs?.quand ? el("span", { class: "frise-quand mono" }, f.champs.quand) : null,
            el("span", { class: "frise-titre" }, f.titre || "Sans titre"),
            f.champs?.resume ? el("span", { class: "frise-resume" }, f.champs.resume) : null,
          ),
          el("span", { class: "frise-actions" },
            el("button", { type: "button", class: "plan-action", "data-action": "monter", "data-id": f.id,
              "aria-label": `Monter l'événement « ${f.titre} »`, title: "Plus tôt", disabled: i === 0 }, "↑"),
            el("button", { type: "button", class: "plan-action", "data-action": "descendre", "data-id": f.id,
              "aria-label": `Descendre l'événement « ${f.titre} »`, title: "Plus tard", disabled: i === fiches.length - 1 }, "↓"),
          ),
        )),
      ),
    );
  }
  return el("div", { class: "liste-fiches" },
    bouton,
    el("ul", { class: "fiches" },
      fiches.map((f) => el("li", {},
        el("button", { type: "button", class: "fiche-item", "data-action": "ouvrir-fiche", "data-id": f.id },
          el("span", { class: "fiche-item-titre" }, f.titre || "Sans nom"),
          f.type ? el("span", { class: "fiche-item-type" }, f.type) : null,
          etat.roman.ficheEpinglee === f.id ? el("span", { class: "fiche-item-epingle", title: "Épinglée" }, "📌") : null,
        ),
      )),
    ),
  );
}

function messageVide(categorie) {
  return {
    principal: "Aucune fiche de personnage principal. Créez-la : elle pourra rester épinglée pendant que vous écrivez.",
    pnj: "Aucun PNJ pour l'instant.",
    lieu: "Aucun lieu pour l'instant.",
    evenement: "Aucun événement pour l'instant. Ajoutez-les dans l'ordre où ils se sont passés.",
  }[categorie];
}

// ---------- Une fiche, en lecture ----------

function vueLecture(fiche, { compacte }) {
  const cat = CATEGORIES[fiche.categorie];
  const epinglee = etat.roman.ficheEpinglee === fiche.id;
  const champs = cat.champs
    .filter(([cle]) => (fiche.champs?.[cle] || "").trim())
    .map(([cle, libelle]) => [el("dt", {}, libelle), el("dd", {}, fiche.champs[cle])]);
  if ((fiche.notes || "").trim()) champs.push([el("dt", {}, "Notes"), el("dd", {}, fiche.notes)]);

  return el("article", { class: "fiche" + (compacte ? " compacte" : "") },
    compacte ? null : el("button", { type: "button", class: "lien-retour", "data-action": "liste" }, "← " + cat.onglet),
    el("div", { class: "fiche-tete" },
      el(compacte ? "p" : "h2", { class: "fiche-titre", tabindex: "-1" }, fiche.titre || "Sans nom"),
      fiche.type ? el("span", { class: "statut" }, fiche.type) : null,
    ),
    champs.length
      ? el("dl", { class: "fiche-champs" }, champs)
      : el("p", { class: "discret petit" }, "Fiche vide pour l'instant."),
    // (la fiche épinglée reste compacte : sans la liste des événements liés)
    fiche.categorie === "evenement" ? vueConcernes(fiche) : compacte ? null : vueEvenementsLies(fiche),
    el("div", { class: "fiche-actions" },
      el("button", { type: "button", class: "petit-bouton", "data-action": "modifier", "data-id": fiche.id }, "✎ Modifier"),
      epinglee
        ? el("button", { type: "button", class: "petit-bouton", "data-action": "desepingler", "aria-pressed": "true" }, "Désépingler")
        : el("button", { type: "button", class: "petit-bouton", "data-action": "epingler", "data-id": fiche.id, "aria-pressed": "false" }, "📌 Épingler"),
    ),
  );
}

// Événement : les personnages et lieux concernés, sous forme d'étiquettes cliquables
function vueConcernes(fiche) {
  const liens = [...(fiche.champs?.personnages || []), ...(fiche.champs?.lieux || [])]
    .map(trouverFiche).filter(Boolean);
  if (!liens.length) return null;
  return el("div", { class: "fiche-liens" },
    el("p", { class: "etiquette" }, "Concernés"),
    el("div", { class: "pastilles" },
      liens.map((f) => el("button", { type: "button", class: "pastille", "data-action": "ouvrir-fiche", "data-id": f.id },
        f.titre || "Sans nom")),
    ),
  );
}

// Personnage ou lieu : les événements où il apparaît
function vueEvenementsLies(fiche) {
  const evenements = fichesDe("evenement").filter((e) =>
    (e.champs?.personnages || []).includes(fiche.id) || (e.champs?.lieux || []).includes(fiche.id));
  if (!evenements.length) return null;
  return el("div", { class: "fiche-liens" },
    el("p", { class: "etiquette" }, "Apparaît dans"),
    el("ul", { class: "losanges petit" },
      evenements.map((e) => el("li", {},
        el("button", { type: "button", class: "lien-discret", "data-action": "ouvrir-fiche", "data-id": e.id },
          (e.champs?.quand ? e.champs.quand + " — " : "") + (e.titre || "Sans titre")),
      )),
    ),
  );
}

// ---------- Une fiche, en modification ----------

function vueEdition(fiche) {
  const cat = CATEGORIES[fiche.categorie];
  fiche.champs ||= {};
  const idListe = "types-" + fiche.categorie;
  const typesExistants = [...new Set(fichesDe(fiche.categorie).map((f) => f.type).filter(Boolean))];

  // Chaque modification met à jour la fiche, puis l'enregistre peu après
  const surSaisie = (e) => {
    const champ = e.target.name;
    if (!champ) return;
    if (champ === "titre") fiche.titre = e.target.value;
    else if (champ === "type") fiche.type = e.target.value;
    else if (champ === "notes") fiche.notes = e.target.value;
    else if (champ === "personnages" || champ === "lieux") {
      fiche.champs[champ] = [...e.target.form.querySelectorAll(`input[name="${champ}"]:checked`)].map((c) => c.value);
    } else fiche.champs[champ] = e.target.value;
    if (e.target.tagName === "TEXTAREA") ajusterHauteur(e.target);
    planifierSauvegarde(fiche);
  };

  const form = el("form", { class: "fiche-edition", oninput: surSaisie, onchange: surSaisie, onsubmit: (e) => { e.preventDefault(); terminerEdition(); } },
    el("button", { type: "button", class: "lien-retour", "data-action": "liste" }, "← " + cat.onglet),
    el("p", { class: "etiquette" }, "Modifier : " + cat.nom),
    champTexte("titre", "Nom", fiche.titre, { court: true }),
    el("label", { class: "champ" },
      el("span", { class: "etiquette" }, "Type"),
      el("input", { type: "text", name: "type", value: fiche.type || "", list: idListe, placeholder: cat.exempleType, autocomplete: "off" }),
      el("datalist", { id: idListe }, typesExistants.map((t) => el("option", { value: t }))),
    ),
    cat.champs.map(([cle, libelle]) => champTexte(cle, libelle, fiche.champs[cle], { court: CHAMPS_COURTS.includes(cle) })),
    fiche.categorie === "evenement" ? [
      choixLiens("personnages", "Personnages concernés", [...fichesDe("principal"), ...fichesDe("pnj")], fiche.champs.personnages),
      choixLiens("lieux", "Lieux concernés", fichesDe("lieu"), fiche.champs.lieux),
    ] : null,
    champTexte("notes", "Notes libres", fiche.notes),
    el("div", { class: "fiche-actions" },
      el("button", { type: "submit", class: "bouton bouton-petit" }, "Terminé"),
      el("button", { type: "button", class: "petit-bouton danger", "data-action": "supprimer-fiche", "data-id": fiche.id }, "Supprimer la fiche"),
    ),
    el("p", { class: "discret petit" }, "Enregistrement automatique à chaque modification."),
  );
  // Les zones de texte prennent la hauteur de leur contenu
  requestAnimationFrame(() => form.querySelectorAll("textarea").forEach(ajusterHauteur));
  return form;
}

function champTexte(nom, libelle, valeur, { court = false } = {}) {
  return el("label", { class: "champ" },
    el("span", { class: "etiquette" }, libelle),
    court
      ? el("input", { type: "text", name: nom, value: valeur || "", autocomplete: "off", maxlength: 200 })
      : el("textarea", { name: nom, rows: 2, lang: "fr", spellcheck: "true" }, valeur || ""),
  );
}

// Liste de cases à cocher (personnages ou lieux concernés par un événement)
function choixLiens(nom, libelle, fiches, choisis = []) {
  return el("fieldset", { class: "choix-liens" },
    el("legend", { class: "etiquette" }, libelle),
    fiches.length
      ? fiches.map((f) => el("label", { class: "case" },
          el("input", { type: "checkbox", name: nom, value: f.id, checked: choisis.includes(f.id) }),
          el("span", {}, f.titre || "Sans nom"),
        ))
      : el("p", { class: "discret petit" }, "Aucune fiche à relier pour l'instant."),
  );
}

function ajusterHauteur(zone) {
  zone.style.height = "auto";
  zone.style.height = zone.scrollHeight + 2 + "px";
}

// =====================================================================
// Enregistrement
// =====================================================================

function planifierSauvegarde(fiche) {
  fiche.modifie = Date.now();
  ficheModifiee = fiche;
  clearTimeout(minuterie);
  minuterie = setTimeout(sauverFiche, DELAI_SAUVEGARDE);
}

export async function sauverFiche() {
  clearTimeout(minuterie);
  const fiche = ficheModifiee;
  if (!fiche) return;
  ficheModifiee = null;
  if (!trouverFiche(fiche.id)) return; // supprimée entre-temps
  try {
    await db.ecrire("fiches", { ...fiche, champs: { ...fiche.champs } });
    if (etat.roman && etat.roman.ficheEpinglee === fiche.id) afficherEpinglee(); // la fiche épinglée suit les changements
  } catch (erreur) {
    ficheModifiee = fiche;
    informer("La fiche n'a pas pu être enregistrée : " + erreur.message, { erreur: true });
  }
}

// =====================================================================
// Créer, supprimer, épingler, réordonner
// =====================================================================

async function creerFiche(categorie) {
  await sauverFiche();
  const cat = CATEGORIES[categorie];
  const memes = etat.fiches.filter((f) => f.categorie === categorie);
  const fiche = {
    id: nouvelId(), romanId: etat.roman.id, categorie,
    titre: cat.nouveau, type: "", champs: {}, notes: "",
    ordre: memes.length ? Math.max(...memes.map((f) => f.ordre || 0)) + 1 : 0,
    modifie: Date.now(),
  };
  etat.fiches.push(fiche);
  const aEcrire = { fiches: [fiche] };
  // Le premier personnage principal s'épingle tout seul
  if (categorie === "principal" && !trouverFiche(etat.roman.ficheEpinglee)) {
    etat.roman.ficheEpinglee = fiche.id;
    aEcrire.romans = [etat.roman];
  }
  // Le formulaire s'affiche tout de suite ; l'enregistrement suit (sans faire attendre)
  ouvrirFiche(fiche.id, { edition: true });
  await db.lot({ ecrire: aEcrire });
}

async function supprimerFiche(id) {
  const fiche = trouverFiche(id);
  if (!fiche) return;
  const ok = await confirmer({
    titre: "Supprimer cette fiche ?",
    message: [`« ${fiche.titre || "Sans nom"} » sera supprimée définitivement.`, "Cette action ne peut pas être annulée."],
    ok: "Supprimer définitivement",
    danger: true,
  });
  if (!ok) return;
  if (ficheModifiee && ficheModifiee.id === id) ficheModifiee = null;
  // On retire aussi cette fiche des événements qui la citaient
  const evenementsModifies = [];
  for (const e of etat.fiches) {
    if (e.categorie !== "evenement" || !e.champs) continue;
    const avant = (e.champs.personnages || []).length + (e.champs.lieux || []).length;
    e.champs.personnages = (e.champs.personnages || []).filter((x) => x !== id);
    e.champs.lieux = (e.champs.lieux || []).filter((x) => x !== id);
    if (e.champs.personnages.length + e.champs.lieux.length !== avant) evenementsModifies.push(e);
  }
  etat.fiches = etat.fiches.filter((f) => f.id !== id);
  const aEcrire = { fiches: evenementsModifies };
  if (etat.roman.ficheEpinglee === id) {
    etat.roman.ficheEpinglee = null;
    aEcrire.romans = [etat.roman];
  }
  await db.lot({ ecrire: aEcrire, supprimer: { fiches: [id] } });
  informer(`« ${fiche.titre || "Sans nom"} » a été supprimée.`);
  vue.ficheId = null;
  vue.edition = false;
  afficherPanneau();
}

async function epingler(id) {
  sauverFiche();
  etat.roman.ficheEpinglee = id;
  vue.epingleeRepliee = false;
  // L'écran change tout de suite ; l'enregistrement suit
  afficherPanneau();
  const b = $("contenu-panneau").querySelector('[data-action="epingler"], [data-action="desepingler"]');
  if (b) b.focus({ preventScroll: true });
  await db.ecrire("romans", etat.roman);
}

async function deplacerEvenement(id, sens) {
  const liste = fichesDe("evenement");
  const i = liste.findIndex((f) => f.id === id);
  const j = i + sens;
  if (i < 0 || j < 0 || j >= liste.length) return;
  [liste[i], liste[j]] = [liste[j], liste[i]];
  liste.forEach((f, k) => { f.ordre = k; });
  await db.lot({ ecrire: { fiches: liste } });
  afficherContenu();
  const b = $("contenu-panneau").querySelector(`[data-action="${sens < 0 ? "monter" : "descendre"}"][data-id="${CSS.escape(id)}"]`);
  if (b && !b.disabled) b.focus();
}
