import axios from 'axios';

export default {
  name: 'tiktok',
  aliases: ['tt', 'ttdl'],
  category: 'download',

  async execute(sock, m, { args, toBoldSmallCaps, formatBox }) {
    const url = args[0];
    if (!url || !url.includes('tiktok.com')) {
      return m.reply(
        formatBox('ᴛɪᴋᴛᴏᴋ ᴅʟ', [
          `${toBoldSmallCaps('provide a valid tiktok link')}`
        ])
      );
    }

    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await axios.get(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    );
    const videoData = res.data?.data;

    if (!videoData || !videoData.play) {
      return m.reply(
        formatBox('ᴛɪᴋᴛᴏᴋ ᴅʟ', [
          `${toBoldSmallCaps('failed to fetch video')}`
        ])
      );
    }

    const caption = formatBox('ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ', [
      `${toBoldSmallCaps('author')} : ${toBoldSmallCaps(videoData.author?.nickname || 'unknown')}`,
      `${toBoldSmallCaps('title')} : ${toBoldSmallCaps((videoData.title || 'video').slice(0, 45))}`
    ]);

    await sock.sendMessage(
      m.chat,
      { video: { url: videoData.play }, caption },
      { quoted: m }
    );
  }
};
