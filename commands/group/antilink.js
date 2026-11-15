import { getGroupConfig, setGroupConfig } from '../../utils/db.js';

export default {
  name: 'antilink',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  async execute(sock, m, { args, prefix, toBoldSmallCaps, formatBox }) {
    const state = args[0]?.toLowerCase();
    const current = getGroupConfig(m.chat).antilink;

    if (state !== 'on' && state !== 'off') {
      return m.reply(
        formatBox('ᴀɴᴛɪʟɪɴᴋ', [
          `${toBoldSmallCaps('status')} : ${toBoldSmallCaps(current ? 'on' : 'off')}`,
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps(prefix + 'antilink on/off')}`
        ])
      );
    }

    const newValue = state === 'on';
    setGroupConfig(m.chat, 'antilink', newValue);

    await m.reply(
      formatBox('ᴀɴᴛɪʟɪɴᴋ', [
        `${toBoldSmallCaps('protection')} : ${toBoldSmallCaps(newValue ? 'enabled' : 'disabled')}`
      ])
    );
  }
};
