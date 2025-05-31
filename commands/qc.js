const Jimp = require('jimp');

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  if (!args.length) {
    const msg = await sock.sendMessage(from, { text: '❌ Kirim teks untuk dijadikan quote!' });
    if (msg.key?.id) saveBotMessage(from, msg.key.id);
    return;
  }

  const text = args.join(' ');
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

    const sentMsg = await sock.sendMessage(from, {
      image: buffer,
      caption: '🖼️ Quote kamu nih!'
    });

    if (sentMsg.key?.id) saveBotMessage(from, sentMsg.key.id);
  } catch (e) {
    const errMsg = await sock.sendMessage(from, { text: '⚠️ Gagal buat quote.' });
    if (errMsg.key?.id) saveBotMessage(from, errMsg.key.id);
  }
};
