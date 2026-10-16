# L'Atelier — Omni-système

Application d'écriture de romans tirés des parties de l'Omni-système.
Elle s'installe comme une application, fonctionne **sans connexion**, et garde tout sur l'ordinateur.

**Version 1.7** — les sept étapes prévues sont terminées, plus l'étape 8 (les fiches repérées dans le texte),
l'étape 9 (écrire sur deux appareils : la fusion), l'étape 10 (la frise des événements),
l'étape 11 (les noms en couleur dans le texte), l'étape 12 (les notes à côté du texte rédigé),
l'étape 13 (sur chaque fiche, les scènes où elle est nommée) et l'étape 14 (l'export en ePub et en Word).

**En ligne : https://ferrusdantioch.github.io/atelier-romans/** — s'ouvre aussi sur téléphone,
sans rien installer d'autre (voir « L'Atelier en ligne » plus bas).

## En bref : ce que fait l'Atelier

- **Bibliothèque** de romans, chacun dans un univers (Cyberpunk, Fantasy, Space opéra,
  Horreur / enquête, Autre) dont la couleur habille l'interface.
- **Écriture** en chapitres et scènes, chaque scène en deux versions : *Notes* (fragments, puces)
  et *Rédigé* (le texte du roman), ou **les deux côte à côte** sur un écran assez large.
  Mise en forme `*italique*`, `**gras**`, séparateur `* * *`.
  Compteurs de mots, objectif de session, mode concentration.
- **Fiches** à côté du texte : personnage principal (épinglé), PNJ, lieux, événements dans l'ordre.
- **Frise des événements** : toute la partie sur une ligne du temps, et d'un coup d'œil, qui apparaît où.
- **`Ctrl+K`** : on tape un nom, la fiche s'ouvre à côté, **le curseur ne bouge pas**.
- **Dans cette scène** : les personnages et lieux nommés dans la scène s'affichent d'eux-mêmes
  à côté du texte, prêts à être consultés d'un clic.
- **Noms en couleur** : ces noms sont aussi soulignés directement dans le texte ; les toucher ouvre leur fiche.
- **Nommé dans ces scènes** : sur la fiche d'un personnage ou d'un lieu, les scènes où il est nommé ;
  en toucher une l'ouvre, le nom sélectionné.
- **Export** d'une scène, d'un chapitre ou du roman : en **PDF** mis en page comme un livre,
  en **ePub** pour une liseuse, ou en **Word** pour faire relire.
- **Sauvegarde automatique** permanente, copie de secours si l'onglet se ferme en pleine phrase,
  et **export / import** de toutes les données dans un fichier, avec un rappel doux.
- **Deux appareils** (téléphone et ordinateur) : le fichier exporté sur l'un se **fusionne** sur l'autre,
  sans rien écraser.

## Première installation (une seule fois)

*Plus simple : ouvrir l'adresse en ligne ci-dessus dans Chrome ou Edge, puis passer directement
à l'étape D (installer). Les étapes A à C ne servent que pour faire tourner l'Atelier depuis
ses fichiers, sur l'ordinateur.*

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
  s'est mise en réserve dans le navigateur. **Attendez de la voir avant d'arrêter le serveur.**
  Si elle commence par **⚠**, elle dit ce qui manque : le plus souvent, le serveur a été lancé depuis
  un autre dossier (refaire l'étape B depuis le dossier qui contient `index.html`), ou le dossier est
  incomplet (refaire l'étape A). Puis rouvrir http://localhost:8000.

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
5. Pour lire ou faire relire : **Exporter (PDF, ePub, Word)**, depuis la page d'écriture du roman.

## Mettre à jour l'Atelier (nouvelle version)

1. Retélécharger le ZIP (étape A) et lancer le serveur **depuis le nouveau dossier**, avec la même
   commande que d'habitude (étape B, ou `py serveur.py` si c'est elle qui marche chez vous), et le numéro `8000`.
2. Ouvrir l'Atelier (son icône, ou http://localhost:8000) : il prend la nouvelle version tout seul,
   et la met en réserve pour fonctionner ensuite sans connexion.
3. Attendre la ligne **« Prête à fonctionner sans connexion ✓ »** dans « À propos », puis arrêter le serveur.

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
  Sur écran tactile, ils restent affichés pour les chapitres et pour la scène ouverte
  (pour une autre scène : la toucher d'abord, ce qui l'ouvre).
  Une scène qu'on monte depuis le haut de son chapitre passe à la fin du chapitre précédent.
- **Notes / Rédigé** : chaque scène a deux textes. *Notes* pour les fragments et les puces,
  *Rédigé* pour le texte du roman. On bascule à tout moment ; chacun garde son curseur.
- **Les deux** (côte à côte) : les notes à gauche, le texte rédigé à droite, plus large.
  On rédige en gardant ses notes sous les yeux, et l'on peut écrire dans les deux :
  cliquez dans l'un ou l'autre ; le titre de la colonne où vous écrivez est en couleur,
  et les boutons I, G, * * * (et la puce, côté notes) agissent sur elle.
  - Ce bouton n'apparaît que si la colonne d'écriture est assez large (ordinateur, tablette tenue
    en largeur). Si la fenêtre devient trop étroite, seul reste le texte où vous écriviez ;
    qu'elle s'élargisse de nouveau, et les deux reviennent. En mode concentration, les deux restent.
  - Le choix est gardé sur cet appareil, pour toutes les scènes. Pour revenir à un seul texte :
    « Notes » ou « Rédigé ».
  - Seuls ces boutons « Notes » et « Rédigé » changent le mode de la scène (et la mention « notes »
    dans le plan) : passer d'une colonne à l'autre n'y change rien.
  - `Ctrl+Z` annule dans la colonne où vous écrivez. Limite : après un `Ctrl+Z` dans une colonne,
    ce que vous aviez tapé juste avant dans l'autre ne peut plus être annulé (le navigateur ne garde
    qu'une seule liste d'annulations pour toute la page).
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
- **Champs** : personnages → autres noms, apparence, caractère, background, relations ;
  lieux → autres noms, description, ambiance ; événements → date ou moment, résumé, personnages et lieux concernés.
  Chaque fiche a aussi un **type** libre (allié, taverne…) et des **notes libres**.
- **Dans cette scène** (en haut du panneau) : les personnages et lieux de vos fiches qui sont nommés
  dans la scène ouverte (notes et texte rédigé), dans l'ordre où ils apparaissent. La liste se met à
  jour pendant que vous écrivez. Un clic ouvre la fiche, **le curseur reste dans le texte**.
  Sur écran moyen ou petit, le bouton indique combien il y en a : « Fiches (3) ».
  Une fiche est repérée par :
  - son **nom complet** (« Mère Corbeau », même écrit « mère corbeau ») ;
  - un de ses **autres noms** (champ « Autres noms », séparés par des virgules : « la Vieille, Corbeau ») ;
  - un **mot de son nom écrit avec une majuscule** : « Corbeau » repère Mère Corbeau, mais pas « un corbeau ».
    Les mots courants (Mère, Docteur, Taverne, Grand…) ne suffisent pas, car plusieurs fiches peuvent les partager.
  Accents et majuscules sont ignorés, sauf la majuscule exigée pour un nom d'un seul mot.
  Les événements, et une fiche pas encore renommée (« Nouveau PNJ »), ne sont pas repérés.
- **Noms en couleur dans le texte** : les mêmes noms sont soulignés directement dans la scène,
  à la couleur de l'univers (les lieux en pointillés). La couleur suit l'écriture : un nom tapé se
  colore aussitôt, un nom effacé perd sa couleur.
  - **Toucher (ou cliquer) un nom coloré** fait apparaître une petite bulle, par exemple « PNJ · Mira la Rousse › » :
    la toucher ouvre la fiche (sur téléphone, le volet des fiches s'ouvre). Le curseur reste dans le texte.
    Si un même mot nomme deux fiches (« Corbeau » : Mère Corbeau et la Taverne du Corbeau Noir),
    la bulle propose les deux. Taper au clavier ou toucher ailleurs la fait disparaître.
  - **`Ctrl+clic`** (Mac : `Cmd+clic`) sur un nom ouvre sa fiche directement.
  - Pour écrire sans couleurs : décochez **« Noms en couleur dans le texte »**, sous « Dans cette scène ».
    Ce choix est propre à chaque appareil. En mode concentration, les couleurs s'effacent d'elles-mêmes.
  - Un nom coupé par un retour à la ligne (« Mère » en fin de ligne, « Corbeau » au début de la suivante)
    n'est pas coloré en entier : seul « Corbeau » l'est, comme un nom d'un seul mot.
    Il compte bien, lui, dans « Dans cette scène ».
- **Nommé dans ces scènes** (en bas de la fiche d'un personnage ou d'un lieu) : les scènes où il est
  nommé, chapitre par chapitre, avec le nombre de fois (« 2 fois » ; « 1 fois (notes) » s'il n'est
  nommé que dans les notes). Le survol en donne le détail (texte rédigé, notes).
  Mêmes règles que pour les noms en couleur : « Mère Corbeau » ne compte que pour Mère Corbeau ;
  « Corbeau » tout seul compte pour chaque fiche qui porte ce mot.
  - **Toucher une scène** l'ouvre et y sélectionne le nom ; sa ligne est amenée vers le haut du texte
    (sur téléphone, le volet des fiches se referme pour laisser voir le texte).
    Si le nom n'est que dans les notes, ce sont elles qui s'affichent (le mode de la scène ne change pas).
  - **La scène ouverte** est marquée d'un trait de couleur : la toucher de nouveau mène au passage
    suivant (le texte rédigé d'abord, puis les notes), et après le dernier, de nouveau au premier.
  - Comme après une recherche, le nom sélectionné serait remplacé si vous tapiez aussitôt :
    un clic dans le texte, ou une flèche, retire la sélection (`Ctrl+Z` rétablit le nom au besoin).
  - La liste suit l'écriture : un nom tapé dans la scène ouverte y compte un instant après.
  - Juste après l'ouverture d'un gros roman (ou après avoir changé un nom de fiche), la liste peut
    mettre un instant à venir : « Recherche dans le roman… ». Le roman est lu en arrière-plan,
    sans jamais bloquer l'écriture.
  - Pas de liste pour la fiche épinglée (gardée courte), ni pour les événements (ils ont leurs « Concernés »).
- **Fiche épinglée** : elle reste affichée en haut du panneau, quel que soit l'onglet.
  Le premier personnage principal s'épingle tout seul ; « 📌 Épingler » en choisit une autre ;
  « Replier » la réduit à son nom.
- **Événements** : listés dans l'ordre, avec le moment et le début du résumé. ↑ ↓ pour les réordonner.
  Les personnages et lieux cochés deviennent des étiquettes cliquables ; chaque fiche indique
  en retour « Apparaît dans » ses événements, et « Suivre sur la frise » (voir ci-dessous).
  « Voir la frise » ouvre la frise des événements.
- **`Échap`** dans le panneau : retour au texte, le curseur exactement où il était.
- **Écran moyen ou petit** : le panneau devient un volet, ouvert par le bouton « Fiches ».

## La frise des événements

Pour voir toute la partie d'un coup : **« Frise des événements »**, sous le titre du roman (à gauche ;
sur téléphone, dans le volet « ☰ Plan »), ou **« Voir la frise »** dans l'onglet Événements.

- **La ligne du temps** : chaque événement est un losange numéroté (1, 2, 3…) suivi de sa carte :
  la date ou le moment, le nom, le type, le résumé, et les personnages et lieux concernés
  (les lieux ont un contour en pointillés). **↑ ↓** changent l'ordre, ici aussi.
- **Qui apparaît où** : une ligne par personnage ou lieu, une case par événement, dans l'ordre.
  Les cases pleines montrent où il apparaît : on voit tout de suite qu'un PNJ a disparu depuis
  longtemps, ou qu'un lieu revient souvent. Seuls les personnages et lieux reliés à au moins un
  événement sont listés (ceux cochés dans « Personnages concernés » et « Lieux concernés »).
  Sur téléphone, ce tableau est replié : le toucher pour l'ouvrir.
- **Suivre** un personnage ou un lieu : touchez son nom (dans « Qui apparaît où » ou sur une carte).
  Ses événements ressortent, les autres s'effacent un peu, et un bandeau indique
  « Vous suivez Mira : 3 événements sur 7 ». Retouchez le nom, ou « Tout afficher », pour arrêter.
  Depuis la fiche d'un personnage, « Suivre sur la frise » ouvre la frise en le suivant déjà.
- **Ouvrir une fiche** : touchez le nom d'un événement (ou « Ouvrir sa fiche » pour le personnage suivi) :
  on revient au texte, la fiche ouverte à côté, prête à être lue ou modifiée.
  « + Nouvel événement » fait de même avec une nouvelle fiche.
- **Revenir au texte** : « ← Retour au texte », `Échap`, ou le bouton « retour » du téléphone.
  Le curseur et le défilement du texte sont exactement comme avant.

## La recherche rapide : `Ctrl+K`

En pleine écriture, besoin de vérifier la couleur des yeux d'un PNJ ?

1. **`Ctrl+K`** (Mac : `Cmd+K`) : la recherche s'ouvre.
2. Tapez quelques lettres du nom : « corb » trouve « Mère Corbeau ».
   Accents et majuscules sont ignorés. On peut aussi chercher par un autre nom (« vieille »),
   par type (« antagoniste ») ou par un mot du contenu de la fiche (« néons »).
3. **`Entrée`** : la fiche s'ouvre dans le panneau, et **votre curseur reste exactement où il était**
   dans le texte (même sélection, même défilement). Vous continuez d'écrire aussitôt.
4. **`Échap`** : la recherche se ferme, retour au texte sans rien changer.

Autres possibilités : `↑` `↓` pour choisir parmi les résultats ; **`Ctrl+Entrée`** pour ouvrir la fiche
en modification ; un clic sur un résultat. Si le nom n'existe pas encore, la recherche propose
**« Créer un PNJ »** ou **« Créer un lieu »** avec ce nom, sans quitter le texte.
Sans rien taper, la recherche propose les dernières fiches consultées.

Les boutons « ⌕ Chercher » (panneau) et « ⌕ » (barre d'outils, sur écran moyen) font la même chose à la souris.

## Exporter : PDF, ePub ou Word

Dans la page d'écriture, cliquez sur **« Exporter (PDF, ePub, Word) »** (sous le titre du roman, à gauche).
Choisissez **le roman entier**, **un chapitre** (dans la liste) ou **la scène ouverte**, puis le **type de fichier** :

| Type | Pour quoi faire |
|---|---|
| **PDF** | un livre à imprimer ou à lire à l'écran (voir ci-dessous) |
| **ePub** | lire le roman sur une liseuse (Kobo, Kindle…) ou dans une application de lecture du téléphone |
| **Word (.docx)** | le faire relire, l'annoter, le retravailler (Word, LibreOffice, Google Docs…) |

Dans tous les cas : le **texte rédigé** seulement (jamais les notes ni les fiches), l'*italique* et le
**gras** mis en forme, les `* * *` (un séparateur est aussi placé entre deux scènes), une page de titre
si la case est cochée, et un seul nom, le pseudonyme **Ferrus Dantioch** (auteur du fichier, et
« Réalisé par Ferrus Dantioch » sur la page de titre). L'Atelier retient votre dernier choix.

### ePub et Word

1. Cochez **ePub** ou **Word (.docx)**, puis cliquez sur **« Créer le fichier ePub »** (ou « … Word »).
2. Le fichier arrive dans vos **Téléchargements**, nommé d'après le titre du roman
   (par exemple `Les Cendres de Port-Sombre.epub` ; pour un chapitre, son titre est ajouté).

- **L'ePub** : un chapitre par « page » de la liseuse, un sommaire des chapitres, la typographie
  française (espaces insécables avant `:` `;` `!` `?`). La liseuse garde la main sur la police et sa taille.
  Pour le mettre sur une liseuse : Kobo, en le copiant par le câble USB ; Kindle, avec le service
  « Send to Kindle » d'Amazon ; sur le téléphone, en l'ouvrant avec une application de lecture
  (Google Play Livres, Apple Livres…). Exporter de nouveau le roman entier crée une nouvelle version
  du même livre.
- **Le Word** : un manuscrit classique, facile à relire : format A4, Times New Roman 12, interligne 1,5,
  texte justifié, chaque chapitre sur une nouvelle page, numéros de page en bas.
  Les chapitres ont le style « Titre 1 » : ils apparaissent dans le volet de navigation de Word.
- Ces fichiers ont été contrôlés avec les outils de référence (EPUBCheck pour l'ePub, LibreOffice et
  pandoc pour le Word), mais pas encore sur une vraie liseuse ni dans Microsoft Word lui-même.

### PDF (mise en page de livre)

1. Cochez **PDF** (c'est aussi ce qu'ouvre **`Ctrl+P`**), puis choisissez le **format**
   (*Livre A5*, le format d'un roman, ou *Page A4*) ; avec ou sans **page de titre**.
2. Cliquez sur **« Préparer le PDF »** : la fenêtre d'impression du navigateur s'ouvre.
3. Dans **« Destination »**, choisissez **« Enregistrer au format PDF »**, puis **« Enregistrer »**.
   Si la case **« En-têtes et pieds de page »** apparaît (dans « Plus de paramètres »), **décochez-la** :
   sinon le navigateur ajoute sa propre date et l'adresse de la page.

Le PDF a en plus un chapitre par page, les numéros de page, et la mention discrète
**« Réalisé par Ferrus Dantioch »** en pied de page.
Pour un roman entier, l'aperçu peut mettre quelques secondes à apparaître.
Utilisez **Chrome ou Edge** : Firefox n'imprime pas encore les numéros de page ni la mention en pied de page.

### Raccourcis clavier

| Raccourci | Effet |
|---|---|
| `Ctrl+I` | italique `*…*` (une 2e fois : le retire) |
| `Ctrl+B` | gras `**…**` |
| `Entrée` sur une ligne `- …` (mode Notes) | nouvelle puce ; sur une puce vide : fin de la liste |
| `Ctrl+K` | recherche rapide d'une fiche (le curseur reste en place) |
| `Ctrl+clic` sur un nom coloré | ouvrir sa fiche (le curseur reste en place) |
| `Ctrl+Maj+F` | mode concentration (seul le texte reste) |
| `Ctrl+P` | exporter en PDF (scène, chapitre ou roman) ; ePub et Word : bouton « Exporter » |
| `Échap` | quitter le mode concentration, ou revenir au texte depuis le panneau ou la frise |
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
  Un fichier `atelier-romans-sauvegarde-AAAA-MM-JJ-appareil.json` est téléchargé
  (par exemple `…-2026-10-15-telephone-android.json`). Rangez-le en lieu sûr (clé USB, cloud…).
- **Importer** : bouton « Importer mes données », puis choisir un fichier de sauvegarde.
  L'Atelier montre ce que contient le fichier et ce qui changerait, puis propose :
  - **Fusionner** (conseillé pour un fichier venant d'un autre appareil) : voir ci-dessous ;
  - **Remplacer tout** : les données de cet appareil sont remplacées par celles du fichier.
  Pour une sauvegarde faite sur ce même appareil, seul « Remplacer » est proposé (c'est une restauration).
- **Annuler le dernier import** : ce bouton (à côté d'« Importer ») remet l'Atelier exactement
  dans son état d'avant le dernier import, fusion ou remplacement. Attention : ce qui a été écrit
  depuis cet import est retiré aussi.
- Un **rappel discret** apparaît en haut de l'écran quand des modifications n'ont pas été
  exportées depuis 3 jours. « Plus tard » le cache pendant 2 jours.

### Écrire sur deux appareils (téléphone et ordinateur)

Chaque appareil garde ses propres données : on passe de l'un à l'autre par le fichier d'export.

1. Sur l'appareil où vous venez d'écrire : **« Exporter mes données »**.
2. Faites passer le fichier sur l'autre appareil : envoyez-le-vous par e-mail, mettez-le sur
   Google Drive, ou branchez le téléphone à l'ordinateur avec un câble. Sur Android, le fichier
   est dans **Téléchargements** (application « Fichiers »).
3. Sur l'autre appareil : **« Importer mes données »**, choisir le fichier, puis **« Fusionner »**.

La fusion :
- **ajoute** ce qui est nouveau (romans, chapitres, scènes, fiches) ;
- pour ce qui existe des deux côtés, **garde la version la plus récente**, en prenant séparément le
  contenu, le titre et la place dans le plan : une scène renommée ou déplacée ici et réécrite là-bas
  garde le nouveau titre, la nouvelle place ET le nouveau texte ;
- **supprime** ce qui a été supprimé sur l'autre appareil, sauf ce qui a été modifié ici après
  cette suppression (du travail récent n'est jamais jeté) ;
- si une même scène a été **écrite sur les deux appareils** depuis le dernier échange, **les deux
  versions sont gardées** : la plus récente à sa place, l'autre juste après dans le plan, avec
  « (autre version : téléphone Android) » dans son titre. Relisez-les, gardez la bonne, supprimez
  l'autre. Pour une fiche modifiée des deux côtés, l'autre version est recopiée dans ses notes.

Conseil : faites l'aller-retour à chaque changement d'appareil (exporter ici, fusionner là-bas),
pour éviter d'écrire la même scène des deux côtés.

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
images (attendre la ligne ✓ dans « À propos » avant d'arrêter le serveur). L'icône de l'application déjà installée peut mettre un peu de temps à changer (la désinstaller
puis la réinstaller la met à jour aussitôt ; les romans ne sont pas touchés).

## Ce qui reste à faire, et idées pour plus tard

Prévu « pour plus tard » dès le départ (hors de la première version) :
- une **frise chronologique visuelle** des événements : faite à l'étape 10 ;
- des **liens automatiques** entre le texte et les fiches : faits avec « Dans cette scène » (étape 8)
  et les noms en couleur dans le texte (étape 11) ;
- l'**import des fiches PDF** de JDR ;
- la **synchronisation** entre plusieurs appareils : faite à l'étape 9 par fichier et fusion ;
  reste possible : une synchronisation automatique (elle demanderait un compte en ligne).

À savoir :
- **Remplacer les logos** par les vôtres (voir plus haut), si ceux repris du portfolio ne conviennent pas.
- **Navigateur conseillé : Chrome ou Edge.** Firefox n'installe pas les applications de ce type et
  n'imprime pas les numéros de page du PDF. Safari (Mac, iPad) n'a pas été testé.
- La **coupure des mots** en fin de ligne dans le PDF dépend du navigateur (elle peut manquer).
- **Sur téléphone** : testé en simulation (Chrome Android) ; l'iPhone et l'iPad (Safari) n'ont pas été testés.

## L'Atelier en ligne (GitHub Pages)

L'Atelier est publié à l'adresse **https://ferrusdantioch.github.io/atelier-romans/**.
C'est la même application : elle s'installe, fonctionne sans connexion, et **les romans restent
sur l'appareil** (rien n'est envoyé sur Internet). Quelqu'un d'autre qui ouvrirait l'adresse
trouverait un Atelier vide. L'adresse est signalée aux moteurs de recherche comme à ne pas référencer.

**Sur un téléphone Android** :
1. Ouvrir l'adresse dans **Chrome**.
2. Installer : l'encart « Installer l'Atelier » dans la Bibliothèque, ou le menu **⋮** →
   **« Installer l'application »** (ou « Ajouter à l'écran d'accueil »).
3. Dans « À propos », attendre la ligne **« Prête à fonctionner sans connexion ✓ »**.
4. L'Atelier s'ouvre ensuite depuis son icône, même en mode avion.
- Sans clavier, `Ctrl+K` est remplacé par le bouton **⌕** (barre d'outils ou panneau des fiches).
- **PDF** : « Exporter », PDF, ouvre la fenêtre d'impression d'Android ; choisir
  **« Enregistrer au format PDF »** en haut, puis le bouton PDF.
- **ePub et Word** : le fichier va dans les **Téléchargements** du téléphone (une notification
  l'annonce) ; le toucher l'ouvre dans une application de lecture ou de traitement de texte.

**Mises à jour** : chaque nouvelle version envoyée sur GitHub est prise automatiquement à la
prochaine ouverture avec une connexion (quelques minutes après l'envoi).

**À savoir** : chaque adresse a sa propre bibliothèque. Les romans écrits sur `localhost:8000`
n'apparaissent pas à l'adresse en ligne, ni ceux du téléphone sur l'ordinateur. Pour passer de
l'un à l'autre : « Exporter mes données » d'un côté, puis « Importer mes données » de l'autre.

**Retirer la publication** : sur GitHub, dans le dépôt, **Settings → Pages → « Unpublish site »**
(ou le demander). Les romans déjà écrits restent sur l'appareil, mais pensez à les exporter avant.

## Organisation des fichiers

```
index.html     la page de l'application
manifest.json  la carte d'identité de l'application (nom, icônes, couleurs) pour l'installer
sw.js          le « service worker » : la réserve qui permet de fonctionner sans connexion
serveur.py     petit serveur de secours (voir « Si quelque chose ne va pas »)
.nojekyll      (fichier vide, caché) : GitHub Pages publie les fichiers tels quels
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
js/reperage.js      les fiches nommées dans le texte (« Dans cette scène », « Nommé dans ces scènes »)
js/surlignage.js    les noms en couleur dans le texte, et la bulle qui ouvre leur fiche
js/frise.js         la frise des événements et « Qui apparaît où »
js/export-pdf.js    la fenêtre « Exporter » et l'export PDF (le livre à imprimer)
js/export-fichiers.js  l'export en ePub et en Word (.docx)
js/zip.js           les archives ZIP (un ePub et un .docx en sont)
js/fusion.js        la fusion des données de deux appareils
js/annulation.js    Ctrl+Z en toute sécurité (n'annule que là où l'on écrit)
js/onglets.js       une seule page de l'Atelier ouverte à la fois
js/hors-ligne.js    le mode hors ligne et le bouton « Installer l'application »
js/sauvegarde.js    les boutons d'export/import (fusion, annulation) et le rappel
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
