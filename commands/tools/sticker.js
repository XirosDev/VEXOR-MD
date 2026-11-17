import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import config from '../../config.js';

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'tools',

  async execute(sock, m, { toBoldSmallCaps, formatBox }) {
    const targetMsg = m.quoted ? m.quoted : m;
    const mime = targetMsg.msg?.mimetype || '';

    if (!/image|video/.test(mime)) {
      return m.reply(
        formatBox('sᴛɪᴄᴋᴇʀ ᴍᴀᴋᴇʀ', [
          `${toBoldSmallCaps('reply to an image or short video with .s')}`
        ])
      );
    }

    const buffer = await downloadMediaMessage(
      {
        key: { remoteJid: m.chat, id: targetMsg.id },
        message: targetMsg.message
      },
      'buffer',
      {}
    );

    const sticker = new Sticker(buffer, {
      pack: config.headerTitle,
      author: config.edition,
      type: StickerTypes.FULL,
      quality: 70
    });

    await sock.sendMessage(m.chat, await sticker.toMessage(), { quoted: m });
  }
};
