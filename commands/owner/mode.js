import config from '../../config.js';

export default {
  name: 'mode',
  category: 'owner',
  ownerOnly: true,

  async execute(sock, m, { args, prefix, toBoldSmallCaps, formatBox }) {
    const targetMode = args[0]?.toLowerCase();

    if (targetMode !== 'public' && targetMode !== 'private') {
      return m.reply(
        formatBox('ʙᴏᴛ ᴍᴏᴅᴇ', [
          `${toBoldSmallCaps('current')} : ${toBoldSmallCaps(config.mode)}`,
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps(prefix + 'mode public/private')}`
        ])
      );
    }

    config.mode = targetMode;

    await m.reply(
      formatBox('ʙᴏᴛ ᴍᴏᴅᴇ', [
        `${toBoldSmallCaps('new mode')} : ${toBoldSmallCaps(config.mode)}`
      ])
    );
  }
};
