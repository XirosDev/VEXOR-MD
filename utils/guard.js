import { getGroupConfig } from './db.js';
import { toBoldSmallCaps, formatBox } from './font.js';
import { logger } from './logger.js';

// ─────────────────────────────────────────────
//  Détection des liens (http, www, invitations, wa.me, t.me, chaînes WhatsApp...)
// ─────────────────────────────────────────────
const LINK_REGEX =
  /(?:https?:\/\/|www\.)\S+|\b(?:chat\.whatsapp\.com|whatsapp\.com\/channel|wa\.me|t\.me|telegram\.me|discord\.gg|bit\.ly)\/\S+/i;

// ─────────────────────────────────────────────
//  Identifiants (gère @s.whatsapp.net ET @lid)
// ─────────────────────────────────────────────
export function normalizeId(jid = '') {
  return String(jid).split(':')[0].split('@')[0];
}

export function getSenderIds(m) {
  return [
    m.sender,
    m.key?.participant,
    m.key?.participantAlt,
    m.key?.participantPn,
    m.key?.participantLid
  ]
    .filter(Boolean)
    .map(normalizeId);
}

export function getBotIds(sock) {
  return [
    sock.user?.id,
    sock.user?.lid,
    sock.authState?.creds?.me?.id,
    sock.authState?.creds?.me?.lid
  ]
    .filter(Boolean)
    .map(normalizeId);
}

function participantIds(p) {
  return [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(normalizeId);
}

export function getRoles(meta, senderIds, botIds) {
  const find = ids =>
    meta.participants.find(p => participantIds(p).some(x => ids.includes(x)));
  return {
    isAdmin: Boolean(find(senderIds)?.admin),
    isBotAdmin: Boolean(find(botIds)?.admin)
  };
}

// ─────────────────────────────────────────────
//  Cache des métadonnées de groupe (évite un appel réseau à chaque message)
// ─────────────────────────────────────────────
const META_TTL = 30_000;
const metaCache = new Map(); // jid -> { data, exp }
const inflight = new Map(); // jid -> Promise
const generation = new Map(); // jid -> n (invalide les réponses arrivées trop tard)

export function invalidateMeta(jid) {
  generation.set(jid, (generation.get(jid) || 0) + 1);
  metaCache.delete(jid);
  inflight.delete(jid);
}

export function getMeta(sock, jid, force = false) {
  const hit = metaCache.get(jid);
  if (!force && hit && hit.exp > Date.now()) return Promise.resolve(hit.data);
  if (!force && inflight.has(jid)) return inflight.get(jid);

  const gen = generation.get(jid) || 0;
  const p = sock
    .groupMetadata(jid)
    .then(data => {
      if ((generation.get(jid) || 0) === gen) {
        metaCache.set(jid, { data, exp: Date.now() + META_TTL });
      }
      return data;
    })
    .catch(err => {
      logger.error('GUARD', 'Impossible de lire groupMetadata', err);
      return hit?.data || null;
    })
    .finally(() => {
      if (inflight.get(jid) === p) inflight.delete(jid);
    });

  inflight.set(jid, p);
  return p;
}

// ─────────────────────────────────────────────
//  Détection d'une mention de groupe en statut
// ─────────────────────────────────────────────
const WRAPPERS = [
  'ephemeralMessage',
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension',
  'documentWithCaptionMessage'
];

export function isStatusMentionMessage(message, depth = 0) {
  if (!message || typeof message !== 'object' || depth > 4) return false;

  if (message.groupStatusMentionMessage || message.statusMentionMessage) return true;

  const pType = message.protocolMessage?.type;
  if (pType === 25 || pType === 'STATUS_MENTION_MESSAGE') return true;

  for (const w of WRAPPERS) {
    if (message[w]?.message && isStatusMentionMessage(message[w].message, depth + 1)) {
      return true;
    }
  }
  return false;
}

function getText(m) {
  return [m.body, m.msg?.matchedText, m.msg?.canonicalUrl].filter(Boolean).join(' ');
}

// ─────────────────────────────────────────────
//  GARDE IMMÉDIAT : appelé en tout premier dans handleMessage
//  Retourne true si le message a été traité (supprimé).
// ─────────────────────────────────────────────
export async function runGuards(sock, m, isOwner) {
  if (!m.isGroup || m.fromMe || isOwner) return false;

  const cfg = getGroupConfig(m.chat);
  if (!cfg.antilink && !cfg.antistatus) return false;

  if (process.env.GUARD_DEBUG) {
    logger.debug('GUARD', 'message reçu', {
      type: m.type,
      keys: Object.keys(m.message || {}),
      body: String(m.body || '').slice(0, 60)
    });
  }

  let reason = null;
  if (cfg.antistatus && isStatusMentionMessage(m.message)) reason = 'antistatus';
  else if (cfg.antilink && LINK_REGEX.test(getText(m))) reason = 'antilink';

  // Pas de violation : on réchauffe le cache en arrière-plan pour la suite
  if (!reason) {
    getMeta(sock, m.chat).catch(() => {});
    return false;
  }

  const meta = await getMeta(sock, m.chat);
  if (!meta) return false;

  const senderIds = getSenderIds(m);
  const botIds = getBotIds(sock);
  const { isAdmin, isBotAdmin } = getRoles(meta, senderIds, botIds);

  if (isAdmin) return false;

  if (!isBotAdmin) {
    logger.info('GUARD', `${reason} détecté mais le bot n'est pas admin`, {
      botIds,
      senderIds,
      admins: meta.participants.filter(p => p.admin).map(p => p.id)
    });
    return false;
  }

  // 1) Suppression IMMÉDIATE
  await sock.sendMessage(m.chat, { delete: m.key });
  logger.info('GUARD', `${reason} déclenché`, { chat: m.chat, sender: m.sender });

  // 2) Avertissement
  const action = reason === 'antilink' ? 'lien supprime' : 'mention statut supprimee';
  const box = formatBox(reason, [
    `${toBoldSmallCaps('user')} : @${normalizeId(m.sender)}`,
    `${toBoldSmallCaps('action')} : ${toBoldSmallCaps(action)}`
  ]);
  await sock.sendMessage(m.chat, { text: box, mentions: [m.sender] });

  return true;
  }
