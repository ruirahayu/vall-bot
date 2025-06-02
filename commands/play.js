const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

module.exports = async (sock, m, args, sender, from) => {
  const query = args.join(' ');
  if (!query) {
    return await sock.sendMessage(from, { text: '❌ Masukkan judul lagu atau link YouTube.' });
  }

  try {
    let url = query;
    let title = 'Audio';

    if (!ytdl.validateURL(query)) {
      const results = await yts(query);
      if (!results || !results.videos.length) {
        return await sock.sendMessage(from, { text: '❌ Lagu tidak ditemukan di YouTube.' });
      }
      const video = results.videos[0];
      url = video.url;
      title = video.title;
    } else {
      const info = await ytdl.getInfo(url);
      title = info.videoDetails.title;
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, `${Date.now()}.mp3`);
    const stream = ytdl(url, { filter: 'audioonly' });

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on('finish', async () => {
      const audio = fs.readFileSync(filePath);
      await sock.sendMessage(from, {
        audio,
        mimetype: 'audio/mp4',
        fileName: `${title}.mp3`,
      });
      fs.unlinkSync(filePath);
    });
  } catch (e) {
    console.error('Play Error:', e);
    await sock.sendMessage(from, { text: '⚠️ Gagal mengambil audio. Coba lagi nanti.' });
  }
};

