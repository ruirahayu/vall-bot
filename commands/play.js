const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = async (sock, m, args, sender, from) => {
  const query = args.join(' ');
  if (!query) {
    return await sock.sendMessage(from, { text: '❌ Masukkan judul lagu atau link YouTube.' });
  }

  try {
    const isUrl = ytdl.validateURL(query);
    const info = isUrl ? await ytdl.getInfo(query) : null;

    const url = isUrl ? query : `https://www.youtube.com/watch?v=${(await ytdl.search(query))[0].id}`;
    const title = info ? info.videoDetails.title : 'Audio';

    const filePath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const stream = ytdl(url, { filter: 'audioonly' });

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on('finish', async () => {
      const audio = fs.readFileSync(filePath);
      await sock.sendMessage(from, {
        audio,
        mimetype: 'audio/mp4',
        ptt: false,
        fileName: `${title}.mp3`,
      });
      fs.unlinkSync(filePath);
    });
  } catch (e) {
    console.error(e);
    await sock.sendMessage(from, { text: '⚠️ Gagal mengambil audio. Coba lagi.' });
  }
};
