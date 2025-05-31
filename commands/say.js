const { MessageType } = require('@whiskeysockets/baileys');
const gtts = require('gtts');

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  if (args.length === 0) {
    const msg = await sock.sendMessage(from, { text: '❗ Contoh: .say halo semua' });
    if (msg.key?.id) saveBotMessage(from, msg.key.id);
    return;
  }

  const teks = args.join(' ');
  const gttsVoice = new gtts(teks, 'id'); // Gunakan bahasa Indonesia

  try {
    const filePath = `./tmp/${Date.now()}.mp3`;
    gttsVoice.save(filePath, async () => {
      const audio = require('fs').readFileSync(filePath);
      await sock.sendMessage(from, { audio: audio, mimetype: 'audio/mp4', ptt: true });
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('❌ Error TTS:', err);
    await sock.sendMessage(from, { text: '⚠️ Gagal mengubah teks ke suara.' });
  }
};
