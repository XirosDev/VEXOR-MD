const smallCapsMap = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

// Convertit en Small Caps simple : ᴀʙᴄ
export function toSmallCaps(text = '') {
  return String(text)
    .toLowerCase()
    .split('')
    .map(char => smallCapsMap[char] || char)
    .join('');
}

// Convertit en Small Caps Gras WhatsApp : *ᴀʙᴄ*
export function toBoldSmallCaps(text = '') {
  return `*${toSmallCaps(text)}*`;
}

// Génère un bloc Design 2 uniforme pour toutes les réponses du bot
export function formatBox(title, lines = []) {
  const header = `┌──「 ${toBoldSmallCaps(title)} 」`;
  const body = lines.map(line => `│ ▸ ${line}`).join('\n');
  const footer = `└───╼`;
  return `${header}\n${body}\n${footer}`;
    }
