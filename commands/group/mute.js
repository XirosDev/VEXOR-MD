export default {
  name: 'mute',
  aliases: ['close', 'open', 'unmute'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  async execute(sock, m, { args, toBoldSmallCaps, formatBox }) {
    const invokedCmd = m.body.slice(1).trim().split(/ +/)[0].toLowerCase();
    const subArg = args[0]?.toLowerCase();

    const shouldClose =
      invokedCmd === 'mute' && subArg !== 'off' ||
      invokedCmd === 'close' ||
      subArg === 'on';

    await sock.groupSettingUpdate(
      m.chat,
      shouldClose ? 'announcement' : 'not_announcement'
    );

    await m.reply(
      formatBox('ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs', [
        `${toBoldSmallCaps('state')} : ${toBoldSmallCaps(shouldClose ? 'closed (admins only)' : 'open (all members)')}`
      ])
    );
  }
};
