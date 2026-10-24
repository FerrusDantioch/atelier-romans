# =====================================================================
# PETIT SERVEUR D'OMNI-ROMANCIER (solution de secours)
# Fait la même chose que « py -m http.server 8000 », avec deux précautions :
#  - il annonce toujours le bon type de chaque fichier (certains ordinateurs Windows
#    présentent les fichiers .js comme du simple texte, ce qui empêche l'application
#    de démarrer) ;
#  - il n'est visible que depuis cet ordinateur (pas depuis le réseau).
#
# Lancement, depuis ce dossier :   py serveur.py        (Mac : python3 serveur.py)
# Puis ouvrir http://localhost:8000 — Ctrl+C dans la fenêtre pour arrêter.
# =====================================================================

import http.server
import os

PORT = 8000

# Les types de fichiers de l'application, toujours annoncés correctement
TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
}


class Gestionnaire(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, **TYPES}


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))  # sert le dossier d'Omni-Romancier, d'où qu'on lance
    try:
        serveur = http.server.ThreadingHTTPServer(("localhost", PORT), Gestionnaire)
    except OSError:
        # Le port est déjà pris : le plus souvent, Omni-Romancier est déjà servi par une autre fenêtre
        print(f"Le port {PORT} est déjà utilisé : Omni-Romancier est sans doute déjà lancé dans une autre fenêtre.")
        print(f"Ouvrez simplement http://localhost:{PORT} (ou fermez l'autre fenêtre, puis relancez).")
        raise SystemExit(1)
    with serveur:
        print(f"Omni-Romancier est servi sur http://localhost:{PORT}")
        print("Laissez cette fenêtre ouverte pendant l'utilisation (Ctrl+C pour arrêter).")
        try:
            serveur.serve_forever()
        except KeyboardInterrupt:
            print("\nServeur arrêté.")
