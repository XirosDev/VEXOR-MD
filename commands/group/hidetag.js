export default {
  name: 'hidetag',
  aliases: ['htag', 'tag'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, m, { text, toBoldSmallCaps }) {
    const metadata = await sock.groupMetadata(m.chat);
    const mentions = metadata.participants.map(p => p.id);

    const content =
      text ||
      m.quoted?.msg?.text ||
      m.quoted?.message?.conversation ||
      toBoldSmallCaps('attention everyone');

    await sock.sendMessage(
      m.chat,
      { text: content, mentions },
      { quoted: m }
    );
  }
};
