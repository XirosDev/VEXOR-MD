import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import config from './config.js';
import { serialize } from './utils/serialize.js';
import { loadCommands, handleMessage, handleGroupParticipants } from './utils/handler.js';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import config from './config.js';
import { serialize } from './utils/serialize.js';
import { loadCommands, handleMessage, handleGroupParticipants } from './utils/handler.js';

async function startVexor() {
  await loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  // Génération automatique du Pairing Code sur le 22890283084
  if (!sock.authState.creds.registered) {
    const phoneNumber = (config.ownerNumber || '22890283084').replace(/[^0-9]/g, '');

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
        console.log(`\n========================================`);
        console.log(`⚡ VEXOR MD (${phoneNumber}) - CODE : ${formattedCode}`);
        console.log(`========================================\n`);
      } catch (err) {
        console.error('Erreur lors de la génération du Pairing Code :', err);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('Connexion fermée. Reconnexion :', shouldReconnect);
      if (shouldReconnect) startVexor();
    } else if (connection === 'open') {
      console.log('✓ 𝐕ᴇxᴏʀ 𝐌ᴅ [SHINMON BENIMARU EDITION] est en ligne !');
    }
  });

  // Réception des messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const rawMsg of messages) {
      if (!rawMsg?.message) continue;
      try {
        const m = serialize(sock, rawMsg);
        // Sans await : une commande lente ne bloque pas la détection des autres messages
        handleMessage(sock, m).catch(err => console.error('Erreur traitement message :', err));
      } catch (err) {
        console.error('Erreur serialize :', err);
      }
    }
  });

  // Événements Welcome & Goodbye
  sock.ev.on('group-participants.update', async (update) => {
    await handleGroupParticipants(sock, update);
  });
}

startVexor();ck.ev.on('group-participants.update', async (update) => {
    await handleGroupParticipants(sock, update);
  });
}

sta
  rtVexor();
