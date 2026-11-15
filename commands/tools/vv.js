import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'vv',
  aliases: ['viewonce', 'rvo'],
  category: 'tools',

  async execute(sock, m, { toBoldSmallCaps, formatBox }) {
    if (!m.quoted) {
      return m.reply(
        formatBox('ᴀɴᴛɪ ᴠɪᴇᴡᴏɴᴄᴇ', [
          `${toBoldSmallCaps('reply to a view-once media with .vv')}`
        ])
      );
    }

    // Extraction du contenu même s'il est encapsulé dans viewOnceMessageV2
    const quotedRaw =
      m.quoted.message?.viewOnceMessageV2?.message ||
      m.quoted.message?.viewOnceMessage?.message ||
      m.quoted.message?.viewOnceMessageV2Extension?.message ||
      m.quoted.message;

    const mediaType = Object.keys(quotedRaw || {}).find(k =>
      ['imageMessage', 'videoMessage', 'audioMessage'].includes(k)
    );

    if (!mediaType) {
      return m.reply(
        formatBox('ᴀɴᴛɪ ᴠɪᴇᴡᴏɴᴄᴇ', [
          `${toBoldSmallCaps('no view-once media detected')}`
        ])
      );
    }

    const mediaMsg = quotedRaw[mediaType];
    const streamType = mediaType.replace('Message', '');
    const stream = await downloadContentFromMessage(mediaMsg, streamType);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    const caption = formatBox('ᴠᴇxᴏʀ ᴠᴠ', [
      `${toBoldSmallCaps('type')} : ${toBoldSmallCaps(streamType)}`,
      `${toBoldSmallCaps('status')} : ${toBoldSmallCaps('unlocked')}`
    ]);

    if (streamType === 'image') {
      await sock.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });
    } else if (streamType === 'video') {
      await sock.sendMessage(m.chat, { video: buffer, caption }, { quoted: m });
    } else if (streamType === 'audio') {
      await sock.sendMessage(
        m.chat,
        { audio: buffer, mimetype: 'audio/mp4', ptt: true },
        { quoted: m }
      );
    }
  }
};
