import axios from 'axios';

export default {
  name: 'tr',
  aliases: ['translate', 'trad'],
  category: 'tools',

  async execute(sock, m, { args, toBoldSmallCaps, formatBox }) {
    const targetLang = args[0] || 'fr';
    const textToTranslate =
      args.slice(1).join(' ') ||
      m.quoted?.msg?.text ||
      m.quoted?.message?.conversation;

    if (!textToTranslate) {
      return m.reply(
        formatBox('ᴛʀᴀɴsʟᴀᴛᴏʀ', [
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps('.tr en Bonjour le monde')}`
        ])
      );
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
    const res = await axios.get(url);
    const translated = res.data[0].map(item => item[0]).join('');

    await m.reply(
      formatBox(`ᴛʀᴀɴsʟᴀᴛᴇ (${targetLang})`, [
        `${toBoldSmallCaps(translated)}`
      ])
    );
  }
};
