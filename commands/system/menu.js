import config from '../../config.js';

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}ʜ ${String(m).padStart(2, '0')}ᴍ`;
}

export default {
  name: 'menu',
  aliases: ['help', 'list'],
  category: 'system',

  async execute(sock, m, { prefix, commands, toBoldSmallCaps }) {
    const uptime = formatUptime(process.uptime());
    const senderTag = `@${m.sender.split('@')[0]}`;

    // Regroupement automatique des commandes par catégorie
    const categories = {};
    for (const [, cmd] of commands) {
      const cat = cmd.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.name);
    }

    // En-tête Design 2
    let menuText = `乂  𝐕 𝐄 𝐗 𝐎 𝐑  -  𝐌 𝐃  乂\n\n`;
    menuText += `  ◦ ${toBoldSmallCaps('user')} : ${senderTag}\n`;
    menuText += `  ◦ ${toBoldSmallCaps('prefix')} : [ ${prefix} ]\n`;
    menuText += `  ◦ ${toBoldSmallCaps('mode')} : ${toBoldSmallCaps(config.mode)}\n`;
    menuText += `  ◦ ${toBoldSmallCaps('uptime')} : *${uptime}*\n`;
    menuText += `  ◦ ${toBoldSmallCaps('cmds')} : *${commands.size}*\n\n`;

    // Génération des branches pour chaque catégorie
    for (const [catName, cmdList] of Object.entries(categories)) {
      menuText += `┌──「 ${toBoldSmallCaps(catName)} 」\n`;
      for (const name of cmdList) {
        menuText += `│ ▸ ${toBoldSmallCaps(prefix + name)}\n`;
      }
      menuText += `└───╼\n\n`;
    }

    await sock.sendMessage(
      m.chat,
      {
        image: { url: config.benimaruPic },
        caption: menuText.trim(),
        mentions: [m.sender],
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: config.headerTitle,
            body: config.edition,
            thumbnailUrl: config.benimaruPic,
            sourceUrl: config.channelUrl,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      },
      { quoted: m }
    );
  }
};
