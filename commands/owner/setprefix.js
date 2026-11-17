import config from '../../config.js';

export default {
  name: 'setprefix',
  aliases: ['prefix'],
  category: 'owner',
  ownerOnly: true,

  async execute(sock, m, { args, toBoldSmallCaps, formatBox }) {
    const newPrefix = args[0];

    if (!newPrefix || newPrefix.length > 2) {
      return m.reply(
        formatBox('ᴘʀᴇғɪx sʏsᴛᴇᴍ', [
          `${toBoldSmallCaps('current')} : [ ${config.prefix} ]`,
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps(config.prefix + 'setprefix !')}`
        ])
      );
    }

    config.prefix = newPrefix;

    await m.reply(
      formatBox('ᴘʀᴇғɪx sʏsᴛᴇᴍ', [
        `${toBoldSmallCaps('new prefix')} : [ ${config.prefix} ]`
      ])
    );
  }
};
