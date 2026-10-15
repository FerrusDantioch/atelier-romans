# L'Atelier — Omni-système

Application d'écriture de romans tirés des parties de l'Omni-système.
Elle s'installe comme une application, fonctionne **sans connexion**, et garde tout sur l'ordinateur.

**Version 1.0** — les sept étapes prévues sont terminées.

## En bref : ce que fait l'Atelier

- **Bibliothèque** de romans, chacun dans un univers (Cyberpunk, Fantasy, Space opéra,
  Horreur / enquête, Autre) dont la couleur habille l'interface.
- **Écriture** en chapitres et scènes, chaque scène en deux versions : *Notes* (fragments, puces)
  et *Rédigé* (le texte du roman). Mise en forme `*italique*`, `**gras**`, séparateur `* * *`.
  Compteurs de mots, objectif de session, mode concentration.
- **Fiches** à côté du texte : personnage principal (épinglé), PNJ, lieux, événements dans l'ordre.
- **`Ctrl+K`** : on tape un nom, la fiche s'ouvre à côté, **le curseur ne bouge pas**.
- **Export PDF** d'une scène, d'un chapitre ou du roman, mis en page comme un livre.
- **Sauvegarde automatique** permanente, copie de secours si l'onglet se ferme en pleine phrase,
  et **export / import** de toutes les données dans un fichier, avec un rappel doux.

## Première installation (une seule fois)

L'Atelier a besoin, **la toute première fois**, d'un petit « serveur » sur l'ordinateur (c'est une
règle des navigateurs). Il se lance avec une commande tapée dans un **terminal** : une fenêtre où
l'on donne des instructions en tapant du texte au lieu de cliquer.
Une fois l'application installée, **plus besoin du serveur** pour écrire.

### Étape A — Récupérer les fichiers (sans terminal)

1. Aller sur https://github.com/FerrusDantioch/atelier-romans
2. Cliquer sur le bouton vert **« Code »**, puis **« Download ZIP »**.
3. Décompresser le ZIP :
   - **Windows** : clic droit sur le fichier → **« Extraire tout… »**
   - **Mac** : double-clic sur le fichier
4. On obtient un dossier `atelier-romans-main`.

### Étape B — Lancer le petit serveur

**Sur Windows**

1. Ouvrir le dossier `atelier-romans-main` dans l'Explorateur de fichiers
   (on doit voir `index.html` dedans).
2. Cliquer dans la **barre d'adresse** en haut de la fenêtre (là où s'affiche le chemin du dossier).
3. Effacer ce qui est écrit, taper `cmd` puis **Entrée** : une fenêtre noire s'ouvre,
   c'est le terminal, déjà placé dans le bon dossier.
4. Copier-coller cette commande, puis **Entrée** :

   ```
   py -m http.server 8000
   ```

5. Si un message dit que Python est introuvable : installer Python depuis
   https://www.python.org/downloads/ en **cochant la case « Add python.exe to PATH »**
   pendant l'installation. Fermer la fenêtre noire et recommencer à l'étape 1.

**Sur Mac**

1. Ouvrir l'application **Terminal** : `Cmd + Espace`, taper `Terminal`, **Entrée**.
2. Taper `cd` suivi d'un **espace** (sans appuyer sur Entrée).
3. **Glisser le dossier** `atelier-romans-main` depuis le Finder dans la fenêtre du Terminal :
   son chemin s'écrit tout seul. Appuyer sur **Entrée**.
4. Copier-coller cette commande, puis **Entrée** :

   ```
   python3 -m http.server 8000
   ```

   Si le Mac propose d'installer des « outils de développement », accepter, puis relancer la commande.

### Étape C — Ouvrir l'Atelier

- Le terminal affiche une ligne du type `Serving HTTP on … port 8000` : c'est bon signe.
- Ouvrir **Chrome ou Edge** à l'adresse **http://localhost:8000**
- Dans « À propos », la ligne **« Prête à fonctionner sans connexion ✓ »** confirme que l'application
  s'est mise en réserve dans le navigateur.

### Étape D — Installer l'application

- Dans la Bibliothèque, cliquer sur **« Installer l'application »**. L'encart apparaît quand le
  navigateur le permet, parfois seulement après quelques instants passés sur la page.
  Autre possibilité : la petite icône d'installation à droite de la barre d'adresse, ou le menu du
  navigateur (⋮) → **« Installer L'Atelier »** (Edge : « Applications » → « Installer ce site en tant qu'application »).
- L'Atelier a maintenant **son icône** (bureau, menu Démarrer ou Launchpad) et **sa propre fenêtre**.
- On peut alors arrêter le serveur (`Ctrl + C` dans la fenêtre noire, ou la fermer).

## Au quotidien

1. **Ouvrir l'Atelier** depuis son icône. Pas de serveur, pas de connexion nécessaires.
2. **Écrire** : tout s'enregistre tout seul, en continu.
3. **Consulter une fiche** sans perdre le fil : `Ctrl+K`, quelques lettres, `Entrée`… et on continue d'écrire.
4. **Exporter ses données** quand le rappel apparaît (ou une fois par semaine) : bouton
   « Exporter mes données » en bas de la Bibliothèque, puis ranger le fichier en lieu sûr
   (clé USB, cloud…). **C'est la seule copie hors de cet ordinateur.**
5. Pour lire ou faire relire : **Exporter en PDF** (`Ctrl+P`).

## Mettre à jour l'Atelier (nouvelle version)

1. Retélécharger le ZIP (étape A) et lancer le serveur **depuis le nouveau dossier** (étape B), avec le numéro `8000`.
2. Ouvrir l'Atelier (son icône, ou http://localhost:8000) : il prend la nouvelle version tout seul,
   et la met en réserve pour fonctionner ensuite sans connexion.
3. Arrêter le serveur.

Les romans ne sont pas dans le dossier mais dans le navigateur : une mise à jour n'y touche pas.
*(Pour les habitués de git : `git clone https://github.com/FerrusDantioch/atelier-romans.git`, puis `git pull`.)*

## Si quelque chose ne va pas

- **« L'application n'a pas pu démarrer »** :
  - la page a sans doute été ouverte par double-clic sur `index.html` : il faut passer par le
    petit serveur (étape B) et l'adresse **http://localhost:8000** ;
  - si le message apparaît alors que le serveur tourne (cela arrive sur certains Windows), arrêter le
    serveur (`Ctrl + C`) et le relancer avec la solution de secours : `py serveur.py`
    (Mac : `python3 serveur.py`).
- **« L'Atelier est déjà ouvert ailleurs »** : l'application est ouverte dans un autre onglet ou une
  autre fenêtre (par exemple l'application installée **et** un onglet). Une seule page peut servir à
  la fois, sinon chacune effacerait le travail de l'autre. Fermez l'autre page — celle-ci s'ouvre alors
  toute seule — ou cliquez sur « Utiliser plutôt cette page » : l'autre enregistre tout et vous cède la place.
- **Bibliothèque vide alors qu'on avait des romans** : vérifier l'adresse. Le navigateur range les
  romans selon l'adresse exacte : **toujours `localhost:8000`** (avec `localhost:8001`, on verrait une
  bibliothèque vide ; rien ne serait perdu, juste rangé sous l'autre adresse).

## Écrire

Ouvrez un roman depuis la Bibliothèque. L'écran se divise en trois colonnes :
**le plan** à gauche, **le texte** au centre, **la consultation des fiches** à droite.

- **Plan** : « + Chapitre » et « + Scène » pour ajouter. Au survol d'une ligne apparaissent
  ↑ ↓ (déplacer), ✎ (renommer) et ✕ (supprimer, avec confirmation).
  Une scène qu'on monte depuis le haut de son chapitre passe à la fin du chapitre précédent.
- **Notes / Rédigé** : chaque scène a deux textes. *Notes* pour les fragments et les puces,
  *Rédigé* pour le texte du roman. On bascule à tout moment ; chacun garde son curseur.
- **Mise en forme** : `*italique*`, `**gras**`, et `* * *` (séparateur) sur sa propre ligne.
  Les boutons I, G et * * * insèrent ces symboles autour du texte sélectionné.
- **Compteurs** : mots de la scène, du chapitre et du roman (seul le texte *Rédigé* compte).
- **Session** : la barre suit les mots ajoutés depuis le début de la session.
  La session redémarre chaque jour, ou avec « Nouvelle session ». L'objectif se change
  avec « Changer l'objectif ».
- **Enregistrement** : automatique, en continu (« Enregistré ✓ » en bas à droite).
  Même si l'onglet se ferme en pleine phrase, le texte est récupéré à la réouverture.
  Si « Non enregistré ! » s'affiche (disque plein…), le texte est gardé en secours dans le navigateur
  et remis dans le roman dès que possible : ne videz pas les données du navigateur à ce moment-là.

## Consulter et modifier les fiches (colonne de droite)

- **4 onglets** : Principal (personnage principal), PNJ, Lieux, Événements.
  « + Nouveau… » crée une fiche ; « ✎ Modifier » ouvre le formulaire ; tout s'enregistre seul ;
  « Terminé » revient à la lecture.
- **Champs** : personnages → apparence, caractère, background, relations ;
  lieux → description, ambiance ; événements → date ou moment, résumé, personnages et lieux concernés.
  Chaque fiche a aussi un **type** libre (allié, taverne…) et des **notes libres**.
- **Fiche épinglée** : elle reste affichée en haut du panneau, quel que soit l'onglet.
  Le premier personnage principal s'épingle tout seul ; « 📌 Épingler » en choisit une autre ;
  « Replier » la réduit à son nom.
- **Événements** : listés dans l'ordre, avec le moment et le début du résumé. ↑ ↓ pour les réordonner.
  Les personnages et lieux cochés deviennent des étiquettes cliquables ; chaque fiche indique
  en retour « Apparaît dans » ses événements.
- **`Échap`** dans le panneau : retour au texte, le curseur exactement où il était.
- **Écran moyen ou petit** : le panneau devient un volet, ouvert par le bouton « Fiches ».

## La recherche rapide : `Ctrl+K`

En pleine écriture, besoin de vérifier la couleur des yeux d'un PNJ ?

1. **`Ctrl+K`** (Mac : `Cmd+K`) : la recherche s'ouvre.
2. Tapez quelques lettres du nom : « corb » trouve « Mère Corbeau ».
   Accents et majuscules sont ignorés. On peut aussi chercher par type (« antagoniste »)
   ou par un mot du contenu de la fiche (« néons »).
3. **`Entrée`** : la fiche s'ouvre dans le panneau, et **votre curseur reste exactement où il était**
   dans le texte (même sélection, même défilement). Vous continuez d'écrire aussitôt.
4. **`Échap`** : la recherche se ferme, retour au texte sans rien changer.

Autres possibilités : `↑` `↓` pour choisir parmi les résultats ; **`Ctrl+Entrée`** pour ouvrir la fiche
en modification ; un clic sur un résultat. Si le nom n'existe pas encore, la recherche propose
**« Créer un PNJ »** ou **« Créer un lieu »** avec ce nom, sans quitter le texte.
Sans rien taper, la recherche propose les dernières fiches consultées.

Les boutons « ⌕ Chercher » (panneau) et « ⌕ » (barre d'outils, sur écran moyen) font la même chose à la souris.

## Exporter en PDF (mise en page de livre)

1. Dans la page d'écriture, cliquez sur **« Exporter en PDF »** (sous le titre du roman, à gauche),
   ou appuyez sur **`Ctrl+P`**.
2. Choisissez : **le roman entier**, **un chapitre** (dans la liste) ou **la scène ouverte** ;
   le **format** (*Livre A5*, le format d'un roman, ou *Page A4*) ; avec ou sans **page de titre**.
3. Cliquez sur **« Préparer le PDF »** : la fenêtre d'impression du navigateur s'ouvre.
4. Dans **« Destination »**, choisissez **« Enregistrer au format PDF »**, puis **« Enregistrer »**.
   Si la case **« En-têtes et pieds de page »** apparaît (dans « Plus de paramètres »), **décochez-la** :
   sinon le navigateur ajoute sa propre date et l'adresse de la page.

Ce que contient le PDF : le **texte rédigé** seulement (jamais les notes ni les fiches), un chapitre
par page, les `* * *` centrés (un séparateur est aussi placé entre deux scènes), l'*italique* et le
**gras** mis en forme, les numéros de page, et la mention discrète **« Réalisé par Ferrus Dantioch »**
sur la page de titre et en pied de page — c'est le seul nom qui y figure.
Pour un roman entier, l'aperçu peut mettre quelques secondes à apparaître.
Utilisez **Chrome ou Edge** : Firefox n'imprime pas encore les numéros de page ni la mention en pied de page.

### Raccourcis clavier

| Raccourci | Effet |
|---|---|
| `Ctrl+I` | italique `*…*` (une 2e fois : le retire) |
| `Ctrl+B` | gras `**…**` |
| `Entrée` sur une ligne `- …` (mode Notes) | nouvelle puce ; sur une puce vide : fin de la liste |
| `Ctrl+K` | recherche rapide d'une fiche (le curseur reste en place) |
| `Ctrl+Maj+F` | mode concentration (seul le texte reste) |
| `Ctrl+P` | exporter en PDF (scène, chapitre ou roman) |
| `Échap` | quitter le mode concentration, ou revenir au texte depuis le panneau |
| `←` `→` sur les onglets du panneau | changer d'onglet |
| `Ctrl+Z` | annuler (dans le texte : n'annule jamais, par erreur, une modification faite dans une fiche) |
| `Ctrl+Y` ou `Ctrl+Maj+Z` | rétablir |
| `Ctrl+S` | inutile : tout est déjà enregistré (un message le rappelle) |

Sur Mac, `Cmd` remplace `Ctrl`.

## Mes données : où sont-elles, comment les protéger ?

- Tout est enregistré **automatiquement**, dans le navigateur, **sur cet ordinateur uniquement**.
  Aucun compte, aucun serveur.
- ⚠️ Si vous effacez les données de navigation du site, ou changez d'ordinateur ou de navigateur,
  vous ne retrouverez pas vos romans… sauf si vous les avez **exportés**.
- **Exporter** : bouton « Exporter mes données » en bas de la Bibliothèque.
  Un fichier `atelier-romans-sauvegarde-AAAA-MM-JJ.json` est téléchargé.
  Rangez-le en lieu sûr (clé USB, cloud…).
- **Importer** : bouton « Importer mes données », puis choisir un fichier de sauvegarde.
  ⚠️ L'import **remplace** toutes les données actuelles par celles du fichier.
- Un **rappel discret** apparaît en haut de l'écran quand des modifications n'ont pas été
  exportées depuis 3 jours. « Plus tard » le cache pendant 2 jours.

## Changer l'apparence

Tout est dans **`css/theme.css`** : couleurs, polices, arrondis, lueurs, espacements.
Chaque ligne est commentée en français.

## Remplacer les logos

Les logos actuels sont repris du portfolio. Pour mettre les vôtres, remplacez
dans `assets/` (en gardant les mêmes noms) :

| Fichier | Rôle |
|---|---|
| `logo.png` | logo de l'en-tête (carré) |
| `logo-rond.png` | logo rond de la page « À propos » |
| `icone-192.png`, `icone-512.png` | icônes de l'application installée (rondes, fond sombre) |
| `icone-maskable-512.png` | icône carrée pleine (Android découpe lui-même la forme) |
| `favicon.png` | petite icône de l'onglet |

Après le remplacement : lancer le serveur et ouvrir l'Atelier une fois pour qu'il prenne les nouvelles
images. L'icône de l'application déjà installée peut mettre un peu de temps à changer (la désinstaller
puis la réinstaller la met à jour aussitôt ; les romans ne sont pas touchés).

## Ce qui reste à faire, et idées pour plus tard

Prévu « pour plus tard » dès le départ (hors de la première version) :
- une **frise chronologique visuelle** des événements ;
- des **liens automatiques** entre le texte et les fiches (noms mis en surbrillance) ;
- l'**import des fiches PDF** de JDR ;
- la **synchronisation** entre plusieurs appareils.

À savoir :
- **Remplacer les logos** par les vôtres (voir plus haut), si ceux repris du portfolio ne conviennent pas.
- **Navigateur conseillé : Chrome ou Edge.** Firefox n'installe pas les applications de ce type et
  n'imprime pas les numéros de page du PDF. Safari (Mac, iPad) n'a pas été testé.
- La **coupure des mots** en fin de ligne dans le PDF dépend du navigateur (elle peut manquer).
- L'Atelier n'est **pas publié sur Internet** (voir ci-dessous).

## Publier l'Atelier sur Internet (facultatif, non fait)

Le dossier est prêt pour **GitHub Pages**, qui donnerait une adresse du type
`https://ferrusdantioch.github.io/atelier-romans/`, utilisable sans aucun serveur sur l'ordinateur.
Rien n'a été publié : il suffira de le demander. Attention : à une nouvelle adresse correspond une
nouvelle bibliothèque, vide. Pour y retrouver ses romans : « Exporter mes données » ici, puis
« Importer mes données » là-bas.

## Organisation des fichiers

```
index.html     la page de l'application
manifest.json  la carte d'identité de l'application (nom, icônes, couleurs) pour l'installer
sw.js          le « service worker » : la réserve qui permet de fonctionner sans connexion
serveur.py     petit serveur de secours (voir « Si quelque chose ne va pas »)
css/theme.css  toutes les couleurs et polices
css/app.css    la mise en page
css/impression.css  la mise en page de livre du PDF
js/app.js           le chef d'orchestre (navigation entre les pages)
js/db.js            le stockage des données (IndexedDB) + export/import
js/bibliotheque.js  la liste des romans
js/etat.js          le roman ouvert, en mémoire (chapitres, scènes, compteurs)
js/plan.js          le plan : chapitres et scènes
js/editeur.js       l'écriture : modes, mise en forme, enregistrement, session, concentration
js/panneau.js       le panneau de consultation : onglets, fiches, épinglage, événements
js/recherche.js     la recherche rapide Ctrl+K
js/export-pdf.js    l'export PDF (le livre à imprimer)
js/annulation.js    Ctrl+Z en toute sécurité (n'annule que là où l'on écrit)
js/onglets.js       une seule page de l'Atelier ouverte à la fois
js/hors-ligne.js    le mode hors ligne et le bouton « Installer l'application »
js/sauvegarde.js    les boutons d'export/import et le rappel
js/dialogues.js     les fenêtres de confirmation et les petits messages
js/outils.js        petites fonctions partagées (compteur de mots, dates…)
fonts/         les polices (hors ligne)
assets/        logos et icônes
```

## Conception

L'Atelier a été conçu par **Ferrus Dantioch** et **Claude**, l'assistant d'intelligence artificielle
d'Anthropic : Ferrus Dantioch, créateur de l'Omni-système, en a imaginé l'idée, les besoins et
l'apparence ; Claude en a écrit le code. Application personnelle, destinée pour l'instant à son seul auteur.
(C'est aussi indiqué dans la page « À propos » de l'application.)

---
*Réalisé par Ferrus Dantioch*
