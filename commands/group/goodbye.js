import { getGroupConfig, setGroupConfig } from '../../utils/db.js';

export default {
  name: 'goodbye',
  category: 'group',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, m, { args, prefix, toBoldSmallCaps, formatBox }) {
    const state = args[0]?.toLowerCase();
    const current = getGroupConfig(m.chat).goodbye;

    if (state !== 'on' && state !== 'off') {
      return m.reply(
        formatBox('ɢᴏᴏᴅʙʏᴇ sʏsᴛᴇᴍ', [
          `${toBoldSmallCaps('status')} : ${toBoldSmallCaps(current ? 'on' : 'off')}`,
          `${toBoldSmallCaps('usage')} : ${toBoldSmallCaps(prefix + 'goodbye on/off')}`
        ])
      );
    }

    const newValue = state === 'on';
    setGroupConfig(m.chat, 'goodbye', newValue);

    await m.reply(
      formatBox('ɢᴏᴏᴅʙʏᴇ sʏsᴛᴇᴍ', [
        `${toBoldSmallCaps('goodbye')} : ${toBoldSmallCaps(newValue ? 'enabled' : 'disabled')}`
      ])
    );
  }
};
