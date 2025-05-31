const Jimp = require('jimp');

module.exports = async (sock, m, args, sender, from) => {
  let text = '';

  // Cek apakah user reply pesan teks
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted) {
    if (quoted.conversation) {
      text = quoted.conversation;
    } else if (quoted.extendedTextMessage?.text) {
      text = quoted.extendedTextMessage.text;
    } else {
      return await sock.sendMessage(from, { text: '❌ Reply pesan teks untuk dibuat stiker!' });
    }
  } else if (args.length) {
    // Kalau gak reply, pakai args sebagai teks
    text = args.join(' ');
  } else {
    return await sock.sendMessage(from, { text: '❌ Kirim teks atau reply pesan teks untuk dijadikan stiker!' });
  }

  try {
    const size = 512;
    const image = new Jimp(size, size, 0x00000000); // transparan

    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    image.print(
      font,
      0,
      0,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      size,
      size
    );

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    await sock.sendMessage(from, {
      sticker: buffer,
      quoted: m.key, // biar reply balik ke pesan yang di-sticker-in
    });
  } catch (e) {
    console.error('Error membuat stiker:', e);
    await sock.sendMessage(from, { text: '⚠️ Gagal buat stiker.' });
  }
};
