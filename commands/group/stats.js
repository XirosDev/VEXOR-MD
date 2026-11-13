import { getGroupStats } from '../../utils/db.js';

export default {
  name: 'stats',
  aliases: ['active', 'top'],
  category: 'group',
  groupOnly: true,

  async execute(sock, m, { toBoldSmallCaps, formatBox }) {
    const stats = getGroupStats(m.chat);

    if (!stats.length) {
      return m.reply(
        formatBox('ɢʀᴏᴜᴘ sᴛᴀᴛs', [`${toBoldSmallCaps('no messages recorded yet')}`])
      );
    }

    const topMembers = stats.slice(0, 15); // Top 15 des membres les plus actifs
    const mentions = topMembers.map(([jid]) => jid);

    const lines = topMembers.map(([jid, count], index) => {
      const rank = String(index + 1).padStart(2, '0');
      const userTag = `@${jid.split('@')[0]}`;
      return `*${rank}.* ${userTag} : *${count}* ${toBoldSmallCaps('msgs')}`;
    });

    const box = formatBox('ᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀs', lines);
    await m.reply(box, mentions);
  }
};
