function time() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

export const logger = {
  info(tag, msg, data = '') {
    console.log(`[${time()}] [INFO] [${tag}] ${msg}`, data || '');
  },
  debug(tag, msg, data = '') {
    console.log(`[${time()}] [DEBUG] [${tag}] ${msg}`, data || '');
  },
  error(tag, msg, err) {
    console.error(`[${time()}] [ERROR] [${tag}] ${msg}`);
    if (err) console.error(err.stack || err.message || err);
  }
};
