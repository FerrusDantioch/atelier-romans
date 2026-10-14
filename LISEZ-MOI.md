# L'Atelier — Omni-système

Application d'écriture de romans tirés des parties de l'Omni-système.
Elle fonctionne dans le navigateur, hors ligne, et garde tout sur l'ordinateur.

> 🚧 En construction — étape 2 sur 7 terminée (thème, bibliothèque de romans, sauvegarde de sécurité).

## Lancer l'application sur son ordinateur

Il faut un petit serveur local (obligatoire pour le fonctionnement hors ligne).
Python est déjà installé sur la plupart des ordinateurs.

1. Ouvrir un terminal dans le dossier `atelier-romans`.
2. Copier-coller :

   ```
   python3 -m http.server 8000
   ```

   (Sous Windows, si `python3` n'est pas reconnu : `py -m http.server 8000`)
3. Ouvrir le navigateur à l'adresse **http://localhost:8000**
4. Pour arrêter : revenir dans le terminal et taper `Ctrl+C`.

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
js/sauvegarde.js    les boutons d'export/import et le rappel
js/dialogues.js     les fenêtres de confirmation et les petits messages
js/outils.js        petites fonctions partagées (compteur de mots, dates…)
fonts/         les polices (hors ligne)
assets/        logos et icônes
```

---
*Réalisé par Ferrus Dantioch*
