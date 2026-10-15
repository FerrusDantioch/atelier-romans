// =====================================================================
// SERVICE WORKER : l'application fonctionne sans connexion (et sans serveur)
//
// À la première ouverture, tous les fichiers de l'application sont copiés dans
// une réserve du navigateur. Ensuite, à chaque ouverture :
//   - si le serveur répond, on prend la version fraîche (et on met la réserve à jour) ;
//   - sinon (pas de connexion, serveur arrêté), on prend la copie en réserve.
// Ainsi, une modification (par exemple de css/theme.css) se voit tout de suite,
// et l'application démarre quand même quand il n'y a rien pour la servir.
//
// Les romans, eux, ne sont jamais ici : ils sont dans la base IndexedDB.
// =====================================================================

const RESERVE = "atelier-romans";
const DELAI_RESEAU = 4000; // au-delà (connexion très lente), on prend la copie en réserve

// Tous les fichiers de l'application (à compléter si l'on en ajoute un)
const FICHIERS = [
  "./",
  "index.html",
  "manifest.json",
  "css/theme.css",
  "css/app.css",
  "css/impression.css",
  "js/app.js",
  "js/annulation.js",
  "js/bibliotheque.js",
  "js/db.js",
  "js/dialogues.js",
  "js/editeur.js",
  "js/etat.js",
  "js/export-pdf.js",
  "js/hors-ligne.js",
  "js/onglets.js",
  "js/outils.js",
  "js/panneau.js",
  "js/plan.js",
  "js/recherche.js",
  "js/sauvegarde.js",
  "fonts/oxanium.woff2",
  "fonts/literata.woff2",
  "fonts/literata-italique.woff2",
  "fonts/jetbrains-mono.woff2",
  "assets/logo.png",
  "assets/logo-rond.png",
  "assets/favicon.png",
  "assets/icone-192.png",
  "assets/icone-512.png",
  "assets/icone-maskable-512.png",
];

// Installation : on remplit la réserve (en redemandant chaque fichier au serveur)
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const reserve = await caches.open(RESERVE);
    await reserve.addAll(FICHIERS.map((f) => new Request(f, { cache: "reload" })));
    await self.skipWaiting(); // la nouvelle version prend le relais sans attendre
  })());
});

// Activation : on supprime les éventuelles anciennes réserves, et on prend en charge la page ouverte
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const nom of await caches.keys()) if (nom !== RESERVE) await caches.delete(nom);
    await self.clients.claim();
  })());
});

// Chaque fichier demandé par l'application
self.addEventListener("fetch", (e) => {
  const demande = e.request;
  if (demande.method !== "GET" || new URL(demande.url).origin !== self.location.origin) return;
  e.respondWith(repondre(demande));
});

async function repondre(demande) {
  const reserve = await caches.open(RESERVE);
  const page = demande.mode === "navigate"; // ouverture de l'application elle-même
  try {
    // 1. Version fraîche, si le serveur répond assez vite
    const reponse = await avecDelai(fetch(demande, { cache: "no-cache" }), DELAI_RESEAU);
    if (reponse.ok) {
      // (une réponse obtenue par redirection n'est pas mise en réserve)
      if (!reponse.redirected) reserve.put(page ? "index.html" : demande, reponse.clone());
      return reponse;
    }
    throw new Error("réponse " + reponse.status);
  } catch {
    // 2. Sinon, la copie en réserve (pour une page : l'application, index.html)
    const copie = await reserve.match(page ? "index.html" : demande, { ignoreSearch: true });
    if (copie) return copie;
    return new Response("Hors ligne : ce fichier n'est pas disponible.", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

// Abandonne une attente trop longue
function avecDelai(promesse, ms) {
  return new Promise((ok, echec) => {
    const minuterie = setTimeout(() => echec(new Error("trop lent")), ms);
    promesse.then((r) => { clearTimeout(minuterie); ok(r); }, (err) => { clearTimeout(minuterie); echec(err); });
  });
}
