import dotenv from 'dotenv';
dotenv.config();

export default {
  botName: '𝐕ᴇxᴏʀ 𝐌ᴅ',
  headerTitle: '𝐕𝐄𝐗𝐎𝐑-𝐌𝐃',
  edition: '𝗦𝗛𝗜𝗡𝗠𝗢𝗡 𝗕𝗘𝗡𝗜𝗠𝗔𝗥𝗨 𝗘𝗗𝗜𝗧𝗜𝗢𝗡',
  prefix: process.env.PREFIX || '.',
  ownerNumber: process.env.OWNER_NUMBER || '22890283084', // Ton numéro sans le +
  ownerName: process.env.OWNER_NAME || '𝐋𝗢⃪᪵̑𝆇𝐑𝐃 ⃑🄱𝐄𝚴𝐈𝝡︭𝝖⃗𝗥𝗨 ❯❯̸⃞ ',
  mode: 'public', // 'public' ou 'private'
  
  // Image fixe de Shinmon Benimaru (utilisée pour la miniature et l'image du menu)
  benimaruPic: process.env.BOT_IMAGE || 'https://files.catbox.moe/95onjv.jpg',
  
  // Lien qui fait apparaître "whatsapp.com" dans l'encadré externalAdReply
  channelUrl: process.env.CHANNEL_URL || 'https://whatsapp.com/channel/0029VaXXXXXXXX'
};
