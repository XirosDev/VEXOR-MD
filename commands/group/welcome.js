import { getGroupConfig, setGroupConfig } from '../../utils/db.js';

export default {
  name: 'welcome',
  category: 'group',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, m, { args, prefix, toBoldSmallCaps, formatBox }) {
    const state = args[0]?.toLowerCase();
    const current = getGroupConfig(m.chat).welcome;

    if (state !== 'on' && state !== 'off') {
      return m.reply(
        formatBox('ᴡᴇʟᴄᴏᴍᴇ sʏsᴛᴇᴍ', [
          `${toBoldSmallCaps('status')} : ${toBoldSmallCaps(current ? 'on' : 'off')}`,
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps(prefix + 'welcome on/off')}`
        ])
      );
    }

    const newValue = state === 'on';
    setGroupConfig(m.chat, 'welcome', newValue);

    await m.reply(
      formatBox('ᴡᴇʟᴄᴏᴍᴇ sʏsᴛᴇᴍ', [
        `${toBoldSmallCaps('welcome')} : ${toBoldSmallCaps(newValue ? 'enabled' : 'disabled')}`
      ])
    );
  }
};
