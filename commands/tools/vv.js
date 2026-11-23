import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'vv',
  aliases: ['viewonce', 'rvo'],
  category: 'tools',

  async execute(sock, m, { toBoldSmallCaps, formatBox, t, logger }) {
    if (!m.quoted) {
      return m.reply(formatBox('anti viewonce', [toBoldSmallCaps(t('vv_reply'))]));
    }

    const quotedRaw =
      m.quoted.message?.viewOnceMessageV2?.message ||
      m.quoted.message?.viewOnceMessage?.message ||
      m.quoted.message?.viewOnceMessageV2Extension?.message ||
      m.quoted.message;

    const mediaType = Object.keys(quotedRaw || {}).find(k =>
      ['imageMessage', 'videoMessage', 'audioMessage'].includes(k)
    );

    logger.debug('VV', 'Structure détectée', {
      quotedType: m.quoted.type,
      mediaType,
      hasMediaKey: Boolean(quotedRaw?.[mediaType]?.mediaKey?.length)
    });

    if (!mediaType) {
      return m.reply(formatBox('anti viewonce', [toBoldSmallCaps(t('vv_no_media'))]));
    }

    const mediaMsg = quotedRaw[mediaType];

    // Empêche le crash "Cannot derive from empty media key" si la vue unique a déjà été ouverte
    if (!mediaMsg.mediaKey || mediaMsg.mediaKey.length === 0) {
      return m.reply(formatBox('anti viewonce', [toBoldSmallCaps(t('vv_empty_key'))]));
    }

    const streamType = mediaType.replace('Message', '');
    const stream = await downloadContentFromMessage(mediaMsg, streamType);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    const caption = formatBox('vexor vv', [
      `${toBoldSmallCaps('type')} : ${toBoldSmallCaps(streamType)}`,
      `${toBoldSmallCaps(t('status'))} : ${toBoldSmallCaps(t('vv_unlocked'))}`
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
