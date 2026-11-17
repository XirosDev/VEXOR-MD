import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'toimg',
  aliases: ['img', 'tophoto'],
  category: 'tools',

  async execute(sock, m, { toBoldSmallCaps, formatBox }) {
    if (!m.quoted || m.quoted.type !== 'stickerMessage') {
      return m.reply(
        formatBox('sᴛɪᴄᴋᴇʀ ᴛᴏ ɪᴍᴀɢᴇ', [
          `${toBoldSmallCaps('reply to a static sticker with .toimg')}`
        ])
      );
    }

    const stream = await downloadContentFromMessage(m.quoted.msg, 'sticker');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    await sock.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: formatBox('ᴠᴇxᴏʀ ᴛᴏɪᴍɢ', [
          `${toBoldSmallCaps('status')} : ${toBoldSmallCaps('converted')}`
        ])
      },
      { quoted: m }
    );
  }
};
