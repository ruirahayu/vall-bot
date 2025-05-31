const axios = require('axios');

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  try {
    const emoji = args.join(' ');
    if (!emoji.includes('+')) {
      return sock.sendMessage(from, { text: '❌ Format salah. Contoh: .emoji 😎+😂' });
    }

    const [e1, e2] = emoji.split('+');
    const url = `https://emoji-api.dev/kitchen?emoji1=${encodeURIComponent(e1)}&emoji2=${encodeURIComponent(e2)}`;

    const { data } = await axios.get(url, { responseType: 'arraybuffer' });

    await sock.sendMessage(from, {
      sticker: data,
      mimetype: 'image/webp'
    });
  } catch (err) {
    console.error('❌ Error .emoji:', err);
    sock.sendMessage(from, { text: '⚠️ Gagal gabungkan emoji.' });
  }
};
