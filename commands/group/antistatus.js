import { getGroupConfig, setGroupConfig } from '../../utils/db.js';

export default {
  name: 'antistatus',
  aliases: ['antistory'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  async execute(sock, m, { args, prefix, toBoldSmallCaps, formatBox }) {
    const state = args[0]?.toLowerCase();
    const current = getGroupConfig(m.chat).antistatus;

    if (state !== 'on' && state !== 'off') {
      return m.reply(
        formatBox('ᴀɴᴛɪsᴛᴀᴛᴜs', [
          `${toBoldSmallCaps('status')} : ${toBoldSmallCaps(current ? 'on' : 'off')}`,
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps(prefix + 'antistatus on/off')}`
        ])
      );
    }

    const newValue = state === 'on';
    setGroupConfig(m.chat, 'antistatus', newValue);

    await m.reply(
      formatBox('ᴀɴᴛɪsᴛᴀᴛᴜs', [
        `${toBoldSmallCaps('protection')} : ${toBoldSmallCaps(newValue ? 'enabled' : 'disabled')}`
      ])
    );
  }
};
