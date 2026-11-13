import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./data/db.json');

// Initialisation du fichier JSON s'il n'existe pas
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ groups: {}, stats: {} }, null, 2));
}

export function getDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

export function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Récupère ou initialise la config d'un groupe
export function getGroupConfig(jid) {
  const db = getDb();
  if (!db.groups[jid]) {
    db.groups[jid] = {
      welcome: false,
      goodbye: false,
      antilink: false,
      antistatus: false
    };
    saveDb(db);
  }
  return db.groups[jid];
}

// Modifie un paramètre du groupe (ex: welcome, antistatus)
export function setGroupConfig(jid, key, value) {
  const db = getDb();
  if (!db.groups[jid]) getGroupConfig(jid);
  db.groups[jid][key] = value;
  saveDb(db);
}

// Incrémente le compteur de messages d'un membre pour .stats
export function incrementMessageCount(groupJid, userJid) {
  const db = getDb();
  if (!db.stats[groupJid]) db.stats[groupJid] = {};
  db.stats[groupJid][userJid] = (db.stats[groupJid][userJid] || 0) + 1;
  saveDb(db);
}

// Récupère le classement des membres actifs d'un groupe
export function getGroupStats(groupJid) {
  const db = getDb();
  const groupStats = db.stats[groupJid] || {};
  return Object.entries(groupStats)
    .sort(([, a], [, b]) => b - a); // Tri du plus actif au moins actif
                                           }
