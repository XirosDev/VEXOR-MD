import axios from 'axios';
import config from '../../config.js';

export default {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  category: 'download',

  async execute(sock, m, { text, toBoldSmallCaps, formatBox }) {
    if (!text) {
      return m.reply(
        formatBox('ᴠᴇxᴏʀ ᴘʟᴀʏ', [
          `${toBoldSmallCaps('provide a song title or link')}`
        ])
      );
    }

    await sock.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

    // Appel via API publique de recherche/téléchargement audio
    const res = await axios.get(
      `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(text)}`
    ).catch(() => null);

    const data = res?.data?.data;
    if (!data || !data.dl) {
      return m.reply(
        formatBox('ᴠᴇxᴏʀ ᴘʟᴀʏ', [
          `${toBoldSmallCaps('audio not found or api unavailable')}`
        ])
      );
    }

    const infoBox = formatBox('ɴᴏᴡ ᴘʟᴀʏɪɴɢ', [
      `${toBoldSmallCaps('title')} : ${toBoldSmallCaps(data.title || text)}`,
      `${toBoldSmallCaps('format')} : *ᴍᴘ3 ᴀᴜᴅɪᴏ*`
    ]);

    await sock.sendMessage(
      m.chat,
      {
        audio: { url: data.dl },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'audio'}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: data.title || config.headerTitle,
            body: config.edition,
            thumbnailUrl: data.thumbnail || config.benimaruPic,
            sourceUrl: config.channelUrl,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    );
  }
};
