import { getBotLang, setBotLang } from '../../utils/db.js';
import { availableLangs } from '../../utils/lang.js';

export default {
  name: 'lang',
  aliases: ['setlang', 'langue'],
  category: 'owner',
  ownerOnly: true,

  async execute(sock, m, { args, toBoldSmallCaps, formatBox, t }) {
    const choice = args[0]?.toLowerCase();

    if (!choice || !availableLangs.includes(choice)) {
      return m.reply(
        formatBox('langue', [
          `${toBoldSmallCaps(t('lang_current'))} : ${toBoldSmallCaps(getBotLang())}`,
          `${toBoldSmallCaps(t('lang_usage'))}`
        ])
      );
    }

    setBotLang(choice);

    await m.reply(
      formatBox('langue', [
        `${toBoldSmallCaps(t('lang_updated'))} : ${toBoldSmallCaps(choice)}`
      ])
    );
  }
};
