const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = async (sock, m, args, sender, from) => {
  if (!args.length) {
    return sock.sendMessage(from, { text: '❌ Kirim nama lagu yang mau diputar!' });
  }

  const query = args.join(' ');
  const searchResult = await yts(query);
  const video = searchResult.videos.length > 0 ? searchResult.videos[0] : null;

  if (!video) {
    return sock.sendMessage(from, { text: '❌ Lagu tidak ditemukan.' });
  }

  try {
    // Download audio stream via ytdl-core
    const stream = ytdl(video.url, { filter: 'audioonly' });

    await sock.sendMessage(from, {
      audio: stream,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: { externalAdReply: {
        title: video.title,
        body: video.author.name,
        mediaUrl: video.url,
        mediaType: 2,
        thumbnail: { url: video.thumbnail }
      }}
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: '⚠️ Gagal memutar lagu.' });
  }
};
