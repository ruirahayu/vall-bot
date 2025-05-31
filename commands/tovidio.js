const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  try {
    const msg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!msg?.stickerMessage || !msg.stickerMessage.isAnimated) {
      return sock.sendMessage(from, { text: '❌ Reply ke stiker animasi (gif/webp).' });
    }

    const buffer = await downloadMediaMessage({ message: msg }, 'buffer', {}, {});

    const inputPath = './tmp/input.webp';
    const outputPath = './tmp/output.mp4';
    fs.writeFileSync(inputPath, buffer);

    ffmpeg(inputPath)
      .outputOptions('-pix_fmt yuv420p')
      .save(outputPath)
      .on('end', async () => {
        const video = fs.readFileSync(outputPath);
        await sock.sendMessage(from, { video, caption: '✅ Stiker animasi berhasil diubah ke video.' });
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
  } catch (err) {
    console.error('❌ Error .tovideo:', err);
    sock.sendMessage(from, { text: '⚠️ Gagal convert stiker ke video.' });
  }
};
