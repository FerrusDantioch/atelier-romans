# L'Atelier — Omni-système

Application d'écriture de romans tirés des parties de l'Omni-système.
Elle fonctionne dans le navigateur, hors ligne, et garde tout sur l'ordinateur.

> 🚧 En construction — étape 1 sur 7 terminée (thème, polices, logo, page « À propos »).

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
js/app.js      le script principal
fonts/         les polices (hors ligne)
assets/        logos et icônes
```

---
*Réalisé par Ferrus Dantioch*
