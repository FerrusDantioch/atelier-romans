// =====================================================================
// ARCHIVE ZIP (pour les fichiers ePub et Word, qui sont des archives ZIP)
//
// Une archive très simple : les fichiers y sont rangés tels quels, sans compression
// (« stored »). C'est ce que demande le format ePub pour son premier fichier, et Word
// comme les liseuses lisent ces archives sans difficulté. Aucune dépendance : cela
// fonctionne hors ligne.
// =====================================================================

// Table du CRC-32 (la « somme de contrôle » de chaque fichier, exigée par le format ZIP)
const TABLE_CRC = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(octets) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < octets.length; i++) crc = TABLE_CRC[(crc ^ octets[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Date et heure au format des archives ZIP (celui de l'ancien MS-DOS)
function dateZip(d) {
  return {
    heure: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    jour: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

// fichiers : [{ nom, contenu }] (contenu : texte ou Uint8Array), dans l'ordre voulu.
// Renvoie un Blob du type indiqué.
export function creerZip(fichiers, type = "application/zip", date = new Date()) {
  const encodeur = new TextEncoder();
  const { heure, jour } = dateZip(date);
  const morceaux = [];   // ce qui compose l'archive, dans l'ordre
  const sommaire = [];   // le « répertoire central », à la fin de l'archive
  let position = 0;

  for (const f of fichiers) {
    const nom = encodeur.encode(f.nom);
    const donnees = typeof f.contenu === "string" ? encodeur.encode(f.contenu) : f.contenu;
    const crc = crc32(donnees);
    // (le drapeau 0x0800 annonce un nom en UTF-8 : seulement s'il n'est pas en simple ASCII)
    const drapeaux = /^[\x20-\x7E]*$/.test(f.nom) ? 0 : 0x0800;

    const entete = new DataView(new ArrayBuffer(30));
    entete.setUint32(0, 0x04034B50, true);  // signature d'un fichier
    entete.setUint16(4, 20, true);          // version nécessaire pour l'extraire (2.0)
    entete.setUint16(6, drapeaux, true);
    entete.setUint16(8, 0, true);           // pas de compression
    entete.setUint16(10, heure, true);
    entete.setUint16(12, jour, true);
    entete.setUint32(14, crc, true);
    entete.setUint32(18, donnees.length, true); // taille rangée
    entete.setUint32(22, donnees.length, true); // taille réelle (la même : pas de compression)
    entete.setUint16(26, nom.length, true);
    entete.setUint16(28, 0, true);          // pas de champ supplémentaire
    morceaux.push(new Uint8Array(entete.buffer), nom, donnees);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014B50, true);
    central.setUint16(4, 20, true);         // créé par la version 2.0
    central.setUint16(6, 20, true);
    central.setUint16(8, drapeaux, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, heure, true);
    central.setUint16(14, jour, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, donnees.length, true);
    central.setUint32(24, donnees.length, true);
    central.setUint16(28, nom.length, true);
    // (champ supplémentaire, commentaire, disque, attributs : tous à zéro)
    central.setUint32(42, position, true);  // où commence ce fichier dans l'archive
    sommaire.push(new Uint8Array(central.buffer), nom);

    position += 30 + nom.length + donnees.length;
  }

  const tailleSommaire = sommaire.reduce((t, m) => t + m.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054B50, true);       // signature de fin d'archive
  fin.setUint16(8, fichiers.length, true);
  fin.setUint16(10, fichiers.length, true);
  fin.setUint32(12, tailleSommaire, true);
  fin.setUint32(16, position, true);
  return new Blob([...morceaux, ...sommaire, new Uint8Array(fin.buffer)], { type });
}
