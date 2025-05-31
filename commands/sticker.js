const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (sock, m, args, sender, from) => {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
      return sock.sendMessage(from, { text: '⚠️ Balas gambar atau video pendek dengan `.sticker`' });
    }

    const buffer = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger: console }
    );

    const tmpIn = path.join(os.tmpdir(), `in-${Date.now()}`);
    const tmpOut = path.join(os.tmpdir(), `out-${Date.now()}.webp`);

    if (quoted.imageMessage) {
      await sharp(buffer)
        .resize(512, 512, { fit: 'inside' })
        .webp()
        .toFile(tmpOut);

    } else if (quoted.videoMessage) {
      fs.writeFileSync(`${tmpIn}.mp4`, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(`${tmpIn}.mp4`)
          .inputFormat('mp4')
          .outputOptions([
            '-vcodec libwebp',
            '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15',
            '-loop 0',
            '-preset default',
            '-an',
            '-vsync 0',
            '-s 512:512'
          ])
          .toFormat('webp')
          .save(tmpOut)
          .on('end', resolve)
          .on('error', reject);
      });

      fs.unlinkSync(`${tmpIn}.mp4`);
    }

    const stickerBuffer = fs.readFileSync(tmpOut);
    await sock.sendMessage(from, { sticker: stickerBuffer });
    fs.unlinkSync(tmpOut);

  } catch (err) {
    console.error('❌ Gagal buat sticker:', err);
    await sock.sendMessage(from, { text: '❌ Gagal membuat stiker dari media.' });
  }
};
