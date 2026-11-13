import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { toSmallCaps, toBoldSmallCaps, formatBox } from './font.js';
import { getGroupConfig, incrementMessageCount } from './db.js';

export const commands = new Map();

// 1. Chargement dynamique de tous les fichiers dans commands/
export async function loadCommands() {
  commands.clear();
  const commandsDir = path.resolve('./commands');
  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir);

  const categories = fs.readdirSync(commandsDir);
  for (const category of categories) {
    const categoryPath = path.join(commandsDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = `../commands/${category}/${file}`;
      const { default: cmd } = await import(`${filePath}?update=${Date.now()}`);
      if (cmd && cmd.name) {
        cmd.category = cmd.category || category;
        commands.set(cmd.name, cmd);
      }
    }
  }
  console.log(`✓ ${commands.size} commandes chargées dans VEXOR MD`);
}

// 2. Gestionnaire principal des messages
export async function handleMessage(sock, m) {
  if (!m.message || m.chat === 'status@broadcast') return;

  const isOwner =
    m.fromMe || m.sender.split('@')[0] === config.ownerNumber.replace(/[^0-9]/g, '');

  // --- LOGIQUE DE GROUPE (STATS, ANTISTATUS, ANTILINK) ---
  let isAdmin = false;
  let isBotAdmin = false;

  if (m.isGroup) {
    // Compteur automatique pour .stats
    if (!m.fromMe) {
      incrementMessageCount(m.chat, m.sender);
    }

    const groupConfig = getGroupConfig(m.chat);

    // Vérification des rôles Admin uniquement si nécessaire
    if (groupConfig.antistatus || groupConfig.antilink || m.body.startsWith(config.prefix)) {
      const metadata = await sock.groupMetadata(m.chat).catch(() => null);
      if (metadata) {
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderParticipant = metadata.participants.find(p => p.id === m.sender);
        const botParticipant = metadata.participants.find(p => p.id === botJid);
        isAdmin = Boolean(senderParticipant?.admin);
        isBotAdmin = Boolean(botParticipant?.admin);
      }
    }

    // Protection ANTISTATUS (Mention du groupe dans une story)
    if (groupConfig.antistatus && m.isStatusMention && !isAdmin && !isOwner) {
      if (isBotAdmin) {
        await sock.sendMessage(m.chat, { delete: m.key });
      }
      const warnBox = formatBox('ᴀɴᴛɪsᴛᴀᴛᴜs', [
        `${toBoldSmallCaps('user')} : @${m.sender.split('@')[0]}`,
        `${toBoldSmallCaps('action')} : ${toBoldSmallCaps('status mention deleted')}`
      ]);
      await sock.sendMessage(m.chat, { text: warnBox, mentions: [m.sender] });
      return;
    }

    // Protection ANTILINK
    const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    if (groupConfig.antilink && linkRegex.test(m.body) && !isAdmin && !isOwner) {
      if (isBotAdmin) {
        await sock.sendMessage(m.chat, { delete: m.key });
      }
      const warnBox = formatBox('ᴀɴᴛɪʟɪɴᴋ', [
        `${toBoldSmallCaps('user')} : @${m.sender.split('@')[0]}`,
        `${toBoldSmallCaps('action')} : ${toBoldSmallCaps('link deleted')}`
      ]);
      await sock.sendMessage(m.chat, { text: warnBox, mentions: [m.sender] });
      return;
    }
  }

  // --- EXÉCUTION DES COMMANDES ---
  if (!m.body.startsWith(config.prefix)) return;
  if (config.mode === 'private' && !isOwner) return;

  const args = m.body.slice(config.prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  // Recherche par nom ou par alias
  const cmd =
    commands.get(cmdName) ||
    [...commands.values()].find(c => c.aliases && c.aliases.includes(cmdName));

  if (!cmd) return;

  // Vérifications des permissions (Design 2)
  if (cmd.ownerOnly && !isOwner) {
    return m.reply(formatBox('ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ', [`${toBoldSmallCaps('owner only command')}`]));
  }
  if (cmd.groupOnly && !m.isGroup) {
    return m.reply(formatBox('ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ', [`${toBoldSmallCaps('group only command')}`]));
  }
  if (cmd.adminOnly && !isAdmin && !isOwner) {
    return m.reply(formatBox('ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ', [`${toBoldSmallCaps('admin only command')}`]));
  }
  if (cmd.botAdminOnly && !isBotAdmin) {
    return m.reply(formatBox('ᴇʀʀᴏʀ', [`${toBoldSmallCaps('bot must be admin')}`]));
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
      formatBox
    });
  } catch (err) {
    console.error(err);
    await m.reply(formatBox('sʏsᴛᴇᴍ ᴇʀʀᴏʀ', [`${toBoldSmallCaps(err.message || 'execution failed')}`]));
  }
}

// 3. Gestionnaire Welcome & Goodbye
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

    const tag = `@${user.split('@')[0]}`;
    const isWelcome = action === 'add';

    const boxText = formatBox(isWelcome ? 'ᴡᴇʟᴄᴏᴍᴇ' : 'ɢᴏᴏᴅʙʏᴇ', [
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
