export default {
  name: 'ping',
  aliases: ['p', 'speed'],
  category: 'system',

  async execute(sock, m, { toBoldSmallCaps, formatBox }) {
    const start = Date.now();
    await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
    const speed = ((Date.now() - start) / 1000).toFixed(2);

    const box = formatBox('ᴠᴇxᴏʀ sᴘᴇᴇᴅ', [
      `${toBoldSmallCaps('status')} : ${toBoldSmallCaps('online')}`,
      `${toBoldSmallCaps('ping')} : *${speed}s*`
    ]);

    await m.reply(box);
  }
};
