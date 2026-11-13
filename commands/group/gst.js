import {
  downloadMediaMessage,
  generateWAMessageContent,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys';

export default {
  name: 'gst',
  aliases: ['groupstory', 'gstatus'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, m, { text, toBoldSmallCaps, formatBox }) {
    if (!m.quoted && !text) {
      return m.reply(
        formatBox('ɢʀᴏᴜᴘ sᴛᴏʀʏ', [
          `${toBoldSmallCaps('reply to an image, video or text with .gst')}`
        ])
      );
    }

    let contentPayload = {};

    if (m.quoted) {
      const qType = m.quoted.type;
      const caption = text || m.quoted.msg?.caption || '';

      if (qType === 'imageMessage') {
        const buffer = await downloadMediaMessage(
          { key: { remoteJid: m.chat, id: m.quoted.id }, message: m.quoted.message },
          'buffer',
          {}
        );
        contentPayload = { image: buffer, caption };
      } else if (qType === 'videoMessage') {
        const buffer = await downloadMediaMessage(
          { key: { remoteJid: m.chat, id: m.quoted.id }, message: m.quoted.message },
          'buffer',
          {}
        );
        contentPayload = { video: buffer, caption };
      } else {
        const quotedText = m.quoted.msg?.text || m.quoted.message?.conversation || text;
        contentPayload = { text: quotedText };
      }
    } else {
      contentPayload = { text };
    }

    // Encapsulation au format Story de Groupe WhatsApp (groupStatusMessageV2)
    const insideContent = await generateWAMessageContent(contentPayload, {
      upload: sock.waUploadToServer
    });

    const groupStoryMsg = generateWAMessageFromContent(
      m.chat,
      {
        groupStatusMessageV2: {
          message: insideContent
        }
      },
      { userJid: sock.user.id }
    );

    await sock.relayMessage(m.chat, groupStoryMsg.message, {
      messageId: groupStoryMsg.key.id
    });

    await m.reply(
      formatBox('ɢʀᴏᴜᴘ sᴛᴏʀʏ', [`${toBoldSmallCaps('story published to group')}`])
    );
  }
};
