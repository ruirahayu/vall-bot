const { createCanvas } = require('canvas');
const { sticker } = require('../lib/sticker');

function acakLayout(text) {
  const words = text.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += 2) {
    const left = words[i];
    const right = words[i + 1] || '';
    lines.push([left, right]);
  }

  return lines.map(([l, r]) => {
    const spacing = ' '.repeat(18 - l.length);
    return l + spacing + r;
  }).join('\n');
}

module.exports = async (sock, m, args, sender, from) => {
  const input = args.join(' ');
  if (!input) {
    return sock.sendMessage(from, { text: 'Kirim: *.stikerteks [teks]*' });
  }

  const formattedText = acakLayout(input);

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // ✅ Background putih
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // ✅ Teks hitam, font monospace
  ctx.fillStyle = '#000000';
  ctx.font = '28px Courier New';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = formattedText.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 20, 40 + i * 50);
  });

  const buffer = canvas.toBuffer();
  const stickerBuffer = await sticker(buffer);

  await sock.sendMessage(from, {
    sticker: { buffer: stickerBuffer },
    quoted: m,
  });
};
