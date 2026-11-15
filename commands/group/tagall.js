export default {
  name: 'tagall',
  aliases: ['all', 'everyone'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, m, { text, toBoldSmallCaps }) {
    const metadata = await sock.groupMetadata(m.chat);
    const participants = metadata.participants || [];
    const mentions = participants.map(p => p.id);

    const customMsg = text || 'annonce du groupe';

    let tagText = `乂  𝐕 𝐄 𝐗 𝐎 𝐑  -  𝐓 𝐀 𝐆  乂\n\n`;
    tagText += `  ◦ ${toBoldSmallCaps('group')} : ${toBoldSmallCaps(metadata.subject)}\n`;
    tagText += `  ◦ ${toBoldSmallCaps('members')} : *${participants.length}*\n`;
    tagText += `  ◦ ${toBoldSmallCaps('message')} : ${toBoldSmallCaps(customMsg)}\n\n`;

    tagText += `┌──「 ${toBoldSmallCaps('mentions')} 」\n`;
    for (const p of participants) {
      tagText += `│ ▸ @${p.id.split('@')[0]}\n`;
    }
    tagText += `└───╼`;

    await sock.sendMessage(
      m.chat,
      { text: tagText, mentions },
      { quoted: m }
    );
  }
};
