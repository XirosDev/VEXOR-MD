export default {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  async execute(sock, m, { toBoldSmallCaps, formatBox }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
      return m.reply(
        formatBox('ᴋɪᴄᴋ sʏsᴛᴇᴍ', [
          `${toBoldSmallCaps('mention or reply to a user')}`
        ])
      );
    }

    await sock.groupParticipantsUpdate(m.chat, [target], 'remove');

    await m.reply(
      formatBox('ᴋɪᴄᴋ sʏsᴛᴇᴍ', [
        `${toBoldSmallCaps('user')} : @${target.split('@')[0]}`,
        `${toBoldSmallCaps('status')} : ${toBoldSmallCaps('removed')}`
      ]),
      [target]
    );
  }
};
