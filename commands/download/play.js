import axios from 'axios';
import yts from 'yt-search';
import config from '../../config.js';

export default {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  category: 'download',

  async execute(sock, m, { text, toBoldSmallCaps, formatBox, t, logger }) {
    if (!text) {
      return m.reply(formatBox('vexor play', [toBoldSmallCaps(t('play_no_query'))]));
    }

    await sock.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

    // 1. Recherche YouTube par titre ou lien
    const search = await yts(text);
    const video = search.videos?.[0];

    if (!video) {
      logger.debug('PLAY', 'Aucun résultat yts pour :', text);
      return m.reply(formatBox('vexor play', [toBoldSmallCaps(t('play_not_found'))]));
    }

    logger.info('PLAY', `Trouvé : ${video.title} (${video.url})`);

    // 2. Tentative sur deux APIs de téléchargement MP3 (secours automatique)
    const endpoints = [
      `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`,
      `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`
    ];

    let audioUrl = null;
    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(endpoint, { timeout: 20000 });
        logger.debug('PLAY', `Réponse API (${endpoint.split('/')[2]})`, res.status);
        audioUrl = res.data?.data?.dl || res.data?.url || res.data?.downloadUrl;
        if (audioUrl) break;
      } catch (err) {
        logger.error('PLAY', `API en échec : ${endpoint.split('/')[2]}`, err);
      }
    }

    if (!audioUrl) {
      return m.reply(formatBox('vexor play', [toBoldSmallCaps(t('play_api_error'))]));
    }

    await sock.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `${video.timestamp} • ${config.edition}`,
            thumbnailUrl: video.thumbnail || config.benimaruPic,
            sourceUrl: video.url,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    );
  }
};
