# L'Atelier — Omni-système

Application d'écriture de romans tirés des parties de l'Omni-système.
Elle fonctionne dans le navigateur, hors ligne, et garde tout sur l'ordinateur.

> 🚧 En construction — étape 3 sur 7 terminée (thème, bibliothèque, sauvegarde, écriture).

## Lancer l'application sur son ordinateur

L'application a besoin d'un petit « serveur » local pour fonctionner (c'est une règle des
navigateurs pour le mode hors ligne). Il se lance avec une commande tapée dans un **terminal** :
une fenêtre où l'on donne des instructions en tapant du texte au lieu de cliquer.

### Étape A — Récupérer les fichiers (sans terminal)

1. Aller sur https://github.com/FerrusDantioch/atelier-romans (connecté à son compte GitHub).
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

### Étape C — Ouvrir l'application

- Le terminal affiche une ligne du type `Serving HTTP on … port 8000` : c'est bon signe.
- Ouvrir le navigateur (Chrome ou Edge de préférence) à l'adresse **http://localhost:8000**
- **Laisser la fenêtre du terminal ouverte** pendant qu'on utilise l'application (on peut la réduire).
- Pour arrêter : cliquer dans le terminal et appuyer sur `Ctrl + C`, ou fermer la fenêtre.

### Deux points importants

- **Toujours utiliser le numéro `8000`.** Le navigateur range les romans selon l'adresse exacte :
  avec `localhost:8001`, on verrait une bibliothèque vide (les données ne seraient pas perdues,
  juste rangées sous l'autre adresse).
- **Pour récupérer une nouvelle version** : retélécharger le ZIP et lancer le serveur depuis le
  nouveau dossier. Les romans ne sont pas dans le dossier mais dans le navigateur : ils restent
  là tant qu'on utilise la même adresse `localhost:8000`.

*Pour les habitués de git : `git clone https://github.com/FerrusDantioch/atelier-romans.git`,
puis `git pull` pour les mises à jour.*

## Écrire

Ouvrez un roman depuis la Bibliothèque. L'écran se divise en trois colonnes :
**le plan** à gauche, **le texte** au centre, **la consultation des fiches** à droite (étape 4).

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

### Raccourcis clavier

| Raccourci | Effet |
|---|---|
| `Ctrl+I` | italique `*…*` (une 2e fois : le retire) |
| `Ctrl+B` | gras `**…**` |
| `Entrée` sur une ligne `- …` (mode Notes) | nouvelle puce ; sur une puce vide : fin de la liste |
| `Ctrl+Maj+F` | mode concentration (seul le texte reste) |
| `Échap` | quitter le mode concentration |
| `Ctrl+Z` | annuler |
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

## Organisation des fichiers

```
index.html     la page de l'application
css/theme.css  toutes les couleurs et polices
css/app.css    la mise en page
js/app.js           le chef d'orchestre (navigation entre les pages)
js/db.js            le stockage des données (IndexedDB) + export/import
js/bibliotheque.js  la liste des romans
js/etat.js          le roman ouvert, en mémoire (chapitres, scènes, compteurs)
js/plan.js          le plan : chapitres et scènes
js/editeur.js       l'écriture : modes, mise en forme, enregistrement, session, concentration
js/sauvegarde.js    les boutons d'export/import et le rappel
js/dialogues.js     les fenêtres de confirmation et les petits messages
js/outils.js        petites fonctions partagées (compteur de mots, dates…)
fonts/         les polices (hors ligne)
assets/        logos et icônes
```

---
*Réalisé par Ferrus Dantioch*
