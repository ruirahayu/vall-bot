const Jimp = require('jimp');

module.exports = async (sock, m, args, sender, from) => {
  let text = '';

  // Kalau ada args, ambil dari args
  if (args.length) {
    text = args.join(' ');
  } else {
    // Kalau gak ada args, coba cek apakah reply ke pesan teks
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      // Cek tipe pesan yang direply
      if (quoted.conversation) {
        text = quoted.conversation;
      } else if (quoted.extendedTextMessage?.text) {
        text = quoted.extendedTextMessage.text;
      } else {
        return await sock.sendMessage(from, { text: '❌ Reply pesan teks untuk dibuat quote!' });
      }
    } else {
      return await sock.sendMessage(from, { text: '❌ Kirim teks atau reply pesan teks untuk dijadikan quote!' });
    }
  }

  try {
    const width = 800;
    const height = 400;

    const image = new Jimp(width, height, '#1e1e1e'); // background gelap
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    image.print(
      font,
      20,
      20,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      width - 40,
      height - 40
    );

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    await sock.sendMessage(from, {
      image: buffer,
      caption: '🖼️ Quote kamu nih!'
    });
  } catch (e) {
    console.error('Error membuat quote:', e);
    await sock.sendMessage(from, { text: '⚠️ Gagal buat quote.' });
  }
};
