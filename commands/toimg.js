const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  try {
    const msg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!msg?.stickerMessage) {
      return sock.sendMessage(from, { text: '❌ Reply ke stiker yang ingin diubah ke gambar.' });
    }

    const mediaKey = msg.stickerMessage.mediaKey;
    const mediaUrl = await sock.downloadMediaMessage({ message: msg });
    const buffer = Buffer.from(mediaUrl);

    await writeFile('./tmp/sticker.png', buffer);
    await sock.sendMessage(from, { image: buffer, caption: '✅ Stiker berhasil diubah ke gambar.' });
  } catch (err) {
    console.error('❌ Error .toimg:', err);
    sock.sendMessage(from, { text: '⚠️ Gagal convert stiker ke gambar.' });
  }
};
