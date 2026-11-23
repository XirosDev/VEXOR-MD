import { getBotLang } from './db.js';

const translations = {
  fr: {
    access_denied: 'acces refuse',
    owner_only: 'commande reservee au proprietaire',
    group_only: 'commande reservee aux groupes',
    admin_only: 'commande reservee aux admins',
    bot_must_be_admin: 'le bot doit etre admin du groupe',
    error: 'erreur',
    system_error: 'erreur systeme',
    exec_failed: 'echec de execution',
    vv_reply: 'reponds a une vue unique avec !vv',
    vv_no_media: 'aucun media vue unique detecte',
    vv_empty_key: 'cle manquante (ne pas ouvrir la vue unique avant !vv)',
    vv_unlocked: 'debloque',
    play_no_query: 'donne un titre ou un lien youtube',
    play_not_found: 'aucun resultat trouve sur youtube',
    play_api_error: 'serveur audio indisponible (voir logs console)',
    lang_current: 'langue actuelle',
    lang_usage: 'utilisation : !lang fr / en / es',
    lang_updated: 'langue changee en',
    status: 'statut',
    enabled: 'active',
    disabled: 'desactive'
  },
  en: {
    access_denied: 'access denied',
    owner_only: 'owner only command',
    group_only: 'group only command',
    admin_only: 'admin only command',
    bot_must_be_admin: 'bot must be admin',
    error: 'error',
    system_error: 'system error',
    exec_failed: 'execution failed',
    vv_reply: 'reply to a view-once media with !vv',
    vv_no_media: 'no view-once media detected',
    vv_empty_key: 'missing key (do not open view-once before !vv)',
    vv_unlocked: 'unlocked',
    play_no_query: 'provide a song title or youtube link',
    play_not_found: 'no youtube result found',
    play_api_error: 'audio api unavailable (check console logs)',
    lang_current: 'current language',
    lang_usage: 'usage : !lang fr / en / es',
    lang_updated: 'language changed to',
    status: 'status',
    enabled: 'enabled',
    disabled: 'disabled'
  },
  es: {
    access_denied: 'acceso denegado',
    owner_only: 'solo para el propietario',
    group_only: 'solo en grupos',
    admin_only: 'solo para admins',
    bot_must_be_admin: 'el bot debe ser admin',
    error: 'error',
    system_error: 'error del sistema',
    exec_failed: 'error de ejecucion',
    vv_reply: 'responde a una foto unica con !vv',
    vv_no_media: 'no se detecto media de una sola vez',
    vv_empty_key: 'clave vacia (no abras el mensaje antes de !vv)',
    vv_unlocked: 'desbloqueado',
    play_no_query: 'escribe un titulo o enlace de youtube',
    play_not_found: 'no se encontro resultado',
    play_api_error: 'api de audio no disponible (ver consola)',
    lang_current: 'idioma actual',
    lang_usage: 'uso : !lang fr / en / es',
    lang_updated: 'idioma cambiado a',
    status: 'estado',
    enabled: 'activado',
    disabled: 'desactivado'
  }
};

export const availableLangs = Object.keys(translations);

export function t(key) {
  const lang = getBotLang();
  return translations[lang]?.[key] || translations.fr[key] || key;
    }
