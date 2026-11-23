import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { toSmallCaps, toBoldSmallCaps, formatBox } from './font.js';
import { getGroupConfig, incrementMessageCount } from './db.js';
import { t } from './lang.js';
import { logger } from './logger.js';

export const commands = new Map();

// Extrait uniquement l'identifiant brut (gère @s.whatsapp.net et @lid)
function normalizeId(jid = '') {
  return String(jid).split(':')[0].split('@')[0];
}

function matchParticipant(participant, targetIds) {
  const pIds = [
    participant.id,
    participant.jid,
    participant.phoneNumber,
    participant.lid
  ]
    .filter(Boolean)
    .map(normalizeId);
  return pIds.some(id => targetIds.includes(id));
}

export async function loadCommands() {
  commands.clear();
  const commandsDir = path.resolve('./commands');
  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

  const categories = fs.readdirSync(commandsDir);
  for (const category of categories) {
    const categoryPath = path.join(commandsDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const filePath = `../commands/${category}/${file}`;
        const { default: cmd } = await import(`${filePath}?update=${Date.now()}`);
        if (cmd && cmd.name) {
          cmd.category = cmd.category || category;
          commands.set(cmd.name, cmd);
        }
      } catch (err) {
        logger.error('LOADER', `Impossible de charger ${category}/${file}`, err);
      }
    }
  }
  logger.info('LOADER', `${commands.size} commandes chargées dans VEXOR MD`);
}

export async function handleMessage(sock, m) {
  if (!m.message || m.chat === 'status@broadcast') return;

  const ownerClean = config.ownerNumber.replace(/[^0-9]/g, '');
  const botIds = [sock.user?.id, sock.user?.lid].filter(Boolean).map(normalizeId);
  const senderId = normalizeId(m.sender);

  const isOwner = m.fromMe || senderId === ownerClean || botIds.includes(senderId);

  let isAdmin = false;
  let isBotAdmin = false;

  if (m.isGroup) {
    if (!m.fromMe) incrementMessageCount(m.chat, m.sender);
    const groupConfig = getGroupConfig(m.chat);

    if (groupConfig.antistatus || groupConfig.antilink || m.body.startsWith(config.prefix)) {
      const metadata = await sock.groupMetadata(m.chat).catch(err => {
        logger.error('GROUP', 'Impossible de lire groupMetadata', err);
        return null;
      });

      if (metadata) {
        const senderParticipant = metadata.participants.find(p =>
          matchParticipant(p, [senderId])
        );
        const botParticipant = metadata.participants.find(p =>
          matchParticipant(p, botIds)
        );

        isAdmin = Boolean(senderParticipant?.admin);
        isBotAdmin = Boolean(botParticipant?.admin);

        if (m.body.startsWith(config.prefix)) {
          logger.debug('ADMIN-CHECK', `Groupe: ${metadata.subject}`, {
            botIds,
            botRole: botParticipant?.admin || 'none',
            senderRole: senderParticipant?.admin || 'none',
            isBotAdmin,
            isAdmin
          });
        }
      }
    }

    if (groupConfig.antistatus && m.isStatusMention && !isAdmin && !isOwner) {
      if (isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
      const warnBox = formatBox('antistatus', [
        `${toBoldSmallCaps('user')} : @${senderId}`,
        `${toBoldSmallCaps('action')} : ${toBoldSmallCaps('mention statut supprimee')}`
      ]);
      await sock.sendMessage(m.chat, { text: warnBox, mentions: [m.sender] });
      return;
    }

    const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    if (groupConfig.antilink && linkRegex.test(m.body) && !isAdmin && !isOwner) {
      if (isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
      const warnBox = formatBox('antilink', [
        `${toBoldSmallCaps('user')} : @${senderId}`,
        `${toBoldSmallCaps('action')} : ${toBoldSmallCaps('lien supprime')}`
      ]);
      await sock.sendMessage(m.chat, { text: warnBox, mentions: [m.sender] });
      return;
    }
  }

  if (!m.body.startsWith(config.prefix)) return;
  if (config.mode === 'private' && !isOwner) return;

  const args = m.body.slice(config.prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  const cmd =
    commands.get(cmdName) ||
    [...commands.values()].find(c => c.aliases && c.aliases.includes(cmdName));

  if (!cmd) return;

  logger.info('CMD', `Exécution de ${config.prefix}${cmd.name}`, {
    from: m.sender,
    chat: m.chat,
    args
  });

  if (cmd.ownerOnly && !isOwner) {
    return m.reply(formatBox(t('access_denied'), [toBoldSmallCaps(t('owner_only'))]));
  }
  if (cmd.groupOnly && !m.isGroup) {
    return m.reply(formatBox(t('access_denied'), [toBoldSmallCaps(t('group_only'))]));
  }
  if (cmd.adminOnly && !isAdmin && !isOwner) {
    return m.reply(formatBox(t('access_denied'), [toBoldSmallCaps(t('admin_only'))]));
  }
  if (cmd.botAdminOnly && !isBotAdmin) {
    return m.reply(formatBox(t('error'), [toBoldSmallCaps(t('bot_must_be_admin'))]));
  }

  try {
    await cmd.execute(sock, m, {
      args,
      text: args.join(' '),
      prefix: config.prefix,
      isOwner,
      isAdmin,
      isBotAdmin,
      commands,
      toSmallCaps,
      toBoldSmallCaps,
      formatBox,
      t,
      logger
    });
  } catch (err) {
    logger.error(`CMD:${cmd.name}`, 'Erreur pendant exécution', err);
    await m.reply(
      formatBox(t('system_error'), [toBoldSmallCaps(err.message || t('exec_failed'))])
    );
  }
}

export async function handleGroupParticipants(sock, { id, participants, action }) {
  const groupConfig = getGroupConfig(id);
  if (action === 'add' && !groupConfig.welcome) return;
  if (action === 'remove' && !groupConfig.goodbye) return;

  const metadata = await sock.groupMetadata(id).catch(() => null);
  const groupName = metadata?.subject || 'Group';
  const count = metadata?.participants?.length || 0;

  for (const user of participants) {
    let ppUrl = config.benimaruPic;
    try {
      ppUrl = await sock.profilePictureUrl(user, 'image');
    } catch {}

    const tag = `@${normalizeId(user)}`;
    const isWelcome = action === 'add';

    const boxText = formatBox(isWelcome ? 'welcome' : 'goodbye', [
      `${toBoldSmallCaps('user')} : ${tag}`,
      `${toBoldSmallCaps('group')} : ${toBoldSmallCaps(groupName)}`,
      `${toBoldSmallCaps('members')} : ${toBoldSmallCaps(String(count))}`
    ]);

    await sock.sendMessage(id, {
      image: { url: ppUrl },
      caption: boxText,
      mentions: [user],
      contextInfo: {
        mentionedJid: [user],
        externalAdReply: {
          title: config.headerTitle,
          body: config.edition,
          thumbnailUrl: config.benimaruPic,
          sourceUrl: config.channelUrl,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    });
  }
  }
