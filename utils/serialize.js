import { getContentType, jidNormalizedUser } from '@whiskeysockets/baileys';

export function serialize(sock, m) {
  if (!m) return m;

  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = jidNormalizedUser(
      m.fromMe ? sock.user.id : m.isGroup ? m.key.participant : m.chat
    );
  }

  if (m.message) {
    m.type = getContentType(m.message);
    
    // Gestion des messages éphémères ou vue unique
    if (m.type === 'ephemeralMessage' || m.type === 'viewOnceMessageV2' || m.type === 'viewOnceMessage') {
      m.message = m.message[m.type].message;
      m.type = getContentType(m.message);
    }

    m.msg = m.message[m.type];

    // Extraction du texte quelle que soit la nature du message
    m.body =
      m.message.conversation ||
      m.msg?.text ||
      m.msg?.caption ||
      m.msg?.selectedId ||
      '';

    // Détection spécifique des mentions de groupe en statut (Antistatus)
    m.isStatusMention =
      m.type === 'groupStatusMentionMessage' ||
      Boolean(m.message?.groupStatusMentionMessage);

    // Extraction du message cité (quoted) pour .gst, .kick, .vv, .sticker
    const contextInfo = m.msg?.contextInfo;
    m.mentionedJid = contextInfo?.mentionedJid || [];
    
    if (contextInfo?.quotedMessage) {
      const quotedType = getContentType(contextInfo.quotedMessage);
      m.quoted = {
        type: quotedType,
        id: contextInfo.stanzaId,
        sender: jidNormalizedUser(contextInfo.participant),
        message: contextInfo.quotedMessage,
        msg: contextInfo.quotedMessage[quotedType],
        delete: () =>
          sock.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: contextInfo.stanzaId,
              participant: contextInfo.participant
            }
          })
      };
    } else {
      m.quoted = null;
    }
  }

  // Fonction rapide pour répondre en citant le message
  m.reply = (text, mentions = []) =>
    sock.sendMessage(
      m.chat,
      { text, mentions },
      { quoted: m }
    );

  return m;
        }
